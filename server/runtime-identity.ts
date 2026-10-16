import { createHash } from 'node:crypto';
import { realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const service='abangcolek-platform',version=1;
const fingerprintPattern=/^[a-f0-9]{64}$/;
export interface RuntimeIdentity {
  ok:true;
  version:1;
  service:'abangcolek-platform';
  sourceFingerprint:string;
  dataFingerprint:string;
  fingerprint:string;
}
export type IdentityVerification='match'|'malformed'|'mismatched_source'|'mismatched_data';
export type RuntimeProbe='reusable'|'occupied_invalid'|'unreachable';
type IdentityFetcher=(url:string,options:RequestInit)=>Promise<Response>;

function canonicalPath(value:string):string{
  if(!value.trim()||value.includes('\0'))throw new Error('Runtime identity path tidak sah.');
  let ancestor=resolve(value);
  const missing:string[]=[];
  for(;;){
    try{
      const canonical=join(realpathSync.native(ancestor),...missing).replaceAll('\\','/');
      return process.platform==='win32'?canonical.toLowerCase():canonical;
    }catch(error){
      const code=(error as NodeJS.ErrnoException).code;
      // Resolve existing junction/symlink ancestors even before children exist.
      // Permission failures cannot safely fall back to a lexical identity.
      if(code!=='ENOENT'&&code!=='ENOTDIR')throw error;
      const parent=dirname(ancestor);
      if(parent===ancestor)throw error;
      missing.unshift(ancestor.slice(parent.length).replace(/^[/\\]+/,''));ancestor=parent;
    }
  }
}
const digest=(parts:unknown[])=>createHash('sha256').update(JSON.stringify(parts)).digest('hex');

/** Consistency fingerprints identify configured paths; they are not authentication. */
export function createRuntimeIdentity(options:{checkoutRoot:string;runtimeRoot:string;databasePath?:string}):RuntimeIdentity{
  const sourceFingerprint=digest(['checkout',canonicalPath(options.checkoutRoot)]);
  const dataFingerprint=digest(['runtime',canonicalPath(options.runtimeRoot),'database',canonicalPath(options.databasePath??join(options.runtimeRoot,'lib/platform/platform.sqlite'))]);
  return {ok:true,version,service,sourceFingerprint,dataFingerprint,fingerprint:digest([version,service,sourceFingerprint,dataFingerprint])};
}

export function verifyRuntimeIdentity(expected:RuntimeIdentity,candidate:unknown):IdentityVerification{
  if(!candidate||typeof candidate!=='object'||Array.isArray(candidate))return 'malformed';
  const value=candidate as Record<string,unknown>;
  const keys=['ok','version','service','sourceFingerprint','dataFingerprint','fingerprint'];
  if(Object.keys(value).length!==keys.length||Object.keys(value).some(key=>!keys.includes(key))||value.ok!==true||value.version!==version||value.service!==service)return 'malformed';
  if([value.sourceFingerprint,value.dataFingerprint,value.fingerprint].some(hash=>typeof hash!=='string'||!fingerprintPattern.test(hash)))return 'malformed';
  if(value.fingerprint!==digest([version,service,value.sourceFingerprint,value.dataFingerprint]))return 'malformed';
  if(value.sourceFingerprint!==expected.sourceFingerprint)return 'mismatched_source';
  if(value.dataFingerprint!==expected.dataFingerprint)return 'mismatched_data';
  return value.fingerprint===expected.fingerprint?'match':'malformed';
}

export const isLocalBinding=(hostname:string)=>['127.0.0.1','localhost','::1'].includes(hostname);

export function identityResponse(request:Request,hostname:string,identity:RuntimeIdentity):Response{
  const headers={'cache-control':'private, no-store','content-type':'application/json','x-content-type-options':'nosniff'};
  if(!isLocalBinding(hostname))return Response.json({ok:false},{status:404,headers});
  if(request.method!=='GET')return Response.json({ok:false},{status:405,headers:{...headers,allow:'GET'}});
  return Response.json(identity,{headers});
}

/** Per-server operator limiter deliberately avoids mutations in the business database. */
export function createRuntimeIdentityHandler(hostname:string,identity:RuntimeIdentity,options:{maximum?:number;windowMs?:number;clock?:()=>number}={}):(request:Request)=>Response{
  const maximum=options.maximum??120,windowMs=options.windowMs??60000,clock=options.clock??Date.now;
  if(!Number.isSafeInteger(maximum)||maximum<1||!Number.isSafeInteger(windowMs)||windowMs<1)throw new Error('Identity limiter config tidak sah.');
  let count=0,resetAt=0;
  return request=>{
    if(!isLocalBinding(hostname))return identityResponse(request,hostname,identity);
    const now=clock();if(now>=resetAt){count=0;resetAt=now+windowMs;}
    if(count>=maximum)return Response.json({ok:false},{status:429,headers:{'cache-control':'private, no-store','retry-after':String(Math.max(1,Math.ceil((resetAt-now)/1000))),'x-content-type-options':'nosniff'}});
    count++;return identityResponse(request,hostname,identity);
  };
}

function isConnectionRefused(error:unknown):boolean{
  let current=error;
  for(let depth=0;depth<4&&current&&typeof current==='object';depth++){
    const value=current as {code?:unknown;cause?:unknown};
    // Bun uses its structured ConnectionRefused code for the same socket error.
    if(value.code==='ECONNREFUSED'||value.code==='ConnectionRefused')return true;
    current=value.cause;
  }
  return false;
}

export async function probeRuntimeIdentity(target:string,expected:RuntimeIdentity,fetcher:IdentityFetcher=fetch):Promise<RuntimeProbe>{
  let response:Response;
  try{
    response=await fetcher(`${target}/api/platform/runtime-identity`,{signal:AbortSignal.timeout(1200),redirect:'error',headers:{accept:'application/json'}});
  }catch(error){return isConnectionRefused(error)?'unreachable':'occupied_invalid';}
  // Once a listener answered, even a broken response body must fail closed.
  try{
    if(response.status!==200){await response.body?.cancel();return 'occupied_invalid';}
    const reader=response.body?.getReader();if(!reader)return 'occupied_invalid';
    const chunks:Uint8Array[]=[];let length=0;
    try{
      for(;;){const {value,done}=await reader.read();if(done)break;length+=value.byteLength;if(length>4096){await reader.cancel();return 'occupied_invalid';}chunks.push(value);}
    }finally{reader.releaseLock();}
    const body=new Uint8Array(length);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length;}
    return verifyRuntimeIdentity(expected,JSON.parse(new TextDecoder().decode(body)))==='match'?'reusable':'occupied_invalid';
  }catch{return 'occupied_invalid';}
}
