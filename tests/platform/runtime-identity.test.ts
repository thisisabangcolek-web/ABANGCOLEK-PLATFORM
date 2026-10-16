import { expect, test } from 'bun:test';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRuntimeIdentity, createRuntimeIdentityHandler, identityResponse, probeRuntimeIdentity, verifyRuntimeIdentity } from '../../server/runtime-identity';

const expected = createRuntimeIdentity({ checkoutRoot: resolve('.'), runtimeRoot: resolve('var') });

test('identity fingerprints canonical checkout, runtime and database without exposing paths', () => {
  expect(createRuntimeIdentity({ checkoutRoot: resolve('.'), runtimeRoot: resolve('var') })).toEqual(expected);
  const serialized = JSON.stringify(expected);
  expect(serialized).not.toContain(resolve('.'));
  expect(serialized).not.toContain(resolve('var'));
  expect(verifyRuntimeIdentity(expected, expected)).toBe('match');
  expect(verifyRuntimeIdentity(expected, createRuntimeIdentity({ checkoutRoot: resolve('..'), runtimeRoot: resolve('var') }))).toBe('mismatched_source');
  expect(verifyRuntimeIdentity(expected, createRuntimeIdentity({ checkoutRoot: resolve('.'), runtimeRoot: resolve('var-other') }))).toBe('mismatched_data');
  expect(verifyRuntimeIdentity(expected, createRuntimeIdentity({ checkoutRoot: resolve('.'), runtimeRoot: resolve('var'), databasePath: resolve('var/other.sqlite') }))).toBe('mismatched_data');
});

test('existing directory aliases canonicalize before hashing a not-yet-created runtime path', () => {
  const directory = mkdtempSync(join(tmpdir(), 'identity-alias-'));
  try {
    const actual = join(directory, 'actual'), alias = join(directory, 'alias');
    mkdirSync(actual);
    symlinkSync(actual, alias, process.platform === 'win32' ? 'junction' : 'dir');
    expect(createRuntimeIdentity({ checkoutRoot: alias, runtimeRoot: join(alias, 'future') })).toEqual(createRuntimeIdentity({ checkoutRoot: actual, runtimeRoot: join(actual, 'future') }));
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('identity rejects missing fields, partial fingerprints, wrong schema and inconsistent digest', () => {
  for (const payload of [null, [], {}, { fingerprint: expected.fingerprint }, { ...expected, version: 999 }, { ...expected, ok: false }, { ...expected, fingerprint: '0'.repeat(64) }, { ...expected, dataFingerprint: undefined }]) {
    expect(verifyRuntimeIdentity(expected, payload)).not.toBe('match');
  }
});

test('operator identity is GET-only, private and disabled on public binding', async () => {
  const request = new Request('http://127.0.0.1/api/platform/runtime-identity');
  for (const hostname of ['127.0.0.1', 'localhost', '::1']) {
    const response = identityResponse(request, hostname, expected);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).toEqual(expected);
  }
  expect(identityResponse(request, '0.0.0.0', expected).status).toBe(404);
  expect(identityResponse(new Request(request.url, { method: 'POST' }), '127.0.0.1', expected).status).toBe(405);
});

test('probe reuses only HTTP200 complete matching identity', async () => {
  for (const [status, payload, result] of [[200, expected, 'reusable'], [500, expected, 'occupied_invalid'], [200, {}, 'occupied_invalid'], [404, { ok: true }, 'occupied_invalid']] as const) {
    const fetcher = async () => Response.json(payload, { status });
    expect(await probeRuntimeIdentity('http://127.0.0.1:3010', expected, fetcher)).toBe(result);
  }
  expect(await probeRuntimeIdentity('http://127.0.0.1:3010', expected, async () => new Response('not json'))).toBe('occupied_invalid');
});

test('only connection refusal permits spawn; timeout, generic fetch errors and redirects fail closed', async () => {
  for (const error of [new Error('Failed to fetch'), new DOMException('Timeout', 'TimeoutError'), Object.assign(new Error('refused'), { code: 'ECONNRESET' })]) {
    expect(await probeRuntimeIdentity('http://127.0.0.1:3010', expected, async () => { throw error; })).toBe('occupied_invalid');
  }
  const refused = Object.assign(new Error('refused'), { code: 'ECONNREFUSED' });
  expect(await probeRuntimeIdentity('http://127.0.0.1:3010', expected, async () => { throw refused; })).toBe('unreachable');
  const bunRefused=Object.assign(new Error('refused'),{code:'ConnectionRefused'});
  expect(await probeRuntimeIdentity('http://127.0.0.1:3010',expected,async()=>{throw bunRefused;})).toBe('unreachable');
  expect(await probeRuntimeIdentity('http://127.0.0.1:3010', expected, async (_url, options) => {
    expect(options?.redirect).toBe('error');
    expect(options?.signal).toBeInstanceOf(AbortSignal);
    return new Response(null, { status: 302 });
  })).toBe('occupied_invalid');
});

test('a reachable response with a broken body never becomes permission to spawn',async()=>{
  const body=new ReadableStream<Uint8Array>({start(controller){controller.error(Object.assign(new Error('body failed'),{code:'ECONNREFUSED'}));}});
  expect(await probeRuntimeIdentity('http://127.0.0.1:3010',expected,async()=>new Response(body))).toBe('occupied_invalid');
});

test('loopback identity limiter is isolated, in-memory and resets at the window boundary',()=>{
  let now=1000;
  const handler=createRuntimeIdentityHandler('127.0.0.1',expected,{maximum:2,windowMs:1000,clock:()=>now});
  const request=new Request('http://127.0.0.1/api/platform/runtime-identity');
  expect(handler(request).status).toBe(200);expect(handler(request).status).toBe(200);
  const limited=handler(request);expect(limited.status).toBe(429);expect(limited.headers.get('cache-control')).toBe('private, no-store');expect(limited.headers.get('retry-after')).toBe('1');
  const independent=createRuntimeIdentityHandler('127.0.0.1',expected,{maximum:2,windowMs:1000,clock:()=>now});expect(independent(request).status).toBe(200);
  now=2000;expect(handler(request).status).toBe(200);
  const disabled=createRuntimeIdentityHandler('0.0.0.0',expected,{maximum:1});expect(disabled(request).status).toBe(404);expect(disabled(request).status).toBe(404);
});
