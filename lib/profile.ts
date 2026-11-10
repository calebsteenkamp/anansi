export const LANGUAGES = ["xh", "en"] as const;
export interface ProfileInput { display_name:string; bio:string; preferred_language:"xh"|"en"; spoken_languages:("xh"|"en")[] }
export function validateProfile(form:FormData):ProfileInput {
 const name=form.get("display_name"), bio=form.get("bio"), preferred=form.get("preferred_language"), spoken=form.getAll("spoken_languages");
 if(typeof name!=="string"||!name.trim()||name.trim().length>80||typeof bio!=="string"||bio.length>500||!(preferred==="xh"||preferred==="en")||spoken.some(x=>x!=="xh"&&x!=="en"))throw new Error("Enter a name (1-80 characters), bio (up to 500), and valid languages.");
 return {display_name:name.trim(),bio,preferred_language:preferred,spoken_languages:[...new Set(spoken)] as ("xh"|"en")[]};
}
export function credentials(form:FormData) {
 const email=form.get("email"),password=form.get("password");
 if(typeof email!=="string"||email.length>254||!/^\S+@\S+\.\S+$/.test(email)||typeof password!=="string"||password.length<8||password.length>128)throw new Error("Enter a valid email and a password of 8-128 characters.");
 return {email:email.trim(),password};
}
