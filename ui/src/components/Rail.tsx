import EngineToggle from '@/components/EngineToggle'
import { House, Route, Settings, ShieldCheck, Waves } from 'lucide-react'
import { type Live } from '@/lib/live'
import { assetUrl } from '@/lib/assets'
import { type SectionId } from '@/lib/sections'

/** Верхняя навигация: одна и та же на телефоне и широком экране. */
const ITEMS: { id: SectionId; label: string; icon: typeof House }[] = [
    { id: 'home', label: 'Обзор', icon: House },
    { id: 'rules', label: 'Правила', icon: Route },
    { id: 'vpn', label: 'Подключения', icon: ShieldCheck },
    /* DoH is available inside connections; Zapret remains independent. */
    { id: 'zapret', label: 'Zapret', icon: Waves },
    { id: 'settings', label: 'Настройки', icon: Settings },
]

export interface RailProps {
    live: Live
    section: SectionId
    onSection: (s: SectionId) => void
    /** Числа у пунктов. Приходят снаружи: рельс не должен спрашивать роутер сам — тогда на
     *  экране оказались бы два разных мгновения, его и разделов. */
    counts: Partial<Record<SectionId, { text: string; alarm?: boolean }>>
}


/** Приписка к имени выпуска — «beta 1» у предвыпуска. Пишется на сборке (vite.config.ts,
 *  SPLIFY_RELEASE_SUFFIX); версия пакета при этом остаётся числом. На стенде не определена. */
function releaseSuffix(): string {
    return typeof __RELEASE_SUFFIX__ === 'string' ? __RELEASE_SUFFIX__ : ''
}

export default function Rail({ live, section, onSection, counts }: RailProps) {
    return <header className="sp-topbar">
        <div className="sp-brand"><img src={assetUrl('favicon.svg')} alt="" aria-hidden="true" className="h-8 w-8" /><div><strong>splify2</strong><div className="text-xs text-muted-foreground">{[live.selfUpdate?.current, 'Glass Expressive', releaseSuffix()].filter(Boolean).join(' ')}</div></div></div>
        <nav className="sp-topnav" aria-label="Разделы">{ITEMS.map(({id,label,icon:Icon}) => <button key={id} type="button" aria-current={section===id?'page':undefined} onClick={()=>onSection(id)} className={['sp-nav-item',section===id?'bg-primary/10 text-primary font-medium':'text-subtle hover:bg-accent'].join(' ')}><Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true"/><span>{label}</span>{id==='home'&&!live.phase&&(live.error||(live.diag?.fail||0)+(live.diag?.warn||0)>0)&&<span className="sp-problem-dot" aria-label="Есть проблемы" title="Откройте диагностику в настройках"/>}{counts[id]&&<span className="text-xs text-muted-foreground">{id==='vpn'?Object.entries(live.status?.outputs||{}).filter(([,o])=>o.kind!=='direct'&&!o.part_of&&o.kind!=='zapret'&&o.up===true).length:counts[id]?.text}</span>}</button>)}</nav>
        <EngineToggle live={live} variant="compact" onSection={onSection}/>
    </header>
}
