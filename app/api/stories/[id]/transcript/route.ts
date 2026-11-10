import {apiError,privateJson} from "../../../../../lib/api";
import {AudioError} from "../../../../../lib/audio";
import {storySnapshot,workflowSession} from "../../../../../lib/supabase/story-workflow";
import {workflowBody,rpcError} from "../../../../../lib/workflow-request";
import {validateTranscript} from "../../../../../lib/transcript";
type Context={params:Promise<{id:string}>};
export async function GET(_request:Request,{params}:Context){
 try{const {db,userId}=await workflowSession();const story=await storySnapshot(db,(await params).id);return privateJson({story,canEdit:story.author_id===userId&&story.status!=="published"});}
 catch(error){return apiError(error);}
}
export async function PUT(request:Request,{params}:Context){
 try{
  const body=await workflowBody(request);const {db,userId}=await workflowSession();const story=await storySnapshot(db,(await params).id);
  if(story.author_id!==userId)throw new AudioError("not_found","Story not found.",404);
  const input=validateTranscript(body,story.audio_duration_ms);
  const saved=await db.rpc("m4_save_transcript",{p_story:story.id,p_revision:input.revision,p_title:input.title,p_segments:input.segments});
  rpcError(saved.error);return privateJson({story:await storySnapshot(db,story.id)});
 }catch(error){return apiError(error);}
}
