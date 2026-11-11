import {beforeAll,afterAll,it,expect} from "vitest";
import {randomUUID} from "node:crypto";
import {fixtures} from "../support/supabase";
import {translationPreflight} from "../support/translation-project";
let f:Awaited<ReturnType<typeof fixtures>>;
beforeAll(async()=>{await translationPreflight();f=await fixtures();},30000);
afterAll(async()=>{if(f)await f.cleanup();},30000);
async function published(){
 const id=randomUUID();const inserted=await f.admin.from("stories").insert({id,author_id:f.ids[0],kind:"original",language:"xh",title:"T5 fixture",audio_path:f.ids[0]+"/"+id+"/original.wav",audio_duration_ms:1000,status:"draft"});expect(inserted.error).toBeNull();
 const rows=[{id:randomUUID(),text:"Molo."},{id:randomUUID(),text:"Enkosi."}];expect((await f.sessions[0].rpc("m4_save_transcript",{p_story:id,p_revision:0,p_title:"T5 fixture",p_segments:rows})).error).toBeNull();
 const results=await Promise.all([f.admin.rpc("m4_publish",{p_story:id,p_actor:f.ids[0],p_revision:1,p_provider:"mock",p_model:"synthetic-v1"}),f.admin.rpc("m4_publish",{p_story:id,p_actor:f.ids[0],p_revision:1,p_provider:"mock",p_model:"synthetic-v1"})]);expect(results.every(r=>!r.error)).toBe(true);expect(results[0].data.translation_id).toBe(results[1].data.translation_id);return {id,linked:results[0].data.translation_id as string};
}
async function claim(id:string,actor=f.ids[0],consent=true){return f.admin.rpc("m5_claim_translation",{p_story:id,p_actor:actor,p_consent:consent});}
async function finish(id:string,c:{task_id:string;token:string},text:string|null="Hello.",error:string|null=null){return f.admin.rpc("m5_finish_translation",{p_story:id,p_actor:f.ids[0],p_task:c.task_id,p_token:c.token,p_text:text,p_error:error});}
async function retry(id:string){return f.admin.rpc("m5_retry_translation",{p_story:id,p_actor:f.ids[0]});}
it("denies anonymous/user processing capabilities, task writes and cross-user actor",async()=>{
 const {id}=await published();const args={p_story:id,p_actor:f.ids[0],p_consent:true};
 for(const client of [f.anonymous(),...f.sessions]){
  expect((await client.rpc("m5_claim_translation",args)).error).toBeTruthy();
  expect((await client.rpc("m5_retry_translation",{p_story:id,p_actor:f.ids[0]})).error).toBeTruthy();
  expect((await client.rpc("m5_finish_translation",{p_story:id,p_actor:f.ids[0],p_task:randomUUID(),p_token:randomUUID(),p_text:"forged",p_error:null})).error).toBeTruthy();
 }
 expect((await f.sessions[0].from("translation_tasks").update({state:"complete"}).eq("source_story_id",id)).error).toBeTruthy();
 expect((await claim(id,f.ids[1])).error?.message).toBe("not_found");expect((await claim(id,f.ids[0],false)).error?.message).toBe("consent_required");
});
it("serializes concurrent claims, persists alignment/provenance and completed reuse",async()=>{
 const {id,linked}=await published();const claims=await Promise.all([claim(id),claim(id)]);expect(claims.filter(r=>!r.error)).toHaveLength(1);expect(claims.find(r=>r.error)?.error?.message).toBe("processing");const c=claims.find(r=>!r.error)!.data;
 expect((await f.sessions[1].from("stories").select("id").eq("id",linked)).data).toEqual([]);
 expect((await finish(id,c)).error).toBeNull();expect((await finish(id,c,"overwrite")).error).toBeNull();
 const second=await claim(id);expect(second.data.task_id).not.toBe(c.task_id);expect((await finish(id,second.data,"Thanks.")).error).toBeNull();
 expect((await claim(id)).data).toEqual({reused:true});expect((await retry(id)).error).toBeNull();expect((await claim(id)).data).toEqual({reused:true});
 const tasks=await f.admin.from("translation_tasks").select("attempts,state").eq("translation_story_id",linked);expect(tasks.data).toEqual([{attempts:1,state:"complete"},{attempts:1,state:"complete"}]);
 expect((await f.sessions[1].from("stories").select("id,status,ai_provider,ai_model,parent_story_id").eq("id",linked).single()).data).toEqual({id:linked,status:"awaiting_verification",ai_provider:"mock",ai_model:"synthetic-v1",parent_story_id:id});
 const rows=await f.sessions[1].from("segments").select("text,position,source_story_id,source_segment_id,start_ms,end_ms").eq("story_id",linked).order("position");expect(rows.data?.map(r=>r.text)).toEqual(["Hello.","Thanks."]);expect(rows.data?.every(r=>r.source_story_id===id&&r.source_segment_id&&r.end_ms>r.start_ms)).toBe(true);
});
it("preserves partial successes and retries only failed work",async()=>{
 const {id,linked}=await published(),a=await claim(id);expect((await finish(id,a.data)).error).toBeNull();const b=await claim(id);expect((await finish(id,b.data,null,"quota")).error).toBeNull();expect((await claim(id)).error?.message).toBe("retry_required");
 expect((await f.sessions[0].from("segments").select("text").eq("story_id",linked)).data).toEqual([{text:"Hello."}]);
 expect((await retry(id)).error).toBeNull();const c=await claim(id);expect(c.data.task_id).toBe(b.data.task_id);expect((await finish(id,c.data,"Recovered")).error).toBeNull();
 const tasks=await f.admin.from("translation_tasks").select("id,attempts,state").eq("translation_story_id",linked);expect(tasks.data?.find(t=>t.id===a.data.task_id)?.attempts).toBe(1);expect(tasks.data?.find(t=>t.id===b.data.task_id)?.attempts).toBe(2);
});
it("requires expiry and explicit retry; rejects stale workers and active resets",async()=>{
 const {id}=await published(),a=await claim(id);expect((await retry(id)).error?.message).toBe("processing");
 expect((await f.admin.from("translation_tasks").update({claim_expires_at:"2000-01-01T00:00:00Z"}).eq("id",a.data.task_id)).error).toBeNull();
 expect((await finish(id,a.data)).error?.message).toBe("stale_claim");expect((await claim(id)).error?.message).toBe("retry_required");expect((await retry(id)).error).toBeNull();const b=await claim(id);expect(b.data.token).not.toBe(a.data.token);expect((await finish(id,a.data)).error?.message).toBe("stale_claim");expect((await finish(id,b.data)).error).toBeNull();
});
it("rejects source fingerprint changes before claim or completion",async()=>{
 const {id}=await published();const rows=await f.admin.from("translation_tasks").select("id").eq("source_story_id",id);expect(rows.data).toHaveLength(2);
 expect((await f.admin.from("translation_tasks").update({source_fingerprint:"changed"}).in("id",rows.data!.map(r=>r.id))).error).toBeNull();expect((await claim(id)).error?.message).toBe("source_changed");
 const other=await published(),c=await claim(other.id);expect((await f.admin.from("translation_tasks").update({source_fingerprint:"changed"}).eq("id",c.data.task_id)).error).toBeNull();expect((await finish(other.id,c.data)).error?.message).toBe("source_changed");
});
it("invalid completion rolls back and leaves original/audio unchanged",async()=>{
 const {id,linked}=await published();const before=(await f.sessions[0].from("stories").select("audio_path,audio_duration_ms,transcript_revision,status").eq("id",id).single()).data;const source=(await f.sessions[0].from("segments").select("id,text").eq("story_id",id).order("position")).data;
 const c=await claim(id);expect((await finish(id,c.data,"")).error?.message).toBe("invalid_translation");expect((await f.sessions[0].from("segments").select("id").eq("story_id",linked)).data).toEqual([]);expect((await finish(id,c.data)).error).toBeNull();
 expect((await f.sessions[0].from("stories").select("audio_path,audio_duration_ms,transcript_revision,status").eq("id",id).single()).data).toEqual(before);expect((await f.sessions[0].from("segments").select("id,text").eq("story_id",id).order("position")).data).toEqual(source);
});
