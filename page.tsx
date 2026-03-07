'use client'
import Sidebar from '@/components/Sidebar'
export default function StatsPage() {
  return (
    <div style={{display:'flex'}}>
      <Sidebar />
      <main style={{marginLeft:240,flex:1,padding:32}}>
        <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800}}>
          Statistiques
        </h1>
        <p style={{color:'#8B95A8'}}>Page en cours de développement.</p>
      </main>
    </div>
  )
}
