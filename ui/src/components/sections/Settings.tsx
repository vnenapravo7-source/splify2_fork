import { useEffect, useState } from 'react'
import { Info, Sliders, Stethoscope } from 'lucide-react'
import Fold from '@/components/Fold'
import Diagnostics from '@/components/sections/Diagnostics'
import BackupCard from '@/components/BackupCard'
import ClientNetsCard from '@/components/ClientNetsCard'
import EngineCard from '@/components/EngineCard'
import FetchCard from '@/components/FetchCard'
import ListsSourceCard from '@/components/ListsSourceCard'
import SelfUpdateCard from '@/components/SelfUpdateCard'
import TelemetryCard from '@/components/TelemetryCard'
import ZmFixCard from '@/components/ZmFixCard'
import { pending, usePending } from '@/lib/pending'
import { type Spec } from '@/lib/model'
import { type Live } from '@/lib/live'

type Screen = 'root' | 'diag' | 'general' | 'about' | 'backup'

export default function Settings({ live, initial }: { live: Live; initial?: Screen }) {
    const [screen, setScreen] = useState<Screen>(initial ?? 'root')
    const { spec } = usePending()
    const [editable, setEditable] = useState<Spec | null>(null)
    useEffect(() => { void pending.load().then(setEditable).catch(() => setEditable(null)) }, [])
    useEffect(() => { if (initial) setScreen(initial); if(initial==='about') requestAnimationFrame(()=>document.getElementById('sp-interface-update')?.scrollIntoView?.({block:'center'})) }, [initial])
    const warnings = (live.diag?.fail ?? 0) + (live.diag?.warn ?? 0)
    return <div className="sp-settings space-y-3">
      <Fold title="Общее" subtitle={(live.status?.lan_devices||spec?.lan_devices||[]).join(', ')||'Сеть и загрузки'} icon={Sliders} open={screen==='general'} onToggle={()=>setScreen(screen==='general'?'root':'general')}><ClientNetsCard spec={editable} status={live.status} onChange={next=>{setEditable(next);pending.edit(next)}}/><FetchCard/><ListsSourceCard/><ZmFixCard/></Fold>
      <Fold title="Диагностика" subtitle={warnings?`Проверок с находками: ${warnings}`:live.diag?'Находок нет':'Проверки загружаются'} icon={Stethoscope} open={screen==='diag'} onToggle={()=>setScreen(screen==='diag'?'root':'diag')}><Diagnostics live={live}/></Fold>
      <Fold title="О ПО" subtitle={[live.selfUpdate?.current,live.build?.version].filter(Boolean).join(' · ')} icon={Info} open={screen==='about'} onToggle={()=>setScreen(screen==='about'?'root':'about')}><EngineCard engine={live.build} releases={live.releases} onInstalled={live.refresh}/><SelfUpdateCard info={live.selfUpdate} onInstalled={live.refresh}/><TelemetryCard/></Fold>
      <Fold title="Бэкап настроек" subtitle="Скачать или восстановить архив" icon={Info} open={screen==='backup'} onToggle={()=>setScreen(screen==='backup'?'root':'backup')}><BackupCard showTitle={false}/></Fold>
    </div>
}
