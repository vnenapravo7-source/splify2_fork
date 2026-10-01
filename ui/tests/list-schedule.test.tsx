import { render, screen, waitFor } from '@testing-library/preact'
import { describe, it, expect, vi } from 'vitest'
import ListSchedule from '@/components/ListSchedule'
import { rpc } from '@/lib/rpc'
import userEvent from '@testing-library/user-event'

describe('list schedule',()=>{
    it('loads the saved interval and persists all five choices through RPC',async()=>{
        vi.spyOn(rpc,'listsSchedule').mockResolvedValue({ok:true,hours:72})
        const save=vi.spyOn(rpc,'listsScheduleSet').mockImplementation(async(hours)=>({ok:true,hours:Number(hours)}))
        render(<ListSchedule/>)
        const select=screen.getByLabelText('Интервал автообновления списков') as HTMLSelectElement
        await waitFor(()=>expect(select.value).toBe('72'))
        for(const hours of [12,24,48,72,168]){
            await userEvent.selectOptions(screen.getByLabelText('Интервал автообновления списков'),String(hours))
            await waitFor(()=>expect(save).toHaveBeenLastCalledWith(hours))
            await waitFor(()=>expect(select.disabled).toBe(false))
            expect(save).toHaveBeenLastCalledWith(hours)
            expect(select.value).toBe(String(hours))
        }
    })
    it('does not display a failed save as applied',async()=>{
        vi.spyOn(rpc,'listsSchedule').mockResolvedValue({ok:true,hours:24})
        vi.spyOn(rpc,'listsScheduleSet').mockResolvedValue({ok:false,hours:24,error:'cron unavailable'})
        render(<ListSchedule/>)
        const select=screen.getByLabelText('Интервал автообновления списков') as HTMLSelectElement
        await waitFor(()=>expect(select.value).toBe('24'))
        await userEvent.selectOptions(screen.getByLabelText('Интервал автообновления списков'),'168')
        await waitFor(()=>expect(select.disabled).toBe(false))
        expect(select.value).toBe('24')
    })
})
