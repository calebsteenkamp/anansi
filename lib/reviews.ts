import {AudioError} from "./audio";
import {validId} from "./transcript";
export interface ReviewInput {decision:"approve"|"reject";rating:number;intent:string;edits:{segment_id:string;text:string}[]}
export interface Review extends ReviewInput {id:string;reviewer_id:string;name:string;storyteller:boolean;updated_at:string}
export interface ReviewState {userId:string;eligible:boolean;translationId:string;reviews:Review[]}
export function validateReview(body:Record<string,unknown>):ReviewInput{
 if((body.decision!=="approve"&&body.decision!=="reject")||!Number.isInteger(body.rating)||Number(body.rating)<1||Number(body.rating)>5||typeof body.intent!=="string"||body.intent.length>5000||!Array.isArray(body.edits)||body.edits.length>500)throw new AudioError("invalid_review","Choose approve/reject, an integer rating 1–5, and an intent comment up to 5,000 characters.",400);
 const edits:{segment_id:string;text:string}[]=[];const ids=new Set<string>();let total=0;
 for(const item of body.edits){if(!item||!validId(item.segment_id)||typeof item.text!=="string"||!item.text.trim()||ids.has(item.segment_id))throw new AudioError("invalid_review","Each correction needs one valid segment and nonempty text.",400);ids.add(item.segment_id);total+=Array.from(item.text).length;edits.push({segment_id:item.segment_id,text:item.text.trim()});}
 if(total>50000)throw new AudioError("invalid_review","Corrections exceed 50,000 characters.",400);
 return {decision:body.decision,rating:Number(body.rating),intent:body.intent,edits};
}
export function confidence(reviews:Pick<Review,"decision"|"rating">[]){
 if(!reviews.length)return {label:"Awaiting verification",mean:null};
 const mean=reviews.reduce((n,r)=>n+r.rating,0)/reviews.length;
 const rejected=reviews.filter(r=>r.decision==="reject").length;
 return {label:rejected>reviews.length-rejected?"Disputed":mean<3?"Fairly confident":"Confident",mean};
}
export function latestCorrection(reviews:Review[]):Review|null{return [...reviews].filter(r=>r.edits.length).sort((a,b)=>Date.parse(b.updated_at)-Date.parse(a.updated_at)||(a.id<b.id?1:a.id>b.id?-1:0))[0]??null;}
