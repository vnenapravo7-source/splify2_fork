import { useEffect, useState } from 'react'
import { Clock3 } from 'lucide-react'
import { rpc } from '@/lib/rpc'
import { notify } from '@/lib/notify'

export default function ListSchedule() {
    const [hours,setHours]=useState<number|null>(null)
    const [busy,setBusy]=useState(false)
    const [error,setError]=useState('')
    useEffect(()=>{let stop=false;rpc.listsSchedule().then(r=>{if(!stop){if(r.ok)setHours(r.hours);else setError(r.error||'Не удалось прочитать расписание')}}).catch(()=>{if(!stop)setError('Не удалось прочитать расписание')});return()=>{stop=true}},[])
    async function change(next:number) {
        const previous=hours
        setHours(next)
        setBusy(true)
        try {const r=await rpc.listsScheduleSet(next);if(!r.ok)throw Error(r.error||'Не удалось сохранить');setHours(r.hours);notify('Расписание обновления списков сохранено')}
        catch(e){setHours(previous);notify(String(e instanceof Error?e.message:e),'error')}
        finally{setBusy(false)}
    }
    return <div className="sp-list-schedule"><Clock3 className="h-5 w-5 text-primary shrink-0" aria-hidden="true"/><div className="flex-1 min-w-0"><label htmlFor="lists-interval" className="font-medium">Автообновление списков</label><p className="text-xs text-muted-foreground">Используемые списки каталога и свои списки по ссылкам. Файлы и записи вручную сохраняются.</p>{error&&<p role="alert" className="text-xs text-destructive">{error}</p>}</div><select id="lists-interval" aria-label="Интервал автообновления списков" value={hours??''} disabled={busy||hours===null} onChange={e=>void change(Number(e.currentTarget.value))} className="rounded-xl border border-input px-3 py-2 text-sm">{hours===null&&<option value="">{error?'Недоступно':'Загрузка…'}</option>}{[[12,'Каждые 12 часов'],[24,'Каждый день'],[48,'Каждые 2 дня'],[72,'Каждые 3 дня'],[168,'Каждую неделю']].map(([n,text])=><option key={n} value={n}>{text}</option>)}</select></div>
}
