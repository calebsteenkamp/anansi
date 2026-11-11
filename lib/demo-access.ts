import type {SupabaseClient} from "@supabase/supabase-js";
import {AudioError} from "./audio";
export async function demoRestricted(db:SupabaseClient){const result=await db.rpc("m10_demo_mode");if(result.error||typeof result.data!=="boolean")throw new AudioError("unavailable","Demo access setup is unavailable. Ask the owner to verify M10 SQL.",503);return result.data;}
export async function assertDemoAccess(db:SupabaseClient){const result=await db.rpc("m10_demo_access");if(result.error)throw new AudioError("unavailable","Demo access could not be verified. Try again.",503);if(result.data!==true)throw new AudioError("account_not_allowed","This demo is limited to four invited accounts. Contact the owner for access.",403);}
