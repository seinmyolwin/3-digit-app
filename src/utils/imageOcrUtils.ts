import { BetItem } from '../types';
import { getPermutations, convertMyanmarToEnglishDigits } from './lotteryUtils';

export interface ExtractedBetRow {
  id: string;
  number: string;
  amount: number;
  isRumble: boolean;
  originalRaw: string;
  isValid: boolean;
  errorMessage?: string;
}

export interface ParseImageResult {
  customerName: string;
  customerPhone: string;
  extractedItems: ExtractedBetRow[];
  totalAmount: number;
  rawText: string;
  warnings: string[];
}

/**
 * Filter and enhance an image canvas for optimal OCR accuracy.
 * Enhances contrast, converts to grayscale, and thresholds text.
 */
export function preprocessCanvas(
  sourceCanvas: HTMLCanvasElement,
  options: { contrast: number; brightness: number; threshold: boolean; grayscale: boolean }
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return sourceCanvas;

  ctx.drawImage(sourceCanvas, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  const contrastFactor = (259 * (options.contrast + 255)) / (255 * (259 - options.contrast));
  const brightnessOffset = options.brightness;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Grayscale
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;

    // Brightness & Contrast
    gray = contrastFactor * (gray - 128) + 128 + brightnessOffset;
    gray = Math.min(255, Math.max(0, gray));

    if (options.threshold) {
      // Adaptive binary threshold
      gray = gray > 140 ? 255 : 0;
    }

    if (options.grayscale || options.threshold) {
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    } else {
      data[i] = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128 + brightnessOffset));
      data[i + 1] = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128 + brightnessOffset));
      data[i + 2] = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128 + brightnessOffset));
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Parse extracted OCR raw text into structured lottery rows, customer name, and phone.
 * Supports:
 * - Myanmar numerals (၀-၉) and English digits (0-9)
 * - Separators: =, -, :, /, spaces, tabs, *, x
 * - Permutations / R: 123R=1000, 123 R 500, 123ပတ် 1000, 123ခွေ=500
 * - Customer Name and Phone line detection
 */
