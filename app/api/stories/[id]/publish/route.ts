import {apiError,privateJson} from "../../../../../lib/api";
import {AudioError} from "../../../../../lib/audio";
import {storySnapshot,workflowSession,workflowAdmin} from "../../../../../lib/supabase/story-workflow";
import {workflowBody,rpcError} from "../../../../../lib/workflow-request";
import {configFromEnv} from "../../../../../lib/providers/core";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 try{
  const body=await workflowBody(request);const {db,userId}=await workflowSession();const story=await storySnapshot(db,(await params).id);
  if(story.author_id!==userId)throw new AudioError("not_found","Story not found.",404);
  if(!Number.isSafeInteger(body.revision)||Number(body.revision)<0)throw new AudioError("invalid_input","Reload the saved transcript before publishing.",400);
  const config=configFromEnv(process.env);
  const model=config.translation==="mock"?"synthetic-v1":config.translation==="vulavula"?"vulavula-translate-api":config.openaiTranslationModel;
  const result=await workflowAdmin().rpc("m4_publish",{p_story:story.id,p_actor:userId,p_revision:body.revision,p_provider:config.translation,p_model:model});
  rpcError(result.error);
  return privateJson({...result.data,story:await storySnapshot(db,story.id)});
 }catch(error){return apiError(error);}
}
