import {it,expect} from "vitest";
import {readFile} from "node:fs/promises";
import {demoPlan,seedDemo} from "../../lib/demo";
import {fixtures} from "../support/supabase";
it("repeatable provided-audio seeding preserves published content, completed work and human contributions",async()=>{
 const source={sample:1 as const,bytes:new Uint8Array(await readFile("data/Phrase 1/Phrase 1.mp3")),reference:await readFile("data/Phrase 1/isiXhosa.txt","utf8")};const f=await fixtures();const plan=demoPlan(f.ids[0],f.ids[1],source);
 try{
  await expect(seedDemo(f.admin,f.ids[0],f.ids[1],source)).rejects.toThrow("Prepare existing demo profiles");
  expect((await f.admin.from("stories").select("id").eq("author_id",f.ids[0])).data).toEqual([]);
  expect((await f.sessions[0].from("profiles").update({preferred_language:"xh"}).eq("id",f.ids[0])).error).toBeNull();
  expect((await f.sessions[1].from("profiles").update({preferred_language:"en",spoken_languages:["xh","en"]}).eq("id",f.ids[1])).error).toBeNull();
  const seeded=await seedDemo(f.admin,f.ids[0],f.ids[1],source);
  const seg=await f.sessions[1].from("segments").select("id").eq("story_id",seeded.translation).order("position").limit(1).single();expect(seg.error).toBeNull();
  const review=await f.sessions[1].rpc("m7_save_review",{p_translation:seeded.translation,p_rating:4,p_decision:"approve",p_intent:"Test fixture only",p_edits:[{segment_id:seg.data!.id,text:"Fixture correction"}]});expect(review.error).toBeNull();
  expect((await f.sessions[1].rpc("m8_relationship",{p_kind:"share",p_target:plan.backup,p_enabled:true})).error).toBeNull();
  const before=await f.admin.from("translation_tasks").select("id,state,attempts").eq("source_story_id",plan.backup).order("id");expect(before.error).toBeNull();
  expect((await f.sessions[0].rpc("m4_save_transcript",{p_story:plan.draft,p_revision:0,p_title:"Human draft edit",p_segments:[{id:crypto.randomUUID(),text:"Molo."}]})).error).toBeNull();
  expect(await seedDemo(f.admin,f.ids[0],f.ids[1],source)).toEqual(seeded);
  expect((await f.sessions[0].from("stories").select("title,transcript_revision").eq("id",plan.draft).single()).data).toEqual({title:"Human draft edit",transcript_revision:1});
  expect((await f.admin.from("stories").select("id").eq("author_id",f.ids[0])).data).toHaveLength(3);
  expect((await f.admin.from("translation_tasks").select("id,state,attempts").eq("source_story_id",plan.backup).order("id")).data).toEqual(before.data);
  expect((await f.sessions[1].from("review_edits").select("corrected_text").eq("review_id",review.data)).data).toEqual([{corrected_text:"Fixture correction"}]);
  expect((await f.sessions[1].from("shares").select("story_id").eq("user_id",f.ids[1])).data).toHaveLength(1);
  const audio=await f.admin.storage.from("story-audio").download(f.ids[0]+"/"+plan.backup+"/original.mp3");expect(audio.error).toBeNull();expect(new Uint8Array(await audio.data!.arrayBuffer())).toEqual(source.bytes);
  // A changed backup is never overwritten, even with server administration available.
  expect((await f.admin.from("stories").update({title:"Human changed backup"}).eq("id",plan.backup)).error).toBeNull();
  await expect(seedDemo(f.admin,f.ids[0],f.ids[1],source)).rejects.toThrow("preserve");
 }finally{
  const removed=await f.admin.storage.from("story-audio").remove([plan.backup,plan.draft].map(id=>f.ids[0]+"/"+id+"/original.mp3"));
  await f.cleanup();expect(removed.error).toBeNull();
 }
},90000);
