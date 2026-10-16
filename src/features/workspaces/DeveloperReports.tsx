import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, Filter, Layers, RefreshCw, ShieldCheck, Terminal } from 'lucide-react';
import type { JobRecord, RedactedHealth } from '../../../shared/platform-contracts';
import { useResource } from '../platform/client';
import { dateLabel } from './experience-model';
import { Empty, Panel, RecordMeta, Refresh, ResourceState, Status } from './ui';

export function DeveloperReports() {
  const jobs = useResource<JobRecord[]>('/jobs');
  const health = useResource<RedactedHealth[]>('/health');
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed' | 'queued' | 'blocked'>('all');

  const filteredJobs = useMemo(() => {
    if (!jobs.data) return [];
    if (filter === 'all') return jobs.data;
    return jobs.data.filter(j => j.status === filter);
  }, [jobs.data, filter]);

  const stats = useMemo(() => {
    const list = jobs.data ?? [];
    return {
      total: list.length,
      completed: list.filter(j => j.status === 'completed').length,
      failed: list.filter(j => j.status === 'failed').length,
      queued: list.filter(j => j.status === 'queued').length,
      blocked: list.filter(j => j.status === 'blocked').length,
      avgAttempts: list.length ? (list.reduce((sum, j) => sum + j.attempt, 0) / list.length).toFixed(1) : '0',
    };
  }, [jobs.data]);

  const healthSummary = useMemo(() => {
    const list = health.data ?? [];
    return {
      ready: list.filter(h => h.status === 'ready').length,
      unavailable: list.filter(h => h.status === 'unavailable').length,
      degraded: list.filter(h => h.status === 'degraded').length,
    };
  }, [health.data]);

  return (
    <div className="xp-developer-reports">
      <section className="xp-developer-banner">
        <Activity size={32} />
        <div>
          <p className="xp-eyebrow">Developer Diagnostics · Scoped Telemetry</p>
          <h2>System Execution & Reliability Reports</h2>
          <p>Laporan eksekusi automasi, job queue, dan status kesihatan runtime. Terlindung dari data kewangan atau privasi pelanggan.</p>
        </div>
      </section>

      <section className="xp-count-pair">
        <div>
          <span>Total Automation Jobs</span>
          <strong>{jobs.loading ? '…' : stats.total}</strong>
          <small>{stats.completed} berjaya · {stats.failed} gagal · {stats.queued} dalam giliran</small>
        </div>
        <div>
          <span>Component Health</span>
          <strong>{health.loading ? '…' : `${healthSummary.ready} / ${(health.data ?? []).length} Ready`}</strong>
          <small>{healthSummary.unavailable} unavailable · {healthSummary.degraded} degraded</small>
        </div>
      </section>

      <Panel title="Ringkasan Eksekusi Komponen" eyebrow="Component Readiness Breakdown" action={<Refresh onClick={health.reload} />}>
        <ResourceState {...health} />
        <div className="xp-health-grid">
          {health.data?.map(component => (
            <article className="xp-health" key={component.component}>
              <div className="xp-health-top">
                <ShieldCheck size={20} />
                <Status value={component.status} />
              </div>
              <h3>{component.component.replaceAll('_', ' ')}</h3>
              <code>{component.reasonCode}</code>
              <small>Observed {dateLabel(component.observedAt)}</small>
            </article>
          ))}
        </div>
        {!health.loading && !health.error && !health.data?.length && (
          <Empty description="Tiada data kesihatan komponen direkodkan." />
        )}
      </Panel>

      <Panel
        title="Laporan Status Job Automasi"
        eyebrow="Automation Jobs Audit"
        action={
          <div className="xp-panel-actions">
            <label className="xp-filter-label">
              <Filter size={14} />
              <select value={filter} onChange={e => setFilter(e.target.value as typeof filter)}>
                <option value="all">Semua ({stats.total})</option>
                <option value="completed">Completed ({stats.completed})</option>
                <option value="failed">Failed ({stats.failed})</option>
                <option value="queued">Queued ({stats.queued})</option>
                <option value="blocked">Blocked ({stats.blocked})</option>
              </select>
            </label>
            <Refresh onClick={jobs.reload} />
          </div>
        }
      >
        <ResourceState {...jobs} />
        <div className="xp-jobs-list">
          {filteredJobs.map(job => (
            <article className="xp-job" key={job.id}>
              <div>
                <h3>{job.kind.replaceAll('_', ' ')}</h3>
                <RecordMeta id={job.id} />
                <p>Attempt {job.attempt} · Skill {job.skillVersion} · Scope: <code>{job.scope}</code></p>
                {job.reasonCode && <p className="xp-muted">Reason: {job.reasonCode}</p>}
                {job.checkpoint && <p className="xp-checkpoint">Checkpoint: {job.checkpoint}</p>}
                <small>Dibuat: {dateLabel(job.createdAt)}</small>
              </div>
              <Status value={job.status} />
            </article>
          ))}
        </div>
        {!jobs.loading && !jobs.error && !filteredJobs.length && (
          <Empty
            title="Tiada job dalam kategori ini"
            description="Semua job automasi mematuhi skop terhad dan direkod dengan idempoten."
          />
        )}
      </Panel>
    </div>
  );
}
