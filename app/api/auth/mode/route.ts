import {serverClient} from "../../../../lib/supabase/server";
import {demoRestricted} from "../../../../lib/demo-access";
import {apiError,privateJson} from "../../../../lib/api";
export async function GET(){try{return privateJson({registrationOpen:!await demoRestricted(await serverClient())});}catch(error){return apiError(error);}}
