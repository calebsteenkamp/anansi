import {workflowSession} from "../../../../../../lib/supabase/story-workflow";
import {finalizeUpload} from "../../../../../../lib/supabase/uploads";
import {workflowBody} from "../../../../../../lib/workflow-request";
import {apiError,privateJson} from "../../../../../../lib/api";
export const maxDuration=300;
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){try{await workflowBody(request);const {userId}=await workflowSession();return privateJson(await finalizeUpload(userId,(await params).id),201);}catch(error){return apiError(error);}}
