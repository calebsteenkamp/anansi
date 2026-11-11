import {it,expect} from "vitest";
import {addLiveReservation} from "../lib/live-verification";
it("shares exactly six slots across local/hosted and never resets a used record",()=>{const local=addLiveReservation({calls:0,reservations:[]},3,"local","now");expect(()=>addLiveReservation(local,4,"hosted","later")).toThrow();const final=addLiveReservation(local,3,"hosted","later");expect(final.calls).toBe(6);expect(()=>addLiveReservation(final,1,"local","later")).toThrow();expect(local.calls).toBe(3);});
it("fails closed on corrupt or negative reservation records",()=>{for(const run of [{calls:-1,reservations:[]},{calls:1,reservations:[]},{calls:2,reservations:[{calls:2,phase:"other",at:"now"}]}])expect(()=>addLiveReservation(run,1,"local","later")).toThrow();});
