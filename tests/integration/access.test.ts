import {beforeAll,afterAll,it,expect} from "vitest";
import {fixtures} from "../support/supabase";
import {randomUUID} from "node:crypto";
let f:Awaited<ReturnType<typeof fixtures>>;
let draft:string,published:string;
beforeAll(async()=>{
 f=await fixtures();
 for(const status of ["draft","published"]){const {data,error}=await f.admin.from("stories").insert({author_id:f.ids[0],kind:"original",language:"xh",title:"T2 fixture",status}).select("id").single();if(error)throw new Error("Fixture story setup failed.");if(status==="draft")draft=data.id;else published=data.id;}
},30000);
afterAll(async()=>{if(f)await f.cleanup();},30000);
it("allows own profile edits and denies another user/identity changes",async()=>{
 const own=await f.sessions[0].from("profiles").update({display_name:"T2 storyteller"}).eq("id",f.ids[0]).select("id");expect(own.error).toBeNull();expect(own.data).toHaveLength(1);
 const other=await f.sessions[1].from("profiles").update({display_name:"attacker"}).eq("id",f.ids[0]).select("id");expect(other.error||other.data?.length===0).toBeTruthy();
 const identity=await f.sessions[0].from("profiles").update({id:f.ids[1]}).eq("id",f.ids[0]);expect(identity.error).toBeTruthy();
});
it("isolates drafts while exposing published content to signed-in users",async()=>{
 const owner=await f.sessions[0].from("stories").select("id").eq("id",draft);expect(owner.error).toBeNull();expect(owner.data).toHaveLength(1);
 const other=await f.sessions[1].from("stories").select("id").eq("id",draft);expect(other.error).toBeNull();expect(other.data).toHaveLength(0);
 const visible=await f.sessions[1].from("stories").select("id").eq("id",published);expect(visible.error).toBeNull();expect(visible.data).toHaveLength(1);
 const anon=await f.anonymous().from("stories").select("id").eq("id",published);expect(anon.error||anon.data?.length===0).toBeTruthy();
});
it("denies future workflow writes and invalid profiles at database level",async()=>{
 expect((await f.sessions[0].from("stories").insert({author_id:f.ids[0],kind:"original",language:"xh",title:"forged",status:"published"})).error).toBeTruthy();
 expect((await f.sessions[0].from("profiles").update({preferred_language:"fr"}).eq("id",f.ids[0])).error).toBeTruthy();
 expect((await f.sessions[0].from("profiles").update({spoken_languages:["fr"]}).eq("id",f.ids[0])).error).toBeTruthy();
});
it("creates a private bucket and denies anonymous object access",async()=>{
 const {data,error}=await f.admin.storage.getBucket("story-audio");expect(error).toBeNull();expect(data?.public).toBe(false);
 expect((await f.anonymous().storage.from("story-audio").createSignedUrl(f.ids[0]+"/not-an-object",60)).error).toBeTruthy();
});

it("authorizes real private objects by draft ownership and published visibility",async()=>{
 const path=f.ids[0]+"/t2-"+randomUUID()+".mp3";
 const upload=await f.admin.storage.from("story-audio").upload(path,new Uint8Array([0]),{contentType:"audio/mpeg"});expect(upload.error).toBeNull();
 try{
  expect((await f.admin.from("stories").update({audio_path:path}).eq("id",draft)).error).toBeNull();
  expect((await f.sessions[0].storage.from("story-audio").createSignedUrl(path,30)).error).toBeNull();
  expect((await f.sessions[1].storage.from("story-audio").createSignedUrl(path,30)).error).toBeTruthy();
  expect((await f.anonymous().storage.from("story-audio").createSignedUrl(path,30)).error).toBeTruthy();
  expect((await f.admin.from("stories").update({status:"published"}).eq("id",draft)).error).toBeNull();
  expect((await f.sessions[1].storage.from("story-audio").createSignedUrl(path,30)).error).toBeNull();
 }finally{const cleanup=await f.admin.storage.from("story-audio").remove([path]);expect(cleanup.error).toBeNull();}
});
