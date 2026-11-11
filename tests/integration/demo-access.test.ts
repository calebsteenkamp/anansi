import {wave} from "../support/audio";
import {it,expect} from "vitest";
import {randomUUID} from "node:crypto";
import {fixtures} from "../support/supabase";
it("the locked demo denies a fifth account at table, Storage and guarded-capability boundaries",async()=>{
 const f=await fixtures();let outsider:string|undefined;const storyId=randomUUID(),path=f.ids[0]+"/"+storyId+"/original.wav";
 try{
  const mode=await f.anonymous().rpc("m10_demo_mode");expect(mode.error).toBeNull();if(mode.data!==true)throw new Error("BLOCKED: owner must activate the four permanent demo memberships before the final access gate.");
  const email="anansi-t2-"+randomUUID()+"@example.com",created=await f.admin.auth.admin.createUser({email,password:f.password,email_confirm:true});expect(created.error).toBeNull();outsider=created.data.user!.id;
  // Deliberately do NOT grant this account temporary membership.
  const db=f.anonymous();expect((await db.auth.signInWithPassword({email,password:f.password})).error).toBeNull();
  expect((await db.rpc("m10_demo_access")).data).toBe(false);expect((await f.sessions[0].rpc("m10_demo_access")).data).toBe(true);
  expect((await db.from("profiles").select("id")).data).toEqual([]);expect((await db.from("stories").select("id")).data).toEqual([]);
  expect((await db.rpc("m8_relationship",{p_kind:"follow",p_target:f.ids[0],p_enabled:true})).error?.message).toBe("account_not_allowed");
  expect((await db.rpc("m10_test_member",{p_user:outsider})).error).toBeTruthy();
  expect((await f.admin.rpc("m10_reserve_audio",{p_actor:outsider,p_media:"audio/wav",p_bytes:10})).error?.message).toBe("account_not_allowed");
  expect((await f.admin.storage.from("story-audio").upload(path,wave(),{contentType:"audio/wav"})).error).toBeNull();
  expect((await f.admin.from("stories").insert({id:storyId,author_id:f.ids[0],kind:"original",language:"xh",title:"T10 membership fixture",status:"published",audio_path:path,audio_duration_ms:250})).error).toBeNull();
  expect((await f.sessions[0].storage.from("story-audio").createSignedUrl(path,30)).error).toBeNull();
  expect((await db.storage.from("story-audio").createSignedUrl(path,30)).error).toBeTruthy();
  await db.auth.signOut();
 }finally{await f.admin.storage.from("story-audio").remove([path]);if(outsider)expect((await f.admin.auth.admin.deleteUser(outsider)).error).toBeNull();await f.cleanup();}
},90000);
