/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LotteryProvider } from './context/LotteryContext';
import { Header } from './components/Header';
import { QuickSaleEntry } from './components/QuickSaleEntry';
import { LiveLedgerView } from './components/LiveLedgerView';
import { WinningPayoutView } from './components/WinningPayoutView';
import { VouchersView } from './components/VouchersView';
import { AnalyticsView } from './components/AnalyticsView';
import { VoucherPrintModal } from './components/VoucherPrintModal';
import { ForwardSlipsModal } from './components/ForwardSlipsModal';
import { LimitManagerModal } from './components/LimitManagerModal';
import { NotificationsModal } from './components/NotificationsModal';
import { RoundManagerModal } from './components/RoundManagerModal';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { Voucher } from './types';

function AppContent() {
  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'sales' | 'ledger' | 'winning' | 'vouchers' | 'analytics'>('sales');

  // Modals state
  const [printingVoucher, setPrintingVoucher] = useState<Voucher | null>(null);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [forwardInitialData, setForwardInitialData] = useState<{ num?: string; amt?: number }>({});
  
  const [isLimitsModalOpen, setIsLimitsModalOpen] = useState(false);
  const [limitInitialNumber, setLimitInitialNumber] = useState<string | undefined>(undefined);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoundManagerOpen, setIsRoundManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Trigger voucher print upon creation
  const handleVoucherCreated = (voucher: Voucher) => {
    setPrintingVoucher(voucher);
  };

  const handleOpenForwardModal = (initialNumber?: string, initialAmount?: number) => {
    setForwardInitialData({ num: initialNumber, amt: initialAmount });
    setIsForwardModalOpen(true);
  };

  const handleOpenLimitsModal = (initialNumber?: string) => {
    setLimitInitialNumber(initialNumber);
    setIsLimitsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab: any) => setActiveTab(tab)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenRoundManager={() => setIsRoundManagerOpen(true)}
        onOpenLimitsManager={() => handleOpenLimitsModal()}
        onOpenForwardModal={() => handleOpenForwardModal()}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main View Area */}
      <main className="pb-16 pt-2">
        {activeTab === 'sales' && (
          <QuickSaleEntry onVoucherCreated={handleVoucherCreated} />
        )}

        {activeTab === 'ledger' && (
          <LiveLedgerView
            onOpenForwardModal={handleOpenForwardModal}
            onOpenLimitsManager={handleOpenLimitsModal}
          />
        )}

        {activeTab === 'winning' && (
          <WinningPayoutView />
        )}

        {activeTab === 'vouchers' && (
          <VouchersView onOpenPrintVoucher={(v) => setPrintingVoucher(v)} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView onOpenForwardModal={handleOpenForwardModal} />
        )}
      </main>

      {/* Modals & Drawers */}
      <VoucherPrintModal
        voucher={printingVoucher}
        onClose={() => setPrintingVoucher(null)}
      />

      <ForwardSlipsModal
        isOpen={isForwardModalOpen}
        onClose={() => {
          setIsForwardModalOpen(false);
          setForwardInitialData({});
        }}
        initialNumber={forwardInitialData.num}
        initialAmount={forwardInitialData.amt}
      />

      <LimitManagerModal
        isOpen={isLimitsModalOpen}
        onClose={() => {
          setIsLimitsModalOpen(false);
          setLimitInitialNumber(undefined);
        }}
        initialNumber={limitInitialNumber}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onOpenForwardModal={handleOpenForwardModal}
      />

      <RoundManagerModal
        isOpen={isRoundManagerOpen}
        onClose={() => setIsRoundManagerOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LotteryProvider>
      <AppContent />
    </LotteryProvider>
  );
}
