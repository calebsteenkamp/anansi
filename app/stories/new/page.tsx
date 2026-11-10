import {Suspense} from "react";
import {SessionLink as Link} from "../../session-link";
import {connection} from "next/server";
import {requireUser} from "../../../lib/supabase/server";
import {CaptureForm} from "./capture-form";
async function Capture() {
 await connection();
 const {userId} = await requireUser();
 return <section><h1 className="text-3xl">Record your story</h1><CaptureForm key={userId}/></section>;
}
export default function Page() {
 return <main className="mx-auto max-w-2xl p-8"><nav className="mb-6 flex gap-5"><Link href="/account" className="underline">Your profile and drafts</Link></nav><Suspense fallback={<p>Loading capture…</p>}><Capture/></Suspense></main>;
}
