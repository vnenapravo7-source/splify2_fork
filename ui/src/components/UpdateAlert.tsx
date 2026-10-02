import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cmpVersion, releaseName, type SelfUpdateInfo } from '@/lib/engine'
const KEY = 'splify2:skipped-update'
function skipped() { try { return localStorage.getItem(KEY) || '' } catch { return '' } }
export default function UpdateAlert({info,onUpdate}:{info:SelfUpdateInfo|null;onUpdate:()=>void}) {
 const [dismissed,setDismissed]=useState<string|null>(null)
 const latest=info?.versions[0]
 const skip=skipped()
 if (!latest || !info?.current || cmpVersion(latest,info.current)<=0 || dismissed===latest || (skip&&cmpVersion(latest,skip)<=0)) return null
 const close=()=>setDismissed(latest)
 const dialog=<div className="sp-confirm-overlay fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Доступно обновление" onKeyDown={e=>{if(e.key==='Escape')close()}}><Card className="w-full max-w-md"><CardContent className="p-5"><h2 className="sp-sub">Доступно обновление</h2><p className="mt-2 text-sm text-muted-foreground">{releaseName(latest,info.names)} · установлена {info.current}</p><div className="mt-4 flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={close} autoFocus>Позже</Button><Button variant="secondary" onClick={()=>{try{localStorage.setItem(KEY,latest)}catch{}close()}}>Пропустить</Button><Button onClick={()=>{close();onUpdate()}}>Обновить</Button></div></CardContent></Card></div>
 return createPortal(dialog,document.querySelector('.sp-root')||document.body)
}