export function parseSlipImageText(rawText: string): ParseImageResult {
  const warnings: string[] = [];
  const extractedItems: ExtractedBetRow[] = [];
  let customerName = '';
  let customerPhone = '';

  if (!rawText || !rawText.trim()) {
    return {
      customerName: '',
      customerPhone: '',
      extractedItems: [],
      totalAmount: 0,
      rawText: '',
      warnings: ['စာသား ဖတ်မရပါ သို့မဟုတ် ပုံရိပ် မရှင်းလင်းပါ']
    };
  }

  const rawLines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  let idCounter = 1;

  for (let lineIndex = 0; lineIndex < rawLines.length; lineIndex++) {
    const rawLine = rawLines[lineIndex];

    // 1. Detect Customer Name keywords
    const nameMatch = rawLine.match(/(?:နာမည်|ဝယ်သူ|ထိုးသူ|အမည်|name|customer|cust)\s*[:=\-]\s*([^\d\n]+)/i);
    if (nameMatch && nameMatch[1] && !customerName) {
      customerName = nameMatch[1].trim();
      continue;
    }

    // 2. Detect Customer Phone keywords
    const phoneMatch = rawLine.match(/(?:ဖုန်း|phone|ph|tel)\s*[:=\-]?\s*([0-9\-\+\s]{9,15})/i) ||
                       rawLine.match(/((?:09|\+959|959)[0-9\-\s]{7,12})/);
    if (phoneMatch && phoneMatch[1] && !customerPhone) {
      customerPhone = phoneMatch[1].replace(/[^0-9+]/g, '').trim();
      continue;
    }

    // If first line has no numbers and looks like a name (e.g. "Ko Aung Kyaw" or "မသီတာ")
    if (lineIndex === 0 && !customerName && !/\d/.test(rawLine) && rawLine.length > 2 && rawLine.length < 30) {
      customerName = rawLine;
      continue;
    }

    // 3. Normalize digits from Myanmar to English
    const convertedLine = convertMyanmarToEnglishDigits(rawLine);

    // Clean common OCR noise (e.g. replace 'O' or 'o' with '0' if surrounded by numbers, 'l' or 'I' with '1')
    const cleanedLine = convertedLine
      .replace(/([0-9])([oO])([0-9])/g, '$10$3')
      .replace(/([0-9])([lI])([0-9])/g, '$11$3')
      .replace(/[|]/g, ' ')
      .trim();

    // Check for R/Rumble patterns: "123R=1000", "123 R 500", "123r1000", "123ပတ် 1000", "123ခွေ=1000"
    const rRegex = /([0-9]{3})\s*(?:r|R|ပတ်|ခွေ|ပတ်လည်)\s*[=:\-_/]?\s*([0-9]+)/i;
    const rMatch = cleanedLine.match(rRegex);

    if (rMatch) {
      const baseNum = rMatch[1];
      const amount = parseInt(rMatch[2], 10);
      if (amount > 0) {
        const perms = getPermutations(baseNum);
        perms.forEach((p, idx) => {
          extractedItems.push({
            id: `scan-${Date.now()}-${idCounter++}`,
            number: p,
            amount: amount,
            isRumble: true,
            originalRaw: `${baseNum} R (${perms.length} ခွေ - ${idx + 1})`,
            isValid: true
          });
        });
        continue;
      }
    }

    // Check multiple numbers pattern on same line: e.g. "123, 456, 789 = 1000" or "123 456 789 - 500"
    const multiMatch = cleanedLine.match(/^([0-9]{3}(?:[\s,;/]+[0-9]{3})+)\s*[=:\-_/]\s*([0-9]+)$/);
    if (multiMatch) {
      const nums = multiMatch[1].split(/[\s,;/]+/).filter(s => s.length === 3);
      const amt = parseInt(multiMatch[2], 10);
      if (amt > 0 && nums.length > 0) {
        nums.forEach(n => {
          extractedItems.push({
            id: `scan-${Date.now()}-${idCounter++}`,
            number: n,
            amount: amt,
            isRumble: false,
            originalRaw: `${n} (${amt})`,
            isValid: true
          });
        });
        continue;
      }
    }

    // Standard pattern matching for number and amount pairs
    // Formats: "123=1000", "123-500", "123 1000", "123:5000", "123/1000", "123*500", "123x1000"
    const standardRegex = /([0-9]{3})\s*[=:\-_/*x\s]\s*([0-9]{2,8})/g;
    let match: RegExpExecArray | null;
    let foundInLine = false;

    while ((match = standardRegex.exec(cleanedLine)) !== null) {
      foundInLine = true;
      const num = match[1];
      const amt = parseInt(match[2], 10);

      if (num.length === 3 && amt > 0) {
        extractedItems.push({
          id: `scan-${Date.now()}-${idCounter++}`,
          number: num,
          amount: amt,
          isRumble: false,
          originalRaw: match[0],
          isValid: true
        });
      }
    }

    // If no regex match but line has 3 digits followed by space and numbers
    if (!foundInLine) {
      const tokens = cleanedLine.replace(/[^0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
      if (tokens.length >= 2) {
        const first = tokens[0];
        const second = tokens[1];
        if (first.length === 3 && second.length >= 2) {
          const amt = parseInt(second, 10);
          if (amt > 0) {
            extractedItems.push({
              id: `scan-${Date.now()}-${idCounter++}`,
              number: first,
              amount: amt,
              isRumble: false,
              originalRaw: `${first}=${amt}`,
              isValid: true
            });
            foundInLine = true;
          }
        }
      }
    }

    if (!foundInLine && /\d/.test(cleanedLine)) {
      warnings.push(`ဖတ်မရသော အကြောင်းအရာ: "${rawLine}"`);
    }
  }

  const totalAmount = extractedItems.reduce((acc, it) => acc + (it.isValid ? it.amount : 0), 0);

  return {
    customerName: customerName || 'အထွေထွေ (Photo Entry)',
    customerPhone,
    extractedItems,
    totalAmount,
    rawText,
    warnings
  };
}

/**
 * Perform offline OCR using Tesseract.js
 */
export async function performOfflineOCR(
  canvas: HTMLCanvasElement,
  onProgress?: (progress: number, statusText: string) => void
): Promise<string> {
  const { createWorker } = await import('tesseract.js');

  onProgress?.(10, 'OCR Engine စတင်နေပါသည် (Initializing Offline OCR)...');

  const worker = await createWorker('eng+mya', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        const pct = Math.round((m.progress || 0) * 100);
        onProgress?.(20 + Math.round(pct * 0.75), `ဂဏန်းစာရင်း ဖတ်ယူနေပါသည်... (${pct}%)`);
      }
    }
  });

  try {
    onProgress?.(30, 'ပုံရိပ်အား စစ်ဆေးဖတ်ယူနေပါသည် (Recognizing Digits & Text)...');
    const ret = await worker.recognize(canvas);
    await worker.terminate();
    onProgress?.(100, 'ဖတ်ယူမှု ပြီးစီးပါပြီ (Done)');
    return ret.data.text;
  } catch (err) {
    try {
      await worker.terminate();
    } catch {
      // ignore
    }
    throw err;
  }
}
