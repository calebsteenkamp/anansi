import {workflowSession} from "../../../../lib/supabase/story-workflow";
import {reserveUpload} from "../../../../lib/supabase/uploads";
import {uploadInput} from "../../../../lib/upload-input";
import {workflowBody} from "../../../../lib/workflow-request";
import {apiError,privateJson} from "../../../../lib/api";
export async function POST(request:Request){try{const body=await workflowBody(request),{userId}=await workflowSession();return privateJson(await reserveUpload(userId,uploadInput(body)),201);}catch(error){return apiError(error);}}
