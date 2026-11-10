// Next's internal Request URL can use localhost even when a LAN Host served the page.
// Match the browser Origin against the actual HTTP Host, never a forwarded host supplied by callers.
export function isSameOrigin(request:Request) {
 const origin=request.headers.get("origin");
 if(!origin||origin==="null")return false;
 try{
  const url=new URL(origin), internal=new URL(request.url);
  const host=request.headers.get("host")??internal.host;
  return origin===url.origin&&url.protocol===internal.protocol&&url.host.toLowerCase()===host.toLowerCase();
 }catch{return false;}
}
