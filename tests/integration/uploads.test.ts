import {createHash} from "node:crypto";
import {it,expect,vi} from "vitest";
vi.mock("server-only",()=>({}));
import {fixtures} from "../support/supabase";
import {reserveUpload,finalizeUpload} from "../../lib/supabase/uploads";
import {wave} from "../support/audio";
it("private direct upload above4.5MB is validated unchanged, finalized once, and isolated across users",async()=>{
 const f=await fixtures(),paths:{bucket:string;path:string}[]=[];
 try{
  const bytes=wave(179,16000);expect(bytes.length).toBeGreaterThan(4500000);
  const reserved=await reserveUpload(f.ids[0],{size:bytes.length,media:"audio/wav"});paths.push({bucket:"story-audio-staging",path:reserved.path},{bucket:"story-audio",path:f.ids[0]+"/"+reserved.id+"/original.wav"});
  expect((await f.sessions[0].storage.from("story-audio-staging").uploadToSignedUrl(reserved.path,reserved.token,bytes,{contentType:reserved.mediaType})).error).toBeNull();
  expect((await f.sessions[1].storage.from("story-audio-staging").download(reserved.path)).error).toBeTruthy();
  expect((await f.sessions[0].from("stories").select("id").eq("id",reserved.id)).data).toEqual([]);
  await expect(finalizeUpload(f.ids[1],reserved.id)).rejects.toMatchObject({code:"not_found"});
  const attempts=await Promise.allSettled([finalizeUpload(f.ids[0],reserved.id),finalizeUpload(f.ids[0],reserved.id)]);expect(attempts.filter(r=>r.status==="fulfilled").length).toBeGreaterThanOrEqual(1);
  expect(await finalizeUpload(f.ids[0],reserved.id)).toEqual({id:reserved.id});
  const row=await f.sessions[0].from("stories").select("audio_path,audio_duration_ms,audio_size_bytes,status").eq("id",reserved.id).single();expect(row.error).toBeNull();expect(row.data).toMatchObject({audio_size_bytes:bytes.length,audio_duration_ms:179000,status:"draft"});
  const saved=await f.sessions[0].storage.from("story-audio").download(row.data!.audio_path);expect(saved.error).toBeNull();expect(createHash("sha256").update(new Uint8Array(await saved.data!.arrayBuffer())).digest("hex")).toBe(createHash("sha256").update(bytes).digest("hex"));
  expect((await f.sessions[1].from("stories").select("id").eq("id",reserved.id)).data).toEqual([]);
  expect((await f.sessions[0].storage.from("story-audio-staging").download(reserved.path)).error).toBeTruthy();
 }finally{
  for(const item of paths)expect((await f.admin.storage.from(item.bucket).remove([item.path])).error).toBeNull();await f.cleanup();
 }
},180000);
it("ordinary clients cannot reserve/forge results; malformed staging is cleaned without creating stories",async()=>{
 const f=await fixtures();let path="";try{
  for(const db of [f.anonymous(),...f.sessions])expect((await db.rpc("m10_reserve_audio",{p_actor:f.ids[0],p_media:"audio/wav",p_bytes:10})).error).toBeTruthy();
  const reserved=await reserveUpload(f.ids[0],{size:8,media:"audio/mpeg"});path=reserved.path;expect((await f.sessions[0].storage.from("story-audio-staging").uploadToSignedUrl(path,reserved.token,new TextEncoder().encode("notaudio"),{contentType:"audio/mpeg"})).error).toBeNull();
  expect((await f.admin.rpc("m10_fail_audio",{p_upload:reserved.id,p_actor:f.ids[0],p_token:crypto.randomUUID()})).error?.message).toBe("stale_claim");
  await expect(finalizeUpload(f.ids[0],reserved.id)).rejects.toMatchObject({code:"invalid_audio"});
  expect((await f.sessions[0].from("stories").select("id").eq("id",reserved.id)).data).toEqual([]);expect((await f.admin.storage.from("story-audio-staging").download(path)).error).toBeTruthy();
 }finally{if(path)await f.admin.storage.from("story-audio-staging").remove([path]);await f.cleanup();}
},90000);
