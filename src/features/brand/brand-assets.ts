/** Original artwork is preserved; optimized files only change the image encoding. */
export const BRAND_ASSETS = {
  logo: {
    src: '/assets/brand/abang-colex-logo-original.webp',
    alt: 'Logo rasmi ABANGCOLEK by Liurleleh House',
    width: 1200,
    height: 880,
  },
  world: {
    src: '/assets/brand/abangcolek-world-v2.webp',
    width: 1774,
    height: 887,
  },
  founder: {
    primary: {
      src: '/assets/brand/FOUNDER.png',
      alt: 'Foto pengasas ABANG COLEK (utama)',
      width: 1024,
      height: 1024,
    },
    secondary: {
      src: '/assets/brand/FOUNDER2.png',
      alt: 'Foto pengasas ABANG COLEK (kedua)',
      width: 1024,
      height: 1024,
    },
  },
  mascots: {
    logo: {
      src: '/assets/brand/MASKOT-LOGO.PNG',
      alt: 'Logo Maskot Abang Colek',
      isProductSku: false,
      category: 'brand_artwork',
    },
    series: [
      { id: 'maskot-1', src: '/assets/brand/MASKOT-1.PNG', alt: 'Maskot Gaya 1', isProductSku: false, category: 'brand_artwork' },
      { id: 'maskot-2', src: '/assets/brand/MASKOT-2.PNG', alt: 'Maskot Gaya 2', isProductSku: false, category: 'brand_artwork' },
      { id: 'maskot-3', src: '/assets/brand/MASKOT-3.PNG', alt: 'Maskot Gaya 3', isProductSku: false, category: 'brand_artwork' },
      { id: 'maskot-4', src: '/assets/brand/MASKOT-4.PNG', alt: 'Maskot Gaya 4', isProductSku: false, category: 'brand_artwork' },
      { id: 'maskot-5', src: '/assets/brand/MASKOT-5.PNG', alt: 'Maskot Gaya 5', isProductSku: false, category: 'brand_artwork' },
    ],
  },
  productEditorial: {
    src: '/assets/brand/tiktok-sambal-colek-launch.webp',
    alt: 'Foto asal Sambal Colek: balang berpenutup hitam dengan label merah jambu daripada TikTok ABANG COLEK',
    source: 'https://www.tiktok.com/@styloairpool/video/7683047307016834322',
    provenance: 'TikTok @styloairpool launch video',
    historicalOnly: true,
    requiresOwnerPriceApproval: true,
    width: 405,
    height: 720,
  },
} as const;
