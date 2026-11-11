import {it,expect,vi} from "vitest";
vi.mock("server-only",()=>({}));
import {randomUUID} from "node:crypto";
import {fixtures} from "../support/supabase";
async function draft(f:Awaited<ReturnType<typeof fixtures>>,provider="openai"){
 const id=randomUUID();expect((await f.admin.from("stories").insert({id,author_id:f.ids[0],kind:"original",language:"xh",title:"T10 disposable",status:"draft",audio_path:f.ids[0]+"/"+id+"/original.wav",audio_duration_ms:1000})).error).toBeNull();
 expect((await f.sessions[0].rpc("m4_save_transcript",{p_story:id,p_revision:0,p_title:"T10 disposable",p_segments:[{id:randomUUID(),text:"Molo."},{id:randomUUID(),text:"Enkosi."}]})).error).toBeNull();
 const p=await f.admin.rpc("m4_publish",{p_story:id,p_actor:f.ids[0],p_revision:1,p_provider:provider,p_model:provider==="mock"?"synthetic-v1":"gpt-5.4-mini-2026-03-17"});expect(p.error).toBeNull();return {id,linked:p.data.translation_id as string};
}
async function reviewed(f:Awaited<ReturnType<typeof fixtures>>,provider="openai",reuse=true){
 const s=await draft(f,provider);
 // Administrative synthetic results establish SQL provenance fixtures, never live/quality evidence.
 for(let n=0;n<2;n++){const c=await f.admin.rpc("m5_claim_translation",{p_story:s.id,p_actor:f.ids[0],p_consent:true});expect(c.error).toBeNull();expect((await f.admin.rpc("m5_finish_translation",{p_story:s.id,p_actor:f.ids[0],p_task:c.data.task_id,p_token:c.data.token,p_text:"Fixture English.",p_error:null})).error).toBeNull();}
 const segments=await f.sessions[1].from("segments").select("id").eq("story_id",s.linked).order("position");expect(segments.error).toBeNull();
 const review=await f.sessions[1].rpc("m10_save_review",{p_translation:s.linked,p_decision:"approve",p_rating:4,p_intent:"A friendly greeting",p_edits:[{segment_id:segments.data![0].id,text:"Hello."}],p_reuse:reuse});expect(review.error).toBeNull();return {...s,review:review.data as string,segment:segments.data![0].id};
}
it("real SQL opt-in selection freezes retry context, excludes revoked/newly ineligible examples and preserves content",async()=>{
 const f=await fixtures();
 try{
  expect((await f.sessions[1].from("profiles").update({spoken_languages:["xh","en"]}).eq("id",f.ids[1])).error).toBeNull();
  const source=await reviewed(f),excluded=await reviewed(f,"mock");void excluded;const target=await draft(f);
  const claims=await Promise.all([0,1].map(()=>f.admin.rpc("m10_claim_translation",{p_story:target.id,p_actor:f.ids[0],p_consent:true})));expect(claims.filter(r=>!r.error)).toHaveLength(1);const claim=claims.find(r=>!r.error)!.data;
  expect(claim.examples).toHaveLength(1);expect(claim.examples[0]).toEqual({reviewId:source.review,source:"Molo.",correctedEnglish:"Hello.",intent:"A friendly greeting"});expect(claim.prompt_version).toBe("intent-v1");
  expect((await f.sessions[0].rpc("m10_claim_translation",{p_story:target.id,p_actor:f.ids[0],p_consent:true})).error).toBeTruthy();
  expect((await f.admin.rpc("m5_finish_translation",{p_story:target.id,p_actor:f.ids[0],p_task:claim.task_id,p_token:claim.token,p_text:null,p_error:"timeout"})).error).toBeNull();
  expect((await f.sessions[1].rpc("m10_save_review",{p_translation:source.linked,p_decision:"approve",p_rating:4,p_intent:"A friendly greeting",p_edits:[{segment_id:source.segment,text:"Hello."}],p_reuse:false})).error).toBeNull();
  expect((await f.admin.rpc("m5_retry_translation",{p_story:target.id,p_actor:f.ids[0]})).error).toBeNull();const retry=await f.admin.rpc("m10_claim_translation",{p_story:target.id,p_actor:f.ids[0],p_consent:true});expect(retry.data.examples).toEqual(claim.examples);
  expect((await f.admin.rpc("m5_finish_translation",{p_story:target.id,p_actor:f.ids[0],p_task:retry.data.task_id,p_token:retry.data.token,p_text:"Hello.",p_error:null})).error).toBeNull();
  const other=await draft(f),none=await f.admin.rpc("m10_claim_translation",{p_story:other.id,p_actor:f.ids[0],p_consent:true});expect(none.error).toBeNull();expect(none.data.examples).toEqual([]);expect(none.data.prompt_version).toBe("baseline-v1");
  const original=await f.sessions[0].from("segments").select("text").eq("story_id",source.id).order("position");expect(original.data).toEqual([{text:"Molo."},{text:"Enkosi."}]);
  const info=await f.sessions[0].rpc("m10_context_info",{p_translation:target.linked});expect(info.data).toEqual({examplesUsed:1,promptVersion:"intent-v1"});
 }finally{await f.cleanup();}
},180000);
it("chooses at most three distinct recent translations and rechecks bilingual eligibility",async()=>{
 const f=await fixtures();try{
  expect((await f.sessions[1].from("profiles").update({spoken_languages:["xh","en"]}).eq("id",f.ids[1])).error).toBeNull();
  const sources=[];for(let n=0;n<4;n++)sources.push(await reviewed(f));const target=await draft(f);
  const claim=await f.admin.rpc("m10_claim_translation",{p_story:target.id,p_actor:f.ids[0],p_consent:true});expect(claim.error).toBeNull();expect(claim.data.examples).toHaveLength(3);expect(new Set(claim.data.examples.map((e:{reviewId:string})=>e.reviewId)).size).toBe(3);expect(claim.data.examples.map((e:{reviewId:string})=>e.reviewId)).toEqual(sources.slice(1).reverse().map(s=>s.review));
  expect((await f.sessions[1].from("profiles").update({spoken_languages:["en"]}).eq("id",f.ids[1])).error).toBeNull();const fresh=await draft(f);expect((await f.admin.rpc("m10_claim_translation",{p_story:fresh.id,p_actor:f.ids[0],p_consent:true})).data.examples).toEqual([]);
 }finally{await f.cleanup();}
},180000);
