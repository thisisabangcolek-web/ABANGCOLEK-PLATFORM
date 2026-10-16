import { useMemo, useState } from 'react';
import { AtSign, ExternalLink, Instagram, KeyRound, Link2, Linkedin, Search, ShieldCheck, Unplug, Youtube, type LucideIcon } from 'lucide-react';
import { Panel, Status } from './ui';
import './workspaces.css';

type Plugin = { id: string; name: string; category: string; description: string; method: 'OAuth' | 'Custom API' | 'Browser session' | 'MCP'; access: 'read-only' | 'read-write' | 'publish'; scopes: string[]; featured?: boolean; icon?: LucideIcon };
const plugins: Plugin[] = [
  { id: 'gmail', name: 'Gmail', category: 'Productivity', description: 'Email search, summaries and draft replies.', method: 'OAuth', access: 'read-write', scopes: ['read messages', 'create drafts'] },
  { id: 'google-calendar', name: 'Google Calendar', category: 'Productivity', description: 'Read availability and prepare calendar events.', method: 'OAuth', access: 'read-write', scopes: ['read events', 'create events'] },
  { id: 'google-drive', name: 'Google Drive', category: 'Productivity', description: 'Find, read and organise approved files.', method: 'OAuth', access: 'read-write', scopes: ['read files', 'create files'] },
  { id: 'slack', name: 'Slack', category: 'Productivity', description: 'Read channel context and prepare team messages.', method: 'OAuth', access: 'read-write', scopes: ['read channels', 'draft messages'] },
  { id: 'notion', name: 'Notion', category: 'Productivity', description: 'Search and update approved pages and databases.', method: 'OAuth', access: 'read-write', scopes: ['read pages', 'update pages'] },
  { id: 'hubspot', name: 'HubSpot', category: 'Marketing & CRM', description: 'Inspect deals, contacts and follow-up work.', method: 'OAuth', access: 'read-write', scopes: ['read CRM', 'create tasks'] },
  { id: 'instagram', name: 'Instagram Creator Marketplace', category: 'Marketing & Social', description: 'Professional account content and analytics where supported.', method: 'OAuth', access: 'publish', scopes: ['read insights', 'prepare content', 'publish with approval'], featured: true, icon: Instagram },
  { id: 'threads', name: 'Threads', category: 'Marketing & Social', description: 'Social content workflow through the configured Meta connector.', method: 'OAuth', access: 'publish', scopes: ['read profile', 'prepare post', 'publish with approval'], icon: AtSign },
  { id: 'youtube', name: 'YouTube', category: 'Marketing & Social', description: 'Prepare approved video uploads and channel analytics through Google OAuth.', method: 'OAuth', access: 'publish', scopes: ['read analytics', 'prepare upload', 'publish with approval'], icon: Youtube },
  { id: 'linkedin', name: 'LinkedIn', category: 'Marketing & Social', description: 'Prepare approved company or profile content.', method: 'OAuth', access: 'publish', scopes: ['read profile', 'publish with approval'], icon: Linkedin },
  { id: 'canva', name: 'Canva', category: 'Creativity', description: 'Use authorised design files for content workflows.', method: 'OAuth', access: 'read-write', scopes: ['read designs', 'export approved design'] },
  { id: 'stripe', name: 'Stripe', category: 'Finance', description: 'Read payment records and prepare reconciliation context.', method: 'OAuth', access: 'read-only', scopes: ['read payments', 'read customers'] },
  { id: 'github', name: 'GitHub', category: 'Development', description: 'Read issues, pull requests and repository activity.', method: 'OAuth', access: 'read-write', scopes: ['read issues', 'create draft issue'] },
  { id: 'vercel', name: 'Vercel', category: 'Development', description: 'Inspect deployment status and prepare deploy actions.', method: 'OAuth', access: 'read-write', scopes: ['read projects', 'read deployments'] },
  { id: 'supabase', name: 'Supabase', category: 'Development', description: 'Use an explicitly configured project connector.', method: 'Custom API', access: 'read-write', scopes: ['project-scoped query', 'project-scoped mutation'] },
  { id: 'sentry', name: 'Sentry', category: 'Development', description: 'Read error events and prepare incident summaries.', method: 'OAuth', access: 'read-only', scopes: ['read issues', 'read events'] },
  { id: 'n8n', name: 'n8n', category: 'Automation', description: 'Connect an organisation-owned workflow endpoint.', method: 'Custom API', access: 'read-write', scopes: ['webhook input', 'workflow status'] },
  { id: 'zapier', name: 'Zapier', category: 'Automation', description: 'Send approved workflow payloads to Zapier.', method: 'Custom API', access: 'read-write', scopes: ['webhook output'] },
  { id: 'zoom', name: 'Zoom', category: 'Meetings', description: 'Read authorised meetings, transcripts or recordings where supported.', method: 'OAuth', access: 'read-only', scopes: ['read meetings', 'read transcripts'] },
  { id: 'my-browser', name: 'My Browser', category: 'Browser tools', description: 'Use a user-connected browser session when an official API is unavailable.', method: 'Browser session', access: 'read-write', scopes: ['user-approved browsing', 'manual confirmation'] },
  { id: 'custom-mcp', name: 'Custom MCP', category: 'Developer tools', description: 'Connect an organisation-owned MCP server with explicit tools.', method: 'MCP', access: 'read-write', scopes: ['tool allowlist', 'server scope'] },
];

