'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Cartesia
import type { Livreur, Boutique, Vente } from '@/lib/types'
export default function StatsPage() {
const supabase = createClient()
const [ventes, setVentes] = useState<Vente[]>([])
const [livreurs, setLivreurs] = useState<Livreur[]>([])
const [boutiques, setBoutiques] = useState<Boutique[]>([])
const [loading, setLoading] = useState(true)
const [periode, setPeriode] = useState<'7j' | '30j' | 'tout'>('7j')
useEffect(() => {
async function load() {
const [{ data: v }, { data: l }, { data: b }] = await Promise.all([
supabase.from('ventes').select('*, livreur:livreurs(*), boutique:boutiques(*)').order
supabase.from('livreurs').select('*').eq('actif', true).order('nom'),
supabase.from('boutiques').select('*').eq('actif', true),
])
setVentes(v || [])
setLivreurs(l || [])
setBoutiques(b || [])
setLoading(false)
}
load()
}, [])
const ventesFiltered = ventes.filter(v => {
const d = new Date(v.date_vente)
const now = new Date()
if (periode === '7j') return (now.getTime() - d.getTime()) <= 7 * 86400000
if (periode === '30j') return (now.getTime() - d.getTime()) <= 30 * 86400000
return true
})
// Data par livreur
const dataLivreurs = livreurs.map(l => ({
name: l.nom.split(' ')[0],
total: ventesFiltered.filter(v => v.livreur_id === l.id).reduce((s, v) => s + v.montant_t
nb: ventesFiltered.filter(v => v.livreur_id === l.id).length,
})).sort((a, b) => b.total - a.total)
// Data par boutique
const dataBoutiques = boutiques.map(b => ({
name: b.nom.replace('Boutique ', ''),
total: ventesFiltered.filter(v => v.boutique_id === b.id).reduce((s, v) => s + v.montant_
fill: b.couleur,
}))
// Evolution par jour
const datesUniques = Array.from(new Set(ventesFiltered.map(v => v.date_vente))).sort()
const dataEvolution = datesUniques.map(date => {
const entry: Record<string, any> = { date: new Date(date).toLocaleDateString('fr-FR', { d
boutiques.forEach(b => {
entry[b.nom.replace('Boutique ', '')] = ventesFiltered.filter(v => v.date_vente === dat
})
return entry
})
const tooltipStyle = { background: '#161B27', border: '1px solid #1E2535', borderRadius: 10
if (loading) return <div style={{ display: 'flex' }}><Sidebar /><main style={{ marginLeft:
return (
<div style={{ display: 'flex' }}>
<Sidebar />
<main style={{ marginLeft: 240, flex: 1, padding: 32, minHeight: '100vh' }}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-sta
<div>
<h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, mar
<p style={{ color: '#8B95A8', marginTop: 6 }}>Performance et tendances</p>
</div>
<div style={{ display: 'flex', gap: 8 }}>
{(['7j', '30j', 'tout'] as const).map(p => (
<button key={p} onClick={() => setPeriode(p)} style={{
padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fon
background: periode === p ? '#F59E0B22' : '#161B27',
color: periode === p ? '#F59E0B' : '#8B95A8',
border: `1px solid ${periode === p ? '#F59E0B44' : '#1E2535'}`,
} as React.CSSProperties}>{p === 'tout' ? 'Tout' : `${p}`}</button>
))}
</div>
</div>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom:
{/* Par livreur */}
<div style={{ background: '#161B27', border: '1px solid #1E2535', borderRadius: 16,
<h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, margin: '0 0 20px
<ResponsiveContainer width="100%" height={220}>
<BarChart data={dataLivreurs} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
<XAxis dataKey="name" tick={{ fill: '#8B95A8', fontSize: 12 }} axisLine={fals
<YAxis tick={{ fill: '#8B95A8', fontSize: 11 }} axisLine={false} tickLine={fa
<Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toLocale
<Bar dataKey="total" fill="#F59E0B" radius={[6, 6, 0, 0]} />
</BarChart>
</ResponsiveContainer>
</div>
{/* Par boutique */}
<div style={{ background: '#161B27', border: '1px solid #1E2535', borderRadius: 16,
<h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, margin: '0 0 20px
<ResponsiveContainer width="100%" height={220}>
<BarChart data={dataBoutiques} margin={{ top: 0, right: 0, bottom: 0, left: 0 }
<XAxis dataKey="name" tick={{ fill: '#8B95A8', fontSize: 12 }} axisLine={fals
<YAxis tick={{ fill: '#8B95A8', fontSize: 11 }} axisLine={false} tickLine={fa
<Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toLocale
<Bar dataKey="total" radius={[6, 6, 0, 0]} fill="#6366F1" />
</BarChart>
</ResponsiveContainer>
</div>
</div>
{/* Évolution */}
{dataEvolution.length > 1 && (
<div style={{ background: '#161B27', border: '1px solid #1E2535', borderRadius: 16,
<h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, margin: '0 0 20px
<ResponsiveContainer width="100%" height={240}>
<LineChart data={dataEvolution}>
<CartesianGrid stroke="#1E2535" strokeDasharray="3 3" />
<XAxis dataKey="date" tick={{ fill: '#8B95A8', fontSize: 11 }} axisLine={fals
<YAxis tick={{ fill: '#8B95A8', fontSize: 11 }} axisLine={false} tickLine={fa
<Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toLocale
<Legend wrapperStyle={{ color: '#8B95A8', fontSize: 12 }} />
{boutiques.map(b => (
<Line key={b.id} type="monotone" dataKey={b.nom.replace('Boutique ', ))}
</LineChart>
</ResponsiveContainer>
</div>
'')} s
)}
{/* Tableau récap */}
<div style={{ background: '#161B27', border: '1px solid #1E2535', borderRadius: 16, p
<h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, margin: '0 0 <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
16px',
<thead>
<tr style={{ color: '#8B95A8', borderBottom: '1px solid #1E2535' }}>
<th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, textTransf
{boutiques.map(b => <th key={b.id} style={{ textAlign: 'right', padding: '8px
<th style={{ textAlign: 'right', padding: '8px 12px', fontSize: 11, textTrans
</tr>
</thead>
<tbody>
{livreurs.map(l => {
const parBoutique = boutiques.map(b => ventesFiltered.filter(v => v.livreur_i
const total = parBoutique.reduce((s, v) => s + v, 0)
return (
<tr key={l.id} style={{ borderBottom: '1px solid #1E253533' }}>
<td style={{ padding: '10px 12px' }}>{l.nom}</td>
{parBoutique.map((v, i) => <td key={i} style={{ padding: '10px 12px', tex
<td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: "'Syne
</tr>
)
})}
</tbody>
</table>
</div>
</main>
</div>
)
}
