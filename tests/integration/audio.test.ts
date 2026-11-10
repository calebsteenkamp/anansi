import {beforeAll,afterAll,it,expect,vi} from "vitest";
vi.mock("server-only",()=>({}));
import {randomUUID} from "node:crypto";
import {fixtures} from "../support/supabase";
import {audioPreflight} from "../support/audio-project";
import {wave} from "../support/audio";
import {inspectAudio} from "../../lib/audio-probe";
import {persistDraft} from "../../lib/drafts";
import {draftStore} from "../../lib/supabase/draft-store";
let f:Awaited<ReturnType<typeof fixtures>>;
const paths:string[]=[];
let storyId:string, path:string;
beforeAll(async()=>{await audioPreflight();f=await fixtures();},30000);
afterAll(async()=>{if(f){if(paths.length){const removed=await f.admin.storage.from("story-audio").remove(paths);if(removed.error)throw new Error("T3 object cleanup failed.");}await f.cleanup();}},30000);
it("persists actual validated bytes and authorizes owner-only playback",async()=>{
 const bytes=wave();const audio=await inspectAudio(bytes);storyId=randomUUID();path=f.ids[0]+"/"+storyId+"/original.wav";paths.push(path);
 expect(await persistDraft(draftStore(),{id:storyId,userId:f.ids[0],bytes,audio,consentAt:new Date().toISOString()})).toEqual({id:storyId});
 const own=await f.sessions[0].from("stories").select("audio_duration_ms,audio_media_type,audio_size_bytes,audio_consent_at").eq("id",storyId).single();
 expect(own.error).toBeNull();expect(own.data).toMatchObject({audio_duration_ms:250,audio_media_type:"audio/wav",audio_size_bytes:bytes.length});expect(own.data?.audio_consent_at).toBeTruthy();
 expect((await f.sessions[1].from("stories").select("id").eq("id",storyId)).data).toEqual([]);
 const signed=await f.sessions[0].storage.from("story-audio").createSignedUrl(path,30);
 expect(signed.error).toBeNull();const response=await fetch(signed.data!.signedUrl);expect(response.ok).toBe(true);expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes);
 expect((await f.sessions[1].storage.from("story-audio").createSignedUrl(path,30)).error).toBeTruthy();
 expect((await f.anonymous().storage.from("story-audio").download(path)).error).toBeTruthy();
});
it("denies direct uploads, replacement, deletion and metadata forgery by ordinary clients",async()=>{
 const ownPath=f.ids[0]+"/"+randomUUID()+".wav";paths.push(ownPath);
 const ownUpload=await f.sessions[0].storage.from("story-audio").upload(ownPath,wave(),{contentType:"audio/wav"});expect(ownUpload.error).toBeTruthy();
 const foreignPath=f.ids[0]+"/"+randomUUID()+".wav";paths.push(foreignPath);
 const foreignUpload=await f.sessions[1].storage.from("story-audio").upload(foreignPath,wave(),{contentType:"audio/wav"});expect(foreignUpload.error).toBeTruthy();
 expect((await f.sessions[0].storage.from("story-audio").update(path,wave(0.5),{contentType:"audio/wav"})).error).toBeTruthy();
 await f.sessions[1].storage.from("story-audio").remove([path]);
 expect((await f.sessions[0].storage.from("story-audio").download(path)).data?.size).toBe(wave().length);
 expect((await f.sessions[0].from("stories").update({author_id:f.ids[1],status:"published"}).eq("id",storyId)).error).toBeTruthy();
 expect((await f.sessions[0].from("stories").update({audio_consent_at:null}).eq("id",storyId)).error).toBeTruthy();
});
it("removes the real uploaded object when database finalization is rejected",async()=>{
 const id=randomUUID(), failedPath=f.ids[0]+"/"+id+"/original.wav";paths.push(failedPath);
 const store=draftStore();
 const fail={...store,insert:async()=>{const result=await f.admin.from("stories").insert({id,author_id:f.ids[0],kind:"original",language:"xh",title:"T3 invalid",status:"invalid"});expect(result.error).toBeTruthy();throw new Error("Simulated rejected finalization");}};
 await expect(persistDraft(fail,{id,userId:f.ids[0],bytes:wave(),audio:await inspectAudio(wave()),consentAt:new Date().toISOString()})).rejects.toMatchObject({code:"save_failed"});
 const remaining=await f.admin.storage.from("story-audio").list(f.ids[0]+"/"+id);expect(remaining.error).toBeNull();expect(remaining.data).toEqual([]);
 expect((await f.admin.from("stories").select("id").eq("id",id)).data).toEqual([]);
});
it("rejects malformed bytes before storage and enforces capture metadata constraints",async()=>{
 await expect(inspectAudio(new TextEncoder().encode("fake .mp3"))).rejects.toMatchObject({code:"invalid_audio"});
 const invalid=await f.admin.from("stories").insert({author_id:f.ids[0],kind:"original",language:"xh",title:"T3 invalid metadata",audio_consent_at:new Date().toISOString()});
 expect(invalid.error?.code).toBe("23514");
});
