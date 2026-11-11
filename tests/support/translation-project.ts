import {workflowPreflight} from "./workflow-project";
export async function translationPreflight(browser=false){
 const c=await workflowPreflight(browser);
 const schema=await c.admin.from("stories").select("translation_consent_at").limit(1);
 if(schema.error)throw new Error("BLOCKED: owner must apply 20261110212329_m5_translation_processing.sql before T5 integration/browser tests.");
 return c;
}
