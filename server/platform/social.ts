import type { SocialConnectorSnapshot, SocialConnectionMethodInfo, SocialProviderStatus } from '../../shared/social-contracts';
import { Auth, type Principal } from './auth';
import { now } from './store';

const mockConnected = () => new Set((process.env.PLATFORM_MOCK_SOCIAL_CONNECTORS ?? '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean));
const providerState = (provider: SocialProviderStatus['provider'], operations: string[] = []): Pick<SocialProviderStatus, 'status'|'connectedAccount'|'allowedOperations'|'reasonCode'> => mockConnected().has(provider) ? { status: 'ready', connectedAccount: `mock-${provider}-account`, allowedOperations: operations, reasonCode: 'MOCK_CONNECTOR_READY' } : { status: 'unavailable', allowedOperations: [], reasonCode: 'OAUTH_CONNECTOR_NOT_CONFIGURED' };
const providers: SocialProviderStatus[] = [
  { provider: 'instagram', label: 'Instagram', ...providerState('instagram', ['read_insights','prepare_content']), accountRequirement: 'Professional / Business / Creator; sesetengah operasi memerlukan Facebook Page dipautkan.' },
  { provider: 'facebook', label: 'Facebook', status: 'unavailable', accountRequirement: 'Page access token melalui Meta OAuth rasmi.', allowedOperations: [], reasonCode: 'OAUTH_CONNECTOR_NOT_CONFIGURED' },
  { provider: 'tiktok', label: 'TikTok', status: 'unavailable', accountRequirement: 'Akaun dan app review TikTok yang diluluskan.', allowedOperations: [], reasonCode: 'OAUTH_CONNECTOR_NOT_CONFIGURED' },
  { provider: 'linkedin', label: 'LinkedIn', status: 'unavailable', accountRequirement: 'OAuth app dan permission organisasi yang disahkan.', allowedOperations: [], reasonCode: 'OAUTH_CONNECTOR_NOT_CONFIGURED' },
  { provider: 'x', label: 'X', status: 'unavailable', accountRequirement: 'OAuth app dengan access level yang sesuai.', allowedOperations: [], reasonCode: 'OAUTH_CONNECTOR_NOT_CONFIGURED' },
  { provider: 'youtube', label: 'YouTube', ...providerState('youtube', ['read_analytics','prepare_upload']), accountRequirement: 'Google OAuth dengan channel YouTube yang dipilih dan scope upload/analytics yang diluluskan.' },
  { provider: 'threads', label: 'Threads', ...providerState('threads', ['read_insights','prepare_post']), accountRequirement: 'Meta/Threads API access dan akaun Instagram yang layak jika diperlukan oleh endpoint.' },
];

const methods: SocialConnectionMethodInfo[] = [
  { method: 'official_oauth', label: 'Official OAuth / API', description: 'Sambung melalui halaman kebenaran rasmi platform. Token terhad digunakan; kata laluan tidak disimpan.', securityNote: 'Disyorkan untuk publish, scheduling dan analytics yang disokong provider.', status: mockConnected().size ? 'ready' : 'unavailable', reasonCode: mockConnected().size ? 'MOCK_CONNECTOR_READY' : 'OAUTH_CONNECTOR_NOT_CONFIGURED' },
  { method: 'browser_session', label: 'Browser session', description: 'Gunakan sesi browser pengguna apabila API rasmi tidak tersedia.', securityNote: 'Memerlukan browser connection aktif; CAPTCHA dan perubahan UI boleh mengganggu operasi.', status: 'unavailable', reasonCode: 'BROWSER_SESSION_NOT_CONNECTED' },
  { method: 'custom_api', label: 'Custom API', description: 'Sambung API key, webhook atau gateway dalaman milik organisasi.', securityNote: 'Secret perlu disimpan dalam connector vault; jangan masukkan kata laluan ke workspace.', status: 'unavailable', reasonCode: 'CUSTOM_API_NOT_CONFIGURED' },
  { method: 'mcp', label: 'Custom MCP', description: 'Gunakan MCP server organisasi untuk calendar, content workflow atau publisher sendiri.', securityNote: 'Tool scope dan approval perlu disahkan sebelum sebarang side effect.', status: 'unavailable', reasonCode: 'MCP_CONNECTOR_NOT_CONFIGURED' },
];

export class SocialConnections {
  constructor(readonly auth: Auth) {}
  snapshot(actor: Principal): SocialConnectorSnapshot {
    this.auth.founder(actor);
    return {
      providers: providers.map(provider => ({ ...provider, allowedOperations: [...provider.allowedOperations] })),
      methods: methods.map(method => ({ ...method })),
      publishPolicy: { approvalRequired: true, statement: 'Tiada post awam akan diterbitkan tanpa approval founder untuk exact campaign revision dan provider receipt.' },
      generatedAt: now(),
    };
  }
}
