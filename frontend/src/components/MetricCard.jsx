import React from 'react'

const THRESHOLDS = {
  cpu:    { warn: 70, crit: 85 },
  memory: { warn: 75, crit: 90 },
}

function getColor(value, type) {
  const t = THRESHOLDS[type]
  if (!t) return 'var(--accent-blue)'
  if (value >= t.crit) return 'var(--accent-red)'
  if (value >= t.warn) return 'var(--accent-amber)'
  return 'var(--accent-green)'
}

export default function MetricCard({ label, value, unit = '%', type, icon: Icon, sublabel }) {
  const color = type ? getColor(value, type) : 'var(--accent-blue)'
  const pct = unit === '%' ? Math.min(100, value || 0) : null
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderTop: `3px solid ${color}`, borderRadius: 'var(--radius-lg)', padding: '16px 20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
        {Icon && <Icon size={14} color="var(--text-muted)" />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: pct !== null ? 10 : 0 }}>
        <span style={{ fontSize: 28, fontWeight: 600, fontFamily: 'var(--font-mono)', color }}>
          {value !== null && value !== undefined ? (typeof value === 'number' ? value.toFixed(1) : value) : '—'}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{unit}</span>
      </div>
      {pct !== null && (
        <div style={{ background: 'var(--bg-base)', borderRadius: 2, height: 3, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
        </div>
      )}
      {sublabel && <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{sublabel}</div>}
    </div>
  )
}
