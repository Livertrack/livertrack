'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts'
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
        supabase.from('ventes').select('*, livreur:livreurs(*), boutique:boutiques(*)').order('date_vente'),
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
    total: ventesFiltered.filter(v => v.livreur_id === l.id).reduce((s, v) => s + v.montant_total, 0),
    nb: ventesFiltered.filter(v => v.livreur_id === l.id).length,
  })).sort((a, b) => b.total - a.total)

  // Data par boutique
  const dataBoutiques = boutiques.map(b => ({
    name: b.nom.replace('Boutique ', ''),
    total: ventesFiltered.filter(v => v.boutique_id === b.id).reduce((s, v) => s + v.montant_total, 0),
    fill: b.couleur,
  }))

  // Evolution par jour
  const datesUniques = [...new Set(ventesFiltered.map(v => v.date_vente))].sort()
  const dataEvolution = datesUniques.map(date => {
    const entry: Record<string, any> = { date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) }
    boutiques.forEach(b => {
      entry[b.nom.replace('Boutique ', '')] = ventesFiltered.filter(v => v.date_vente === date && v.boutique_id === b.id).reduce((s, v) => s + v.montant_total, 0)
    })
    return entry
  })

  const tooltipStyle = { background: '#161B27', border: '1px solid #1E2535', borderRadius: 10, color: '#F1F5F9', fontSize: 12 }

  if (loading) return <div style={{ display: 'flex' }}><Sidebar /><main style={{ marginLeft: 240, flex: 1, padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#8B95A8' }}>Chargement...</div></main></div>

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: 32, minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, margin: 0 }}>Statistiques</h1>
            <p style={{ color: '#8B95A8', marginTop: 6 }}>Performance et tendances</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['7j', '30j', 'tout'] as const).map(p => (
              <button key={p} onClick={() => setPeriode(p)} style={{
                padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: periode === p ? '#F59E0B22' : '#161B27',
                color: periode === p ? '#F59E0B' : '#8B95A8',
                border: `1px solid ${periode === p ? '#F59E0B44' : '#1E2535'}`,
              } as React.CSSProperties}>{p === 'tout' ? 'Tout' : `${p}`}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Par livreur */}
          <div style={{ background: '#161B27', border: '1px solid #1E2535', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, margin: '0 0 20px', fontSize: 16 }}>Ventes par livreur (DA)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dataLivreurs} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#8B95A8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8B95A8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toLocaleString()} DA`]} />
                <Bar dataKey="total" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Par boutique */}
          <div style={{ background: '#161B27', border: '1px solid #1E2535', borderRadius: 16, padding: 24 }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, margin: '0 0 20px', fontSize: 16 }}>Ventes par boutique (DA)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dataBoutiques} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#8B95A8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8B95A8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toLocaleString()} DA`]} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Évolution */}
        {dataEvolution.length > 1 && (
          <div style={{ background: '#161B27', border: '1px solid #1E2535', borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, margin: '0 0 20px', fontSize: 16 }}>Évolution des ventes par boutique</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={dataEvolution}>
                <CartesianGrid stroke="#1E2535" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: '#8B95A8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8B95A8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toLocaleString()} DA`]} />
                <Legend wrapperStyle={{ color: '#8B95A8', fontSize: 12 }} />
                {boutiques.map(b => (
                  <Line key={b.id} type="monotone" dataKey={b.nom.replace('Boutique ', '')} stroke={b.couleur} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tableau récap */}
        <div style={{ background: '#161B27', border: '1px solid #1E2535', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, margin: '0 0 16px', fontSize: 16 }}>Récapitulatif livreurs</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ color: '#8B95A8', borderBottom: '1px solid #1E2535' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Livreur</th>
                {boutiques.map(b => <th key={b.id} style={{ textAlign: 'right', padding: '8px 12px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: b.couleur }}>{b.nom.replace('Boutique ', '')}</th>)}
                <th style={{ textAlign: 'right', padding: '8px 12px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {livreurs.map(l => {
                const parBoutique = boutiques.map(b => ventesFiltered.filter(v => v.livreur_id === l.id && v.boutique_id === b.id).reduce((s, v) => s + v.montant_total, 0))
                const total = parBoutique.reduce((s, v) => s + v, 0)
                return (
                  <tr key={l.id} style={{ borderBottom: '1px solid #1E253533' }}>
                    <td style={{ padding: '10px 12px' }}>{l.nom}</td>
                    {parBoutique.map((v, i) => <td key={i} style={{ padding: '10px 12px', textAlign: 'right', color: v > 0 ? boutiques[i]?.couleur : '#4B5563' }}>{v > 0 ? `${v.toLocaleString()} DA` : '—'}</td>)}
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: "'Syne', sans-serif", fontWeight: 700, color: '#F59E0B' }}>{total.toLocaleString()} DA</td>
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
