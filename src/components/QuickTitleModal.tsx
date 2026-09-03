import React, { useState } from 'react';
import { X, Edit3, Check, Store, Sparkles, Layers } from 'lucide-react';
import { useLottery } from '../context/LotteryContext';
import { useTwoDLottery } from '../context/TwoDLotteryContext';
import { useFootball } from '../context/FootballContext';
import { BookieMode } from '../types';

interface QuickTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMode: BookieMode;
}

export const QuickTitleModal: React.FC<QuickTitleModalProps> = ({ isOpen, onClose, activeMode }) => {
  const lottery3D = useLottery();
  const lottery2D = useTwoDLottery();
  const football = useFootball();

  const [selectedMode, setSelectedMode] = useState<BookieMode>(activeMode);

  // 3D form state
  const [name3D, setName3D] = useState(lottery3D.settings.appName || '3D Ledger Pro');
  const [shop3D, setShop3D] = useState(lottery3D.settings.shopName || '');

  // 2D form state
  const [name2D, setName2D] = useState(lottery2D.settings.appName || '2D Ledger Pro');
  const [shop2D, setShop2D] = useState(lottery2D.settings.shopName || '');

  // Football form state
  const [nameFB, setNameFB] = useState(football.settings.appName || 'Football Ledger Pro');
  const [shopFB, setShopFB] = useState(football.settings.shopName || '');

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Save 3D
    lottery3D.updateSettings({
      appName: name3D.trim() || '3D Ledger Pro',
      shopName: shop3D.trim()
    });

    // Save 2D
    lottery2D.updateSettings({
      appName: name2D.trim() || '2D Ledger Pro',
      shopName: shop2D.trim()
    });

    // Save Football
    football.updateSettings({
      appName: nameFB.trim() || 'Football Ledger Pro',
      shopName: shopFB.trim()
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400 flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">
                အက်ပ်ခေါင်းစဉ်နှင့် ဆိုင်အမည် ပြင်ဆင်ခြင်း
              </h3>
              <p className="text-xs text-slate-400">
                ၃ လုံး၊ ၂ လုံးနှင့် ဘောလုံးဒိုင် အသီးသီးအတွက် ခေါင်းစဉ်များ ပြောင်းလဲနိုင်ပါသည်
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center justify-around gap-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setSelectedMode('3d')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedMode === '3d'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <span>၃ လုံး (3D)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode('2d')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedMode === '2d'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <span>၂ လုံး (2D)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode('football')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedMode === 'football'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <span>ဘောလုံး (Football)</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Active Mode Form Field */}
          {selectedMode === '3d' && (
            <div className="space-y-3.5 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>၃ လုံး ချဲဒိုင် (3D Lottery) ခေါင်းစဉ်</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  အက်ပ် ခေါင်းစဉ် (App Name):
                </label>
                <input
                  type="text"
                  value={name3D}
                  onChange={(e) => setName3D(e.target.value)}
                  placeholder="3D Ledger Pro"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ဆိုင်/ဒိုင် အမည် သို့မဟုတ် စာတန်းခွဲ (Shop / Subtitle):
                </label>
                <input
                  type="text"
                  value={shop3D}
                  onChange={(e) => setShop3D(e.target.value)}
                  placeholder="ရွှေမင်္ဂလာ (၃ လုံး ချဲထီ အရောင်း)"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {selectedMode === '2d' && (
            <div className="space-y-3.5 bg-teal-50/50 p-4 rounded-2xl border border-teal-100">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-xs">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>၂ လုံး ထီဒိုင် (2D Lottery) ခေါင်းစဉ်</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  အက်ပ် ခေါင်းစဉ် (App Name):
                </label>
                <input
                  type="text"
                  value={name2D}
                  onChange={(e) => setName2D(e.target.value)}
                  placeholder="2D Ledger Pro"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ဆိုင်/ဒိုင် အမည် သို့မဟုတ် စာတန်းခွဲ (Shop / Subtitle):
                </label>
                <input
                  type="text"
                  value={shop2D}
                  onChange={(e) => setShop2D(e.target.value)}
                  placeholder="ရွှေမင်္ဂလာ (၂ လုံး ထီ/ချဲ အရောင်းဒိုင်)"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          {selectedMode === 'football' && (
            <div className="space-y-3.5 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>ဘောလုံးဒိုင် (Football Betting) ခေါင်းစဉ်</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  အက်ပ် ခေါင်းစဉ် (App Name):
                </label>
                <input
                  type="text"
                  value={nameFB}
                  onChange={(e) => setNameFB(e.target.value)}
                  placeholder="Football Ledger Pro"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ဆိုင်/ဒိုင် အမည် သို့မဟုတ် စာတန်းခွဲ (Shop / Subtitle):
                </label>
                <input
                  type="text"
                  value={shopFB}
                  onChange={(e) => setShopFB(e.target.value)}
                  placeholder="ရွှေမင်္ဂလာ (ဘောလုံးဒိုင် စာရင်း)"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Quick presets for common names */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-500 block">အမြန်ရွေးချယ်ရန် ပုံစံများ:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (selectedMode === '3d') {
                    setName3D('3D Ledger Pro (သုံးလုံး ချဲ)');
                    setShop3D('ရွှေမင်္ဂလာ ချဲထီ အရောင်းဒိုင်');
                  } else if (selectedMode === '2d') {
                    setName2D('2D Ledger Pro (နှစ်လုံး ထီ)');
                    setShop2D('ရွှေမင်္ဂလာ ၂ လုံး အရောင်းဒိုင်');
                  } else {
                    setNameFB('Football Pro (ဘောလုံးဒိုင်)');
                    setShopFB('ရွှေမင်္ဂလာ ဘောလုံးစာရင်း');
                  }
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] rounded-lg font-medium transition-colors cursor-pointer"
              >
                ရွှေမင်္ဂလာ ဒိုင်
              </button>

              <button
                type="button"
                onClick={() => {
                  if (selectedMode === '3d') {
                    setName3D('အောင်သပြေ 3D စာရင်း');
                    setShop3D('ကိုယ်စားလှယ်အရောင်း');
                  } else if (selectedMode === '2d') {
                    setName2D('အောင်သပြေ 2D စာရင်း');
                    setShop2D('မနက်/ညနေ အရောင်းဒိုင်');
                  } else {
                    setNameFB('အောင်သပြေ ဘောလုံးဒိုင်');
                    setShopFB('မောင်းနှင့် ဘော်ဒီစာရင်း');
                  }
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] rounded-lg font-medium transition-colors cursor-pointer"
              >
                အောင်သပြေ ဒိုင်
              </button>

              <button
                type="button"
                onClick={() => {
                  if (selectedMode === '3d') {
                    setName3D('3D Master Dealer');
                    setShop3D('Main Agent Center');
                  } else if (selectedMode === '2d') {
                    setName2D('2D Master Dealer');
                    setShop2D('Daily 2D Ledger');
                  } else {
                    setNameFB('Sports Master Bookie');
                    setShopFB('VIP Sports Betting');
                  }
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] rounded-lg font-medium transition-colors cursor-pointer"
              >
                English Master
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              မလုပ်တော့ပါ
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>သိမ်းဆည်းပြီးပါပြီ</span>
                </>
              ) : (
                <span>သိမ်းဆည်းမည် (Save Changes)</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
