import {AudioError} from "./audio";
export function privateJson(body: unknown, status = 200) {
 return Response.json(body, {status,headers:{"Cache-Control":"private, no-store, max-age=0","Pragma":"no-cache"}});
}
export function apiError(error: unknown) {
 if (error instanceof AudioError) return privateJson({error:{code:error.code,message:error.message}}, error.status);
 return privateJson({error:{code:"unavailable",message:"This operation is unavailable. Please try again."}},503);
}
