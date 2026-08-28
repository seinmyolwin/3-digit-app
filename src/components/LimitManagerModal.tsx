import React, { useState } from 'react';
import {
  X,
  Sliders,
  Lock,
  Unlock,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Layers
} from 'lucide-react';
import { useLottery } from '../context/LotteryContext';
import { formatAmount } from '../utils/lotteryUtils';

interface LimitManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialNumber?: string;
}

export const LimitManagerModal: React.FC<LimitManagerModalProps> = ({
  isOpen,
  onClose,
  initialNumber
}) => {
  const {
    settings,
    updateSettings,
    limits,
    setNumberLimit,
    removeNumberLimit,
    blockedNumbers,
    toggleBlockNumber,
    aggregates
  } = useLottery();

  const isMyanmar = settings.language === 'my';

  const [numberInput, setNumberInput] = useState(initialNumber || '');
  const [limitInput, setLimitInput] = useState('50000');
  const [globalLimitInput, setGlobalLimitInput] = useState(String(settings.globalStockLimit || 100000));
  const [alertPctInput, setAlertPctInput] = useState(String(settings.lowStockAlertPercentage || 80));

  if (!isOpen) return null;

  const handleSetCustomLimit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numberInput || numberInput.length !== 3) return;
    const lmt = parseInt(limitInput, 10);
    if (isNaN(lmt) || lmt <= 0) return;

    setNumberLimit(numberInput, lmt);
    setNumberInput('');
  };

  const handleSaveGlobalSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const gLimit = parseInt(globalLimitInput, 10) || 100000;
    const pct = parseInt(alertPctInput, 10) || 80;
    updateSettings({
      globalStockLimit: gLimit,
      lowStockAlertPercentage: pct
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-200">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isMyanmar ? 'ဂဏန်း အကန့်အသတ်နှင့် ဘရိတ် စီမံခန့်ခွဲမှု' : 'Limits & Risk Controls'}
              </h3>
              <p className="text-xs text-slate-500">
                {isMyanmar ? 'အထွေထွေ အကန့်အသတ်၊ သီးသန့်ဂဏန်း ဘရိတ်များနှင့် ပိတ်ဂဏန်းများ သတ်မှတ်ရန်' : 'Configure global stock limits, per-number custom thresholds and blocked numbers'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Global Limits Card */}
          <form onSubmit={handleSaveGlobalSettings} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>{isMyanmar ? 'အထွေထွေ အခြေခံ ကန့်သတ်ချက်များ (Default Limit)' : 'Global Default Limit'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {isMyanmar ? 'ဂဏန်းတစ်ခုချင်း အခြေခံ ကန့်သတ်ငွေ' : 'Default Max Limit Per Number'} ({settings.currency})
                </label>
                <input
                  type="number"
                  step="5000"
                  value={globalLimitInput}
                  onChange={(e) => setGlobalLimitInput(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold font-mono text-emerald-700 outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {isMyanmar ? 'သတိပေးချက် စတင်ပြသမည့် ရာခိုင်နှုန်း (%)' : 'Low Stock Alert Trigger (%)'}
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={alertPctInput}
                  onChange={(e) => setAlertPctInput(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold font-mono text-amber-800 outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                {isMyanmar ? 'အခြေခံကန့်သတ်ချက် သိမ်းမည်' : 'Update Defaults'}
              </button>
            </div>
          </form>

          {/* Custom Per-Number Limit */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>{isMyanmar ? 'ဂဏန်းတစ်ခုချင်း သီးသန့် ဘရိတ်သတ်မှတ်ရန် (Custom Limits)' : 'Set Custom Number Limit'}</span>
            </h4>

            <form onSubmit={handleSetCustomLimit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-4 space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {isMyanmar ? 'ဂဏန်း (၃ လုံး)' : 'Number'}
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={numberInput}
                  onChange={(e) => setNumberInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="ဥပမာ: 789"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold font-mono text-indigo-900 text-center outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>

              <div className="sm:col-span-5 space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {isMyanmar ? 'ကန့်သတ်ဘရိတ်ငွေ' : 'Max Limit'} ({settings.currency})
                </label>
                <input
                  type="number"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  placeholder="50000"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold font-mono text-slate-900 text-center outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isMyanmar ? 'ဘရိတ်ထည့်' : 'Set Limit'}</span>
                </button>
              </div>
            </form>

            {/* Custom Limits Table */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-600 block">
                {isMyanmar ? 'သတ်မှတ်ထားသော သီးသန့်ဘရိတ်များ:' : 'Active Custom Limits:'}
              </span>

              {Object.keys(limits).length === 0 ? (
                <div className="py-4 text-center text-slate-400 text-xs">
                  {isMyanmar ? 'သီးသန့်ဘရိတ် သတ်မှတ်ထားခြင်း မရှိပါ' : 'No custom limits set'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.entries(limits) as [string, number][]).map(([num, lmt]) => {
                    const sold = aggregates[num]?.totalSold || 0;
                    const pct = lmt > 0 ? Math.round((sold / lmt) * 100) : 0;

                    return (
                      <div
                        key={num}
                        className="bg-white border border-slate-200 p-2.5 rounded-xl flex items-center justify-between text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-100 text-indigo-900 font-mono font-black px-2 py-0.5 rounded border border-slate-200">
                            {num}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              ဘရိတ်: {formatAmount(lmt, settings.currency)}
                            </span>
                            <span className={`text-[10px] block font-mono ${
                              pct >= 100 ? 'text-rose-600 font-bold' : pct >= 80 ? 'text-amber-700' : 'text-slate-500'
                            }`}>
                              ရောင်းပြီး: {formatAmount(sold, settings.currency)} ({pct}%)
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => removeNumberLimit(num)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="ဖျက်မည်"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
