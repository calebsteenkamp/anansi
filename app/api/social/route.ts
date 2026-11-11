import {apiError,privateJson} from "../../../lib/api";
import {AudioError} from "../../../lib/audio";
import {workflowSession} from "../../../lib/supabase/story-workflow";
import {relationship} from "../../../lib/discovery";
import {workflowBody,rpcError} from "../../../lib/workflow-request";
export async function POST(request:Request){try{const body=await workflowBody(request),input=relationship(body),{db,userId}=await workflowSession();if(body.expectedUserId!==userId)throw new AudioError("session_changed","Account changed. Reload discovery before continuing.",409);const r=await db.rpc("m8_relationship",{p_kind:input.kind,p_target:input.target,p_enabled:input.enabled});rpcError(r.error);return privateJson({ok:true});}catch(error){return apiError(error);}}
