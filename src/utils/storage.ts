import { DrawRound, Voucher, ForwardSlip, AppSettings, NumberLimit, BlockedNumbers } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  shopName: 'ရွှေမင်္ဂလာ (၃ လုံး ချဲထီ အရောင်းကိုယ်စားလှယ်)',
  shopPhone: '09-798889900',
  shopAddress: 'ရန်ကုန်မြို့ / မန္တလေးမြို့',
  currency: 'Ks',
  defaultMultiplier: 600,
  defaultToddMultiplier: 100,
  defaultCommissionRate: 10,
  defaultCustomerDiscount: 0,
  globalStockLimit: 100000, // 100,000 Ks per number default limit
  lowStockAlertPercentage: 80, // alert when 80% reached
  language: 'my',
  soundEffects: true,
  printPaperSize: '80mm',
  voucherFooterMessage: 'ထိုးပြီးဘောင်ချာအား သိမ်းထားပေးပါ။ ပေါက်ဂဏန်းထွက်ပြီး ၃ ရက်အတွင်း ငွေလာရောက်ထုတ်ယူနိုင်ပါသည်။'
};

export const INITIAL_ROUNDS: DrawRound[] = [
  {
    id: 'round-2026-09-01',
    name: '01-Sep-2026 (ထိုင်း 3D ပွဲစဉ်)',
    drawDate: '2026-09-01',
    closingTime: '15:00',
    status: 'open',
    winningNumber: undefined,
    multiplier: 600,
    toddMultiplier: 100,
    commissionRate: 10
  },
  {
    id: 'round-2026-08-16',
    name: '16-Aug-2026 (ထိုင်း 3D ပြီးဆုံး)',
    drawDate: '2026-08-16',
    closingTime: '15:00',
    status: 'settled',
    winningNumber: '782',
    multiplier: 600,
    toddMultiplier: 100,
    commissionRate: 10,
    settledAt: '2026-08-16T16:00:00Z'
  }
];

export const INITIAL_LIMITS: NumberLimit = {
  '789': 60000,
  '555': 40000,
  '123': 80000,
  '999': 50000,
  '853': 50000
};

export const INITIAL_BLOCKED: BlockedNumbers = {
  '000': false,
  '777': false
};

export const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: 'vouch-1',
    voucherNo: 'V-3D-1001',
    roundId: 'round-2026-09-01',
    customerName: 'ဦးကျော်စွာ',
    customerPhone: '09-450011223',
    items: [
      { number: '789', amount: 5000, betType: 'straight' },
      { number: '123', amount: 3000, betType: 'straight' },
      { number: '456', amount: 2000, betType: 'straight' }
    ],
    subtotal: 10000,
    discountPercent: 0,
    discountAmount: 0,
    netPayable: 10000,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    notes: 'ဖုန်းဖြင့် မှာယူသည်',
    isPaid: true,
    status: 'active'
  },
  {
    id: 'vouch-2',
    voucherNo: 'V-3D-1002',
    roundId: 'round-2026-09-01',
    customerName: 'ဒေါ်လှလှဝင်း',
    customerPhone: '09-790112233',
    items: [
      { number: '853', amount: 10000, betType: 'straight' },
      { number: '538', amount: 2000, betType: 'rumble' },
      { number: '358', amount: 2000, betType: 'rumble' },
      { number: '835', amount: 2000, betType: 'rumble' }
    ],
    subtotal: 16000,
    discountPercent: 5,
    discountAmount: 800,
    netPayable: 15200,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    notes: 'ဆိုင်လာထိုးသူ',
    isPaid: true,
    status: 'active'
  },
  {
    id: 'vouch-3',
    voucherNo: 'V-3D-1003',
    roundId: 'round-2026-09-01',
    customerName: 'ကိုအောင်သူ (စက်ရုံ)',
    customerPhone: '09-250334455',
    items: [
      { number: '789', amount: 25000, betType: 'straight' },
      { number: '999', amount: 15000, betType: 'straight' },
      { number: '555', amount: 10000, betType: 'straight' }
    ],
    subtotal: 50000,
    discountPercent: 0,
    discountAmount: 0,
    netPayable: 50000,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    notes: 'VIP ဖောက်သည်',
    isPaid: true,
    status: 'active'
  },
  {
    id: 'vouch-4',
    voucherNo: 'V-3D-1004',
    roundId: 'round-2026-09-01',
    customerName: 'မနွယ်နွယ်',
    customerPhone: '09-970556677',
    items: [
      { number: '789', amount: 20000, betType: 'straight' },
      { number: '853', amount: 15000, betType: 'straight' },
      { number: '369', amount: 5000, betType: 'straight' }
    ],
    subtotal: 40000,
    discountPercent: 0,
    discountAmount: 0,
    netPayable: 40000,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    notes: 'KPay ဖြင့်လွှဲထားသည်',
    isPaid: true,
    status: 'active'
  }
];

export const INITIAL_FORWARD_SLIPS: ForwardSlip[] = [
  {
    id: 'fwd-1',
    slipNo: 'FWD-0901-01',
    roundId: 'round-2026-09-01',
    masterAgentName: 'ကိုစိုးနိုင် (ဒိုင်ချုပ်ကြီး)',
    masterAgentPhone: '09-970001111',
    items: [
      { number: '789', amount: 20000 }
    ],
    totalAmount: 20000,
    commissionRate: 12,
    commissionAmount: 2400,
    netPaid: 17600,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    notes: '၇၈၉ အထွက်များ၍ ဘေးကင်းရန် အပေါ်ဖြတ်တင်သည်'
  }
];

const STORAGE_KEYS = {
  ROUNDS: '3d_ledger_rounds_v1',
  VOUCHERS: '3d_ledger_vouchers_v1',
  LIMITS: '3d_ledger_limits_v1',
  BLOCKED: '3d_ledger_blocked_v1',
  FORWARD_SLIPS: '3d_ledger_forward_slips_v1',
  SETTINGS: '3d_ledger_settings_v1',
  ACTIVE_ROUND_ID: '3d_ledger_active_round_id_v1'
};

export function loadStoredData<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to load ${key} from storage:`, err);
    return defaultValue;
  }
}

export function saveStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save ${key} to storage:`, err);
  }
}

export { STORAGE_KEYS };
