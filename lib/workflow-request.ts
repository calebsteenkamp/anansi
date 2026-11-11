import {AudioError} from "./audio";
import {isSameOrigin} from "./request-origin";
export async function workflowBody(request:Request):Promise<Record<string,unknown>>{
 if(!isSameOrigin(request))throw new AudioError("forbidden_origin","Use this story's Anansi page.",403);
 if(!request.headers.get("content-type")?.includes("application/json")||!request.body)throw new AudioError("invalid_input","Send a valid form.",400);
 const reader=request.body.getReader();let size=0;const chunks:Uint8Array[]=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>256000){await reader.cancel();throw new AudioError("invalid_input","Transcript request is too large.",413);}chunks.push(value);}}
 finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 try{const parsed=JSON.parse(new TextDecoder().decode(bytes));if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw new Error();return parsed;}
 catch{throw new AudioError("invalid_input","Send a valid form.",400);}
}
export function rpcError(error:{message:string}|null){
 if(!error)return;
 const known:Record<string,[number,string]>={
  not_found:[404,"Story not found."],unauthenticated:[401,"Sign in first."],revision_conflict:[409,"This story changed elsewhere. Reload before saving; copy unsaved text first."],
  processing:[409,"Processing is still running. Refresh to check its status."],stale_claim:[409,"This processing attempt expired or was replaced. Refresh before retrying."],
  retry_required:[409,"Choose Retry explicitly to recover unfinished processing."],published_immutable:[409,"Published transcripts cannot be edited."],
  invalid_transcript:[400,"Enter a valid title and nonempty transcript (up to 500 segments / 50,000 characters)."],invalid_timings:[400,"Transcript timings are invalid."],consent_required:[400,"Confirm permission before processing."],source_changed:[409,"Source or provider metadata changed. Contact the owner; no new provider call was made."],invalid_translation:[400,"Translation result was empty or too large."],configuration:[503,"Provider configuration needs owner attention."]
 };
 const match=known[error.message];if(match)throw new AudioError(error.message,match[1],match[0]);
 throw new AudioError("unavailable","Story operation unavailable. Check the active milestone setup or try again.",503);
}
