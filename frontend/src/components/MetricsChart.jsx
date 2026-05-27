import React from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts'

function parseMetrics(rec) {
  if (!rec?.recommendation) return { cpu: null, memory: null }
  const cpu    = rec.recommendation.match(/CPU at ([\d.]+)%/i)
  const memory = rec.recommendation.match(/memory at ([\d.]+)%/i)
  return {
    cpu:    cpu    ? parseFloat(cpu[1])    : null,
    memory: memory ? parseFloat(memory[1]) : null,
  }
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, display: 'flex', gap: 8 }}>
          <span>{p.name}</span><span style={{ fontWeight: 600 }}>{p.value?.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  )
}

export default function MetricsChart({ history }) {
  const data = history.map(h => {
    const { cpu, memory } = parseMetrics(h)
    return {
      time: new Date(h.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      cpu,
      memory,
    }
  }).filter(d => d.cpu !== null)

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Resource Utilisation — 2.5 min window</span>
        <div style={{ display: 'flex', gap: 16, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: '#58a6ff' }}>● CPU</span>
          <span style={{ color: '#bc8cff' }}>● Memory</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-dim)" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={80} stroke="var(--accent-amber)" strokeDasharray="4 4" strokeOpacity={0.5} />
          <ReferenceLine y={90} stroke="var(--accent-red)" strokeDasharray="4 4" strokeOpacity={0.5} />
          <Line type="monotone" dataKey="cpu" name="CPU" stroke="#58a6ff" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: '#58a6ff' }} />
          <Line type="monotone" dataKey="memory" name="Memory" stroke="#bc8cff" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: '#bc8cff' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
