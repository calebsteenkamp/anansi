import {loadEnvConfig} from "@next/env";
import {readFile} from "node:fs/promises";
import {createClient} from "@supabase/supabase-js";
import {demoArguments,demoPlan,seedDemo,type DemoSource} from "../lib/demo";
async function main(){loadEnvConfig(process.cwd());const {storyteller,verifier,sample,apply}=demoArguments(process.argv.slice(2));
 const source:DemoSource={sample,bytes:new Uint8Array(await readFile("data/Phrase "+sample+"/Phrase "+sample+".mp3")),reference:await readFile("data/Phrase "+sample+"/isiXhosa.txt","utf8")};
 const plan=demoPlan(storyteller,verifier,source);if(!apply){console.log(JSON.stringify({mode:"dry-run",...plan,note:"No service writes. --apply creates only named demo records; mock text, provided audio."},null,2));return;}
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||new URL(url).hostname!=="lizbeiqyrwzkybpentrk.supabase.co"||!secret)throw new Error("Confirm Anansi project and local server credentials.");
 console.log(JSON.stringify({mode:"mock-demo",...await seedDemo(createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}}),storyteller,verifier,source),note:"Provided audio/reference; mock English, no paid call. Existing profiles/content/reviews not reset."},null,2));
}
main().catch(()=>{console.error("Demo seed failed. Check arguments/profiles, provided sample files, scoped records or active claims. No reset or paid call attempted.");process.exitCode=1;});
