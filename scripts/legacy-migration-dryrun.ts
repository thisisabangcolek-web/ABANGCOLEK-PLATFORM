import { PlatformStore } from '../server/platform/store';
import { Auth } from '../server/platform/auth';
import { LegacyMigrationReconciler } from '../server/platform/migration/migrationReconciler';

const dbPath = process.env.PLATFORM_DATABASE || 'var/lib/platform/platform.sqlite';
const store = new PlatformStore(dbPath);
const auth = new Auth(store);
const reconciler = new LegacyMigrationReconciler(store, auth);

// Sample representative legacy records for CLI dry-run evaluation
const sampleLegacyBatch = [
  {
    id: 'ord-supa-001',
    order_id: 'SP-1001',
    customer_name: 'Ahmad Albab',
    city: 'Kota Bharu',
    items: 'Sambal Colek Original (3), Sambal Extra Pedas (1)',
    amount: 112.00,
    status: 'Delivered',
    created_at: '2026-08-15T10:30:00Z',
  },
  {
    id: 'ord-supa-002',
    order_id: 'SP-1002',
    customer_name: 'Siti Nurhaliza',
    city: 'Kuala Lumpur',
    items: 'Sambal Colek Original (2)',
    amount: 56.00,
    status: 'Processing',
    created_at: '2026-08-16T14:15:00Z',
  },
  {
    id: 'ord-supa-003',
    order_id: 'SP-1003',
    customer_name: 'Malu Apa',
    city: 'Johor Bahru',
    items: '',
    amount: -10, // Invalid amount
    status: 'Processing',
    created_at: '2026-08-17T09:00:00Z',
  },
];

console.log('=== ABANGCOLEK LEGACY MIGRATION DRY-RUN AUDIT ===');
console.log(`Database Target (Read-Only): ${dbPath}`);

const report = reconciler.dryRun(sampleLegacyBatch);

console.log('\n--- RINGKASAN REKONSILIASI ---');
console.log(`Jumlah Rekod Diperiksa : ${report.totalExamined}`);
console.log(`Calon Sah Untuk Import : ${report.validCandidatesCount}`);
console.log(`Rekod Ditolak          : ${report.rejectedCount}`);
console.log(`Jumlah Nilai Pesanan   : RM ${(report.projectedTotalSen / 100).toFixed(2)} (${report.projectedTotalSen} sen)`);
console.log(`Disahkan Bayaran       : RM ${(report.projectedVerifiedPaidSen / 100).toFixed(2)}`);
console.log(`Source Checksum SHA256 : ${report.sourceChecksum}`);

if (report.rejectedRows.length > 0) {
  console.log('\n--- BUTIRAN TOLAKAN ---');
  for (const r of report.rejectedRows) {
    console.log(`- [${r.sourceId}]: ${r.reason}`);
  }
}

console.log('\n[STATUS] Dry-run selesai. TIADA perubahan ditulis ke pangkalan data.');
