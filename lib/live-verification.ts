export interface LiveRun {calls:number;reservations:{phase:string;calls:number;at:string}[]}
export function addLiveReservation(run:LiveRun,calls:number,phase:string,at:string):LiveRun{
 if(!Number.isInteger(run.calls)||run.calls<0||!Array.isArray(run.reservations)||!Number.isInteger(calls)||calls<1||calls>6||run.calls+calls>6||!["local","hosted"].includes(phase))throw new Error("Live verification cap exceeded or invalid record.");
 if(run.reservations.some(r=>!Number.isInteger(r.calls)||r.calls<1||r.calls>6||!["local","hosted"].includes(r.phase))||run.reservations.reduce((sum,r)=>sum+r.calls,0)!==run.calls)throw new Error("Invalid reservation history.");
 return {calls:run.calls+calls,reservations:[...run.reservations,{phase,calls,at}]};
}
