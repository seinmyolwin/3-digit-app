import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  PlusCircle,
  Bell,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { useLottery } from '../context/LotteryContext';
import { formatAmount } from '../utils/lotteryUtils';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  onOpenRoundManager: () => void;
  onOpenLimitsManager: () => void;
  onOpenForwardModal: () => void;
  onOpenHelp: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenNotifications,
  onOpenRoundManager,
  onOpenLimitsManager,
  onOpenForwardModal,
  onOpenHelp,
  activeTab,
  setActiveTab
}) => {
  const {
    settings,
    rounds,
    activeRoundId,
    activeRound,
    setActiveRoundId,
    roundSummary,
    lowStockAlerts,
    exportToExcel
  } = useLottery();

  const isMyanmar = settings.language === 'my';
  const alertCount = lowStockAlerts.length;

  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-30 shadow-xs">
      {/* Top Banner with Shop Details & Quick Stats */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Round Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-black text-xl shadow-xs">
              3D
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  {settings.shopName || '3D Seller Pro'}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  သုံးလုံး ချဲထီ စာရင်း
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span>{settings.shopPhone}</span>
                {settings.shopAddress && <span className="hidden md:inline">• {settings.shopAddress}</span>}
              </p>
            </div>
          </div>

          {/* Active Round Switcher Pill */}
          <div className="hidden lg:flex items-center bg-slate-100/90 border border-slate-200 rounded-xl p-1 shadow-2xs">
            <Calendar className="w-4 h-4 text-indigo-600 ml-2 shrink-0" />
            <select
              value={activeRoundId}
              onChange={(e) => setActiveRoundId(e.target.value)}
              className="bg-transparent text-xs text-slate-800 font-semibold px-2 py-1 outline-none cursor-pointer"
            >
              {rounds.map((r) => (
                <option key={r.id} value={r.id} className="bg-white text-slate-800">
                  {r.name} {r.status === 'settled' ? '✓ (ပေါက်ပြီး)' : ''}
                </option>
              ))}
            </select>
            <button
              onClick={onOpenRoundManager}
              title="ပွဲစဉ်အသစ်ဖွင့်ရန် / စီမံရန်"
              className="p-1 hover:bg-white rounded-lg text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Real-time Quick Mini Stats */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {/* Sales Revenue */}
          <div className="bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-2xs">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">
              {isMyanmar ? 'စုစုပေါင်း ရောင်းရငွေ' : 'Total Sales'}
            </span>
            <span className="font-bold text-emerald-600 text-sm font-mono">
              {formatAmount(roundSummary.netRevenue, settings.currency)}
            </span>
          </div>

          {/* Settled Status / Payout */}
          {activeRound?.status === 'settled' ? (
            <div className={`border px-3 py-1.5 rounded-xl shadow-2xs ${
              roundSummary.isProfit
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-rose-50 border-rose-200'
            }`}>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                {isMyanmar ? 'အသားတင် ရလဒ်' : 'Net Outcome'}
              </span>
              <span className={`font-bold text-sm font-mono ${roundSummary.isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                {roundSummary.isProfit ? '+' : '-'}{formatAmount(Math.abs(roundSummary.netProfit), settings.currency)}
              </span>
            </div>
          ) : (
            <div className="hidden sm:block bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-2xs">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                {isMyanmar ? 'လက်ခံဘောင်ချာ' : 'Vouchers'}
              </span>
              <span className="font-bold text-slate-800 text-sm font-mono">
                {roundSummary.totalVouchers} {isMyanmar ? 'စောင်' : 'slips'}
              </span>
            </div>
          )}

          {/* Quick Action Icons */}
          <div className="flex items-center gap-1.5">
            {/* Low Stock / Limit Alert Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
              title="ဂဏန်း အကန့်အသတ် သတိပေးချက်များ"
            >
              <Bell className="w-4 h-4" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-xs">
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </button>

            {/* Excel Export Button */}
            <button
              onClick={exportToExcel}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              title="Excel စာရင်း အကုန်ထုတ်ယူမည်"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isMyanmar ? 'Excel ထုတ်ရန်' : 'Export Excel'}</span>
            </button>

            {/* Forward/Offload Button */}
            <button
              onClick={onOpenForwardModal}
              className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 hover:text-indigo-900 transition-colors shadow-2xs cursor-pointer"
              title="အထက်တင်/ဖြတ်တင် စာရင်း (Forward/Offload)"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
              title="အပြင်အဆင်နှင့် စနစ်များ"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Quick Guide */}
            <button
              onClick={onOpenHelp}
              className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
              title="လမ်းညွှန်ချက်"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-slate-50/80 border-t border-slate-200 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar">
          <nav className="flex space-x-1 sm:space-x-2 py-1.5">
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'sales'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isMyanmar ? 'အရောင်းစာရင်းသွင်း' : 'Quick Sale Entry'}</span>
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'ledger'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{isMyanmar ? 'အရောင်းစာရင်းချုပ် (၀-၉၉၉)' : 'Live Ledger'}</span>
            </button>

            <button
              onClick={() => setActiveTab('winning')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'winning'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isMyanmar ? 'ပေါက်ဂဏန်းနှင့် လျော်ကြေး' : 'Winning & Payouts'}</span>
              {activeRound?.status === 'settled' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('vouchers')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'vouchers'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isMyanmar ? 'ဘောင်ချာများ' : 'Vouchers'}</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{isMyanmar ? 'အန္တရာယ်ခွဲခြမ်းစိတ်ဖြာမှု' : 'Risk & Analytics'}</span>
            </button>
          </nav>

          {/* Mobile Round Switcher */}
          <div className="lg:hidden py-1 pl-2">
            <button
              onClick={onOpenRoundManager}
              className="text-xs bg-white text-indigo-700 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1 shadow-2xs font-medium"
            >
              <Calendar className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{activeRound?.name || 'ပွဲစဉ်'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
