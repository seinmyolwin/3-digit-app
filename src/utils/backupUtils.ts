import { STORAGE_KEYS } from './storage';

/**
 * Triggers a browser file download for a JSON string with a clean formatted filename
 */
export function downloadJSONFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates date-stamped filename for backups
 */
export function getBackupFileName(prefix: string): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
  return `${prefix}_${dateStr}_${timeStr}.json`;
}

/**
 * Exports All-In-One Unified Master Backup (3D + 2D + Football)
 */
export function exportUnifiedMasterBackup(): string {
  const backup = {
    app: 'Master Bookie Ledger Suite',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    storageType: 'UNIFIED_MASTER_BACKUP',
    modules: {
      '3d': {
        rounds: localStorage.getItem(STORAGE_KEYS.ROUNDS),
        vouchers: localStorage.getItem(STORAGE_KEYS.VOUCHERS),
        limits: localStorage.getItem(STORAGE_KEYS.LIMITS),
        blocked: localStorage.getItem(STORAGE_KEYS.BLOCKED),
        forwardSlips: localStorage.getItem(STORAGE_KEYS.FORWARD_SLIPS),
        settings: localStorage.getItem(STORAGE_KEYS.SETTINGS),
        activeRoundId: localStorage.getItem(STORAGE_KEYS.ACTIVE_ROUND_ID)
      },
      '2d': {
        rounds: localStorage.getItem(STORAGE_KEYS.ROUNDS_2D),
        vouchers: localStorage.getItem(STORAGE_KEYS.VOUCHERS_2D),
        limits: localStorage.getItem(STORAGE_KEYS.LIMITS_2D),
        blocked: localStorage.getItem(STORAGE_KEYS.BLOCKED_2D),
        forwardSlips: localStorage.getItem(STORAGE_KEYS.FORWARD_SLIPS_2D),
        settings: localStorage.getItem(STORAGE_KEYS.SETTINGS_2D),
        activeRoundId: localStorage.getItem(STORAGE_KEYS.ACTIVE_ROUND_ID_2D)
      },
      'football': {
        matches: localStorage.getItem(STORAGE_KEYS.MATCHES_FOOTBALL),
        slips: localStorage.getItem(STORAGE_KEYS.SLIPS_FOOTBALL),
        forwardSlips: localStorage.getItem(STORAGE_KEYS.FORWARD_SLIPS_FOOTBALL),
        settings: localStorage.getItem(STORAGE_KEYS.SETTINGS_FOOTBALL),
        activeDate: localStorage.getItem(STORAGE_KEYS.ACTIVE_DATE_FOOTBALL)
      }
    }
  };

  return JSON.stringify(backup, null, 2);
}

/**
 * Restores Unified Master Backup
 */
export function restoreUnifiedMasterBackup(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.modules) return false;

    const m3 = parsed.modules['3d'];
    if (m3) {
      if (m3.rounds) localStorage.setItem(STORAGE_KEYS.ROUNDS, m3.rounds);
      if (m3.vouchers) localStorage.setItem(STORAGE_KEYS.VOUCHERS, m3.vouchers);
      if (m3.limits) localStorage.setItem(STORAGE_KEYS.LIMITS, m3.limits);
      if (m3.blocked) localStorage.setItem(STORAGE_KEYS.BLOCKED, m3.blocked);
      if (m3.forwardSlips) localStorage.setItem(STORAGE_KEYS.FORWARD_SLIPS, m3.forwardSlips);
      if (m3.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, m3.settings);
      if (m3.activeRoundId) localStorage.setItem(STORAGE_KEYS.ACTIVE_ROUND_ID, m3.activeRoundId);
    }

    const m2 = parsed.modules['2d'];
    if (m2) {
      if (m2.rounds) localStorage.setItem(STORAGE_KEYS.ROUNDS_2D, m2.rounds);
      if (m2.vouchers) localStorage.setItem(STORAGE_KEYS.VOUCHERS_2D, m2.vouchers);
      if (m2.limits) localStorage.setItem(STORAGE_KEYS.LIMITS_2D, m2.limits);
      if (m2.blocked) localStorage.setItem(STORAGE_KEYS.BLOCKED_2D, m2.blocked);
      if (m2.forwardSlips) localStorage.setItem(STORAGE_KEYS.FORWARD_SLIPS_2D, m2.forwardSlips);
      if (m2.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS_2D, m2.settings);
      if (m2.activeRoundId) localStorage.setItem(STORAGE_KEYS.ACTIVE_ROUND_ID_2D, m2.activeRoundId);
    }

    const mf = parsed.modules['football'];
    if (mf) {
      if (mf.matches) localStorage.setItem(STORAGE_KEYS.MATCHES_FOOTBALL, mf.matches);
      if (mf.slips) localStorage.setItem(STORAGE_KEYS.SLIPS_FOOTBALL, mf.slips);
      if (mf.forwardSlips) localStorage.setItem(STORAGE_KEYS.FORWARD_SLIPS_FOOTBALL, mf.forwardSlips);
      if (mf.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS_FOOTBALL, mf.settings);
      if (mf.activeDate) localStorage.setItem(STORAGE_KEYS.ACTIVE_DATE_FOOTBALL, mf.activeDate);
    }

    return true;
  } catch (e) {
    console.error('Failed to restore master backup:', e);
    return false;
  }
}
