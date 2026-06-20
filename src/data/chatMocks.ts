import type { ChatMessage, ChatMode } from '../types/chat';
import type { Product } from '../types/product';
import { getProduct, products } from './products';

export const CHAT_FREE_LIMIT = 4;

export const montirIntro = {
  name: 'Montir AI',
  tagline: 'Asisten servis & rekomendasi motor',
  dockPlaceholder: 'Tanya Montir apapun',
  composerPlaceholder: 'Tanya Montir AI...',
  thinking: 'Montir AI sedang mencari rekomendasi terbaik...',
  welcome:
    'Halo! Aku Montir AI. Ceritakan kebutuhanmu — budget, pemakaian harian atau touring — nanti aku bantu carikan unit yang cocok dan kasih saran sebelum kamu nego.',
};

export const generalSuggestions = [
  'Rekomendasikan motor matic 30 jutaan',
  'Motor bekas irit untuk harian',
  'Cek harga pasaran NMAX 2022',
];

export const followUpSuggestions = [
  'Cek produk serupa',
  'Cek dengan harga lebih mahal',
  'Berikan lebih banyak rekomendasi',
];

export const productAdviceSuggestions = [
  'Cek risiko mesin',
  'Kapan perlu inspeksi?',
  'Bandingkan dengan produk serupa',
];

const byIds = (ids: string[]): Product[] =>
  ids.map((id) => getProduct(id)).filter((p): p is Product => Boolean(p));

const budgetPicks = byIds(['mio-m3-125', 'address-fi', 'vario-125-cbs']);
const midPicks = byIds(['nmax-155-2022', 'pcx-160-2021', 'vario-160-2023']);
const premiumPicks = byIds(['enfield-classic-350', 'ktm-duke-250', 'adv-160-2023']);

const similarTo = (product: Product): Product[] =>
  products
    .filter(
      (p) =>
        p.id !== product.id &&
        p.category === product.category &&
        Math.abs(p.priceValue - product.priceValue) / product.priceValue < 0.45,
    )
    .slice(0, 3);

let replyCounter = 0;
const nextId = () => `assistant-${++replyCounter}`;

export function getProductAdviceOpener(product: Product): ChatMessage[] {
  return [
    {
      id: nextId(),
      role: 'assistant',
      badge: 'Advice produk',
      text: `Dengan tahun ${product.year} dan jarak ${product.mileage}, unit terlihat menarik untuk pemakaian harian. Risiko utama ada di bekas jatuh halus, servis CVT terlambat, dan ban/aki yang mulai mendekati masa ganti.`,
      checklist: [
        'Minta bukti servis berkala dan cek odometer konsisten.',
        'Test ride 10-15 menit untuk cek getaran, rem, dan tarikan awal.',
        'Ajukan inspeksi bila harga nego serius atau ada bekas repaint.',
      ],
    },
  ];
}

export function getMockReply(
  rawText: string,
  mode: ChatMode,
  contextProduct: Product | null,
): ChatMessage[] {
  const text = rawText.toLowerCase();

  if (text.includes('inspeksi')) {
    return [
      {
        id: nextId(),
        role: 'assistant',
        badge: 'Kapan ingin inspeksi',
        text: 'Gunakan Jasa Inspeksi PasarMotor saat kamu sudah cocok dengan unit, ingin nego serius, atau sebelum membayar tanda jadi. Montir akan bantu cek mesin, rangka, CVT, kelistrikan, dokumen, dan estimasi biaya perbaikan supaya keputusan beli lebih aman.',
      },
    ];
  }

  if (mode === 'product-advice' && contextProduct) {
    if (text.includes('risiko') || text.includes('mesin')) {
      return [
        {
          id: nextId(),
          role: 'assistant',
          badge: 'Advice produk',
          text: 'Untuk produk ini, fokus cek histori servis, suara mesin saat idle, kondisi CVT, rem ABS, dan kelistrikan panel sebelum nego harga.',
          checklist: [
            'Dengarkan suara kasar di area CVT saat gas rendah.',
            'Cek kebocoran oli di sekitar blok mesin dan shockbreaker.',
            'Pastikan semua indikator panel menyala normal saat kontak ON.',
          ],
        },
      ];
    }
    if (text.includes('banding') || text.includes('serupa')) {
      const similar = similarTo(contextProduct);
      return [
        {
          id: nextId(),
          role: 'assistant',
          badge: 'Rekomendasi tambahan',
          text: 'Ini beberapa pilihan lain yang masih cocok untuk kebutuhan dan kisaran harga unit yang sedang kamu lihat.',
          products: similar.length > 0 ? similar : midPicks,
        },
      ];
    }
    return [
      {
        id: nextId(),
        role: 'assistant',
        badge: 'Advice produk',
        text: `Pertanyaan bagus. Untuk ${contextProduct.title}, pastikan kamu cek kelengkapan dokumen (BPKB, STNK, faktur) dan minta riwayat servisnya. Kalau penjual terbuka soal kondisi, itu sinyal baik untuk lanjut nego.`,
      },
    ];
  }

  if (text.includes('mahal') || text.includes('premium') || text.includes('moge')) {
    return [
      {
        id: nextId(),
        role: 'assistant',
        badge: 'Rekomendasi tambahan',
        text: 'Kalau budget lebih longgar, tiga unit ini layak masuk daftar bandingmu — karakter berbeda, semua dari seller terkurasi.',
        products: premiumPicks,
      },
    ];
  }

  if (text.includes('irit') || text.includes('15') || text.includes('harian')) {
    return [
      {
        id: nextId(),
        role: 'assistant',
        badge: 'Snapshot produk',
        text: 'Rekomendasi harian di kisaran Rp15 jutaan, fokus irit, mudah dirawat, dan cocok untuk mobilitas kota.',
        products: budgetPicks,
      },
    ];
  }

  if (
    text.includes('rekomendasi') ||
    text.includes('matic') ||
    text.includes('30') ||
    text.includes('cari')
  ) {
    return [
      {
        id: nextId(),
        role: 'assistant',
        badge: 'Snapshot produk',
        text: 'Di kisaran 30 jutaan, tiga matic ini paling sering jadi incaran — nyaman untuk harian dan harga jualnya stabil.',
        products: midPicks,
      },
    ];
  }

  if (text.includes('nmax') || text.includes('harga pasaran')) {
    return [
      {
        id: nextId(),
        role: 'assistant',
        badge: 'Snapshot produk',
        text: 'Harga pasaran NMAX 155 Connected ABS 2022 dengan km rendah ada di kisaran Rp30–33 juta tergantung kondisi dan kelengkapan dokumen. Unit di bawah ini contoh yang sehat di pasar.',
        products: byIds(['nmax-155-2022', 'pcx-160-2021']),
      },
    ];
  }

  return [
    {
      id: nextId(),
      role: 'assistant',
      badge: 'Rekomendasi tambahan',
      text: 'Siap! Ini beberapa pilihan yang masih cocok untuk kebutuhan harian dan kisaran budget kamu. Kalau mau lebih spesifik, sebutkan budget dan pemakaiannya ya.',
      products: budgetPicks,
    },
  ];
}
