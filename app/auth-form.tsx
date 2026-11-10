"use client";
import {useActionState} from "react";
import Link from "next/link";
import {signIn,signUp} from "./auth-actions";
export function AuthForm({mode}:{mode:"sign-in"|"sign-up"}){
 const [state,action,pending]=useActionState(mode==="sign-in"?signIn:signUp,{message:""});
 return <main className="mx-auto w-full max-w-md p-8"><Link href="/">Anansi</Link><h1 className="my-6 text-3xl">{mode==="sign-in"?"Sign in":"Create account"}</h1>
 <form action={action} className="space-y-4"><label className="block">Email<input className="block w-full rounded border p-2" name="email" type="email" autoComplete="email" required maxLength={254}/></label>
 <label className="block">Password<input className="block w-full rounded border p-2" name="password" type="password" autoComplete={mode==="sign-in"?"current-password":"new-password"} required minLength={8} maxLength={128}/></label>
 <p role="status" aria-live="polite">{state.message}</p><button className="rounded bg-black px-4 py-2 text-white disabled:opacity-50" disabled={pending}>{pending?"Please wait…":mode==="sign-in"?"Sign in":"Create account"}</button></form>
 <p className="mt-6"><Link className="underline" href={mode==="sign-in"?"/sign-up":"/sign-in"}>{mode==="sign-in"?"Create account":"Sign in instead"}</Link></p></main>;
}
