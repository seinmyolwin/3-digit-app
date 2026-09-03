/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LotteryProvider, useLottery } from './context/LotteryContext';
import { TwoDLotteryProvider, useTwoDLottery } from './context/TwoDLotteryContext';
import { FootballProvider, useFootball } from './context/FootballContext';
import { Header } from './components/Header';
import { BookieMode, Voucher, TwoDVoucher, FootballSlip } from './types';

// 3D Components
import { QuickSaleEntry } from './components/QuickSaleEntry';
import { LiveLedgerView } from './components/LiveLedgerView';
import { WinningPayoutView } from './components/WinningPayoutView';
import { VouchersView } from './components/VouchersView';
import { AnalyticsView } from './components/AnalyticsView';
import { VoucherPrintModal } from './components/VoucherPrintModal';
import { ForwardSlipsModal } from './components/ForwardSlipsModal';
import { LimitManagerModal } from './components/LimitManagerModal';
import { RoundManagerModal } from './components/RoundManagerModal';

// 2D Components
import { TwoDQuickSaleEntry } from './components/twoD/TwoDQuickSaleEntry';
import { TwoDLiveLedgerView } from './components/twoD/TwoDLiveLedgerView';
import { TwoDWinningPayoutView } from './components/twoD/TwoDWinningPayoutView';
import { TwoDVouchersView } from './components/twoD/TwoDVouchersView';
import { TwoDLimitsManager } from './components/twoD/TwoDLimitsManager';
import { TwoDVoucherPrintModal } from './components/twoD/TwoDVoucherPrintModal';
import { TwoDForwardModal } from './components/twoD/TwoDForwardModal';
import { TwoDRoundManagerModal } from './components/twoD/TwoDRoundManagerModal';

// Football Components
import { FootballFixturesView } from './components/football/FootballFixturesView';
import { FootballSlipEntryView } from './components/football/FootballSlipEntryView';
import { FootballSlipsListView } from './components/football/FootballSlipsListView';

// Shared Modals
import { UnifiedBackupModal } from './components/UnifiedBackupModal';
import { NotificationsModal } from './components/NotificationsModal';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PreviousResultsModal } from './components/PreviousResultsModal';
import { QuickTitleModal } from './components/QuickTitleModal';
import { QuickResultsBanner } from './components/QuickResultsBanner';

