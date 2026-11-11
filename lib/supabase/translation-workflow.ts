import "server-only";
import type {SupabaseClient} from "@supabase/supabase-js";
import {AudioError} from "../audio";
import {rpcError} from "../workflow-request";
import type {StorySnapshot} from "./story-workflow";
import {workflowAdmin} from "./story-workflow";
import type {TranslationStore,TranslationView} from "../translation";
import {configFromEnv,createAdapters} from "../providers/core";
import {ProviderError,type Provider} from "../providers/types";
export async function translationView(db:SupabaseClient,story:StorySnapshot,userId:string):Promise<TranslationView|null>{
 const result=await db.from("stories").select("id,status,ai_provider,ai_model").eq("parent_story_id",story.id).eq("language","en").maybeSingle();
 if(result.error)throw new AudioError("unavailable","Translation setup unavailable. Ask the owner to verify M5 SQL.",503);
 if(!result.data)return null;
 const linked=result.data,owner=story.author_id===userId;
 const segments=await db.from("segments").select("id,text,position").eq("story_id",linked.id).order("position");
 if(segments.error)throw new AudioError("unavailable","Translation unavailable. Refresh to try again.",503);
 let total=segments.data.length,complete=total,failed=0,processing=0,retryRequired=false;
 if(owner){
  const tasks=await workflowAdmin().from("translation_tasks").select("state,claim_expires_at").eq("translation_story_id",linked.id);
  if(tasks.error)throw new AudioError("unavailable","Translation progress unavailable.",503);
  total=tasks.data.length;complete=tasks.data.filter(t=>t.state==="complete").length;failed=tasks.data.filter(t=>t.state==="failed").length;processing=tasks.data.filter(t=>t.state==="processing").length;
  retryRequired=failed>0||tasks.data.some(t=>t.state==="processing"&&Date.parse(t.claim_expires_at??"")<=Date.now());
 }
 return {id:linked.id,status:linked.status,provider:linked.ai_provider,model:linked.ai_model,owner,total,complete,failed,processing,retryRequired,segments:segments.data};
}
export function translationStore(admin:SupabaseClient,id:string,userId:string):TranslationStore{return {
 async claim(consent){const r=await admin.rpc("m5_claim_translation",{p_story:id,p_actor:userId,p_consent:consent});rpcError(r.error);return r.data;},
 async finish(task,token,text,error){const r=await admin.rpc("m5_finish_translation",{p_story:id,p_actor:userId,p_task:task,p_token:token,p_text:text,p_error:error});rpcError(r.error);}
};}
export async function translateConfigured(text:string,provider:Provider,model:string){
 if((provider==="mock"&&model!=="synthetic-v1")||(provider==="vulavula"&&model!=="vulavula-translate-api"))throw new ProviderError("configuration");
 const config=configFromEnv(process.env);
 return createAdapters({...config,translation:provider,openaiTranslationModel:model}).translate(text,"xh","en");
}
