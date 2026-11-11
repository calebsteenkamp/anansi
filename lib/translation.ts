import {AudioError} from "./audio";
import {ProviderError,type Provider,type Translation} from "./providers/types";
export interface TranslationClaim {reused:boolean;task_id?:string;token?:string;text?:string;provider?:Provider;model?:string}
export interface TranslationStore {
 claim(consent:boolean):Promise<TranslationClaim>;
 finish(task:string,token:string,text:string|null,error:string|null):Promise<void>;
}
export async function translateNext(store:TranslationStore,adapter:(text:string,provider:Provider,model:string)=>Promise<Translation>,consent:boolean){
 const claim=await store.claim(consent);
 if(claim.reused)return {reused:true};
 if(!claim.task_id||!claim.token||!claim.text||!claim.model||!claim.provider)throw new AudioError("unavailable","Invalid translation state. Contact the owner.",503);
 let text:string;
 try{
  const result=await adapter(claim.text,claim.provider,claim.model);
  if(!result.text?.trim()||Array.from(result.text.trim()).length>50000||result.provenance.provider!==claim.provider||result.provenance.model!==claim.model||result.provenance.mock!==(claim.provider==="mock"))throw new ProviderError("malformed");
  text=result.text.trim();
 }catch(error){
  const code=error instanceof ProviderError?error.code:"provider";
  await store.finish(claim.task_id,claim.token,null,code);
  throw new AudioError("translation_failed","Translation failed ("+code+"). Completed segments are saved. Choose Retry explicitly.",502);
 }
 // Leave the claim intact if persistence fails. Never repeat the paid request here.
 await store.finish(claim.task_id,claim.token,text,null);
 return {reused:false};
}
export interface TranslationView {
 id:string;status:string;provider:string;model:string;owner:boolean;total:number;complete:number;failed:number;processing:number;retryRequired:boolean;
 segments:{id:string;text:string;position:number}[];
}
