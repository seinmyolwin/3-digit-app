import React, { useState } from 'react';
import {
  X,
  Settings,
  Store,
  Database,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Check,
  Save,
  Coins
} from 'lucide-react';
import { useLottery } from '../context/LotteryContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    updateSettings,
    resetToSampleData,
    clearAllData,
    exportJSONBackup,
    importJSONBackup
  } = useLottery();

  const isMyanmar = settings.language === 'my';

  // Form State
  const [shopName, setShopName] = useState(settings.shopName || '');
  const [shopPhone, setShopPhone] = useState(settings.shopPhone || '');
  const [shopAddress, setShopAddress] = useState(settings.shopAddress || '');
  const [currency, setCurrency] = useState(settings.currency || 'Ks');
  const [defaultMultiplier, setDefaultMultiplier] = useState(String(settings.defaultMultiplier || 600));
  const [defaultToddMultiplier, setDefaultToddMultiplier] = useState(String(settings.defaultToddMultiplier || 100));
  const [defaultCommissionRate, setDefaultCommissionRate] = useState(String(settings.defaultCommissionRate || 10));
  const [defaultCustomerDiscount, setDefaultCustomerDiscount] = useState(String(settings.defaultCustomerDiscount || 0));
  const [voucherFooterMessage, setVoucherFooterMessage] = useState(settings.voucherFooterMessage || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importError, setImportError] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      shopName: shopName.trim(),
      shopPhone: shopPhone.trim(),
      shopAddress: shopAddress.trim(),
      currency,
      defaultMultiplier: parseInt(defaultMultiplier, 10) || 600,
      defaultToddMultiplier: parseInt(defaultToddMultiplier, 10) || 100,
      defaultCommissionRate: parseInt(defaultCommissionRate, 10) || 10,
      defaultCustomerDiscount: parseInt(defaultCustomerDiscount, 10) || 0,
      voucherFooterMessage: voucherFooterMessage.trim()
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportJSON = () => {
    const jsonStr = exportJSONBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `3D_Ledger_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importJSONBackup(content);
        if (ok) {
          onClose();
        } else {
          setImportError(true);
          setTimeout(() => setImportError(false), 3000);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold border border-slate-200">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isMyanmar ? 'အထွေထွေ အပြင်အဆင်နှင့် ဒေတာစီမံခန့်ခွဲမှု' : 'Settings & Data Management'}
              </h3>
              <p className="text-xs text-slate-500">
                {isMyanmar ? 'ဆိုင်အချက်အလက်၊ ပေါက်ကြေးအဆ၊ Backup ထုတ်ယူခြင်းနှင့် ပြန်လည်သွင်းခြင်း' : 'Shop profile, multipliers, backup and restore'}
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

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Shop Profile Form */}
          <form onSubmit={handleSave} className="space-y-4 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Store className="w-4 h-4 text-indigo-600" />
              <span>{isMyanmar ? 'အရောင်းဆိုင် / ကိုယ်စားလှယ် အချက်အလက်' : 'Shop & Agent Details'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {isMyanmar ? 'ဆိုင်အမည်' : 'Shop Name'}
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="ရွှေမင်္ဂလာ (၃ လုံး ချဲထီ)"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {isMyanmar ? 'ဖုန်းနံပါတ်' : 'Shop Phone'}
                </label>
                <input
                  type="text"
                  value={shopPhone}
                  onChange={(e) => setShopPhone(e.target.value)}
                  placeholder="09-xxxxxxx"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">
                  {isMyanmar ? 'လိပ်စာ (ဘောင်ချာတွင် ဖော်ပြရန်)' : 'Shop Address'}
                </label>
                <input
                  type="text"
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  placeholder="ရန်ကုန်မြို့ / မန္တလေးမြို့"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {isMyanmar ? 'ငွေကြေး သင်္ကေတ' : 'Currency Symbol'}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 shadow-2xs"
                >
                  <option value="Ks">Ks (ကျပ်)</option>
                  <option value="MMK">MMK</option>
                  <option value="THB">THB (ဘတ်)</option>
                  <option value="$">USD ($)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  {isMyanmar ? 'တည့်ပေါက် ပုံသေအဆ (ဆ)' : 'Default Multiplier (x)'}
                </label>
                <input
                  type="number"
                  value={defaultMultiplier}
                  onChange={(e) => setDefaultMultiplier(e.target.value)}
                  placeholder="600"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">
                  {isMyanmar ? 'ဘောင်ချာအောက်ခြေ ညွှန်ကြားစာ' : 'Voucher Footer Message'}
                </label>
                <textarea
                  value={voucherFooterMessage}
                  onChange={(e) => setVoucherFooterMessage(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{savedSuccess ? 'သိမ်းဆည်းပြီးပါပြီ' : 'အချက်အလက် သိမ်းမည်'}</span>
              </button>
            </div>
          </form>

          {/* Backup & Restore Data */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>{isMyanmar ? 'ဒေတာ အရန်သိမ်းခြင်းနှင့် ပြန်လည်သွင်းခြင်း (Backup & Restore)' : 'Database Backup & Restore'}</span>
            </h4>
            <p className="text-xs text-slate-500">
              {isMyanmar
                ? 'သင်၏ အရောင်းစာရင်း၊ ဘောင်ချာများ၊ ဘရိတ်များကို ကွန်ပျူတာ/ဖုန်းထဲသို့ JSON ဖိုင်အနေဖြင့် သိမ်းဆည်းထားနိုင်ပါသည်'
                : 'Safely export or restore your complete ledger database'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Export JSON */}
              <button
                type="button"
                onClick={handleExportJSON}
                className="p-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-left transition-all flex items-center gap-3 group shadow-2xs cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 block">
                    {isMyanmar ? 'ဒေတာ Backup ဒေါင်းလုဒ်ဆွဲမည်' : 'Download JSON Backup'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    .json ဖိုင်ဖြင့်သိမ်းရန်
                  </span>
                </div>
              </button>

              {/* Import JSON */}
              <label className="p-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-left transition-all flex items-center gap-3 group cursor-pointer shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 block">
                    {isMyanmar ? 'ဒေတာ ဖိုင် ပြန်လည်တင်သွင်းမည်' : 'Restore from Backup'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    .json ဖိုင် ရွေးချယ်ရန်
                  </span>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>

            {importError && (
              <p className="text-xs text-rose-600 font-medium">ဖိုင်ပုံစံ မှားယွင်းနေပါသည်</p>
            )}
          </div>

          {/* Reset / Sample Data options */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {isMyanmar ? 'စမ်းသပ်ဒေတာနှင့် အစမှပြန်စတင်ခြင်း' : 'Quick Presets & Reset'}
            </h4>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('နမူနာ အရောင်းဒေတာများ ပြန်လည်ဖြည့်သွင်းလိုပါသလား?')) {
                    resetToSampleData();
                    onClose();
                  }
                }}
                className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-indigo-700 text-xs rounded-xl font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isMyanmar ? 'နမူနာ ဒေတာများ ပြန်ဖြည့်မည်' : 'Load Sample Data'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('ဒေတာ အားလုံးကို ရှင်းလင်းပြီး စာရင်းအသစ် စတင်လိုပါသလား?')) {
                    clearAllData();
                    onClose();
                  }
                }}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isMyanmar ? 'ဒေတာ အားလုံးရှင်းမည်' : 'Clear All Data'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
