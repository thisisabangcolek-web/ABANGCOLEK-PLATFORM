import { useState } from 'react';
import { CalendarClock, Download, ExternalLink, Filter, Plus, Radio, Webhook } from 'lucide-react';
import type { AutomationCapability, AutomationDefinition, AutomationRun, PreparedPostizExport, ResearchSessionGrant, ResearchSourceRecord, SavedResearchBrief } from '../../../shared/automation-contracts';
import type { CampaignRecord, WorkspaceRole } from '../../../shared/platform-contracts';
import { api, jsonMutation, useResource } from '../platform/client';
import { dateLabel, downloadText, malaysiaDateTime } from './experience-model';
import { Empty, field, FormPanel, MutationButton, Panel, Refresh, ResourceState, Status } from './ui';

function AutomationControlCenter({ onChanged }: { onChanged?: () => void }) {
  const automations = useResource<AutomationDefinition[]>('/automations');
  const runs = useResource<AutomationRun[]>('/automation-runs');
  const [form, setForm] = useState(false);
  const [recipeBusy, setRecipeBusy] = useState(false);
  const refresh = () => { automations.reload(); runs.reload(); onChanged?.(); };
  async function createSocialRecipe() { setRecipeBusy(true); try { await api('/automations', jsonMutation({ name: 'Approved calendar → Threads + YouTube', instruction: 'Setiap kali content calendar campaign yang telah diluluskan sampai pada scheduled time, sediakan format Threads dan YouTube berdasarkan exact approved revision. Hantar hanya selepas founder approve provider-specific preview. Jangan publish jika connector, account scope, asset rights atau approval expiry tidak sah.', mode: 'schedule', scheduleKind: 'recurring', scheduleExpression: 'campaign.scheduledAt', connectors: ['Threads', 'YouTube'], destination: 'manual_publish', filters: ['campaign.status = approved', 'approvalExpiresAt > now', 'asset rights = verified'], })); refresh(); } finally { setRecipeBusy(false); } }
  const modeIcon = (mode: AutomationDefinition['mode']) => mode === 'schedule' ? <CalendarClock size={18}/> : mode === 'webhook' ? <Webhook size={18}/> : <Radio size={18}/>;
  return <>
    <Panel title="Automations" eyebrow="Schedule · Trigger · Webhook · Receipts" action={<div className="xp-actions"><Refresh onClick={refresh}/><button className="xp-button" onClick={() => setForm(true)}><Plus size={17}/> Create automation</button></div>}>
      <ResourceState {...automations}/>
      <div className="xp-automation-intro"><div><strong>Automate the repeatable work.</strong><p>Schedule berjalan ikut masa; Trigger/Webhook menunggu event. Semua automation disimpan sebagai definition yang boleh diaudit.</p><button className="xp-button xp-secondary" onClick={createSocialRecipe} disabled={recipeBusy}><CalendarClock size={16}/> {recipeBusy ? 'Menyimpan recipe…' : 'Tambah recipe Threads + YouTube'}</button></div><span><Filter size={16}/> Approval untuk publish sentiasa wajib</span></div>
      <div className="xp-automation-list">{automations.data?.map(item => <article className="xp-automation-card" key={item.id}><div className="xp-automation-card-head"><span className="xp-automation-mode">{modeIcon(item.mode)} {item.mode}</span><Status value={item.status}/></div><h3>{item.name}</h3><p>{item.instruction}</p><div className="xp-automation-meta"><span>{item.scheduleExpression || item.triggerEvent || 'Menunggu konfigurasi event'}</span><span>{item.connectors.join(' · ') || 'Tiada connector'}</span><span>{item.destination.replace('_',' ')}</span></div><div className="xp-actions"><MutationButton path={`/automations/${item.id}/toggle`} input={{ expectedRevision:item.revision,status:item.status==='enabled'?'paused':'enabled' }} onChanged={refresh} confirmLabel={item.status==='enabled'?'Pause automation':'Enable automation'}>{item.status==='enabled'?'Pause':'Enable'}</MutationButton><span className="xp-muted">{item.status==='enabled'?'Definition enabled; worker/connector receipt masih diperiksa.':'Disimpan tetapi tidak akan berjalan.'}</span></div></article>)}</div>
      {!automations.loading&&!automations.error&&!automations.data?.length&&<Empty title="Belum ada automation" description="Mulakan dengan arahan yang berdiri sendiri, pilih Schedule atau Trigger, kemudian tetapkan connector dan destination."/>}
    </Panel>
    <Panel title="Runs / execution history" eyebrow="Success · Failed · Needs attention · No match"><ResourceState {...runs}/>{runs.data?.slice(0,20).map(run => <div className="xp-list-row" key={run.id}><div><strong>{automations.data?.find(item=>item.id===run.automationId)?.name??'Automation'}</strong><p>{run.triggerReason} · {run.outputSummary}</p><small>{dateLabel(run.createdAt)} · {run.reasonCode}</small></div><Status value={run.status}/></div>)}{!runs.loading&&!runs.error&&!runs.data?.length&&<Empty description="Execution receipt akan muncul selepas worker menerima schedule atau event sebenar."/>}</Panel>
    {form&&<FormPanel title="Create automation" description="Arahan mesti lengkap kerana ia mungkin berjalan kemudian tanpa konteks chat ini. Automation baru disimpan sebagai paused sehingga anda enable." fields={[field('name','Nama automation',{max:200}),field('instruction','Arahan kepada Manus',{type:'textarea',max:12000,help:'Contoh: Setiap Isnin jam 9 pagi, sediakan 5 idea content Instagram. Simpan sebagai draft dan jangan publish tanpa approval.'}),field('mode','Jenis',{options:[{value:'schedule',label:'Schedule · ikut masa'},{value:'trigger',label:'Trigger · event provider'},{value:'webhook',label:'Webhook · event dari sistem luar'},{value:'script',label:'Script trigger · pemeriksaan berkala'}]}),field('scheduleKind','Schedule type',{required:false,options:[{value:'one_time',label:'One-time'},{value:'recurring',label:'Recurring'},{value:'interval',label:'Interval'},{value:'cron',label:'Cron'}]}),field('scheduleExpression','Schedule / interval / cron expression',{required:false,help:'Contoh 09:00 weekdays, every 30m atau cron expression.'}),field('triggerProvider','Trigger provider',{required:false,help:'Contoh Instagram, Gmail, webhook atau sistem API sendiri.'}),field('triggerEvent','Trigger event',{required:false,help:'Contoh new_comment, new_email, form.submitted atau order.created.'}),field('filters','Filters (satu setiap baris)',{type:'textarea',required:false,help:'Syarat dalam satu kumpulan dianggap AND; kumpulan lain boleh direka sebagai OR.'}),field('connectors','Connectors (comma-separated)',{required:false,defaultValue:'Instagram'}),field('destination','Destination',{options:[{value:'draft',label:'Create draft'},{value:'task',label:'Create task'},{value:'report',label:'Create report'},{value:'manual_publish',label:'Prepare manual publish pack'},{value:'webhook',label:'Send webhook'}]})]} onCancel={()=>setForm(false)} submitLabel="Save paused automation" onSubmit={async values => { const result=await api('/automations',jsonMutation({ ...values,filters:values.filters.split('\n').map(v=>v.trim()).filter(Boolean),connectors:values.connectors.split(',').map(v=>v.trim()).filter(Boolean) })); setForm(false); refresh(); return result; }}/>} 
  </>;
}

