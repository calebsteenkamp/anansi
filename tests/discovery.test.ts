import {it,expect} from "vitest";
import {feedQuery,relationship,storyHref} from "../lib/discovery";
const id="11111111-1111-4111-8111-111111111111";
it("validates defaults and combined literal query parameters",()=>{expect(feedQuery(new URLSearchParams())).toEqual({feed:"all",language:"all",query:""});expect(feedQuery(new URLSearchParams({feed:"following",language:"en",q:" %_ ' "}))).toEqual({feed:"following",language:"en",query:"%_ '"});});
it.each([["feed","bad"],["language","fr"],["q","x".repeat(101)]])("rejects invalid %s input",(key,value)=>{expect(()=>feedQuery(new URLSearchParams({[key]:value}))).toThrow();});
it("validates relationship actions without trusting actor metadata",()=>{expect(relationship({kind:"follow",target:id,enabled:true,actor:"evil"})).toEqual({kind:"follow",target:id,enabled:true});for(const body of [{kind:"bad",target:id,enabled:true},{kind:"share",target:"bad",enabled:true},{kind:"follow",target:id,enabled:"true"}])expect(()=>relationship(body)).toThrow();});
it("builds canonical source links with explicit language",()=>{expect(storyHref({id,parent_story_id:null,language:"xh"})).toBe("/stories/"+id+"?language=xh");expect(storyHref({id:"en",parent_story_id:id,language:"en"})).toBe("/stories/"+id+"?language=en");});
