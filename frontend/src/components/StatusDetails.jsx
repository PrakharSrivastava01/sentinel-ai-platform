import React from 'react'
import { Server } from 'lucide-react'

function Row({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--border-dim)' }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{label}</span>
      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: accent || 'var(--text-primary)', fontWeight: 500 }}>{value ?? '—'}</span>
    </div>
  )
}

export default function StatusDetails({ status }) {
  if (!status) return null
  const uptime = status.uptime_seconds
  const uptimeStr = uptime ? `${Math.floor(uptime/3600)}h ${Math.floor((uptime%3600)/60)}m ${Math.floor(uptime%60)}s` : '—'
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <Server size={13} color="var(--text-muted)" />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Service Status</span>
      </div>
      <Row label="status"      value={status.status}      accent={status.status === 'running' ? 'var(--accent-green)' : 'var(--accent-red)'} />
      <Row label="uptime"      value={uptimeStr}           accent="var(--accent-blue)" />
      <Row label="environment" value={status.environment} />
      <Row label="timestamp"   value={status.timestamp ? new Date(status.timestamp).toLocaleTimeString() : null} />
    </div>
  )
}
