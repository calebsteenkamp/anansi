export const maxDuration=300;
import {apiError,privateJson} from "../../../../../lib/api";
import {storySnapshot,workflowSession,workflowAdmin} from "../../../../../lib/supabase/story-workflow";
import {translationView,translationStore,translateConfigured} from "../../../../../lib/supabase/translation-workflow";
import {workflowBody,rpcError} from "../../../../../lib/workflow-request";
import {translateNext} from "../../../../../lib/translation";
import {AudioError} from "../../../../../lib/audio";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 try{const {db,userId}=await workflowSession();const story=await storySnapshot(db,(await params).id);return privateJson({translation:await translationView(db,story,userId)});}catch(error){return apiError(error);}
}
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 try{
  const body=await workflowBody(request);const {db,userId}=await workflowSession();const story=await storySnapshot(db,(await params).id);
  if(story.author_id!==userId||story.status!=="published")throw new AudioError("not_found","Published story not found.",404);
  if(body.action!=="continue"&&body.action!=="retry")throw new AudioError("invalid_input","Choose Continue or Retry.",400);
  if(body.consent!==true)throw new AudioError("consent_required","Confirm permission to send transcript text to the displayed provider.",400);
  const current=await translationView(db,story,userId);
  if(!current||body.expectedProvider!==current.provider)throw new AudioError("provider_changed","Translation provider changed. Refresh saved progress and review permission again.",409);
  const admin=workflowAdmin();
  if(body.action==="retry"){const r=await admin.rpc("m5_retry_translation",{p_story:story.id,p_actor:userId});rpcError(r.error);}
  const result=await translateNext(translationStore(admin,story.id,userId),translateConfigured,true);
  return privateJson({...result,translation:await translationView(db,story,userId)});
 }catch(error){return apiError(error);}
}
