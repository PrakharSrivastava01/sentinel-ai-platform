import React from 'react'
import { Brain } from 'lucide-react'

const CONFIDENCE_COLOR = { high: 'var(--accent-red)', medium: 'var(--accent-amber)', low: 'var(--accent-blue)' }

function AnomalyScore({ score }) {
  const pct = Math.min(100, (score / 4) * 100)
  const color = score >= 3 ? 'var(--accent-red)' : score >= 2 ? 'var(--accent-amber)' : 'var(--accent-green)'
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Z-SCORE</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, color }}>{score?.toFixed(2) ?? '—'}</span>
      </div>
      <div style={{ background: 'var(--bg-base)', borderRadius: 2, height: 4, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', left: '50%', width: 1, height: '100%', background: 'var(--border)', zIndex: 1 }} />
        <div style={{ position: 'absolute', left: '75%', width: 1, height: '100%', background: 'rgba(210,153,34,0.5)' }} />
        <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.6s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        <span>0</span><span>2.0 warn</span><span>3.0 crit</span><span>4.0+</span>
      </div>
    </div>
  )
}

export default function AnomalyPanel({ recommendation }) {
  if (!recommendation) return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, minHeight: 120 }}>
      <Brain size={14} style={{ marginRight: 8 }} />Loading AI analysis...
    </div>
  )
  const { anomaly_detected, anomaly_score, confidence, recommendation: rec, generated_at } = recommendation
  const confColor = CONFIDENCE_COLOR[confidence] || 'var(--accent-blue)'
  return (
    <div style={{ background: 'var(--bg-surface)', border: `1px solid ${anomaly_detected ? 'rgba(248,81,73,0.4)' : 'var(--border)'}`, borderTop: `3px solid ${anomaly_detected ? 'var(--accent-red)' : 'var(--accent-green)'}`, borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Brain size={14} color={anomaly_detected ? 'var(--accent-red)' : 'var(--accent-green)'} />
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>AI Anomaly Detection</span>
        </div>
        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: anomaly_detected ? 'var(--accent-red)' : 'var(--accent-green)', background: anomaly_detected ? 'rgba(248,81,73,0.1)' : 'rgba(63,185,80,0.1)', padding: '2px 8px', borderRadius: 3 }}>
          {anomaly_detected ? 'ANOMALY DETECTED' : 'NORMAL'}
        </span>
      </div>
      <AnomalyScore score={anomaly_score} />
      <div style={{ background: 'var(--bg-elevated)', borderLeft: `3px solid ${confColor}`, borderRadius: '0 4px 4px 0', padding: '10px 14px', marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recommendation</div>
        <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.6 }}>{rec}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        <span>Confidence: <span style={{ color: confColor, textTransform: 'uppercase' }}>{confidence}</span></span>
        {generated_at && <span>{new Date(generated_at).toLocaleTimeString()}</span>}
      </div>
    </div>
  )
}
