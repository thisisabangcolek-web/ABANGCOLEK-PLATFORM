import type { FulfilmentStatus, OrderLine, OrderRecord, PaymentState } from '../../../shared/platform-contracts';

export interface LegacySupabaseOrder {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email?: string;
  city: string;
  items: string;
  amount: number;
  status: 'Processing' | 'Delivered' | 'Delayed' | 'Refunded' | 'Cancelled';
  refund_reason?: string;
  created_at: string;
  delivered_date?: string;
}

export interface MappedOrderResult {
  valid: boolean;
  order?: OrderRecord;
  rejectionReason?: string;
  sourceId: string;
}

export function mapLegacyStatus(status: LegacySupabaseOrder['status']): {
  fulfilmentStatus: FulfilmentStatus;
  paymentState: PaymentState;
} {
  switch (status) {
    case 'Delivered':
      return { fulfilmentStatus: 'received', paymentState: 'verified' };
    case 'Processing':
      return { fulfilmentStatus: 'accepted', paymentState: 'pending' };
    case 'Delayed':
      return { fulfilmentStatus: 'packing', paymentState: 'pending' };
    case 'Refunded':
      return { fulfilmentStatus: 'cancelled', paymentState: 'refunded' };
    case 'Cancelled':
      return { fulfilmentStatus: 'cancelled', paymentState: 'rejected' };
    default:
      return { fulfilmentStatus: 'review', paymentState: 'pending' };
  }
}

export function parseLegacyItems(itemsRaw: string, defaultPriceSen: number): OrderLine[] {
  // Typical legacy item format: "Sambal Colek Original (2)" or comma separated
  const lines: OrderLine[] = [];
  const parts = itemsRaw.split(',').map(s => s.trim()).filter(Boolean);

  for (const part of parts) {
    const match = part.match(/^(.*?)(?:\s*\((\d+)\))?$/);
    const name = match && match[1] ? match[1].trim() : part;
    const quantity = match && match[2] ? parseInt(match[2], 10) : 1;
    lines.push({
      productId: 'legacy-imported-sku',
      name: name || 'Sambal Colek Legacy',
      quantity: Math.max(1, quantity),
      priceSen: defaultPriceSen,
      publishedVersion: 1,
    });
  }

  if (lines.length === 0) {
    lines.push({
      productId: 'legacy-imported-sku',
      name: 'Sambal Colek Legacy',
      quantity: 1,
      priceSen: defaultPriceSen,
      publishedVersion: 1,
    });
  }

  return lines;
}

export function mapSupabaseOrderToPlatform(
  row: unknown,
  existingOrderIds: Set<string>,
): MappedOrderResult {
  if (!row || typeof row !== 'object') {
    return { valid: false, rejectionReason: 'Row bukan objek', sourceId: 'unknown' };
  }

  const r = row as Partial<LegacySupabaseOrder>;
  const sourceId = r.order_id || r.id || 'unknown';

  if (!r.id || !r.order_id) {
    return { valid: false, rejectionReason: 'ID atau order_id tiada', sourceId };
  }

  if (existingOrderIds.has(r.order_id)) {
    return { valid: false, rejectionReason: `Pesanan pendua dikesan (${r.order_id})`, sourceId };
  }

  if (typeof r.amount !== 'number' || !Number.isFinite(r.amount) || r.amount < 0) {
    return { valid: false, rejectionReason: 'Amaun pesanan tidak sah', sourceId };
  }

  const amountSen = Math.round(r.amount * 100);
  const { fulfilmentStatus, paymentState } = mapLegacyStatus(r.status || 'Processing');
  const createdAt = r.created_at && !isNaN(Date.parse(r.created_at)) ? r.created_at : new Date().toISOString();
  const lines = parseLegacyItems(r.items || 'Sambal Colek', amountSen);

  // Map to distinct legacy customer identity (never forge verified credentials or sessions)
  const customerId = `legacy-cust-${sourceId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

  const order: OrderRecord = {
    id: `LEGACY-${r.order_id}`,
    customerId,
    lines,
    amountSen,
    fulfilment: 'delivery',
    contactRef: `[LEGACY_IMPORT] ${r.customer_name || 'Pelanggan Legacy'} - ${r.city || 'Malaysia'}`,
    outletId: 'hq',
    fulfilmentStatus,
    revision: 1,
    paymentState,
    paidAmountSen: paymentState === 'verified' ? amountSen : 0,
    refundAmountSen: paymentState === 'refunded' ? amountSen : 0,
    createdAt,
    updatedAt: r.delivered_date && !isNaN(Date.parse(r.delivered_date)) ? r.delivered_date : createdAt,
  };

  return { valid: true, order, sourceId };
}
