export type SocialProvider = 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'x' | 'youtube' | 'threads';
export type SocialConnectionMethod = 'official_oauth' | 'browser_session' | 'custom_api' | 'mcp';
export type SocialConnectorStatus = 'ready' | 'unavailable' | 'needs_verification' | 'disabled';

export interface SocialProviderStatus {
  provider: SocialProvider;
  label: string;
  status: SocialConnectorStatus;
  connectedAccount?: string;
  accountRequirement?: string;
  allowedOperations: string[];
  reasonCode: string;
}

export interface SocialConnectionMethodInfo {
  method: SocialConnectionMethod;
  label: string;
  description: string;
  securityNote: string;
  status: SocialConnectorStatus;
  reasonCode: string;
}

export interface SocialConnectorSnapshot {
  providers: SocialProviderStatus[];
  methods: SocialConnectionMethodInfo[];
  publishPolicy: {
    approvalRequired: true;
    statement: string;
  };
  generatedAt: string;
}
