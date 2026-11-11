import {AudioError} from "./audio";
import {validId} from "./transcript";
export interface FeedCard {id:string;parent_story_id:string|null;author_id:string;title:string;language:"xh"|"en";created_at:string;author_name:string;following_author:boolean;shared:boolean;reposted_by:{id:string;name:string;following:boolean}[]}
export function feedQuery(params:URLSearchParams){const feed=params.get("feed")??"all",language=params.get("language")??"all",query=(params.get("q")??"").trim();if(!["all","following"].includes(feed)||!["all","xh","en"].includes(language)||query.length>100)throw new AudioError("invalid_feed","Choose a feed/language and a title search up to 100 characters.",400);return {feed,language,query};}
export function relationship(body:Record<string,unknown>){if((body.kind!=="follow"&&body.kind!=="share")||!validId(body.target)||typeof body.enabled!=="boolean")throw new AudioError("invalid_relationship","Choose a valid follow or repost action.",400);return {kind:body.kind,target:body.target,enabled:body.enabled};}
export function storyHref(card:Pick<FeedCard,"id"|"parent_story_id"|"language">){return "/stories/"+(card.parent_story_id??card.id)+"?language="+card.language;}