export function AutomationWorkspace({ role, onChanged }: { role: WorkspaceRole; onChanged?: () => void }) {
  const capabilities = useResource<AutomationCapability[]>('/automation/capabilities');
  return <>
    {role === 'founder' && <AutomationControlCenter onChanged={onChanged}/>} 
    <Panel title="Automation readiness" eyebrow="Configured capabilities · explicit authorization" action={<Refresh onClick={capabilities.reload} />}>
      <ResourceState {...capabilities} />
      <div className="xp-detail-grid">{capabilities.data?.map(capability => <article key={capability.providerId}>
        <h3>{capability.providerId === 'manual' ? 'Manual research & export' : capability.providerId.replaceAll('_', ' ')}</h3>
        <Status value={capability.status} />
        <p>{capability.providerId === 'manual' ? 'Sources, tafsiran manusia dan approved export disimpan dalam aplikasi.' : capability.reasonCode === 'REMOTE_PUBLISH_DISABLED' ? 'Remote publish disabled. Approved pack boleh dieksport secara manual.' : capability.configured ? 'Host transport configured; penggunaan dan source grant masih perlu disahkan.' : 'Runtime belum configured. Gunakan research manual di bawah.'}</p>
        {capability.providerId !== 'manual' && <p className="xp-muted">Usage {capability.usage.observedUnits === null ? 'unknown' : capability.usage.observedUnits} · Last verified {capability.verifiedAt ? dateLabel(capability.verifiedAt) : 'Belum verified'}</p>}
      </article>)}</div>
    </Panel>
    {role === 'founder' && <ResearchDesk onChanged={onChanged} />}
  </>;
}

