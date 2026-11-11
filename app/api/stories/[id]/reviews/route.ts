import {apiError,privateJson} from "../../../../../lib/api";
import {workflowSession,storySnapshot} from "../../../../../lib/supabase/story-workflow";
import {reviewState} from "../../../../../lib/supabase/reviews";
import {validateReview} from "../../../../../lib/reviews";
import {workflowBody,rpcError} from "../../../../../lib/workflow-request";
import {AudioError} from "../../../../../lib/audio";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){try{const {db,userId}=await workflowSession();const story=await storySnapshot(db,(await params).id);return privateJson(await reviewState(db,story,userId));}catch(error){return apiError(error);}}
export async function PUT(request:Request,{params}:{params:Promise<{id:string}>}){
 try{const body=await workflowBody(request);const input=validateReview(body);const {db,userId}=await workflowSession();if(body.expectedUserId!==userId)throw new AudioError("session_changed","Account changed. Reload reviews before saving.",409);
 const story=await storySnapshot(db,(await params).id),state=await reviewState(db,story,userId);
 if(!state.eligible)throw new AudioError("ineligible","List both isiXhosa and English in your profile to review.",403);
 const result=await db.rpc("m10_save_review",{p_translation:state.translationId,p_decision:input.decision,p_rating:input.rating,p_intent:input.intent,p_edits:input.edits,p_reuse:input.reuse??false});rpcError(result.error);return privateJson(await reviewState(db,story,userId));
 }catch(error){return apiError(error);}
}
