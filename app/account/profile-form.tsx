"use client";
import {useActionState,useState} from "react";
import {saveProfile,type ProfileState} from "../auth-actions";
import type {ProfileInput} from "../../lib/profile";

export function ProfileForm({profile}:{profile:ProfileInput}){
 const [draft,setDraft]=useState(profile);
 const [state,action,pending]=useActionState(async(previous:ProfileState,form:FormData)=>{
  const result=await saveProfile(previous,form);
  if(result.profile)setDraft(result.profile);
  return result;
 },{message:""});
 function spoken(code:"xh"|"en",checked:boolean){
  setDraft(current=>({...current,spoken_languages:checked?[...new Set([...current.spoken_languages,code])]:current.spoken_languages.filter(value=>value!==code)}));
 }
 return <form action={action} onReset={event=>event.preventDefault()} className="mt-6 space-y-4">
 <fieldset disabled={pending} className="space-y-4"><legend className="sr-only">Profile details</legend>
 <label className="block">Display name<input className="block w-full rounded border p-2" name="display_name" value={draft.display_name} onChange={event=>setDraft({...draft,display_name:event.target.value})} required maxLength={80}/></label>
 <label className="block">Bio<textarea className="block w-full rounded border p-2" name="bio" value={draft.bio} onChange={event=>setDraft({...draft,bio:event.target.value})} maxLength={500}/></label>
 <label className="block">Preferred language<select className="ml-3 rounded border p-2" name="preferred_language" value={draft.preferred_language} onChange={event=>setDraft({...draft,preferred_language:event.target.value as "xh"|"en"})}><option value="xh">isiXhosa</option><option value="en">English</option></select></label>
 <fieldset><legend>Spoken languages (self-declared)</legend>{(["xh","en"] as const).map(code=><label className="mr-4" key={code}><input name="spoken_languages" type="checkbox" value={code} checked={draft.spoken_languages.includes(code)} onChange={event=>spoken(code,event.target.checked)}/> {code==="xh"?"isiXhosa":"English"}</label>)}</fieldset>
 </fieldset>
 <p role="status" aria-live="polite">{state.message}</p>
 <button className="rounded bg-black px-4 py-2 text-white disabled:opacity-50" disabled={pending}>{pending?"Saving…":"Save profile"}</button>
 </form>;
}
