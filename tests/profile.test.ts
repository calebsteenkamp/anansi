import {it,expect} from "vitest";
import {credentials,validateProfile} from "../lib/profile";
function profile(){const f=new FormData();f.set("display_name"," Storyteller ");f.set("bio","Hello");f.set("preferred_language","xh");f.append("spoken_languages","xh");f.append("spoken_languages","en");return f;}
it("validates profile languages and trims name",()=>expect(validateProfile(profile())).toEqual({display_name:"Storyteller",bio:"Hello",preferred_language:"xh",spoken_languages:["xh","en"]}));
it.each(["","x".repeat(81)])("rejects invalid names",name=>{const f=profile();f.set("display_name",name);expect(()=>validateProfile(f)).toThrow();});
it("rejects unsupported language and overlong bio",()=>{const f=profile();f.set("spoken_languages","fr");expect(()=>validateProfile(f)).toThrow();f.delete("spoken_languages");f.set("bio","x".repeat(501));expect(()=>validateProfile(f)).toThrow();});
it("accepts no language declaration and deduplicates",()=>{const f=profile();f.append("spoken_languages","en");expect(validateProfile(f).spoken_languages).toEqual(["xh","en"]);f.delete("spoken_languages");expect(validateProfile(f).spoken_languages).toEqual([]);});
it("validates credentials without leaking password",()=>{const f=new FormData();f.set("email","a@example.com");f.set("password","long-password");expect(credentials(f).email).toBe("a@example.com");f.set("password","short");expect(()=>credentials(f)).toThrow("8-128");});
