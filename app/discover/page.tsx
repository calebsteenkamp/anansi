import {Suspense} from "react";
import {connection} from "next/server";
import {requireUser} from "../../lib/supabase/server";
import {SessionLink} from "../session-link";
import {Discovery} from "./discovery";
async function Content(){await connection();const {db,userId}=await requireUser();const r=await db.rpc("m8_feed",{p_feed:"all",p_language:"all",p_query:""});if(r.error)return <p role="alert">Discovery setup unavailable. Ask the owner to verify the M8 migration.</p>;return <Discovery userId={userId} initialCards={r.data}/>;}
export default function Page(){return <main className="mx-auto max-w-3xl p-6"><nav className="mb-6 flex flex-wrap gap-4"><SessionLink className="underline" href="/account">Your profile</SessionLink><SessionLink className="underline" href="/stories/new">Record a story</SessionLink></nav><h1 className="text-3xl">Discover stories</h1><Suspense fallback={<p>Loading discovery…</p>}><Content/></Suspense></main>;}
