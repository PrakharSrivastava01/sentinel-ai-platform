import React from 'react'
import { Activity, Shield, Clock } from 'lucide-react'

const dot = (ok) => ({
  display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
  background: ok ? 'var(--accent-green)' : 'var(--accent-red)',
  marginRight: 6,
  boxShadow: ok ? '0 0 6px var(--accent-green)' : '0 0 6px var(--accent-red)',
})

export default function StatusBar({ health, lastUpdated }) {
  const ok = health?.status === 'healthy'
  return (
    <header style={{
      background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
      padding: '0 24px', height: 52, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Shield size={18} color="var(--accent-blue)" />
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 15, letterSpacing: '0.02em' }}>SentinelAI</span>
        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>// DevSecOps Monitor</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
          <span style={dot(ok)} />
          <span style={{ color: ok ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {health ? (ok ? 'HEALTHY' : 'DEGRADED') : 'CONNECTING...'}
          </span>
          {health?.app && <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{health.app} v{health.version}</span>}
        </div>
        {lastUpdated && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            <Clock size={11} />{lastUpdated.toLocaleTimeString()}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 11 }}>
          <Activity size={11} /><span>5s refresh</span>
        </div>
      </div>
    </header>
  )
}
