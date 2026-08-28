export type BetType = 'straight' | 'rumble'; // 'straight' (တည့်) or 'rumble' (ပတ်လည် / R)

export interface BetItem {
  id: string;
  number: string; // 3 digits, e.g. "123"
  amount: number; // in MMK / Currency
  isRumble?: boolean; // If input as R (permutation)
  originalInput?: string; // e.g. "123 R"
}

export interface VoucherItem {
  number: string;
  amount: number;
  betType: BetType;
  isWon?: boolean;
  wonAmount?: number;
}

export interface Voucher {
  id: string;
  voucherNo: string; // e.g. "V-3D-1001"
  roundId: string;
  customerName: string;
  customerPhone?: string;
  items: VoucherItem[];
  subtotal: number;
  discountPercent: number; // e.g. 10% dealer discount to customer
  discountAmount: number;
  netPayable: number;
  createdAt: string;
  notes?: string;
  isPaid: boolean;
  status: 'active' | 'cancelled' | 'settled';
}

export interface ForwardSlipItem {
  number: string;
  amount: number;
}

export interface ForwardSlip {
  id: string;
  slipNo: string;
  roundId: string;
  masterAgentName: string; // e.g. "Ko Aung (Main Bookie)"
  masterAgentPhone?: string;
  items: ForwardSlipItem[];
  totalAmount: number;
  commissionRate: number; // e.g. 12% received from bookmaker
  commissionAmount: number;
  netPaid: number;
  createdAt: string;
  notes?: string;
}

export interface DrawRound {
  id: string;
  name: string; // e.g., "16-Sep-2026 (Thai 3D)"
  drawDate: string; // "2026-09-16"
  closingTime: string; // "15:00"
  status: 'open' | 'closed' | 'settled';
  winningNumber?: string; // e.g. "789"
  toddNumbers?: string[]; // permutations e.g. ["798", "879", "897", "978", "987"]
  multiplier: number; // default 500 or 600 or 700 (e.g. 1000 ks bet wins 500,000 ks at 500x)
  toddMultiplier: number; // default 100 or 120 (e.g. 1000 ks bet wins 100,000 ks at 100x)
  commissionRate: number; // e.g. 10%
  settledAt?: string;
}

export interface NumberLimit {
  [number: string]: number; // number -> max total amount allowed, e.g. "123": 50000
}

export interface BlockedNumbers {
  [number: string]: boolean; // completely closed numbers
}

export interface AppSettings {
  shopName: string;
  shopPhone: string;
  shopAddress?: string;
  currency: string; // "MMK", "Ks", "THB", "USD"
  defaultMultiplier: number; // 600
  defaultToddMultiplier: number; // 100
  defaultCommissionRate: number; // 10%
  defaultCustomerDiscount: number; // 0%
  globalStockLimit: number; // e.g. 100,000 Ks per number default limit
  lowStockAlertPercentage: number; // e.g. 80% (trigger notification when 80% of limit is sold)
  language: 'my' | 'en'; // Myanmar or English
  soundEffects: boolean;
  printPaperSize: '58mm' | '80mm' | 'A4';
  voucherFooterMessage: string;
}

export interface NumberAggregate {
  number: string;
  totalSold: number;
  forwardedAmount: number;
  retainedAmount: number; // totalSold - forwardedAmount
  limit: number;
  isBlocked: boolean;
  betCount: number;
  estimatedPayout: number; // retainedAmount * multiplier
  netRisk: number; // estimatedPayout - totalRoundRevenue
  riskLevel: 'safe' | 'warning' | 'danger'; // safe (<50%), warning (50-80%), danger (>80%)
  toddEstimatedPayout?: number;
}

export interface RoundSummary {
  totalSales: number;
  totalVouchers: number;
  totalDiscount: number;
  netRevenue: number;
  totalForwarded: number;
  forwardedCommission: number;
  totalPayout: number;
  winningNumber?: string;
  totalWinnersCount: number;
  netProfit: number; // (netRevenue - totalPayout) + forwardedCommission
  isProfit: boolean;
}

export interface LowStockAlert {
  id: string;
  number: string;
  soldAmount: number;
  limit: number;
  percentage: number;
  timestamp: string;
  type: 'near_limit' | 'limit_reached' | 'blocked';
}
