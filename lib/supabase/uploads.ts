import "server-only";
import {createHash} from "node:crypto";
import {workflowAdmin} from "./story-workflow";
import {rpcError} from "../workflow-request";
import {AudioError,validateAudioSize} from "../audio";
import {inspectAudio} from "../audio-probe";
import {validId} from "../transcript";
function digest(bytes:Uint8Array){return createHash("sha256").update(bytes).digest("hex");}
export async function reserveUpload(actor:string,input:{size:number;media:string}){
 const admin=workflowAdmin(),r=await admin.rpc("m10_reserve_audio",{p_actor:actor,p_media:input.media,p_bytes:input.size});rpcError(r.error);
 const signed=await admin.storage.from("story-audio-staging").createSignedUploadUrl(r.data.path,{upsert:false});
 if(signed.error||!signed.data){await admin.rpc("m10_fail_audio",{p_upload:r.data.id,p_actor:actor,p_token:null});throw new AudioError("upload_unavailable","Upload setup failed. No audio was sent; try again later.",503);}
 return {id:r.data.id,path:r.data.path,token:signed.data.token,mediaType:r.data.media};
}
export async function finalizeUpload(actor:string,id:string){
 if(!validId(id))throw new AudioError("not_found","Upload not found.",404);
 const admin=workflowAdmin(),r=await admin.rpc("m10_claim_audio",{p_upload:id,p_actor:actor});rpcError(r.error);
 if(r.data.reused)return {id};
 const claim=r.data,path=actor+"/"+id+"/original.";
 let bytes:Uint8Array,audio:Awaited<ReturnType<typeof inspectAudio>>;
 const stored=await admin.storage.from("story-audio-staging").download(claim.path);
 if(stored.error&&(Number(stored.error.status)===404||["NoSuchKey","404"].includes(stored.error.statusCode??""))){
  const failed=await admin.rpc("m10_fail_audio",{p_upload:id,p_actor:actor,p_token:claim.token});rpcError(failed.error);
  throw new AudioError("upload_missing","The file did not arrive. Choose Save again to upload your retained preview.",409);
 }
 if(stored.error||!stored.data)throw new AudioError("upload_unavailable","Upload could not be read. Your preview is retained. Wait five minutes before retrying finalization.",503);
 try{
  validateAudioSize(stored.data.size);if(stored.data.size!==claim.expectedBytes)throw new AudioError("invalid_audio","Uploaded file size differs from the reserved file.",400);
  bytes=new Uint8Array(await stored.data.arrayBuffer());audio=await inspectAudio(bytes);
 }catch(error){
  const failed=await admin.rpc("m10_fail_audio",{p_upload:id,p_actor:actor,p_token:claim.token});
  if(failed.error)throw new AudioError("cleanup_required","Validation failed and cleanup needs owner attention. Upload ID: "+id,503);
  const removed=await admin.storage.from("story-audio-staging").remove([claim.path]);
  if(removed.error)throw new AudioError("cleanup_required","Validation failed; staged audio cleanup needs owner attention. Upload ID: "+id,503);
  throw error;
 }
 const finalPath=path+audio.extension;
 // Recover a lost previous upload response without replacing original bytes.
 const existing=await admin.storage.from("story-audio").download(finalPath);
 if(existing.data){if(digest(new Uint8Array(await existing.data.arrayBuffer()))!==digest(bytes))throw new AudioError("cleanup_required","Stored audio differs. Contact the owner with upload ID "+id,503);}
 else{
  const uploaded=await admin.storage.from("story-audio").upload(finalPath,bytes,{upsert:false,contentType:audio.mediaType,cacheControl:"0"});
  if(uploaded.error)throw new AudioError("upload_unavailable","Saving audio could not be confirmed. Keep this draft ID and retry after five minutes: "+id,503);
 }
 const finished=await admin.rpc("m10_finish_audio",{p_upload:id,p_actor:actor,p_token:claim.token,p_media:audio.mediaType,p_extension:audio.extension,p_bytes:bytes.length,p_duration:audio.durationMs});
 if(finished.error){
  const confirmed=await admin.from("stories").select("id").eq("id",id).eq("author_id",actor).eq("audio_path",finalPath).maybeSingle();
  if(confirmed.error||!confirmed.data)throw new AudioError("save_unconfirmed","Saving could not be confirmed. Do not upload again; retry finalization after five minutes. Upload ID: "+id,503);
 }
 // The final object/row are confirmed. A temporary-object cleanup error must never delete the saved story.
 const removed=await admin.storage.from("story-audio-staging").remove([claim.path]);
 return {id,...(removed.error?{warning:"Draft saved; temporary upload cleanup needs owner attention."}:{})};
}
