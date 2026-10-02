import Rail from '@/components/Rail'
import { fireEvent, render, screen, waitFor } from '@testing-library/preact'
import { beforeEach, expect, it, vi } from 'vitest'
import Home from '@/components/sections/Home'
import Settings from '@/components/sections/Settings'
import Vpn from '@/components/sections/Vpn'
import Rules from '@/components/sections/Rules'
import { pending } from '@/lib/pending'
import { rpc } from '@/lib/rpc'
import { live } from './fixtures'
import type { Spec } from '@/lib/model'

const spec: Spec = { schema: 1, outputs: { vpn: { name: 'vpn', kind: 'interface', device: 'wg0' } }, channels: [{ name: 'YouTube', out: 'vpn', enabled: true, match: { domains_files: ['domains/youtube.lst'] } }] }
beforeEach(() => {
    vi.restoreAllMocks()
    pending.saved = structuredClone(spec)
    pending.applied = structuredClone(spec)
    vi.spyOn(rpc, 'specGet').mockResolvedValue(structuredClone(spec))
    vi.spyOn(rpc, 'localLists').mockResolvedValue({ files: {} })
    vi.spyOn(rpc, 'devices').mockResolvedValue({ devices: [] })
})
it('overview checkbox edits the shared spec and pencil opens the selected rule', async () => {
    const edit = vi.spyOn(pending, 'edit').mockImplementation(() => {})
    const go = vi.fn()
    render(<Home live={live()} onSection={go} onAddRule={() => {}} />)
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Включить правило YouTube' }))
    expect(edit).toHaveBeenCalledWith(expect.objectContaining({ channels: [expect.objectContaining({ enabled: false })] }))
    fireEvent.click(screen.getByRole('button', { name: 'Редактировать правило YouTube' }))
    expect(go).toHaveBeenCalledWith('rules', 'YouTube')
})
it('all five presets call the real explain RPC with their domain', async () => {
    const explain = vi.spyOn(rpc, 'explain').mockResolvedValue({ text: 'Напрямую' })
    render(<Home live={live()} onSection={() => {}} onAddRule={() => {}} />)
    for (const domain of ['youtube.com', 'instagram.com', 'discord.com', 'ru-tracker.org', 'ozon.ru']) {
        fireEvent.click(screen.getByRole('button', { name: domain }))
        await waitFor(() => expect(explain).toHaveBeenCalledWith(domain))
    }
})
it('backup is at the bottom of settings and the whole named row opens general settings', async () => {
    const { container } = render(<Settings live={live()} />)
    expect(container.querySelector('.sp-settings')?.lastElementChild?.textContent).toContain('Бэкап настроек')
    expect(screen.queryByRole('button', { name: /Дополнительно/ })).toBeNull()
    fireEvent.click(screen.getByText('Общее'))
    expect(screen.getByRole('button', { name: /Общее/ })).toHaveAttribute('aria-expanded','true')
})
it('DoH lives in connections and keeps its original controls', async () => {
    vi.spyOn(rpc, 'dohState').mockResolvedValue({ installed: false } as never)
    render(<Vpn live={live()} />)
    fireEvent.click(screen.getByRole('button', { name: /DoH/ }))
    expect(await screen.findByText(/Пакет https-dns-proxy не установлен/)).toBeInTheDocument()
})
it('catalog and custom lists are reachable from rules', async () => {
    render(<Rules live={live()} />)
    expect(screen.getByRole('button', { name: 'Каталог' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Свои списки' }))
    expect(await screen.findByText('Свои списки', { selector: 'h3' })).toBeInTheDocument()
})

it('navigation counts active VPNs and shows problems beside overview',()=>{
 const {container}=render(<Rail section="home" onSection={()=>{}} counts={{vpn:{text:'9'}}} live={live({build:{present:true,vless:true,running:true,enabled:true,version:'1.5.9'},diag:{checks:[],fail:1,warn:0},status:{outputs:{vpn:{kind:'interface',up:true},down:{kind:'interface',up:false},direct:{kind:'direct',up:true},part:{kind:'vless',up:true,part_of:'vpn'},zapret:{kind:'zapret',up:true}}} as never})}/> )
 expect(screen.getByRole('button',{name:/Подключения/})).toHaveTextContent('1')
 expect(screen.getByLabelText('Есть проблемы')).toBeInTheDocument()
 expect(container.querySelector('header .sp-engine-compact')).toContainElement(screen.getByRole('button',{name:'Остановить всё'}))
})
it('settings deep link opens diagnostics and leaves backup collapsed last',()=>{
 const {container}=render(<Settings live={live()} initial="diag"/> )
 expect(Array.from(container.querySelectorAll('.sp-fold-heading strong')).map(n=>n.textContent)).toEqual(['Общее','Диагностика','О ПО','Бэкап настроек'])
 expect(screen.getByRole('button',{name:/Диагностика/})).toHaveAttribute('aria-expanded','true')
 expect(screen.getByRole('button',{name:/Бэкап настроек/})).toHaveAttribute('aria-expanded','false')
 fireEvent.click(screen.getByRole('button',{name:/Бэкап настроек/}))
 expect(screen.getByRole('button',{name:/Диагностика/})).toHaveAttribute('aria-expanded','false')
 expect(screen.getByRole('button',{name:'Скачать архив'})).toBeInTheDocument()
})
it('closed sources show subscription count and DoH state',async()=>{
 vi.spyOn(rpc,'subList').mockResolvedValue({subs:[{name:'a',path:'/a',present:true,mtime:Math.floor(Date.now()/1000)-10800},{name:'b',path:'/b',present:true}]})
 vi.spyOn(rpc,'dohState').mockResolvedValue({installed:true,running:true} as never)
 render(<Vpn live={live()}/> )
 await waitFor(()=>expect(screen.getByRole('button',{name:/Подписки/})).toHaveTextContent('2 · последнее обновление 3 ч назад'))
 expect(screen.getByRole('button',{name:/DoH/})).toHaveTextContent('Включён')
 expect(screen.getByRole('button',{name:/Подписки/})).toHaveAttribute('aria-expanded','false')
})
