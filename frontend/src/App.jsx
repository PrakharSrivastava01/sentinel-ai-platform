import React, { useCallback } from 'react'
import { Cpu, MemoryStick, Activity, Zap } from 'lucide-react'
import { api, parseMetricsFromRec } from './lib/api'
import { usePolling, useMetricsHistory } from './hooks/usePolling'
import StatusBar from './components/StatusBar'
import MetricCard from './components/MetricCard'
import MetricsChart from './components/MetricsChart'
import AlertsFeed from './components/AlertsFeed'
import AnomalyPanel from './components/AnomalyPanel'
import StatusDetails from './components/StatusDetails'
import K8sPanel from './components/K8sPanel'

export default function App() {
  const healthFetch  = useCallback(api.health, [])
  const statusFetch  = useCallback(api.status, [])
  const alertsFetch  = useCallback(api.alerts, [])
  const recFetch     = useCallback(api.recommendation, [])

  const { data: health, lastUpdated } = usePolling(healthFetch, 10000)
  const { data: status }              = usePolling(statusFetch, 15000)
  const { data: alerts }              = usePolling(alertsFetch, 5000)
  const { data: rec }                 = usePolling(recFetch, 5000)
  const { history }                   = useMetricsHistory(recFetch, 30, 5000)

  const { cpu, memory } = parseMetricsFromRec(rec)
  const statusWithEnv = status ? { ...status, environment: health?.environment } : null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <StatusBar health={health} lastUpdated={lastUpdated} />
      <main style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>

        {/* Top metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 16, marginBottom: 20 }}>
          <MetricCard label="CPU Usage"     value={cpu}               unit="%" type="cpu"    icon={Cpu}         sublabel={health?.app || '—'} />
          <MetricCard label="Memory Usage"  value={memory}            unit="%" type="memory" icon={MemoryStick}  sublabel="process rss" />
          <MetricCard label="Anomaly Score" value={rec?.anomaly_score} unit=""               icon={Zap}          sublabel={rec?.confidence ? `confidence: ${rec.confidence}` : 'awaiting data'} />
          <MetricCard label="Uptime"        value={status?.uptime_seconds ? `${Math.floor(status.uptime_seconds/3600)}h ${Math.floor((status.uptime_seconds%3600)/60)}m` : null} unit="" icon={Activity} sublabel={health?.environment || '—'} />
        </div>

        {/* Chart */}
        <div style={{ marginBottom: 20 }}>
          <MetricsChart history={history} />
        </div>

        {/* Bottom row — 3 col */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 16, alignItems: 'start', marginBottom: 16 }}>
          <AlertsFeed alerts={alerts} />
          <AnomalyPanel recommendation={rec} />
          <StatusDetails status={statusWithEnv} />
        </div>

        {/* K8s section — full width */}
        <K8sPanel />

      </main>
    </div>
  )
}
