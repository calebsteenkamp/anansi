import {createServerClient} from "@supabase/ssr";
import {NextResponse,type NextRequest} from "next/server";
export async function proxy(request:NextRequest){
 let response=NextResponse.next({request});
 const db=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{
  getAll:()=>request.cookies.getAll(),
  setAll(values){values.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});values.forEach(({name,value,options})=>response.cookies.set(name,value,options));}
 }});
 await db.auth.getClaims();
 response.headers.set("Cache-Control","private, no-store, max-age=0");
 response.headers.set("Pragma","no-cache");response.headers.set("Expires","0");
 return response;
}
export const config={matcher:["/account/:path*","/sign-in","/sign-up"]};