function AppContent() {
  const { settings: settings3D } = useLottery();
  const { settings: settings2D } = useTwoDLottery();
  const { settings: settingsFB } = useFootball();

  // Active Dealer Mode ('3d' | '2d' | 'football')
  const [dealerMode, setDealerModeState] = useState<BookieMode>(() => {
    try {
      const saved = localStorage.getItem('active_bookie_mode');
      if (saved === '2d' || saved === 'football' || saved === '3d') {
        return saved as BookieMode;
      }
    } catch {
      // fallback
    }
    return '3d';
  });

  const setDealerMode = (mode: BookieMode) => {
    setDealerModeState(mode);
    try {
      localStorage.setItem('active_bookie_mode', mode);
    } catch {
      // ignore
    }
  };

  // Mode-Specific Active Tabs
  const [activeTab3D, setActiveTab3D] = useState<'sales' | 'ledger' | 'winning' | 'vouchers' | 'analytics'>('sales');
  const [activeTab2D, setActiveTab2D] = useState<'sales' | 'ledger' | 'winning' | 'vouchers' | 'limits'>('sales');
  const [activeTabFB, setActiveTabFB] = useState<'fixtures' | 'slip_entry' | 'slips_list'>('fixtures');

  // Modals state
  const [printingVoucher3D, setPrintingVoucher3D] = useState<Voucher | null>(null);
  const [printingVoucher2D, setPrintingVoucher2D] = useState<TwoDVoucher | null>(null);

  const [isForwardModal3DOpen, setIsForwardModal3DOpen] = useState(false);
  const [forwardInitialData3D, setForwardInitialData3D] = useState<{ num?: string; amt?: number }>({});

  const [isForwardModal2DOpen, setIsForwardModal2DOpen] = useState(false);
  const [forwardInitialData2D, setForwardInitialData2D] = useState<{ num?: string; amt?: number }>({});

  const [isLimitsModal3DOpen, setIsLimitsModal3DOpen] = useState(false);
  const [limitInitialNumber3D, setLimitInitialNumber3D] = useState<string | undefined>(undefined);

  const [isRoundManager3DOpen, setIsRoundManager3DOpen] = useState(false);
  const [isRoundManager2DOpen, setIsRoundManager2DOpen] = useState(false);

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPreviousResultsOpen, setIsPreviousResultsOpen] = useState(false);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);

  // Sync document title with active mode
  useEffect(() => {
    if (dealerMode === '3d') {
      const title = settings3D.appName || settings3D.shopName || '3D Ledger Pro';
      document.title = `${title} - သုံးလုံး ချဲ စာရင်းစနစ်`;
    } else if (dealerMode === '2d') {
      const title = settings2D.appName || settings2D.shopName || '2D Ledger Pro';
      document.title = `${title} - ၂ လုံး ထီ စာရင်းစနစ်`;
    } else {
      const title = settingsFB.appName || settingsFB.shopName || 'Football Betting Pro';
      document.title = `${title} - ဘောလုံးဒိုင် စာရင်းစနစ်`;
    }
  }, [dealerMode, settings3D, settings2D, settingsFB]);

  // Current active tab based on active mode
  const currentActiveTab =
    dealerMode === '3d'
      ? activeTab3D
      : dealerMode === '2d'
      ? activeTab2D
      : activeTabFB;

  const handleSetTab = (tab: string) => {
    if (dealerMode === '3d') setActiveTab3D(tab as any);
    else if (dealerMode === '2d') setActiveTab2D(tab as any);
    else setActiveTabFB(tab as any);
  };

  const handleOpenRoundManager = () => {
    if (dealerMode === '3d') setIsRoundManager3DOpen(true);
    else if (dealerMode === '2d') setIsRoundManager2DOpen(true);
  };

  const handleOpenForwardModal = (num?: string, amt?: number) => {
    if (dealerMode === '3d') {
      setForwardInitialData3D({ num, amt });
      setIsForwardModal3DOpen(true);
    } else if (dealerMode === '2d') {
      setForwardInitialData2D({ num, amt });
      setIsForwardModal2DOpen(true);
    }
  };

  const handleOpenLimitsModal = (num?: string) => {
    if (dealerMode === '3d') {
      setLimitInitialNumber3D(num);
      setIsLimitsModal3DOpen(true);
    } else if (dealerMode === '2d') {
      setActiveTab2D('limits');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Universal Multi-Bookie Header */}
      <Header
        dealerMode={dealerMode}
        setDealerMode={setDealerMode}
        activeTab={currentActiveTab}
        setActiveTab={handleSetTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenRoundManager={handleOpenRoundManager}
        onOpenLimitsManager={() => handleOpenLimitsModal()}
        onOpenForwardModal={() => handleOpenForwardModal()}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenPreviousResults={() => setIsPreviousResultsOpen(true)}
        onOpenTitleModal={() => setIsTitleModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="pb-16 pt-2.5">
        {/* Prominent Quick Results Banner */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 mb-3">
          <QuickResultsBanner
            mode={dealerMode}
            onOpenHistory={() => setIsPreviousResultsOpen(true)}
          />
        </div>

        {/* ======================= 3D LOTTERY VIEWS ======================= */}
        {dealerMode === '3d' && (
          <>
            {activeTab3D === 'sales' && (
              <QuickSaleEntry onVoucherCreated={(v) => setPrintingVoucher3D(v)} />
            )}

            {activeTab3D === 'ledger' && (
              <LiveLedgerView
                onOpenForwardModal={handleOpenForwardModal}
                onOpenLimitsManager={handleOpenLimitsModal}
              />
            )}

            {activeTab3D === 'winning' && (
              <WinningPayoutView />
            )}

            {activeTab3D === 'vouchers' && (
              <VouchersView onOpenPrintVoucher={(v) => setPrintingVoucher3D(v)} />
            )}

            {activeTab3D === 'analytics' && (
              <AnalyticsView onOpenForwardModal={handleOpenForwardModal} />
            )}
          </>
        )}

        {/* ======================= 2D LOTTERY VIEWS ======================= */}
        {dealerMode === '2d' && (
          <>
            {activeTab2D === 'sales' && (
              <TwoDQuickSaleEntry onVoucherCreated={(v) => setPrintingVoucher2D(v)} />
            )}

            {activeTab2D === 'ledger' && (
              <TwoDLiveLedgerView
                onOpenForwardModal={handleOpenForwardModal}
                onOpenLimitsManager={() => setActiveTab2D('limits')}
              />
            )}

            {activeTab2D === 'winning' && (
              <TwoDWinningPayoutView />
            )}

            {activeTab2D === 'vouchers' && (
              <TwoDVouchersView onOpenPrintVoucher={(v) => setPrintingVoucher2D(v)} />
            )}

            {activeTab2D === 'limits' && (
              <TwoDLimitsManager />
            )}
          </>
        )}

        {/* ======================= FOOTBALL BETTING VIEWS ======================= */}
        {dealerMode === 'football' && (
          <>
            {activeTabFB === 'fixtures' && (
              <FootballFixturesView />
            )}

            {activeTabFB === 'slip_entry' && (
              <FootballSlipEntryView
                onSlipCreated={() => setActiveTabFB('slips_list')}
              />
            )}

            {activeTabFB === 'slips_list' && (
              <FootballSlipsListView />
            )}
          </>
        )}
      </main>

      {/* ======================= MODALS & DRAWERS ======================= */}

      {/* 3D Modals */}
      <VoucherPrintModal
        voucher={printingVoucher3D}
        onClose={() => setPrintingVoucher3D(null)}
      />

      <ForwardSlipsModal
        isOpen={isForwardModal3DOpen}
        onClose={() => {
          setIsForwardModal3DOpen(false);
          setForwardInitialData3D({});
        }}
        initialNumber={forwardInitialData3D.num}
        initialAmount={forwardInitialData3D.amt}
      />

      <LimitManagerModal
        isOpen={isLimitsModal3DOpen}
        onClose={() => {
          setIsLimitsModal3DOpen(false);
          setLimitInitialNumber3D(undefined);
        }}
        initialNumber={limitInitialNumber3D}
      />

      <RoundManagerModal
        isOpen={isRoundManager3DOpen}
        onClose={() => setIsRoundManager3DOpen(false)}
      />

      {/* 2D Modals */}
      <TwoDVoucherPrintModal
        voucher={printingVoucher2D}
        onClose={() => setPrintingVoucher2D(null)}
      />

      <TwoDForwardModal
        isOpen={isForwardModal2DOpen}
        onClose={() => {
          setIsForwardModal2DOpen(false);
          setForwardInitialData2D({});
        }}
        initialNumber={forwardInitialData2D.num}
        initialAmount={forwardInitialData2D.amt}
      />

      <TwoDRoundManagerModal
        isOpen={isRoundManager2DOpen}
        onClose={() => setIsRoundManager2DOpen(false)}
      />

      {/* Unified Backup & Restore Modal */}
      <UnifiedBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onOpenForwardModal={handleOpenForwardModal}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={dealerMode}
      />

      {/* Quick Title & Branding Customization Modal */}
      <QuickTitleModal
        isOpen={isTitleModalOpen}
        onClose={() => setIsTitleModalOpen(false)}
        activeMode={dealerMode}
      />

      {/* Previous Results & Winning Numbers Modal */}
      <PreviousResultsModal
        isOpen={isPreviousResultsOpen}
        onClose={() => setIsPreviousResultsOpen(false)}
        mode={dealerMode}
        onSelectRound3D={() => {
          setActiveTab3D('ledger');
        }}
        onSelectRound2D={() => {
          setActiveTab2D('ledger');
        }}
        onGoToWinningPayouts3D={() => {
          setActiveTab3D('payouts');
        }}
        onGoToWinningPayouts2D={() => {
          setActiveTab2D('payouts');
        }}
        onGoToFootballSlips={() => {
          setActiveTabFB('slips');
        }}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Offline Status Badge */}
      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <LotteryProvider>
      <TwoDLotteryProvider>
        <FootballProvider>
          <AppContent />
        </FootballProvider>
      </TwoDLotteryProvider>
    </LotteryProvider>
  );
}
