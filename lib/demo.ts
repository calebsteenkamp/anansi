import {createHash} from "node:crypto";
import type {SupabaseClient} from "@supabase/supabase-js";
import {validId,transcriptSegments} from "./transcript";
import {inspectAudio} from "./audio-probe";
import {createAdapters} from "./providers/core";
export function demoArguments(args:string[]){
 const values=new Map<string,string>();let apply=false;
 for(let i=0;i<args.length;i++){
  const key=args[i];
  if(key==="--apply"){if(apply)throw new Error("Duplicate argument.");apply=true;continue;}
  if(!["--storyteller-id","--verifier-id","--sample"].includes(key)||values.has(key)||!args[i+1]||args[i+1].startsWith("--"))throw new Error("Invalid demo arguments.");
  values.set(key,args[++i]);
 }
 const storyteller=values.get("--storyteller-id"),verifier=values.get("--verifier-id"),sample=values.get("--sample")??"1";
 if(!validId(storyteller)||!validId(verifier)||storyteller===verifier||!["1","2"].includes(sample))throw new Error("Supply distinct existing user UUIDs and sample1 or2.");
 return {storyteller,verifier,sample:Number(sample) as 1|2,apply};
}
export interface DemoSource {sample:1|2;bytes:Uint8Array;reference:string}
export function demoId(key:string){const b=createHash("sha256").update("anansi-demo-v1:"+key).digest().subarray(0,16);b[6]=(b[6]&15)|128;b[8]=(b[8]&63)|128;const h=b.toString("hex");return [h.slice(0,8),h.slice(8,12),h.slice(12,16),h.slice(16,20),h.slice(20)].join("-");}
export function demoPlan(storyteller:string,verifier:string,source:DemoSource){
 if(!validId(storyteller)||!validId(verifier)||storyteller===verifier||![1,2].includes(source.sample)||!source.bytes.length||!source.reference.trim())throw new Error("Supply distinct existing demo user IDs and a provided Phrase sample/reference.");
 const hash=createHash("sha256").update(source.bytes).digest("hex"),key=storyteller+":"+source.sample+":"+hash;
 return {storyteller,verifier,hash,backup:demoId(key+":backup"),draft:demoId(key+":draft"),title:"Anansi Demo - Mock Backup (Phrase "+source.sample+")"};
}
function checked(error:unknown){if(error)throw new Error("Demo operation failed. No reset attempted; inspect the scoped demo records and retry after resolving the cause.");}
export async function seedDemo(admin:SupabaseClient,storyteller:string,verifier:string,source:DemoSource){
 const plan=demoPlan(storyteller,verifier,source),media=await inspectAudio(source.bytes);
 if(media.extension!=="mp3")throw new Error("Use the provided Phrase MP3.");
 const profiles=await admin.from("profiles").select("id,preferred_language,spoken_languages").in("id",[storyteller,verifier]);checked(profiles.error);
 const a=profiles.data?.find(p=>p.id===storyteller),b=profiles.data?.find(p=>p.id===verifier);
 if(!a||!b||a.preferred_language!=="xh"||b.preferred_language!=="en"||!b.spoken_languages.includes("xh")||!b.spoken_languages.includes("en"))throw new Error("Prepare existing demo profiles: storyteller prefers isiXhosa; verifier prefers English and lists both languages. No accounts/profiles were changed.");
 for(const [id,title] of [[plan.backup,plan.title],[plan.draft,"Anansi Demo - Transcript Draft (Phrase "+source.sample+")"]]){
  const path=storyteller+"/"+id+"/original.mp3";
  const found=await admin.from("stories").select("id,author_id,audio_path,title").eq("id",id).maybeSingle();checked(found.error);
  if(found.data){if(found.data.author_id!==storyteller||found.data.audio_path!==path)throw new Error("Demo identity collision; nothing overwritten.");if(id===plan.backup&&found.data.title!==title)throw new Error("Backup was changed; preserve it rather than reset it.");continue;}
  const object=await admin.storage.from("story-audio").download(path);
  if(object.data){if(createHash("sha256").update(new Uint8Array(await object.data.arrayBuffer())).digest("hex")!==plan.hash)throw new Error("Demo audio collision; nothing overwritten.");}
  else {const upload=await admin.storage.from("story-audio").upload(path,source.bytes,{contentType:media.mediaType,upsert:false});checked(upload.error);}
  const inserted=await admin.from("stories").insert({id,author_id:storyteller,kind:"original",language:"xh",title,status:"draft",audio_path:path,audio_duration_ms:media.durationMs,audio_media_type:media.mediaType,audio_size_bytes:source.bytes.length,audio_consent_at:new Date().toISOString()});checked(inserted.error);
 }
 const state=await admin.from("stories").select("status,transcript_revision").eq("id",plan.backup).single();checked(state.error);
 const expected=transcriptSegments(source.reference,media.durationMs,(()=>{let i=0;return()=>demoId(plan.backup+":segment:"+i++);})());
 if(state.data!.status!=="published"){
  const claim=await admin.rpc("m4_claim_transcription",{p_story:plan.backup,p_actor:storyteller,p_provider:"mock",p_model:"synthetic-v1",p_retry:true});checked(claim.error);
  if(!claim.data.reused){const finish=await admin.rpc("m4_finish_transcription",{p_story:plan.backup,p_actor:storyteller,p_token:claim.data.token,p_segments:expected,p_error:null});checked(finish.error);}
 }
 const saved=await admin.from("segments").select("id,text").eq("story_id",plan.backup).order("position");checked(saved.error);
 if(JSON.stringify(saved.data)!==JSON.stringify(expected.map(({id,text})=>({id,text}))))throw new Error("Backup transcript differs; preserve existing content, no reset.");
 const current=await admin.from("stories").select("transcript_revision").eq("id",plan.backup).single();checked(current.error);
 const published=await admin.rpc("m4_publish",{p_story:plan.backup,p_actor:storyteller,p_revision:current.data!.transcript_revision,p_provider:"mock",p_model:"synthetic-v1"});checked(published.error);
 const linked=await admin.from("stories").select("ai_provider,ai_model").eq("id",published.data.translation_id).single();checked(linked.error);
 if(linked.data?.ai_provider!=="mock"||linked.data.ai_model!=="synthetic-v1")throw new Error("Backup provider differs; no results overwritten.");
 const retry=await admin.rpc("m5_retry_translation",{p_story:plan.backup,p_actor:storyteller});checked(retry.error);
 const adapter=createAdapters({transcription:"mock",translation:"mock"});
 for(let i=0;i<=expected.length;i++){
  const claim=await admin.rpc("m5_claim_translation",{p_story:plan.backup,p_actor:storyteller,p_consent:true});checked(claim.error);if(claim.data.reused)return {...plan,translation:published.data.translation_id,durationMs:media.durationMs};
  const translated=await adapter.translate(claim.data.text,"xh","en");
  const finish=await admin.rpc("m5_finish_translation",{p_story:plan.backup,p_actor:storyteller,p_task:claim.data.task_id,p_token:claim.data.token,p_text:translated.text,p_error:null});checked(finish.error);
 }
 throw new Error("Demo preparation incomplete; inspect only the printed deterministic IDs.");
}