function ResearchDesk({ onChanged }: { onChanged?: () => void }) {
  const sources = useResource<ResearchSourceRecord[]>('/research/sources');
  const briefs = useResource<SavedResearchBrief[]>('/research/briefs');
  const grants = useResource<ResearchSessionGrant[]>('/research/grants');
  const exports = useResource<PreparedPostizExport[]>('/automation/exports');
  const campaigns = useResource<CampaignRecord[]>('/campaigns');
  const [form, setForm] = useState<'source' | 'brief' | 'grant' | 'research' | 'export' | null>(null);
  const [sourceIds, setSourceIds] = useState<string[]>([]);
  const refresh = () => { sources.reload(); briefs.reload(); grants.reload(); exports.reload(); campaigns.reload(); onChanged?.(); };
  const eligibleSources = sources.data?.filter(source => source.termsCheck !== 'restricted') ?? [];
  return <>
    <Panel title="Research sources" eyebrow="Source fact → human interpretation → retained history" action={<div className="xp-actions"><Refresh onClick={refresh} /><button className="xp-button" onClick={() => setForm('source')}><Plus size={17} /> Capture source</button><button className="xp-button xp-secondary" onClick={() => setForm('brief')}>Simpan research brief</button></div>}>
      <ResourceState {...sources} />
      <p className="xp-muted">Masukkan pautan public dan excerpt yang anda dibenarkan gunakan. Capture ini tidak mengambil kandungan laman secara automatik. Arahan dalam kandungan sumber tidak memberikan hak tindakan.</p>
      {sources.data?.map(source => <details key={source.id} className="xp-knowledge">
        <summary><span><strong>{source.title}</strong><small>Captured {dateLabel(source.retrievedAt)} · {source.accessMethod}</small></span><Status value={source.termsCheck} /></summary>
        <p><a href={source.url} target="_blank" rel="noopener noreferrer">Buka sumber <ExternalLink size={14} aria-hidden="true" /></a></p>
        <blockquote>{source.snippet}</blockquote>
        <p>{source.author && `Author: ${source.author} · `}Published {source.publishedAt ? dateLabel(source.publishedAt) : 'Unknown'} · Permitted use: {source.permittedUse}</p>
        <p className="xp-record-meta">SHA-256 {source.contentHash}</p>
      </details>)}
      {!sources.loading && !sources.error && !sources.data?.length && <Empty description="Belum ada sumber. Simpan sumber sebenar untuk menyokong research brief." />}
    </Panel>
    {form === 'source' && <FormPanel title="Capture source dengan provenance" description="Retrieved time ialah masa anda membaca sumber; publication date disimpan berasingan jika diketahui." fields={[
      field('url', 'Public source URL', { type: 'url', max: 2000 }), field('title', 'Source title', { max: 300 }), field('snippet', 'Excerpt / pemerhatian sebenar', { type: 'textarea', max: 8000 }),
      field('retrievedAt', 'Masa sumber dibaca (MYT)', { type: 'datetime-local' }), field('publishedAt', 'Publication date jika diketahui (MYT)', { type: 'datetime-local', required: false }), field('author', 'Author jika diketahui', { required: false, max: 200 }),
      field('termsCheck', 'Permission / source terms', { options: [{ value: 'allowed', label: 'Allowed · permission sudah disemak' }, { value: 'unknown', label: 'Unknown · tandakan batas penggunaan' }, { value: 'restricted', label: 'Restricted · simpan reference sahaja' }] }), field('permittedUse', 'Penggunaan yang dibenarkan / batas', { type: 'textarea', max: 2000 }),
    ]} onCancel={() => setForm(null)} submitLabel="Simpan source record" onSubmit={async values => {
      const result = await api('/research/sources', jsonMutation({ ...values, retrievedAt: malaysiaDateTime(values.retrievedAt), publishedAt: values.publishedAt ? malaysiaDateTime(values.publishedAt) : undefined, author: values.author || undefined })); refresh(); return result;
    }} />}
    {form === 'brief' && <FormPanel title="Simpan tafsiran manusia" description="Brief ini ialah tafsiran anda berdasarkan source yang dipilih. Ia tidak mengubah approved campaign atau catalogue." fields={[field('question', 'Research question', { type: 'textarea', max: 2000 }), field('summary', 'Interpretation / hypotheses', { type: 'textarea', max: 12000 }), field('unknownReasons', 'Batas / unknowns (satu setiap baris)', { type: 'textarea', required: false, max: 2000 })]} onCancel={() => setForm(null)} submitLabel="Simpan source-linked brief" onSubmit={async values => {
      if (!sourceIds.length) throw new Error('Pilih sekurang-kurangnya satu source yang dibenarkan.');
      const result = await api('/research/briefs', jsonMutation({ question: values.question, summary: values.summary, sourceIds, unknownReasons: values.unknownReasons.split('\n').map(value => value.trim()).filter(Boolean) })); refresh(); return result;
    }}>
      <fieldset><legend>Supporting sources</legend>{eligibleSources.map(source => <label key={source.id} className="xp-checkbox"><input type="checkbox" checked={sourceIds.includes(source.id)} onChange={event => setSourceIds(current => event.target.checked ? [...current, source.id] : current.filter(value => value !== source.id))} /> {source.title} · {source.termsCheck}</label>)}{!eligibleSources.length && <p>Simpan source yang boleh digunakan terlebih dahulu.</p>}</fieldset>
    </FormPanel>}
    <Panel title="Research brief history" eyebrow="Persisted receipts · explicit unknowns">
      <ResourceState {...briefs} />
      {briefs.data?.map(brief => <details key={brief.id} className="xp-knowledge"><summary><span><strong>{brief.question}</strong><small>{dateLabel(brief.createdAt)} · {brief.synthesis === 'human_authored' ? 'Human interpretation' : 'Untrusted external synthesis'}</small></span><Status value={brief.status} /></summary>
        <p style={{ whiteSpace: 'pre-wrap' }}>{brief.summary || 'Tiada synthesis yang dapat disahkan.'}</p>
        <ul>{brief.sourceRefs.map((source, index) => <li key={`${source.url}:${index}`}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a> · captured {dateLabel(source.retrievedAt)}</li>)}</ul>
        {brief.unknownReasons.length > 0 && <p className="xp-notice">Unknowns: {brief.unknownReasons.join(' · ')}</p>}
      </details>)}
      {!briefs.loading && !briefs.error && !briefs.data?.length && <Empty description="Brief dan source links akan kekal sebagai rekod history selepas disimpan." />}
    </Panel>
    <Panel title="Optional external research" eyebrow="Explicit origin scope · expiry · revocation" action={<div className="xp-actions"><button className="xp-button xp-secondary" onClick={() => setForm('grant')}>Opt-in source grant</button><button className="xp-button xp-secondary" onClick={() => setForm('research')}>Request read-only research</button></div>}>
      <p className="xp-muted">Grant ini membenarkan public source research dalam origin yang dipilih. Ia tidak log masuk, menyalin browser cookies, mengakses inbox atau memberikan publishing privileges. Jika runtime/usage unavailable, request menghasilkan blocked receipt.</p>
      <ResourceState {...grants} />
      {grants.data?.map(grant => <article className="xp-knowledge" key={grant.id}><h3>{grant.purpose}</h3><p>{grant.allowedOrigins.join(' · ')} · Expires {dateLabel(grant.expiresAt)}</p><Status value={grant.status} />{grant.status === 'active' && <MutationButton path={`/research/grants/${grant.id}/revoke`} input={{ expectedVersion: grant.version }} onChanged={refresh} confirmLabel="Sahkan revoke source grant">Revoke</MutationButton>}</article>)}
    </Panel>
    {form === 'grant' && <FormPanel title="Opt-in public source scope" fields={[field('allowedOrigins', 'Allowed public origins (satu setiap baris)', { type: 'textarea', help: 'Contoh https://example.org. Tiada path, local IP atau credentials.', max: 2000 }), field('purpose', 'Tujuan source research', { max: 1000 }), field('expiresAt', 'Expiry dalam 7 hari (MYT)', { type: 'datetime-local' })]} onCancel={() => setForm(null)} submitLabel="Authorize scope ini" onSubmit={async values => { const result = await api('/research/grants', jsonMutation({ allowedOrigins: values.allowedOrigins.split('\n').map(value => value.trim()).filter(Boolean), purpose: values.purpose, expiresAt: malaysiaDateTime(values.expiresAt) })); refresh(); return result; }} />}
    {form === 'research' && <FormPanel title="Request read-only research" fields={[field('question', 'Research question', { type: 'textarea', max: 2000 }), field('allowedSources', 'Exact permitted source URLs (satu setiap baris)', { type: 'textarea', max: 8000 }), field('sessionGrantId', 'Active explicit grant', { options: grants.data?.filter(grant => grant.status === 'active' && grant.expiresAt > new Date().toISOString()).map(grant => ({ value: grant.id, label: grant.purpose })) ?? [] }), field('maxItems', 'Maximum sources', { type: 'number', min: 1, max: 20, defaultValue: '5' })]} onCancel={() => setForm(null)} submitLabel="Simpan request & jalankan jika admitted" onSubmit={async values => { const result = await api('/research/run', jsonMutation({ question: values.question, allowedSources: values.allowedSources.split('\n').map(value => value.trim()).filter(Boolean), sessionGrantId: values.sessionGrantId, maxItems: Number(values.maxItems) })); refresh(); return result; }} />}
    <Panel title="Approved publishing handoff" eyebrow="Exported pack · manual delivery · no publish receipt" action={<button className="xp-button xp-secondary" onClick={() => setForm('export')}>Prepare approved export</button>}>
      <ResourceState {...exports} />
      {exports.data?.map(artifact => <article key={artifact.id} className="xp-knowledge"><h3>{campaigns.data?.find(campaign => campaign.id === artifact.campaignId)?.title ?? 'Approved campaign'} · v{artifact.campaignRevision}</h3><p>{artifact.channel} · {artifact.accountId ?? 'Manual account selection'} · {dateLabel(artifact.createdAt)}</p><Status value={artifact.status} /><p>Manual delivery diperlukan. Export tidak membuktikan post diterbitkan.</p><button className="xp-button xp-secondary" onClick={() => downloadText(`campaign-v${artifact.campaignRevision}.txt`, artifact.content ?? '')}><Download size={16} /> Download exact approved caption</button></article>)}
      {!exports.loading && !exports.error && !exports.data?.length && <Empty description="Sediakan exact approved revision untuk manual channel handoff." />}
    </Panel>
    {form === 'export' && <FormPanel title="Prepare approved channel pack" fields={[field('campaignId', 'Approved campaign', { options: campaigns.data?.filter(campaign => ['approved', 'planned'].includes(campaign.status)).map(campaign => ({ value: campaign.id, label: `${campaign.title} · v${campaign.revision}` })) ?? [] }), field('channel', 'Intended channel', { max: 120, help: 'Label sahaja. Tidak menyambungkan atau menerbit ke platform.' }), field('accountId', 'Intended account label', { required: false, max: 120 })]} onCancel={() => setForm(null)} submitLabel="Prepare & save export" onSubmit={async values => { const campaign = campaigns.data?.find(item => item.id === values.campaignId); if (!campaign) throw new Error('Pilih approved campaign.'); const result = await api(`/campaigns/${campaign.id}/postiz-prepare`, jsonMutation({ expectedRevision: campaign.revision, channel: values.channel, accountId: values.accountId || undefined })); refresh(); return result; }} />}
  </>;
}
