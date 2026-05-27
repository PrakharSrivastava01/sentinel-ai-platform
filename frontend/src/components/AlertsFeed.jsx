import React from 'react'
import { AlertTriangle, AlertOctagon, Info, CheckCircle } from 'lucide-react'

const SEVERITY = {
  critical: { color: 'var(--accent-red)',   bg: 'rgba(248,81,73,0.1)',  Icon: AlertOctagon  },
  warning:  { color: 'var(--accent-amber)',  bg: 'rgba(210,153,34,0.1)', Icon: AlertTriangle },
  info:     { color: 'var(--accent-blue)',   bg: 'rgba(88,166,255,0.1)', Icon: Info          },
  ok:       { color: 'var(--accent-green)',  bg: 'rgba(63,185,80,0.1)',  Icon: CheckCircle   },
}

function SeverityBadge({ severity }) {
  const s = SEVERITY[severity] || SEVERITY.info
  const { Icon } = s
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: s.color, background: s.bg, padding: '2px 7px', borderRadius: 3 }}>
      <Icon size={10} />{severity}
    </span>
  )
}

export default function AlertsFeed({ alerts }) {
  const items = alerts?.alerts || []
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active Alerts</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: items.length > 0 ? 'var(--accent-amber)' : 'var(--accent-green)', background: items.length > 0 ? 'rgba(210,153,34,0.1)' : 'rgba(63,185,80,0.1)', padding: '2px 8px', borderRadius: 3 }}>
          {items.length} alert{items.length !== 1 ? 's' : ''}
        </span>
      </div>
      {items.length === 0 ? (
        <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          <CheckCircle size={20} color="var(--accent-green)" style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
          All clear — no active alerts
        </div>
      ) : (
        <div style={{ maxHeight: 280, overflowY: 'auto' }}>
          {items.map((alert, i) => (
            <div key={i} style={{ padding: '10px 20px', borderBottom: i < items.length - 1 ? '1px solid var(--border-dim)' : 'none', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <SeverityBadge severity={alert.severity} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>{alert.message || alert.alert_id}</div>
                {alert.alert_id && <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ID: {alert.alert_id}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
