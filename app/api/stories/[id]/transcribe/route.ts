import {randomUUID} from "node:crypto";
import {apiError,privateJson} from "../../../../../lib/api";
import {AudioError} from "../../../../../lib/audio";
import {storySnapshot,workflowSession,workflowAdmin,transcriptionStore} from "../../../../../lib/supabase/story-workflow";
import {workflowBody} from "../../../../../lib/workflow-request";
import {transcribeStory} from "../../../../../lib/workflow";
import {providers} from "../../../../../lib/providers";
import {configFromEnv} from "../../../../../lib/providers/core";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 try{
  const body=await workflowBody(request);const {db,userId}=await workflowSession();const story=await storySnapshot(db,(await params).id);
  if(story.author_id!==userId)throw new AudioError("not_found","Story not found.",404);
  if(story.segments.length)return privateJson({reused:true,story});
  if(body.consent!==true)throw new AudioError("consent_required","Confirm sending this audio to the displayed transcription provider.",400);
  const config=configFromEnv(process.env);
  if(config.transcription==="vulavula")throw new AudioError("configuration","Vulavula isiXhosa transcription is unsupported. Enter a transcript manually.",503);
  const model=config.transcription==="mock"?"synthetic-v1":config.openaiTranscriptionModel;
  if(!model)throw new AudioError("configuration","Transcription model is missing.",503);
  const result=await transcribeStory(transcriptionStore(db,workflowAdmin(),story.id,userId,config.transcription,model),
   (bytes,path,mime)=>providers().transcribe({bytes,filename:path.split("/").at(-1)!,mimeType:mime},"xh"),body.retry===true,randomUUID);
  return privateJson({...result,story:await storySnapshot(db,story.id)});
 }catch(error){return apiError(error);}
}
