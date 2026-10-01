import { useState, type ReactNode } from 'react'
import { ChevronDown, Globe, Lock, Network, ShieldCheck } from 'lucide-react'
import PoolList from '@/components/PoolList'
import IfacesPanel from '@/components/IfacesPanel'
import VlessScreen from '@/components/VlessScreen'
import XsteerPanel from '@/components/XsteerPanel'
import Doh from '@/components/sections/Doh'
import type { Live } from '@/lib/live'

function Fold({title,subtitle,icon:Icon,children}:{title:string;subtitle:string;icon:typeof Globe;children:ReactNode}) {
    const [open,setOpen]=useState(false)
    return <section className="sp-fold"><button type="button" className="sp-fold-heading" aria-expanded={open} onClick={()=>setOpen(!open)}><span className="sp-fold-icon"><Icon className="h-5 w-5" aria-hidden="true"/></span><span className="min-w-0 flex-1 text-left"><strong>{title}</strong><span className="block text-xs text-muted-foreground">{subtitle}</span></span><ChevronDown className={open?'h-5 w-5 rotate-180':'h-5 w-5'} aria-hidden="true"/></button>{open&&<div className="sp-fold-content">{children}</div>}</section>
}
export default function Vpn({live}:{live:Live}) {
    return <div className="space-y-4"><h2 className="sp-sub">Источники</h2>
        <Fold title="Подписки" subtitle="Узлы, ссылки и автообновление" icon={Globe}><VlessScreen/></Fold>
        <Fold title="Свои туннели" subtitle="WireGuard, AmneziaWG, OpenVPN" icon={ShieldCheck}><IfacesPanel live={live}/></Fold>
        <Fold title="XSTEER" subtitle="Интерфейсы и параметры" icon={Network}><XsteerPanel live={live}/></Fold>
        <Fold title="DoH" subtitle="Шифрованный DNS и запросы через туннель" icon={Lock}><Doh live={live}/></Fold>
        <section className="sp-inline-outputs"><h2 className="sp-sub mb-4">Выходы VPN</h2><PoolList live={live}/></section>
    </div>
}
