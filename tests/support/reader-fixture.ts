import {randomUUID} from "node:crypto";
import {fixtures} from "./supabase";
import {wave} from "./audio";
export async function readerFixture(){
 const f=await fixtures(),id=randomUUID(),path=f.ids[0]+"/"+id+"/original.wav";
 async function cleanup(){const r=await f.admin.storage.from("story-audio").remove([path]);if(r.error)throw new Error("T6 audio cleanup failed.");await f.cleanup();}
 try{
  for(let i=0;i<2;i++){const r=await f.sessions[i].from("profiles").update({preferred_language:i===0?"en":"xh",display_name:i===0?"T6 Storyteller":"T6 Listener"}).eq("id",f.ids[i]);if(r.error)throw new Error("T6 profile setup failed.");}
  const uploaded=await f.admin.storage.from("story-audio").upload(path,wave(4),{contentType:"audio/wav",upsert:false});if(uploaded.error)throw new Error("T6 audio setup failed.");
  const inserted=await f.admin.from("stories").insert({id,author_id:f.ids[0],kind:"original",language:"xh",title:"Synthetic T6 reader fixture",status:"draft",audio_path:path,audio_duration_ms:4000});if(inserted.error)throw new Error("T6 story setup failed.");
  const saved=await f.sessions[0].rpc("m4_save_transcript",{p_story:id,p_revision:0,p_title:"Synthetic T6 reader fixture",p_segments:[{id:randomUUID(),text:"Molo."},{id:randomUUID(),text:"Enkosi."}]});if(saved.error)throw new Error("T6 transcript setup failed.");
  const published=await f.admin.rpc("m4_publish",{p_story:id,p_actor:f.ids[0],p_revision:1,p_provider:"mock",p_model:"synthetic-v1"});if(published.error)throw new Error("T6 publish setup failed.");
  for(let i=0;i<2;i++){
   const claim=await f.admin.rpc("m5_claim_translation",{p_story:id,p_actor:f.ids[0],p_consent:true});if(claim.error)throw new Error("T6 task setup failed.");
   const finish=await f.admin.rpc("m5_finish_translation",{p_story:id,p_actor:f.ids[0],p_task:claim.data.task_id,p_token:claim.data.token,p_text:i===0?"Synthetic English one.":"Synthetic English two.",p_error:null});if(finish.error)throw new Error("T6 result setup failed.");
  }
  const rows=await f.sessions[0].from("segments").select("id,start_ms,end_ms").eq("story_id",id).order("position");if(rows.error||rows.data.length!==2)throw new Error("T6 source setup failed.");
  return {f,id,path,segments:rows.data,cleanup};
 }catch(error){await cleanup();throw error;}
}
