import type {
  ProductOnboardingDraft,
  LocationOnboardingDraft,
  DealerTermsDraft,
  OnboardingValidationResult,
  OnboardingCommitResult,
} from '../../shared/onboarding-contracts';
import type { CatalogueProduct, StockLot, InventoryMovement } from '../../shared/platform-contracts';
import { Auth, type Principal } from './auth';
import { Commerce } from './commerce';
import { fail, id, now, PlatformStore } from './store';

export class BusinessOnboarding {
  constructor(
    readonly store: PlatformStore,
    readonly auth: Auth,
    readonly commerce: Commerce,
  ) {}

  validate(packet: {
    products?: ProductOnboardingDraft[];
    locations?: LocationOnboardingDraft[];
    dealerTerms?: DealerTermsDraft;
  }): OnboardingValidationResult {
    const missingFields: string[] = [];
    const warnings: string[] = [];
    const unknowns: string[] = [];
    const rejectedItems: { name: string; reason: string }[] = [];

    const products = packet.products ?? [];

    if (!products.length) {
      missingFields.push('products');
      unknowns.push('Katalog produk belum dimuatkan.');
    }

    for (const p of products) {
      const name = p.name?.trim() ?? '';
      if (!name) {
        missingFields.push(`product[${p.sku ?? 'unknown'}].name`);
        rejectedItems.push({ name: p.sku ?? 'unnamed', reason: 'Nama produk diperlukan.' });
        continue;
      }

      // Check if artwork or mascot is erroneously treated as sellable SKU
      const lower = name.toLowerCase();
      if (p.isArtworkOrMascot || lower.includes('maskot') || lower.includes('mascot') || lower.includes('artwork')) {
        rejectedItems.push({
          name,
          reason: 'Artwork dan maskot jenama bukan SKU produk untuk jualan.',
        });
        continue;
      }

      // Pack size validation
      if (!p.packSize || p.packSize < 1) {
        rejectedItems.push({ name, reason: 'Saiz pek mestilah sekurang-kurangnya 1.' });
        continue;
      }

      // Unverified historical claims check
      if (p.priceSen === 2800 && !p.ownerApproved) {
        warnings.push(`Produk "${name}": Tuntutan harga historical RM28 belum disahkan oleh founder.`);
      }

      // Missing price checks
      if (p.priceSen === undefined || p.priceSen === null || p.priceSen <= 0) {
        missingFields.push(`product[${name}].priceSen`);
        if (p.lifecycle === 'published') {
          rejectedItems.push({
            name,
            reason: 'Produk tidak boleh diterbitkan tanpa harga sen yang diluluskan pemilik.',
          });
          continue;
        }
      }

      // Unapproved publish attempt
      if (p.lifecycle === 'published' && !p.ownerApproved) {
        rejectedItems.push({
          name,
          reason: 'Penerbitan katalog memerlukan kelulusan rasmi pemilik (ownerApproved: true).',
        });
        continue;
      }

      if (p.unverifiedFields && p.unverifiedFields.length > 0) {
        warnings.push(`Produk "${name}" mempunyai medan belum sah: ${p.unverifiedFields.join(', ')}.`);
      }
    }

    // Locations validation
    if (packet.locations) {
      for (const loc of packet.locations) {
        if (!loc.id || !loc.name) {
          missingFields.push('location.id_or_name');
        }
        if (loc.openingStockQuantity !== undefined && loc.openingStockQuantity < 0) {
          warnings.push(`Lokasi ${loc.name}: Opening stock tidak boleh negatif.`);
        }
      }
    }

    // Dealer terms validation
    if (packet.dealerTerms) {
      if (packet.dealerTerms.minimumQuantity < 1) {
        warnings.push('Terma pengedar: Kuantiti minimum mestilah sekurang-kurangnya 1.');
      }
      if (packet.dealerTerms.priceBasisPoints < 1 || packet.dealerTerms.priceBasisPoints > 10000) {
        warnings.push('Terma pengedar: Basis points diskaun mestilah antara 1 dan 10000.');
      }
    }

    const isValid = rejectedItems.length === 0 && missingFields.length === 0;
    const canCommit = rejectedItems.length === 0 && products.some(p => p.ownerApproved && (p.priceSen ?? 0) > 0);

    return {
      isValid,
      canCommit,
      missingFields,
      warnings,
      unknowns,
      rejectedItems,
    };
  }

  commit(
    actor: Principal,
    packet: {
      products: ProductOnboardingDraft[];
      locations?: LocationOnboardingDraft[];
      dealerTerms?: DealerTermsDraft;
    },
  ): OnboardingCommitResult {
    this.auth.founder(actor);
    const validation = this.validate(packet);
    if (!validation.canCommit) {
      fail('ONBOARDING_VALIDATION_FAILED', 400, 'Data onboarding tidak memenuhi syarat kelulusan.');
    }

    let committedProductsCount = 0;
    let publishedProductsCount = 0;
    const locationsCount = packet.locations?.length ?? 0;
    const commitTime = now();

    for (const p of packet.products) {
      if (!p.ownerApproved) continue;
      if (!p.priceSen || p.priceSen <= 0) continue;

      const shouldPublish = p.lifecycle === 'published';
      const version = this.commerce.version() + 1;
      const record: CatalogueProduct = {
        id: p.sku ? `prod-${p.sku.toLowerCase()}` : id(),
        name: p.name.trim(),
        description: p.description || 'Sambal Colek istimewa Abang Colek',
        priceSen: p.priceSen,
        packSize: p.packSize || 1,
        currency: 'MYR',
        publishedVersion: shouldPublish ? version : 0,
        availableQuantity: 0,
        revision: 1,
        status: shouldPublish ? 'published' : 'draft',
      };

      this.store.save('catalogue', record);
      this.store.setMetadata('catalogue_version', String(version));
      this.store.audit(actor.user.id, 'onboarding.product_commit', record.id, record.revision);

      committedProductsCount++;
      if (shouldPublish) publishedProductsCount++;
    }

    // Opening inventory reconciliation if specified
    if (packet.locations) {
      for (const loc of packet.locations) {
        if (loc.openingStockQuantity && loc.openingStockQuantity > 0) {
          const firstProduct = this.store.all<CatalogueProduct>('catalogue')[0];
          if (firstProduct) {
            const lot: StockLot = {
              id: id(),
              productId: firstProduct.id,
              ownerId: 'business',
              locationId: loc.id,
              custodyId: 'hq',
              quantity: loc.openingStockQuantity,
              status: 'available',
              batchId: loc.batchId || `OB-${commitTime.slice(0, 10)}`,
              revision: 1,
            };
            this.store.save('lots', lot);
            const movement: InventoryMovement = {
              id: id(),
              productId: firstProduct.id,
              ownerId: 'business',
              locationId: loc.id,
              quantityDelta: loc.openingStockQuantity,
              operationKey: `onboarding.opening_stock.${lot.id}`,
              sourceEntityId: lot.id,
              createdAt: commitTime,
            };
            this.store.save('movements', movement);
          }
        }
      }
    }

    return {
      committedProductsCount,
      publishedProductsCount,
      locationsCount,
      catalogueVersion: this.commerce.version(),
      committedAt: commitTime,
    };
  }
}
