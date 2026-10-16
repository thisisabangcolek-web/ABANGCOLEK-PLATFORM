import { expect,test } from 'bun:test';
import { runtimeConfig } from '../../server/runtime-config';

test('runtime defaults remain local and production origins require an exact HTTPS allowlist',()=>{
  expect(runtimeConfig({}).allowedOrigins).toEqual(['http://localhost:3000','http://127.0.0.1:3000']);
  expect(runtimeConfig({PLATFORM_ALLOWED_ORIGINS:'https://example.test'}).allowedOrigins).toEqual(['https://example.test']);
  for(const value of ['*','https://example.test/path','http://example.test','https://user:password@example.test'])expect(()=>runtimeConfig({PLATFORM_ALLOWED_ORIGINS:value})).toThrow();
  expect(()=>runtimeConfig({PLATFORM_PORT:'abc'})).toThrow();
  expect(()=>runtimeConfig({PLATFORM_HOST:'0.0.0.0'})).toThrow();
});

test('runtime root and loopback URL are explicit and validated before writes',()=>{
  expect(runtimeConfig({}).runtimeRoot).toBe('var');
  expect(runtimeConfig({PLATFORM_RUNTIME_ROOT:'runtime-other'}).runtimeRoot).toBe('runtime-other');
  expect(runtimeConfig({PLATFORM_HOST:'::1'}).target).toBe('http://[::1]:3010');
  for(const value of ['', '   ', 'invalid\0path'])expect(()=>runtimeConfig({PLATFORM_RUNTIME_ROOT:value})).toThrow();
});
