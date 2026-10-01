import { useState } from 'react'
import { ChevronLeft, Globe, Layers, Lock, Network, ShieldCheck } from 'lucide-react'
import HubRow from '@/components/HubRow'
import PoolList from '@/components/PoolList'
import IfacesPanel from '@/components/IfacesPanel'
import VlessScreen from '@/components/VlessScreen'
import XsteerPanel from '@/components/XsteerPanel'
import Doh from '@/components/sections/Doh'
import type { Live } from '@/lib/live'

type Screen = 'root' | 'sources' | 'outputs' | 'doh' | 'ifaces' | 'vless' | 'xsteer'
const TITLE = { sources: 'Источники', outputs: 'Выходы VPN', doh: 'DoH', ifaces: 'Свои туннели', vless: 'Подписки', xsteer: 'XSTEER' }
export default function Vpn({ live }: { live: Live }) {
    const [screen, setScreen] = useState<Screen>('root')
    if (screen === 'root') return <div className="sp-connection-grid">
        <HubRow icon={Globe} title="Источники" state="Подписки, свои туннели и XSTEER" onClick={() => setScreen('sources')} />
        <HubRow icon={Layers} title="Выходы VPN" state="Пулы, порядок выбора и резервные подключения" onClick={() => setScreen('outputs')} />
        <HubRow icon={Lock} title="DoH" state="Шифрованный DNS и запросы через туннель" onClick={() => setScreen('doh')} />
    </div>
    const nested = ['ifaces', 'vless', 'xsteer'].includes(screen)
    return <div className="space-y-4">
        <button type="button" className="flex items-center gap-1 text-sm text-primary" onClick={() => setScreen(nested ? 'sources' : 'root')}><ChevronLeft className="h-4 w-4" aria-hidden="true" /> {nested ? 'Источники' : 'Подключения'}</button>
        <h2 className="sp-title">{TITLE[screen]}</h2>
        {screen === 'sources' && <div className="space-y-3">
            <HubRow icon={Globe} title="Подписки" state="Узлы, ссылки и автообновление" onClick={() => setScreen('vless')} />
            <HubRow icon={ShieldCheck} title="Свои туннели" state="WireGuard, AmneziaWG, OpenVPN" onClick={() => setScreen('ifaces')} />
            <HubRow icon={Network} title="XSTEER" state="Интерфейсы и параметры" onClick={() => setScreen('xsteer')} />
        </div>}
        {screen === 'outputs' && <PoolList live={live} />}
        {screen === 'doh' && <Doh live={live} />}
        {screen === 'ifaces' && <IfacesPanel live={live} />}
        {screen === 'vless' && <VlessScreen />}
        {screen === 'xsteer' && <XsteerPanel live={live} />}
    </div>
}
