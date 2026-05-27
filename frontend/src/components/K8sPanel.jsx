import React from 'react'
import { usePolling } from '../hooks/usePolling'
import { prom } from '../lib/api'
import { useCallback } from 'react'
import { Server, Box, Cpu, Database } from 'lucide-react'

function PodRow({ pod, cpu, memory }) {
  const shortName = pod.replace(/^dev-sentinelai-/, '').slice(0, 18)
  const cpuMilli  = (cpu * 1000).toFixed(1)
  const memMB     = (memory / 1024 / 1024).toFixed(0)
  const cpuPct    = Math.min(100, cpu * 1000 / 200 * 100) // out of 200m limit
  const memPct    = Math.min(100, memory / (128 * 1024 * 1024) * 100) // out of 128Mi limit

  const cpuColor  = cpuPct > 80 ? 'var(--accent-red)' : cpuPct > 60 ? 'var(--accent-amber)' : 'var(--accent-green)'
  const memColor  = memPct > 85 ? 'var(--accent-red)' : memPct > 70 ? 'var(--accent-amber)' : 'var(--accent-purple)'

  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border-dim)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-primary)' }}>
          {shortName}
        </span>
        <div style={{ display: 'flex', gap: 12, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: cpuColor }}>{cpuMilli}m</span>
          <span style={{ color: memColor }}>{memMB}Mi</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <div style={{ flex: 1, background: 'var(--bg-base)', borderRadius: 2, height: 3 }}>
          <div style={{ width: `${cpuPct}%`, height: '100%', background: cpuColor, borderRadius: 2, transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ flex: 1, background: 'var(--bg-base)', borderRadius: 2, height: 3 }}>
          <div style={{ width: `${memPct}%`, height: '100%', background: memColor, borderRadius: 2, transition: 'width 0.6s ease' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
        <div style={{ flex: 1, fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>cpu (limit 200m)</div>
        <div style={{ flex: 1, fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>mem (limit 128Mi)</div>
      </div>
    </div>
  )
}

export default function K8sPanel() {
  const podCPUFetch    = useCallback(prom.podCPU, [])
  const podMemFetch    = useCallback(prom.podMemory, [])
  const nodeIdleFetch  = useCallback(prom.nodeIdleCPU, [])
  const podCountFetch  = useCallback(prom.podCount, [])

  const { data: podCPU }   = usePolling(podCPUFetch, 10000)
  const { data: podMem }   = usePolling(podMemFetch, 10000)
  const { data: nodeIdle } = usePolling(nodeIdleFetch, 10000)
  const { data: podCount } = usePolling(podCountFetch, 15000)

  const nodeCPUUsed = nodeIdle?.[0] ? (100 - parseFloat(nodeIdle[0].value[1])).toFixed(1) : null
  const nodeColor   = nodeCPUUsed > 80 ? 'var(--accent-red)' : nodeCPUUsed > 60 ? 'var(--accent-amber)' : 'var(--accent-blue)'
  const totalPods   = podCount?.[0] ? parseInt(podCount[0].value[1]) : podCPU?.length ?? 0

  // merge pod CPU + memory by pod name
  const pods = (podCPU || []).map(p => {
    const mem = (podMem || []).find(m => m.metric.pod === p.metric.pod)
    return {
      pod:    p.metric.pod,
      cpu:    parseFloat(p.value[1]),
      memory: mem ? parseFloat(mem.value[1]) : 0,
    }
  })

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderTop: '3px solid var(--accent-blue)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <Server size={13} color="var(--accent-blue)" />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          K8s Resources — sentinelai-dev
        </span>
      </div>

      {/* Node CPU summary */}
      <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            <Cpu size={11} />NODE CPU
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: nodeColor }}>
            {nodeCPUUsed ?? '—'}%
          </span>
        </div>
        <div style={{ background: 'var(--bg-base)', borderRadius: 2, height: 4 }}>
          <div style={{ width: `${nodeCPUUsed ?? 0}%`, height: '100%', background: nodeColor, borderRadius: 2, transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            <Box size={10} />
            <span>{totalPods} pod{totalPods !== 1 ? 's' : ''} ready</span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {(100 - nodeCPUUsed).toFixed(1)}% idle
          </span>
        </div>
      </div>

      {/* Per-pod rows */}
      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
        <span>POD</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ color: 'var(--accent-blue)' }}>CPU</span>
          <span style={{ color: 'var(--accent-purple)' }}>MEM</span>
        </div>
      </div>
      {pods.length === 0 ? (
        <div style={{ padding: '12px 0', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          Loading pod data...
        </div>
      ) : (
        pods.map(p => <PodRow key={p.pod} {...p} />)
      )}
    </div>
  )
}
