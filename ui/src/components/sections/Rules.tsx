import { useEffect, useState } from 'react'
import RulesTab from '@/components/tabs/RulesTab'
import CatalogTab from '@/components/tabs/CatalogTab'
import CustomLists from '@/components/CustomLists'
import { rpc } from '@/lib/rpc'
import type { ServiceEntry } from '@/lib/model'
import type { Live } from '@/lib/live'

export default function Rules(props: {
    live: Live; wanted?: ServiceEntry | null; onWantedUsed?: () => void
    addNow?: boolean; onAddUsed?: () => void; onGoOutbounds?: () => void
    editName?: string | null; onEditUsed?: () => void
}) {
    const [tab, setTab] = useState('rules')
    const [wanted, setWanted] = useState<ServiceEntry | null>(null)
    const [local, setLocal] = useState<Record<string, { count: number; mtime: number }>>({})
    const reload = () => rpc.localLists().then(r => setLocal(r.files || {}))
    useEffect(() => { void reload().catch(() => setLocal({})) }, [])
    useEffect(() => { if (props.wanted || props.addNow || props.editName) setTab('rules') }, [props.wanted, props.addNow, props.editName])
    return <div className="space-y-4">
        <div className="sp-segments" role="group" aria-label="Разделы правил">
            {[['rules', 'Правила'], ['catalog', 'Каталог'], ['custom', 'Свои списки']].map(([id, text]) => <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)}>{text}</button>)}
        </div>
        {tab === 'rules' && <RulesTab {...props} wanted={wanted || props.wanted} onWantedUsed={() => { setWanted(null); props.onWantedUsed?.() }} />}
        {tab === 'catalog' && <CatalogTab onUseInRule={service => { setWanted(service); setTab('rules') }} />}
        {tab === 'custom' && <CustomLists local={local} onChanged={() => { void reload().catch(() => setLocal({})) }} />}
    </div>
}
