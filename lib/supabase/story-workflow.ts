import "server-only";
import {createClient,type SupabaseClient} from "@supabase/supabase-js";
import {serverClient} from "./server";
import {AudioError} from "../audio";
import {rpcError} from "../workflow-request";
import {validId,type Segment} from "../transcript";
import type {TranscriptionStore} from "../workflow";
export interface StorySnapshot {
 id:string;author_id:string;title:string;status:string;audio_path:string;audio_duration_ms:number;transcript_revision:number;
 transcript_origin:string|null;transcription_error:string|null;transcription_claim_expires_at:string|null;ai_provider:string|null;ai_model:string|null;
 segments:Segment[];
}
export async function workflowSession(){
 const db=await serverClient();const {data,error}=await db.auth.getUser();
 if(error||!data.user)throw new AudioError("unauthenticated","Sign in first.",401);
 return {db,userId:data.user.id};
}
export async function storySnapshot(db:SupabaseClient,id:string):Promise<StorySnapshot>{
 if(!validId(id))throw new AudioError("not_found","Story not found.",404);
 const story=await db.from("stories").select("id,author_id,title,status,audio_path,audio_duration_ms,transcript_revision,transcript_origin,transcription_error,transcription_claim_expires_at,ai_provider,ai_model").eq("id",id).eq("kind","original").maybeSingle();
 if(story.error)throw new AudioError("unavailable","Story setup is unavailable. Ask the owner to verify M4 SQL.",503);
 if(!story.data?.audio_path)throw new AudioError("not_found","Story not found.",404);
 const segments=await db.from("segments").select("id,text,start_ms,end_ms,timing_source").eq("story_id",id).order("position");
 if(segments.error)throw new AudioError("unavailable","Transcript unavailable. Try again.",503);
 return {...story.data,segments:segments.data??[]} as StorySnapshot;
}
export function workflowAdmin(){
 const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!secret)throw new AudioError("configuration","Server workflow configuration is missing.",503);
 return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,secret,{auth:{persistSession:false,autoRefreshToken:false}});
}
export function transcriptionStore(db:SupabaseClient,admin:SupabaseClient,id:string,userId:string,provider:string,model:string):TranscriptionStore {
 return {
  async claim(retry){const result=await admin.rpc("m4_claim_transcription",{p_story:id,p_actor:userId,p_provider:provider,p_model:model,p_retry:retry});rpcError(result.error);return result.data;},
  async download(path){const {data,error}=await db.storage.from("story-audio").download(path);if(error||!data)throw new Error("Private audio unavailable.");return new Uint8Array(await data.arrayBuffer());},
  async finish(token,segments,error){const result=await admin.rpc("m4_finish_transcription",{p_story:id,p_actor:userId,p_token:token,p_segments:segments,p_error:error});rpcError(result.error);}
 };
}