export function PluginsWorkspace() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<Plugin>(plugins[6]);
  const categories = ['All', ...Array.from(new Set(plugins.map(plugin => plugin.category)))];
  const filtered = useMemo(() => plugins.filter(plugin => (category === 'All' || plugin.category === category) && `${plugin.name} ${plugin.description} ${plugin.category}`.toLowerCase().includes(query.toLowerCase())), [category, query]);
  const SelectedIcon = selected.icon ?? Link2;
  return <>
    <Panel title="Plugins / Connectors" eyebrow="Manage authorised bridges to external applications" action={<span className="xp-plugin-safety"><ShieldCheck size={16}/> OAuth token only · password never stored</span>}>
      <div className="xp-plugin-hero"><div><h3>Give ABANGCOLEK the right tools.</h3><p>Plugin ialah connector kepada aplikasi luar. Skill menentukan apa yang boleh dibuat; Automation menentukan bila ia berjalan; permission menentukan apa yang dibenarkan.</p></div><div className="xp-plugin-mental-model"><span>Connector</span><b>+</b><span>Skill</span><b>+</b><span>Automation</span></div></div>
      <div className="xp-plugin-toolbar"><label className="xp-search"><Search size={17}/><span className="xp-sr-only">Cari plugin</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari Gmail, Instagram, GitHub…" /></label><select value={category} onChange={event => setCategory(event.target.value)} aria-label="Filter kategori">{categories.map(item => <option key={item}>{item}</option>)}</select></div>
      <div className="xp-plugin-layout"><div className="xp-plugin-grid">{filtered.map(plugin => { const Icon=plugin.icon??Link2; return <button className={`xp-plugin-card ${selected.id === plugin.id ? 'is-selected' : ''}`} key={plugin.id} onClick={() => setSelected(plugin)}><span className={`xp-plugin-icon xp-provider-${plugin.id}`}><Icon size={18}/></span><span><strong>{plugin.name}</strong><small>{plugin.category}</small></span><Status value={plugin.access}/><em>Not connected</em></button>; })}{!filtered.length&&<p className="xp-muted">Tiada connector sepadan dengan carian.</p>}</div><aside className="xp-plugin-detail"><div className="xp-plugin-detail-head"><span className={`xp-plugin-icon xp-provider-${selected.id}`}><SelectedIcon size={22}/></span><div><p className="xp-eyebrow">{selected.category}</p><h3>{selected.name}</h3></div></div><p>{selected.description}</p><div className="xp-plugin-facts"><span><KeyRound size={15}/> {selected.method}</span><span><ShieldCheck size={15}/> {selected.access.replace('-', ' ')}</span></div><h4>Permission scope</h4><ul>{selected.scopes.map(scope => <li key={scope}>{scope}</li>)}</ul><div className="xp-plugin-notice"><strong>Connector belum dikonfigurasi</strong><p>Connect akan menggunakan OAuth/API rasmi atau sesi browser yang telah disambungkan. Tiada password perlu dimasukkan ke chat.</p></div><button className="xp-button" disabled><Link2 size={17}/> Connect unavailable</button><button className="xp-button xp-secondary" disabled><Unplug size={17}/> Disconnect</button><a className="xp-plugin-doc" href="https://open.manus.im/docs/v2/connectors" target="_blank" rel="noreferrer">Baca connector documentation <ExternalLink size={14}/></a></aside></div>
    </Panel>
  </>;
}
