import { createHmac } from 'node:crypto';
import type { AgentResult, CancelOutcome, PublishIntent, ReadOnlyAgentTask, ResearchRequest, UsageSnapshot } from '../../shared/platform-contracts';
import { now } from '../platform/store';
import type { AutomationOptions, PostizPublisherTransport, ReadOnlyHermesTransport, ReadOnlyResearchTransport, ResearchCollection } from './adapters';
import type { WhatsAppTransport } from '../platform/whatsapp';
import { publicSourceUrl } from './sourcePolicy';

export class LocalHermesTransport implements ReadOnlyHermesTransport {
  readonly zeroNewSpend = true as const;

  async run(task: ReadOnlyAgentTask, signal: AbortSignal): Promise<AgentResult> {
    if (signal.aborted) {
      throw new Error('HERMES_ABORTED');
    }

    // Safety check against unauthorized tool scopes
    if (task.allowedToolIds.some(tool => !['research.sources.read', 'knowledge.approved.read'].includes(tool))) {
      return {
        status: 'blocked',
        artifactIds: [],
        evidenceIds: [],
        unknownReasons: ['TOOL_SCOPE_DENIED'],
      };
    }

    // Anti-prompt-injection check: Untrusted content cannot instruct secrets extraction or shell execution
    if (/(\bsecrets?\b|\bapi.?key\b|\bpasswords?\b|\btoken\b|\bexec\b|\bshell\b|\brm\s+-rf\b)/i.test(task.objective)) {
      return {
        status: 'blocked',
        artifactIds: [],
        evidenceIds: [],
        unknownReasons: ['UNTRUSTED_CONTENT_INSTRUCTION_DENIED'],
      };
    }

    // Harmless, grounded analysis on permitted source references
    const summary = `Hermes Analysis for Job ${task.jobId}: Processed ${task.sourceRefs.length} approved references under objective: "${task.objective.slice(0, 100)}".`;

    return {
      status: 'completed',
      artifactIds: [`art-hermes-${task.jobId}`],
      evidenceIds: [],
      unknownReasons: [],
    };
  }
}

export class LocalAgentReachTransport implements ReadOnlyResearchTransport {
  readonly zeroNewSpend = true as const;

  async collect(
    request: ResearchRequest,
    signal: AbortSignal,
    onSource?: (source: unknown) => void,
  ): Promise<ResearchCollection> {
    if (signal.aborted) {
      throw new Error('AGENT_REACH_ABORTED');
    }

    const collectedSources: unknown[] = [];
    const unknownReasons: string[] = [];

    for (const rawUrl of request.allowedSources.slice(0, request.maxItems)) {
      if (signal.aborted) break;
      try {
        const validatedUrl = publicSourceUrl(rawUrl);
        const sourceData = {
          url: validatedUrl,
          title: `Public Research Source: ${new URL(validatedUrl).hostname}`,
          snippet: `Disahkan daripada sumber awam yang dibenarkan (${validatedUrl}) untuk soalan: ${request.question.slice(0, 120)}`,
          retrievedAt: now(),
          termsCheck: 'allowed',
          accessMethod: 'public_web',
          permittedUse: 'analisis_penyelidikan_platform',
        };
        collectedSources.push(sourceData);
        onSource?.(sourceData);
      } catch (err) {
        unknownReasons.push('SOURCE_URL_INVALID_OR_DENIED');
      }
    }

    return {
      summary: `Hasil carian Agent-Reach bagi: "${request.question}". Mengandungi ${collectedSources.length} sumber awam disahkan.`,
      sources: collectedSources,
      unknownReasons,
    };
  }
}

export class LocalPostizTransport implements PostizPublisherTransport {
  readonly zeroNewSpend = true as const;
  readonly channel = 'local-pilot' as const;

  async publish(
    intent: PublishIntent,
    signal: AbortSignal,
  ): Promise<{ providerRef: string; status: 'published' | 'blocked' | 'unknown'; url?: string; reasonCode?: string }> {
    if (signal.aborted) throw new Error('POSTIZ_ABORTED');

    const providerRef = `postiz-${intent.campaignId.slice(0, 8)}-rev${intent.assetVersion}`;
    return {
      providerRef,
      status: 'published',
      url: `https://postiz.local/posts/${providerRef}`,
      reasonCode: 'POSTIZ_PUBLISHED',
    };
  }

  async reconcile(
    providerRef: string,
    signal: AbortSignal,
  ): Promise<{ status: 'published' | 'blocked' | 'unknown'; url?: string; reasonCode?: string }> {
    if (signal.aborted) throw new Error('POSTIZ_ABORTED');
    return {
      status: 'published',
      url: `https://postiz.local/posts/${providerRef}`,
      reasonCode: 'RECONCILED',
    };
  }

  async cancel(
    providerRef: string,
    signal: AbortSignal,
  ): Promise<CancelOutcome> {
    if (signal.aborted) throw new Error('POSTIZ_ABORTED');
    return {
      providerRef,
      status: 'cancelled',
      evidenceIds: [],
    };
  }
}

export class LocalWhatsAppTransport implements WhatsAppTransport {
  readonly zeroNewSpend = true as const;
  readonly phoneNumberId = 'local-phone-60123456789';
  readonly webhookSecret = 'local-wa-webhook-secret-abangcolek';

  async sendTemplate(
    to: string,
    templateName: string,
    parameters: Record<string, string>,
    signal: AbortSignal,
  ): Promise<{ messageId: string; status: 'accepted' | 'sent' | 'failed' | 'unknown'; reasonCode?: string }> {
    if (signal.aborted) throw new Error('WHATSAPP_ABORTED');
    const messageId = `wamid.HBgL${Date.now()}AB12CD`;
    return {
      messageId,
      status: 'sent',
      reasonCode: 'SENT_OK',
    };
  }

  verifyWebhookSignature(signature: string, rawPayload: string): boolean {
    const expected = 'sha256=' + createHmac('sha256', this.webhookSecret).update(rawPayload).digest('hex');
    return signature === expected;
  }
}

export function createDefaultWhatsAppTransport(): WhatsAppTransport {
  return new LocalWhatsAppTransport();
}

export function createDefaultAutomationOptions(): AutomationOptions {
  return {
    hermes: new LocalHermesTransport(),
    agentReach: new LocalAgentReachTransport(),
    postiz: new LocalPostizTransport(),
    externalUsage: (): UsageSnapshot => ({
      providerId: 'agent_reach',
      observedUnits: 1,
      limitUnits: 100,
      available: true,
      observedAt: now(),
    }),
    timeoutMs: 5000,
  };
}
