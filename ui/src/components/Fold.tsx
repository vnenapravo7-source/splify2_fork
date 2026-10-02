import { useId, type ReactNode } from 'react'
import { ChevronDown, Globe } from 'lucide-react'
export default function Fold({title,subtitle,icon:Icon,children,open,onToggle}:{title:string;subtitle:string;icon:typeof Globe;children:ReactNode;open:boolean;onToggle:()=>void}) {
 const id=useId()
 return <section className="sp-fold"><h2><button type="button" className="sp-fold-heading" aria-expanded={open} aria-controls={id} onClick={onToggle}><span className="sp-fold-icon"><Icon className="h-5 w-5" aria-hidden="true"/></span><span className="min-w-0 flex-1 text-left"><strong>{title}</strong><span className="block text-xs text-muted-foreground">{subtitle}</span></span><ChevronDown className={open?'h-5 w-5 rotate-180':'h-5 w-5'} aria-hidden="true"/></button></h2>{open&&<div id={id} className="sp-fold-content">{children}</div>}</section>
}
