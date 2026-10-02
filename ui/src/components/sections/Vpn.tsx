import Fold from '@/components/Fold'
import {rpc} from '@/lib/rpc'
import type {SubRow} from '@/lib/subs'
import { useEffect, useState } from 'react'
import { Globe, Lock, Network, ShieldCheck } from 'lucide-react'
import PoolList from '@/components/PoolList'
import IfacesPanel from '@/components/IfacesPanel'
import VlessScreen from '@/components/VlessScreen'
import XsteerPanel from '@/components/XsteerPanel'
import Doh from '@/components/sections/Doh'
import type { Live } from '@/lib/live'

export default function Vpn({live}:{live:Live}) {
    const [opened,setOpened]=useState<Record<string,boolean>>({})
    const [subs,setSubs]=useState<SubRow[]|null>(null)
    const [doh,setDoh]=useState<Awaited<ReturnType<typeof rpc.dohState>>|null>(null)
    const load=()=>{void rpc.subList().then(r=>setSubs(r.subs||[])).catch(()=>{});void rpc.dohState().then(setDoh).catch(()=>{})}
    useEffect(load,[])
    const fold=(title:string)=>({open:!!opened[title],onToggle:()=>{setOpened(v=>({...v,[title]:!v[title]}));load()}})
    const latest=Math.max(0,...(subs||[]).map(s=>s.mtime||0))
    const hours=latest?Math.max(0,Math.floor((Date.now()/1000-latest)/3600)):null
    return <div className="space-y-4"><section><h2 className="sp-sub mb-4">Выходы VPN</h2><PoolList live={live}/></section><div className="sp-sources"><h2 className="sp-sub mb-4">Источники</h2>
        <Fold {...fold("Подписки")} title="Подписки" subtitle={subs?`${subs.length} · ${hours===null?'время обновления неизвестно':hours<1?'последнее обновление менее часа назад':`последнее обновление ${hours} ч назад`}`:'Загрузка подписок'} icon={Globe}><VlessScreen/></Fold>
        <Fold {...fold("Свои туннели")} title="Свои туннели" subtitle="WireGuard, AmneziaWG, OpenVPN" icon={ShieldCheck}><IfacesPanel live={live}/></Fold>
        <Fold {...fold("XSTEER")} title="XSTEER" subtitle="Интерфейсы и параметры" icon={Network}><XsteerPanel live={live}/></Fold>
        <Fold {...fold("DoH")} title="DoH" subtitle={doh?(!doh.installed?'Не установлен':doh.running?'Включён':'Выключен'):'Проверка состояния'} icon={Lock}><Doh live={live}/></Fold>
        </div>
    </div>
}
