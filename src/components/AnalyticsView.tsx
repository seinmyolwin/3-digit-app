import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Zap,
  BarChart3,
  Users,
  Target,
  ArrowUpRight,
  Sparkles,
  PieChart,
  Layers
} from 'lucide-react';
import { useLottery } from '../context/LotteryContext';
import { formatAmount } from '../utils/lotteryUtils';
import { NumberAggregate } from '../types';

interface AnalyticsViewProps {
  onOpenForwardModal: (initialNumber?: string, initialAmount?: number) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onOpenForwardModal }) => {
  const {
    activeRound,
    settings,
    aggregates,
    hotNumbers,
    activeRoundVouchers,
    roundSummary
  } = useLottery();

  const isMyanmar = settings.language === 'my';

  // Simulator State
  const [simulatedWinningNumber, setSimulatedWinningNumber] = useState('');

  // Top 10 High Risk Numbers (Highest potential loss if they hit)
  const highRiskNumbers = useMemo(() => {
    return (Object.values(aggregates) as NumberAggregate[])
      .filter(a => a.totalSold > 0)
      .sort((a, b) => b.estimatedPayout - a.estimatedPayout)
      .slice(0, 10);
  }, [aggregates]);

  // Single Digit (0-9) Frequency Analysis
  const digitFrequencies = useMemo(() => {
    const counts = Array(10).fill(0);
    const volume = Array(10).fill(0);

    (Object.values(aggregates) as NumberAggregate[]).forEach(a => {
      if (a.totalSold > 0) {
        const digits = a.number.split('').map(Number);
        digits.forEach(d => {
          counts[d] += a.betCount;
          volume[d] += a.totalSold;
        });
      }
    });

    const maxVol = Math.max(...volume, 1);
    return counts.map((count, digit) => ({
      digit,
      count,
      totalVolume: volume[digit],
      percentage: Math.round((volume[digit] / maxVol) * 100)
    }));
  }, [aggregates]);

  // Top Customers leaderboard
  const customerLeaderboard = useMemo(() => {
    const map: { [name: string]: { totalSpend: number; voucherCount: number; phone?: string } } = {};
    activeRoundVouchers.forEach(v => {
      if (v.status === 'cancelled') return;
      const key = v.customerName || 'အထွေထွေ';
      if (!map[key]) {
        map[key] = { totalSpend: 0, voucherCount: 0, phone: v.customerPhone };
      }
      map[key].totalSpend += v.netPayable;
      map[key].voucherCount += 1;
    });

    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 8);
  }, [activeRoundVouchers]);

  // Simulator Outcome
  const simulationOutcome = useMemo(() => {
    if (!simulatedWinningNumber || simulatedWinningNumber.length !== 3) return null;
    const agg = aggregates[simulatedWinningNumber];
    const retained = agg ? agg.retainedAmount : 0;
    const mult = activeRound?.multiplier || settings.defaultMultiplier;
    const payout = retained * mult;
    const net = (roundSummary.netRevenue - payout) + roundSummary.forwardedCommission;
    return {
      number: simulatedWinningNumber,
      totalSold: agg ? agg.totalSold : 0,
      forwarded: agg ? agg.forwardedAmount : 0,
      retained,
      multiplier: mult,
      payout,
      netOutcome: net,
      isProfit: net >= 0
    };
  }, [simulatedWinningNumber, aggregates, activeRound, settings, roundSummary]);

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-6">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {isMyanmar ? 'အန္တရာယ်ခွဲခြမ်းစိတ်ဖြာမှုနှင့် စာရင်းအင်းများ' : 'Risk Management & Analytics Dashboard'}
            </h2>
            <p className="text-xs text-slate-500">
              {isMyanmar ? 'ဒိုင်အရှုံးသက်သာစေရန် အန္တရာယ်အများဆုံးဂဏန်းများနှင့် ခန့်မှန်းချက်များ' : 'Liability assessment, heatmaps, and worst-case scenario forecasting'}
            </p>
          </div>
        </div>
      </div>

      {/* Simulator Section */}
      <div className="bg-white border border-indigo-100 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {isMyanmar ? 'ပေါက်ဂဏန်း အကြိုစမ်းသပ်တွက်ချက်မှု (What-If Simulator)' : 'What-If Risk Simulator'}
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {isMyanmar ? 'မည်သည့်ဂဏန်းထွက်လျှင် အမြတ်/အရှုံး မည်မျှရှိမည်ကို ကြိုတင်စစ်ဆေးနိုင်သည်' : 'Simulate profit/loss if a specific number hits'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          <div className="sm:col-span-4 space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              {isMyanmar ? 'စမ်းသပ်မည့် ၃ လုံးဂဏန်း' : 'Test Number (000-999)'}
            </label>
            <input
              type="text"
              maxLength={3}
              value={simulatedWinningNumber}
              onChange={(e) => setSimulatedWinningNumber(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="ဥပမာ: 789"
              className="w-full bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xl font-bold font-mono text-indigo-900 text-center outline-none transition-colors shadow-2xs"
            />
          </div>

          <div className="sm:col-span-8">
            {simulationOutcome ? (
              <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                simulationOutcome.isProfit
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/70 border-rose-200 text-rose-950'
              }`}>
                <div>
                  <span className="text-xs font-bold block">
                    ဂဏန်း [{simulationOutcome.number}] ပေါက်ပါက:
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    ရောင်းရငွေ: {formatAmount(simulationOutcome.totalSold, settings.currency)} | လျော်ကြေး: {formatAmount(simulationOutcome.payout, settings.currency)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-semibold block text-slate-500">
                    {simulationOutcome.isProfit ? 'ခန့်မှန်းအမြတ်' : 'ခန့်မှန်းအရှုံး'}
                  </span>
                  <span className={`text-xl font-black font-mono ${
                    simulationOutcome.isProfit ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {simulationOutcome.isProfit ? '+' : '-'}{formatAmount(Math.abs(simulationOutcome.netOutcome), settings.currency)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-3 text-center bg-slate-50 rounded-xl border border-slate-200">
                {isMyanmar ? 'စမ်းသပ်လိုသော ဂဏန်း ၃ လုံး ရိုက်ထည့်ပါ' : 'Enter 3-digit number to preview risk outcome'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Left = Top 10 High Risk / Hot Numbers, Right = Digit Frequency & Customer Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Top 10 High Liability Numbers */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {isMyanmar ? 'အန္တရာယ်အများဆုံး ထိပ်တန်းဂဏန်းများ (Top 10 Liability)' : 'Top 10 High-Risk Numbers'}
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                {isMyanmar ? 'လျော်ကြေး အများဆုံးကျနိုင်သည့် ဂဏန်းများ' : 'Max payout exposure'}
              </span>
            </div>

            <div className="space-y-2.5">
              {highRiskNumbers.length === 0 ? (
                <div className="py-10 text-center text-slate-500 text-xs">
                  {isMyanmar ? 'အရောင်းစာရင်း မရှိသေးပါ' : 'No sales recorded yet'}
                </div>
              ) : (
                highRiskNumbers.map((item, idx) => {
                  const estPayout = item.estimatedPayout;

                  return (
                    <div
                      key={item.number}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-slate-400 w-4">
                          {idx + 1}.
                        </span>
                        <span className="bg-white text-indigo-950 font-mono font-black text-base px-2.5 py-1 rounded-lg border border-slate-200 tracking-wider shadow-2xs">
                          {item.number}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            ရောင်းရငွေ: {formatAmount(item.totalSold, settings.currency)}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            လက်ကျန်တာဝန်: {formatAmount(item.retainedAmount, settings.currency)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-semibold text-rose-600 block">
                            ပေါက်ပါက လျော်ငွေ
                          </span>
                          <span className="font-mono font-black text-sm text-rose-600">
                            {formatAmount(estPayout, settings.currency)}
                          </span>
                        </div>

                        {/* Forward Button to relieve risk */}
                        <button
                          onClick={() => onOpenForwardModal(item.number, Math.round(item.retainedAmount / 2))}
                          className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
                          title="အပေါ်သို့ လွှဲတင်မည် (Hedging/Forwarding)"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Digit Frequency & Customers */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Digit 0-9 Frequency Distribution */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {isMyanmar ? 'ဂဏန်းလုံးရေ (၀-၉) အကြိမ်ရေ ခွဲခြမ်းချက်' : 'Single Digit (0-9) Frequency'}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 pt-1">
              {digitFrequencies.map((d) => (
                <div
                  key={d.digit}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center space-y-1"
                >
                  <span className="font-mono font-black text-base text-indigo-950 block">
                    {d.digit}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    {d.count} ကြိမ်
                  </span>
                  <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${d.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customers Leaderboard */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {isMyanmar ? 'အများဆုံး အားပေးသော ဖောက်သည်များ' : 'Top VIP Customers'}
                </h3>
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {customerLeaderboard.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs">
                  {isMyanmar ? 'ဖောက်သည် စာရင်းမရှိသေးပါ' : 'No customer records yet'}
                </div>
              ) : (
                customerLeaderboard.map((cust, i) => (
                  <div key={i} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 text-[11px] w-4">{i + 1}.</span>
                      <div>
                        <span className="font-bold text-slate-900 block">{cust.name}</span>
                        {cust.phone && <span className="text-[10px] text-slate-500 font-mono">{cust.phone}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-700 block">
                        {formatAmount(cust.totalSpend, settings.currency)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-sans">
                        {cust.voucherCount} စောင်
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
