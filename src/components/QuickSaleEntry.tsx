import React, { useState, useId, useRef, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Receipt,
  FileText,
  AlertTriangle,
  Sparkles,
  Zap,
  RotateCcw,
  Check,
  Percent,
  User,
  Phone,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useLottery } from '../context/LotteryContext';
import { BetItem, VoucherItem, Voucher } from '../types';
import { getPermutations, parseQuickBetText, formatAmount, LOTTERY_PATTERNS } from '../utils/lotteryUtils';

interface QuickSaleEntryProps {
  onVoucherCreated: (voucher: Voucher) => void;
}

export const QuickSaleEntry: React.FC<QuickSaleEntryProps> = ({ onVoucherCreated }) => {
  const {
    activeRound,
    settings,
    addVoucher,
    aggregates,
    limits,
    blockedNumbers,
    vouchers
  } = useLottery();

  const isMyanmar = settings.language === 'my';

  // Form State
  const [customerName, setCustomerName] = useState('အထွေထွေ (General)');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(settings.defaultCustomerDiscount || 0);
  const [notes, setNotes] = useState('');

  // Single Item Input
  const [numberInput, setNumberInput] = useState('');
  const [amountInput, setAmountInput] = useState('1000');
  const [isRumble, setIsRumble] = useState(false);

  // Staged Bet Items in current voucher
  const [stagedItems, setStagedItems] = useState<BetItem[]>([]);

  // Batch / Quick text mode toggle
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [rawBatchText, setRawBatchText] = useState('');
  const [batchErrors, setBatchErrors] = useState<string[]>([]);

  const numberInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Unique customer names list for auto-complete
  const previousCustomers = useMemo(() => {
    const names = new Set<string>();
    vouchers.forEach(v => {
      if (v.customerName && v.customerName !== 'အထွေထွေ (General)') {
        names.add(v.customerName);
      }
    });
    return Array.from(names);
  }, [vouchers]);

  // Current number limit check
  const currentNumberWarning = useMemo(() => {
    if (!numberInput || numberInput.length !== 3) return null;
    const num = numberInput;
    const agg = aggregates[num];
    const isBlocked = !!blockedNumbers[num];
    const limit = limits[num] !== undefined ? limits[num] : settings.globalStockLimit;
    const currentSold = agg ? agg.totalSold : 0;
    const amt = parseInt(amountInput, 10) || 0;
    const totalWillBe = currentSold + amt;

    if (isBlocked) {
      return { type: 'danger', message: `ဂဏန်း [${num}] သည် ပိတ်ထားသောဂဏန်း (Blocked) ဖြစ်ပါသည်!` };
    }
    if (limit > 0 && totalWillBe > limit) {
      return {
        type: 'danger',
        message: `ဂဏန်း [${num}] ကန့်သတ်ချက် ပြည့်တော့မည် (ရောင်းပြီး: ${formatAmount(currentSold, settings.currency)} / ဘရိတ်: ${formatAmount(limit, settings.currency)})`
      };
    }
    if (limit > 0 && (totalWillBe / limit) >= (settings.lowStockAlertPercentage / 100)) {
      return {
        type: 'warning',
        message: `ဂဏန်း [${num}] လက်ကျန်နည်းနေပါသည် (${Math.round((totalWillBe / limit) * 100)}% ရောင်းပြီး)`
      };
    }
    return null;
  }, [numberInput, amountInput, aggregates, limits, blockedNumbers, settings]);

  // Permutation count preview
  const permPreview = useMemo(() => {
    if (!isRumble || numberInput.length !== 3) return [];
    return getPermutations(numberInput);
  }, [isRumble, numberInput]);

  // Calculate Subtotal and Net
  const subtotal = useMemo(() => {
    return stagedItems.reduce((acc, item) => acc + item.amount, 0);
  }, [stagedItems]);

  const discountAmount = useMemo(() => {
    if (discountPercent <= 0) return 0;
    return Math.round((subtotal * discountPercent) / 100);
  }, [subtotal, discountPercent]);

  const netPayable = subtotal - discountAmount;

  // Add Single Bet Handler
  const handleAddBet = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!numberInput || numberInput.length !== 3) {
      numberInputRef.current?.focus();
      return;
    }

    const amount = parseInt(amountInput, 10);
    if (isNaN(amount) || amount <= 0) {
      amountInputRef.current?.focus();
      return;
    }

    const newItems: BetItem[] = [];

    if (isRumble) {
      const perms = getPermutations(numberInput);
      perms.forEach((p, idx) => {
        newItems.push({
          id: `item-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 3)}`,
          number: p,
          amount: amount,
          isRumble: true,
          originalInput: `${numberInput} R`
        });
      });
    } else {
      newItems.push({
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
        number: numberInput,
        amount: amount,
        isRumble: false,
        originalInput: numberInput
      });
    }

    setStagedItems(prev => [...prev, ...newItems]);
    setNumberInput('');
    setIsRumble(false);
    numberInputRef.current?.focus();
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    setStagedItems(prev => prev.filter(item => item.id !== id));
  };

  // Add Pattern Numbers (e.g. Triples/Doubles, Power, Natkhat)
  const handleAddPattern = (name: string, numbers: string[]) => {
    const amount = parseInt(amountInput, 10) || 1000;
    const newItems: BetItem[] = numbers.map((num, idx) => ({
      id: `item-pat-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 3)}`,
      number: num,
      amount: amount,
      isRumble: false,
      originalInput: `${name} (${num})`
    }));
    setStagedItems(prev => [...prev, ...newItems]);
  };

  // Parse Text Batch
  const handleProcessBatchText = () => {
    if (!rawBatchText.trim()) return;
    const { items, errors } = parseQuickBetText(rawBatchText);
    setBatchErrors(errors);
    if (items.length > 0) {
      setStagedItems(prev => [...prev, ...items]);
      setRawBatchText('');
      if (errors.length === 0) {
        setShowBatchModal(false);
      }
    }
  };

  // Submit Voucher
  const handleSaveVoucher = () => {
    if (stagedItems.length === 0) return;

    const voucherItems: VoucherItem[] = stagedItems.map(item => ({
      number: item.number,
      amount: item.amount,
      betType: item.isRumble ? 'rumble' : 'straight'
    }));

    const newVoucher = addVoucher({
      roundId: activeRound?.id || 'default',
      customerName: customerName.trim() || 'အထွေထွေ (General)',
      customerPhone: customerPhone.trim(),
      items: voucherItems,
      subtotal,
      discountPercent,
      discountAmount,
      netPayable,
      notes: notes.trim(),
      isPaid: true,
      status: 'active'
    });

    // Clear Staging
    setStagedItems([]);
    setNotes('');
    onVoucherCreated(newVoucher);
  };

  const quickAmounts = [500, 1000, 2000, 3000, 5000, 10000, 20000];

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-6">
      {/* Top Banner / Round Status notice */}
      {activeRound?.status === 'settled' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between text-amber-900 text-sm shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              လက်ရှိပွဲစဉ် ({activeRound.name}) သည် ပေါက်ဂဏန်း <b>{activeRound.winningNumber}</b> ဖြင့် ပြီးဆုံးပြီး ဖြစ်ပါသည်။ (အရောင်းစာရင်းများ စမ်းသပ်ထည့်သွင်းနိုင်ပါသည်)
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Left = Entry Controls, Right = Slip Preview / Items Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Quick Entry Pad & Helpers */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Main Keypad / Input Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
            
            {/* Box Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {isMyanmar ? 'အမြန် အရောင်းစာရင်းသွင်း' : 'Fast Sale Entry'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isMyanmar ? 'ဂဏန်း ၃ လုံး နှင့် ထိုးကြေးငွေ ရိုက်ထည့်ပါ' : 'Enter 3-digit number and bet amount'}
                  </p>
                </div>
              </div>

              {/* Batch Text Input Trigger */}
              <button
                type="button"
                onClick={() => setShowBatchModal(!showBatchModal)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-indigo-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isMyanmar ? 'စာသားဖြင့် စုပြုံထည့်ရန် (Batch Paste)' : 'Batch Paste'}</span>
              </button>
            </div>

            {/* Batch Text Drawer (if toggled) */}
            {showBatchModal && (
              <div className="bg-slate-50 border border-indigo-200 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    {isMyanmar ? 'Viber / SMS မှ စာသားကူးထည့်ရန် (Shallow Parser)' : 'Paste Text from Viber/SMS'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    နမူနာ: 123=1000, 456=500, 789R=1000
                  </span>
                </div>
                <textarea
                  value={rawBatchText}
                  onChange={(e) => setRawBatchText(e.target.value)}
                  placeholder={`123=1000\n456-500\n789R=1000\n555=2000`}
                  rows={4}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
                {batchErrors.length > 0 && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-700 space-y-1">
                    {batchErrors.map((err, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowBatchModal(false); setBatchErrors([]); }}
                    className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs rounded-xl font-semibold cursor-pointer"
                  >
                    ပိတ်မည်
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessBatchText}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-xl font-bold shadow-xs cursor-pointer"
                  >
                    စာရင်းထဲသို့ ထည့်သွင်းမည်
                  </button>
                </div>
              </div>
            )}

            {/* Direct Form */}
            <form onSubmit={handleAddBet} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* 3-Digit Input */}
                <div className="sm:col-span-5 space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {isMyanmar ? 'ဂဏန်း (၃ လုံး)' : '3-Digit Number'}
                  </label>
                  <div className="relative">
                    <input
                      ref={numberInputRef}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={3}
                      value={numberInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
                        setNumberInput(val);
                      }}
                      placeholder="000 - 999"
                      className="w-full bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-indigo-600 rounded-xl px-3 py-2.5 text-2xl font-black text-indigo-950 font-mono tracking-widest text-center outline-none transition-colors shadow-2xs"
                      autoFocus
                    />
                    {numberInput.length === 3 && (
                      <span className="absolute right-3 top-3.5 text-emerald-600">
                        <Check className="w-5 h-5" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount Input */}
                <div className="sm:col-span-4 space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {isMyanmar ? 'ထိုးကြေးငွေ' : 'Amount'} ({settings.currency})
                  </label>
                  <input
                    ref={amountInputRef}
                    type="number"
                    step="100"
                    min="100"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="1000"
                    className="w-full bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-indigo-600 rounded-xl px-3 py-2.5 text-xl font-bold text-emerald-700 font-mono text-center outline-none transition-colors shadow-2xs"
                  />
                </div>

                {/* Add Button */}
                <div className="sm:col-span-3 flex items-end">
                  <button
                    type="submit"
                    className="w-full h-[52px] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    <span>{isMyanmar ? 'ထည့်မည်' : 'Add'}</span>
                  </button>
                </div>
              </div>

              {/* Permutation / Rumble (R) Checkbox Toggle */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isRumble}
                    onChange={(e) => setIsRumble(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-white border-slate-300 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <span>ပတ်လည် (R / Permutation) အကုန်ခွေထည့်မည်</span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-mono font-bold">
                        R
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      ဂဏန်းတစ်ခုချင်းစီအတွက် {amountInput || 1000} {settings.currency} စီ ထည့်သွင်းပေးပါမည်
                    </span>
                  </div>
                </label>

                {isRumble && permPreview.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-indigo-800 font-mono font-bold bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-lg">
                    <span>{permPreview.length} ခွေ:</span>
                    <span>{permPreview.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Real-time Warning if stock/limit is reached */}
              {currentNumberWarning && (
                <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium animate-pulse ${
                  currentNumberWarning.type === 'danger'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{currentNumberWarning.message}</span>
                </div>
              )}

              {/* Quick Amount Preset Chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  {isMyanmar ? 'အမြန်ငွေပမာဏ ရွေးချယ်ရန်:' : 'Quick Amount Presets:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmountInput(String(amt))}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                        amountInput === String(amt)
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      {amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </form>

            {/* Quick Pattern Shortcut Buttons (အပူး၊ ပါဝါ၊ နက္ခတ်၊ ညီကို) */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isMyanmar ? 'အထူးဂဏန်းအတွဲများ (Quick Patterns):' : 'Special Number Sets:'}</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleAddPattern('အပူး (Triples)', LOTTERY_PATTERNS.triples)}
                  className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all cursor-pointer group"
                >
                  <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 block">
                    အပူး (000-999)
                  </span>
                  <span className="text-[10px] text-slate-500 block">၁၀ လုံးတွဲ</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddPattern('ညီကို (Consecutive)', LOTTERY_PATTERNS.consecutives)}
                  className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all cursor-pointer group"
                >
                  <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 block">
                    ညီကို (012, 123...)
                  </span>
                  <span className="text-[10px] text-slate-500 block">၂၀ လုံးတွဲ</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddPattern('ပါဝါ (Power Pairs)', LOTTERY_PATTERNS.getPowerPairs().slice(0, 15))}
                  className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all cursor-pointer group"
                >
                  <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 block">
                    ပါဝါအတွဲများ
                  </span>
                  <span className="text-[10px] text-slate-500 block">၀-၅, ၁-၆...</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddPattern('နက္ခတ် (Natkhat)', LOTTERY_PATTERNS.getNatkhatPairs().slice(0, 15))}
                  className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all cursor-pointer group"
                >
                  <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 block">
                    နက္ခတ်အတွဲများ
                  </span>
                  <span className="text-[10px] text-slate-500 block">၀-၇, ၁-၈...</span>
                </button>
              </div>
            </div>

          </div>

          {/* Quick Stats of Current Staged Bets */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-500 shadow-2xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>
                {isMyanmar ? 'လတ်တလော စာရင်းသွင်းထားသော ဂဏန်းအရေအတွက်:' : 'Staged Bet Count:'}
              </span>
              <span className="font-bold text-slate-900 font-mono text-sm bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                {stagedItems.length}
              </span>
            </div>
            {stagedItems.length > 0 && (
              <button
                type="button"
                onClick={() => setStagedItems([])}
                className="text-rose-600 hover:text-rose-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isMyanmar ? 'အကုန်ရှင်းမည်' : 'Clear All'}</span>
              </button>
            )}
          </div>

        </div>

        {/* Right Column: Customer Info & Staged Voucher Invoice Review */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col h-full justify-between space-y-5">
            
            {/* Voucher Header & Customer Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    {isMyanmar ? 'ဘောင်ချာ / ပြေစာ အချက်အလက်' : 'Slip / Voucher Details'}
                  </h3>
                </div>
                <span className="text-xs bg-slate-100 text-slate-600 font-mono px-2.5 py-1 rounded-lg font-semibold">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Customer Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isMyanmar ? 'ဝယ်သူအမည်' : 'Customer Name'}</span>
                  </label>
                  <input
                    type="text"
                    list="customer-suggestions"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="ဦးကျော် / မလှ"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 transition-colors shadow-2xs"
                  />
                  <datalist id="customer-suggestions">
                    {previousCustomers.map((name, i) => (
                      <option key={i} value={name} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isMyanmar ? 'ဖုန်းနံပါတ်' : 'Phone (Optional)'}</span>
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="09-xxxxxxx"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 transition-colors shadow-2xs"
                  />
                </div>
              </div>

              {/* Staged Items List Table */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                  <span>{isMyanmar ? 'ထိုးဂဏန်းများ' : 'Bet Numbers'}</span>
                  <span>{isMyanmar ? 'ပမာဏ' : 'Amount'}</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl max-h-60 overflow-y-auto divide-y divide-slate-100 p-1">
                  {stagedItems.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 text-xs">
                      {isMyanmar
                        ? 'ဂဏန်းများ ထည့်သွင်းထားခြင်း မရှိသေးပါ'
                        : 'No numbers added to slip yet'}
                    </div>
                  ) : (
                    stagedItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-3 py-2 text-xs hover:bg-white rounded-lg transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-slate-400 text-[11px] w-5 text-right">
                            {idx + 1}.
                          </span>
                          <span className="font-mono font-bold text-indigo-950 text-sm tracking-wider">
                            {item.number}
                          </span>
                          {item.isRumble && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-mono font-bold">
                              R
                            </span>
                          )}
                          {item.originalInput && item.originalInput !== item.number && (
                            <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                              {item.originalInput}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-emerald-700">
                            {formatAmount(item.amount, settings.currency)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                            title="ဖျက်မည်"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Discount / Commission & Notes */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                    <Percent className="w-3 h-3 text-slate-400" />
                    <span>{isMyanmar ? 'လျှော့ငွေ (%)' : 'Discount (%)'}</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500 shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-600">
                    {isMyanmar ? 'မှတ်ချက်' : 'Notes'}
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ဥပမာ: KPay ပေးပြီး"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Calculations & Save Button */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              {/* Financial Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>{isMyanmar ? 'စုစုပေါင်း ထိုးကြေး' : 'Subtotal'}:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatAmount(subtotal, settings.currency)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>{isMyanmar ? `လျှော့ငွေ (${discountPercent}%)` : `Discount (${discountPercent}%)`}:</span>
                    <span className="font-mono font-bold">
                      -{formatAmount(discountAmount, settings.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>{isMyanmar ? 'အသားတင် ပေးချေငွေ' : 'Net Total'}:</span>
                  <span className="font-mono text-base text-emerald-700">
                    {formatAmount(netPayable, settings.currency)}
                  </span>
                </div>
              </div>

              {/* Main Submit Voucher Button */}
              <button
                type="button"
                onClick={handleSaveVoucher}
                disabled={stagedItems.length === 0}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
              >
                <Receipt className="w-4 h-4" />
                <span>{isMyanmar ? 'ဘောင်ချာ ထုတ်ယူမည် (Save & Print)' : 'Generate Voucher'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
