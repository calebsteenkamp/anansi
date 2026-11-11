import {loadEnvConfig} from "@next/env";
import {createClient} from "@supabase/supabase-js";
async function main(){
 loadEnvConfig(process.cwd());const args=process.argv.slice(2);if(args.length>1||args.some(a=>a!=="--apply"))throw new Error();
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||new URL(url).hostname!=="lizbeiqyrwzkybpentrk.supabase.co"||!key)throw new Error();
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}),result=await db.rpc("m10_expired_audio");if(result.error||!Array.isArray(result.data))throw new Error();
 const rows=result.data as {id:string;path:string}[];
 for(const row of rows){if(!/^[0-9a-f-]{36}\/[0-9a-f-]{36}\/upload$/.test(row.path)||row.path.split("/")[1]!==row.id)throw new Error();}
 console.log(JSON.stringify({mode:args.includes("--apply")?"apply":"dry-run",count:rows.length,ids:rows.map(r=>r.id),note:"Expired staging only, after signed-token expiry plus10min. Original story audio is never removed."},null,2));
 if(!args.includes("--apply"))return;
 for(const row of rows){if((await db.storage.from("story-audio-staging").remove([row.path])).error)throw new Error();if((await db.rpc("m10_cleaned_audio",{p_upload:row.id})).error)throw new Error();}
}
main().catch(()=>{console.error("Staging maintenance failed. Check owner-applied SQL, local credentials and exact expired upload IDs; no original audio cleanup attempted.");process.exitCode=1;});
