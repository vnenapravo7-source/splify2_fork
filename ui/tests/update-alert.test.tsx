import {render,screen,fireEvent,cleanup} from '@testing-library/preact'
import {beforeEach,afterEach,it,expect,vi} from 'vitest'
import UpdateAlert from '@/components/UpdateAlert'
const info={current:'26.9.6',versions:['26.9.7','26.9.6']}
beforeEach(()=>localStorage.clear())
afterEach(cleanup)
it('later dismisses this opening but asks again after reopening',()=>{
 const {unmount}=render(<UpdateAlert info={info} onUpdate={()=>{}}/> )
 fireEvent.click(screen.getByRole('button',{name:'Позже'}))
 expect(screen.queryByRole('dialog')).toBeNull()
 unmount();render(<UpdateAlert info={info} onUpdate={()=>{}}/> )
 expect(screen.getByRole('dialog')).toBeInTheDocument()
})
it('skip persists until a newer release',()=>{
 const {unmount}=render(<UpdateAlert info={info} onUpdate={()=>{}}/> )
 fireEvent.click(screen.getByRole('button',{name:'Пропустить'}))
 unmount();const next=render(<UpdateAlert info={info} onUpdate={()=>{}}/> )
 expect(screen.queryByRole('dialog')).toBeNull()
 next.rerender(<UpdateAlert info={{...info,versions:['26.9.8']}} onUpdate={()=>{}}/> )
 expect(screen.getByRole('dialog')).toBeInTheDocument()
})
it('update navigates and current versions do not prompt',()=>{
 const go=vi.fn();const {rerender}=render(<UpdateAlert info={info} onUpdate={go}/> )
 fireEvent.click(screen.getByRole('button',{name:'Обновить'}))
 expect(go).toHaveBeenCalledOnce()
 expect(screen.queryByRole('dialog')).toBeNull()
 rerender(<UpdateAlert info={{current:'26.9.7',versions:['26.9.7']}} onUpdate={go}/> )
 expect(screen.queryByRole('dialog')).toBeNull()
})
