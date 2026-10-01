import { useEffect, useState } from 'react'
import { ChevronLeft, Info, Sliders, Stethoscope } from 'lucide-react'
import HubRow from '@/components/HubRow'
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

type Screen = 'root' | 'diag' | 'general' | 'about'
const TITLE = { diag: 'Диагностика', general: 'Общее', about: 'О ПО' }

export default function Settings({ live, initial }: { live: Live; initial?: Screen }) {
    const [screen, setScreen] = useState<Screen>(initial ?? 'root')
    const { spec } = usePending()
    const [editable, setEditable] = useState<Spec | null>(null)
    useEffect(() => { void pending.load().then(setEditable).catch(() => setEditable(null)) }, [])
    useEffect(() => { if (initial) setScreen(initial) }, [initial])
    const warnings = (live.diag?.fail ?? 0) + (live.diag?.warn ?? 0)
    if (screen !== 'root') return <div className="space-y-4">
        <button type="button" onClick={() => setScreen('root')} className="flex items-center gap-1 text-sm text-primary"><ChevronLeft className="h-4 w-4" aria-hidden="true" /> Настройки</button>
        <h2 className="sp-title">{TITLE[screen]}</h2>
        {screen === 'diag' && <Diagnostics live={live} />}
        {screen === 'general' && <>
            <ClientNetsCard spec={editable} status={live.status} onChange={(next) => { setEditable(next); pending.edit(next) }} />
            <FetchCard /><ListsSourceCard /><ZmFixCard />
        </>}
        {screen === 'about' && <>
            <EngineCard engine={live.build} releases={live.releases} onInstalled={live.refresh} />
            <SelfUpdateCard info={live.selfUpdate} onInstalled={live.refresh} /><TelemetryCard />
        </>}
    </div>
    return <div className="sp-settings space-y-3">
        <HubRow icon={Stethoscope} title="Диагностика" state={warnings ? `проверок с находками: ${warnings}` : 'находок нет'} alarm={warnings > 0} onClick={() => setScreen('diag')} />
        <HubRow icon={Sliders} title="Общее" state={(live.status?.lan_devices || spec?.lan_devices || []).join(', ') || 'Сеть и загрузки'} onClick={() => setScreen('general')} />
        <HubRow icon={Info} title="О ПО" state={[live.selfUpdate?.current ? `splify2 ${live.selfUpdate.current}` : '', live.build?.version ? `steer ${live.build.version}` : ''].filter(Boolean).join(' · ')} onClick={() => setScreen('about')} />
        <div className="sp-backup-inline"><BackupCard /></div>
    </div>
}
