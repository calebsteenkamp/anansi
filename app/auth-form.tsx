"use client";
import {useEffect,useRef,useState,useSyncExternalStore} from "react";
import Link from "next/link";
const subscribe=()=>()=>{};
const clientReady=()=>true;
const serverReady=()=>false;
export function AuthForm({mode}:{mode:"sign-in"|"sign-up"}){
 const ready=useSyncExternalStore(subscribe,clientReady,serverReady);
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [message,setMessage]=useState("");
 const [pending,setPending]=useState(false);
 const submitting=useRef(false);
 const [registrationOpen,setRegistrationOpen]=useState<boolean|null>(null),[accessError,setAccessError]=useState("");
 useEffect(()=>{let live=true;fetch("/api/auth/mode",{cache:"no-store"}).then(async r=>{const data=await r.json();if(!r.ok||typeof data.registrationOpen!=="boolean")throw new Error();return data;}).then(r=>{if(live)setRegistrationOpen(r.registrationOpen);}).catch(()=>{if(live){setRegistrationOpen(false);setAccessError("Account access setup is temporarily unavailable. Contact the owner.");}});return()=>{live=false;};},[]);
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(!ready||submitting.current)return;
  const data=new FormData(event.currentTarget);
  submitting.current=true;setPending(true);setMessage("");
  try{
   const response=await fetch("/api/auth/"+mode,{method:"POST",body:data,headers:{Accept:"application/json"}});
   if(!response.headers.get("content-type")?.includes("application/json"))throw new Error("Unexpected response");
   const result=await response.json();
   if(response.ok&&result.redirect==="/account"){// JSON cookie changes do not invalidate Next's private client cache. Reset the document after auth.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/account");return;}
   setMessage(typeof result.message==="string"?result.message:"Authentication failed. Your entries have been kept; try again.");
  }catch{setMessage("Could not reach sign-in reliably. Your entries have been kept. Check the connection and try again.");}
  submitting.current=false;setPending(false);
 }
 return <main className="mx-auto w-full max-w-md p-8"><Link href="/">Anansi</Link><h1 className="my-6 text-3xl">{mode==="sign-in"?"Sign in":"Create account"}</h1>
 {mode==="sign-up"&&registrationOpen===false?<p role="status">{accessError||"This demo is invitation-only. Sign in with an invited account."}</p>:<form onSubmit={submit} onReset={event=>event.preventDefault()} className="space-y-4">
 <fieldset disabled={!ready||pending||(mode==="sign-up"&&registrationOpen!==true)} className="space-y-4"><legend className="sr-only">Account credentials</legend>
 <label className="block">Email<input className="block w-full rounded border p-2" name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} value={email} onChange={event=>setEmail(event.target.value)} required maxLength={254}/></label>
 <label className="block">Password<input className="block w-full rounded border p-2" name="password" type="password" autoComplete={mode==="sign-in"?"current-password":"new-password"} value={password} onChange={event=>setPassword(event.target.value)} required minLength={8} maxLength={128}/></label>
 <button type="submit" className="rounded bg-black px-4 py-2 text-white disabled:opacity-50" disabled={!ready||pending||(mode==="sign-up"&&registrationOpen!==true)}>{!ready?"Preparing sign-in…":pending?"Please wait…":mode==="sign-in"?"Sign in":"Create account"}</button>
 </fieldset><p role="status" aria-live="polite">{message}</p></form>}
 <p className="mt-6"><Link className="underline" href={mode==="sign-in"?"/sign-up":"/sign-in"}>{mode==="sign-in"?"Create account":"Sign in instead"}</Link></p></main>;
}
