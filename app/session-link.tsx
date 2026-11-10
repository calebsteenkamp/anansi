import type {ReactNode} from "react";
// Authenticated navigation deliberately requests a fresh document/session instead of reusing an RSC transition.
export function SessionLink({href,children,className}:{href:string;children:ReactNode;className?:string}){
 return <a href={href} className={className}>{children}</a>;
}
