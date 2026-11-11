import {assertDemoAccess,demoRestricted} from "../../../../lib/demo-access";
import {AudioError} from "../../../../lib/audio";
import {isSameOrigin} from "../../../../lib/request-origin";
import {serverClient} from "../../../../lib/supabase/server";
import {credentials} from "../../../../lib/profile";
import {privateJson} from "../../../../lib/api";
export async function POST(request:Request,{params}:{params:Promise<{mode:string}>}) {
 if(!isSameOrigin(request))
  return privateJson({message:"Sign in from the Anansi page in this browser."},403);
 const {mode}=await params;
 if(mode!=="sign-in"&&mode!=="sign-up")return privateJson({message:"Unknown authentication operation."},404);
 let input;
 try {
  // Retain a small request bound now that auth no longer uses Server Action body limits.
  const limit=16384;
  if(Number(request.headers.get("content-length"))>limit||!request.body)return privateJson({message:"Invalid authentication request."},413);
  const reader=request.body.getReader();const chunks:Uint8Array[]=[];let size=0;
  try {while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();return privateJson({message:"Invalid authentication request."},413);}chunks.push(value);}}
  finally{reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  const form=await new Request(request.url,{method:"POST",headers:{"content-type":request.headers.get("content-type")??""},body:bytes}).formData();
  input=credentials(form);
 }
 catch {return privateJson({message:"Enter a valid email and a password of 8–128 characters."},400);}
 try {
  const db=await serverClient();
  if(mode==="sign-in"){
   const {data,error}=await db.auth.signInWithPassword(input);
   if(error||!data?.user)return privateJson({message:"Unable to sign in. Check your credentials and email confirmation."},401);
   try{await assertDemoAccess(db);}catch(error){await db.auth.signOut();throw error;}
  }else{
   if(await demoRestricted(db))return privateJson({message:"This demo is invitation-only. Sign in with an invited account."},403);
   const {data,error}=await db.auth.signUp(input);
   if(error)return privateJson({message:"Unable to create account. Try again later or contact the demo owner."},400);
   if(!data.session)return privateJson({message:"Check your email to confirm registration before signing in."});
  }
  return privateJson({redirect:"/account"});
 }catch(error){if(error instanceof AudioError)return privateJson({message:error.message},error.status);return privateJson({message:"Authentication is temporarily unavailable. Your entries have been kept; try again."},503);}
}
