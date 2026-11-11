import {apiError,privateJson} from "../../../lib/api";
import {workflowSession} from "../../../lib/supabase/story-workflow";
import {feedQuery} from "../../../lib/discovery";
import {rpcError} from "../../../lib/workflow-request";
export async function GET(request:Request){try{const input=feedQuery(new URL(request.url).searchParams),{db,userId}=await workflowSession();const r=await db.rpc("m8_feed",{p_feed:input.feed,p_language:input.language,p_query:input.query});rpcError(r.error);return privateJson({userId,cards:r.data});}catch(error){return apiError(error);}}
