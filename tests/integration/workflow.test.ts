import {beforeAll,afterAll,it,expect} from "vitest";
import {randomUUID} from "node:crypto";
import {fixtures} from "../support/supabase";
import {workflowPreflight} from "../support/workflow-project";
let f:Awaited<ReturnType<typeof fixtures>>;
beforeAll(async()=>{await workflowPreflight();f=await fixtures();},30000);
afterAll(async()=>{if(f)await f.cleanup();},30000);
async function story(author=f.ids[0]){
 const id=randomUUID();const row={id,author_id:author,kind:"original",language:"xh",title:"T4 fixture",audio_path:author+"/"+id+"/original.wav",audio_duration_ms:1000,status:"draft"};
 const result=await f.admin.from("stories").insert(row);if(result.error)throw new Error("T4 fixture setup failed.");return id;
}
function segments(){return [{id:randomUUID(),text:"Molo.",start_ms:0,end_ms:500,timing_source:"estimated"},{id:randomUUID(),text:"Enkosi.",start_ms:500,end_ms:1000,timing_source:"estimated"}];}
async function save(id:string,revision=0,rows=segments(),client=f.sessions[0]){return client.rpc("m4_save_transcript",{p_story:id,p_revision:revision,p_title:"Saved T4",p_segments:rows});}
async function claim(id:string,retry=false,actor=f.ids[0]){return f.admin.rpc("m4_claim_transcription",{p_story:id,p_actor:actor,p_provider:"mock",p_model:"synthetic-v1",p_retry:retry});}
async function finish(id:string,token:string,rows:ReturnType<typeof segments>|null=segments(),error:string|null=null){return f.admin.rpc("m4_finish_transcription",{p_story:id,p_actor:f.ids[0],p_token:token,p_segments:rows,p_error:error});}
async function publish(id:string,revision=1,actor=f.ids[0]){return f.admin.rpc("m4_publish",{p_story:id,p_actor:actor,p_revision:revision,p_provider:"mock",p_model:"synthetic-v1"});}
it("enforces real user ownership, anonymous denial and privileged-result ACLs",async()=>{
 const id=await story();
 expect((await save(id,0,segments(),f.sessions[1])).error?.message).toBe("not_found");
 expect((await save(id,0,segments(),f.anonymous())).error).toBeTruthy();
 expect((await f.sessions[0].rpc("m4_claim_transcription",{p_story:id,p_actor:f.ids[0],p_provider:"mock",p_model:"synthetic-v1",p_retry:false})).error).toBeTruthy();
 expect((await f.sessions[0].rpc("m4_finish_transcription",{p_story:id,p_actor:f.ids[0],p_token:randomUUID(),p_segments:segments(),p_error:null})).error).toBeTruthy();
 expect((await f.sessions[0].rpc("m4_publish",{p_story:id,p_actor:f.ids[0],p_revision:0,p_provider:"mock",p_model:"synthetic-v1"})).error).toBeTruthy();
 expect((await publish(id,0,f.ids[1])).error?.message).toBe("not_found");
 expect((await f.sessions[0].from("stories").update({author_id:f.ids[1],status:"published",transcription_error:"quota"}).eq("id",id)).error).toBeTruthy();
});
it("saves transactionally, rejects stale revisions/foreign IDs and preserves previous content",async()=>{
 const id=await story(),rows=segments();expect((await save(id,0,rows)).error).toBeNull();
 expect((await save(id,0)).error?.message).toBe("revision_conflict");
 const foreign=await story(f.ids[1]),sid=randomUUID();expect((await f.admin.from("segments").insert({id:sid,story_id:foreign,position:0,text:"foreign"})).error).toBeNull();
 expect((await save(id,1,[{...rows[0],id:sid}])).error?.message).toBe("invalid_transcript");
 expect((await save(id,1,[])).error?.message).toBe("invalid_transcript");
 const stored=await f.sessions[0].from("segments").select("id,text").eq("story_id",id).order("position");expect(stored.data).toEqual(rows.map(({id,text})=>({id,text})));
 const current=await f.sessions[0].from("stories").select("transcript_revision,transcript_origin").eq("id",id).single();expect(current.data).toEqual({transcript_revision:1,transcript_origin:"manual"});
});
it("claims concurrent transcription once and reuses completed work",async()=>{
 const id=await story();const results=await Promise.all([claim(id),claim(id)]);const won=results.find(r=>!r.error)!;expect(results.filter(r=>!r.error)).toHaveLength(1);expect(results.find(r=>r.error)?.error?.message).toBe("processing");
 expect((await finish(id,won.data.token)).error).toBeNull();
 expect((await claim(id)).data).toEqual({reused:true});
 expect((await f.sessions[0].from("stories").select("status,transcript_origin").eq("id",id).single()).data).toEqual({status:"transcript_ready",transcript_origin:"provider"});
});
it("requires explicit recovery after expiry and rejects stale completion after manual save",async()=>{
 const id=await story(),first=await claim(id);expect(first.error).toBeNull();
 expect((await f.admin.from("stories").update({transcription_claim_expires_at:"2000-01-01T00:00:00.000Z"}).eq("id",id)).error).toBeNull();
 expect((await claim(id)).error?.message).toBe("retry_required");
 const second=await claim(id,true);expect(second.error).toBeNull();expect(second.data.token).not.toBe(first.data.token);
 expect((await finish(id,first.data.token)).error?.message).toBe("stale_claim");
 expect((await f.admin.from("stories").update({transcription_claim_expires_at:"2000-01-01T00:00:00.000Z"}).eq("id",id)).error).toBeNull();
 expect((await save(id)).error).toBeNull();expect((await finish(id,second.data.token)).error?.message).toBe("stale_claim");
});
it("records failure, allows manual fallback and rolls back invalid provider segments",async()=>{
 const id=await story(),run=await claim(id);
 expect((await finish(id,run.data.token,[{...segments()[0],end_ms:1001}])).error?.message).toBe("invalid_timings");
 expect((await f.sessions[0].from("segments").select("id").eq("story_id",id)).data).toEqual([]);
 expect((await finish(id,run.data.token,null,"quota")).error).toBeNull();
 expect((await f.sessions[0].from("stories").select("status,transcription_error").eq("id",id).single()).data).toEqual({status:"transcription_failed",transcription_error:"quota"});
 expect((await claim(id)).error?.message).toBe("retry_required");expect((await save(id)).error).toBeNull();
});
it("publishes concurrently/idempotently, creates one linked translation/tasks and freezes original",async()=>{
 const id=await story(),rows=segments();expect((await save(id,0,rows)).error).toBeNull();
 const before=(await f.sessions[0].from("stories").select("audio_path,audio_duration_ms").eq("id",id).single()).data;
 const results=await Promise.all([publish(id),publish(id)]);expect(results.every(r=>!r.error)).toBe(true);expect(results[0].data.translation_id).toBe(results[1].data.translation_id);
 const linked=results[0].data.translation_id;
 expect((await f.admin.from("translation_tasks").select("source_segment_id,source_fingerprint,state").eq("translation_story_id",linked)).data).toEqual(expect.arrayContaining(rows.map(row=>expect.objectContaining({source_segment_id:row.id,state:"pending",source_fingerprint:expect.stringMatching(/^[0-9a-f]{64}$/)}))));
 expect((await f.sessions[0].from("stories").select("id,status").eq("parent_story_id",id)).data).toEqual([{id:linked,status:"pending"}]);
 expect((await f.sessions[1].from("stories").select("id").eq("id",id)).data).toEqual([{id}]);
 expect((await f.sessions[1].from("stories").select("id").eq("id",linked)).data).toEqual([]);
 expect((await save(id,2)).error?.message).toBe("published_immutable");
 expect((await f.sessions[0].from("segments").update({text:"forged"}).eq("id",rows[0].id)).error).toBeTruthy();
 expect((await f.sessions[0].from("stories").select("audio_path,audio_duration_ms").eq("id",id).single()).data).toEqual(before);
 const all=await f.admin.from("translation_tasks").select("id").eq("translation_story_id",linked);expect(all.data).toHaveLength(2);
});
it("rolls back publication on a conflicting translation instead of partially freezing",async()=>{
 const id=await story();expect((await save(id)).error).toBeNull();
 expect((await f.admin.from("stories").insert({author_id:f.ids[0],kind:"translation",language:"en",parent_story_id:id,title:"Conflict fixture",status:"pending"})).error).toBeNull();
 expect((await publish(id)).error).toBeTruthy();
 expect((await f.sessions[0].from("stories").select("status,transcript_revision").eq("id",id).single()).data).toEqual({status:"transcript_ready",transcript_revision:1});
});
