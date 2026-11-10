import {AudioError} from "./audio";
import type {Transcript} from "./providers/types";
import {ProviderError} from "./providers/types";
import {transcriptSegments,type Segment} from "./transcript";
export interface Claim {reused:boolean;token?:string;audio_path?:string;audio_duration_ms?:number;audio_media_type?:string}
export interface TranscriptionStore {
 claim(retry:boolean):Promise<Claim>;
 download(path:string):Promise<Uint8Array>;
 finish(token:string,segments:Segment[]|null,error:string|null):Promise<void>;
}
export async function transcribeStory(store:TranscriptionStore,adapter:(bytes:Uint8Array,path:string,mime:string)=>Promise<Transcript>,retry:boolean,id:()=>string){
 const claim=await store.claim(retry);
 if(claim.reused)return {reused:true};
 if(!claim.token||!claim.audio_path||!claim.audio_duration_ms)throw new AudioError("unavailable","Invalid processing state. Contact the owner.",503);
 let result:Transcript,segments:Segment[];
 try{
  const bytes=await store.download(claim.audio_path);
  result=await adapter(bytes,claim.audio_path,claim.audio_media_type??"audio/mpeg");
  segments=transcriptSegments(result.text,claim.audio_duration_ms,id,result.timings);
 }catch(error){
  const code=error instanceof ProviderError?error.code:error instanceof AudioError?"malformed":"storage";
  await store.finish(claim.token,null,code);
  throw new AudioError("transcription_failed","Transcription failed ("+code+"). Retry explicitly or enter/paste your transcript.",502);
 }
 // Persistence errors leave the existing claim recoverable; never re-call a paid provider here.
 await store.finish(claim.token,segments,null);
 return {reused:false};
}
