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
    expect(container.querySelector('.sp-settings')?.lastElementChild?.textContent).toContain('Бекап настроек')
    expect(screen.queryByRole('button', { name: /Дополнительно/ })).toBeNull()
    fireEvent.click(screen.getByText('Общее'))
    expect(await screen.findByRole('heading', { name: 'Общее' })).toBeInTheDocument()
})
it('DoH lives in connections and keeps its original controls', async () => {
    vi.spyOn(rpc, 'dohState').mockResolvedValue({ installed: false } as never)
    render(<Vpn live={live()} />)
    fireEvent.click(screen.getByRole('button', { name: /DoH/ }))
    expect(await screen.findByRole('heading', { name: 'DoH' })).toBeInTheDocument()
})
it('catalog and custom lists are reachable from rules', async () => {
    render(<Rules live={live()} />)
    expect(screen.getByRole('button', { name: 'Каталог' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Свои списки' }))
    expect(await screen.findByText('Свои списки', { selector: 'h3' })).toBeInTheDocument()
})
