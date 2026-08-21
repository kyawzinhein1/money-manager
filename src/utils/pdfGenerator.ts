import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Transaction, Language } from '../types';
import { CATEGORY_TRANSLATIONS } from '../translations';
import { getLocalDateStr } from './dateUtils';

interface PDFGeneratorParams {
  transactions: Transaction[];
  incomeTotal: number;
  expenseTotal: number;
  netBalance: number;
  currencySymbol: string;
  language: Language;
  formatAmount: (amount: number) => string;
  dateRangeText?: string;
}

function formatPdfDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

function sanitizeText(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function generateLedgerPDF({
  transactions,
  incomeTotal,
  expenseTotal,
  netBalance,
  currencySymbol: _currencySymbol,
  language,
  formatAmount,
  dateRangeText
}: PDFGeneratorParams): Promise<void> {
  const isMy = language === 'my';

  // Determine computed date range cleanly
  let computedDateRange = dateRangeText;
  if (!computedDateRange || computedDateRange.includes('...')) {
    if (transactions.length > 0) {
      const dates = transactions.map((t) => t.date).filter(Boolean).sort();
      const minDate = dates[0];
      const maxDate = dates[dates.length - 1];
      const formattedMin = formatPdfDate(minDate);
      const formattedMax = formatPdfDate(maxDate);
      computedDateRange = minDate === maxDate ? formattedMin : `${formattedMin} → ${formattedMax}`;
    } else {
      computedDateRange = isMy ? 'အချိန်တိုင်း' : 'All Time';
    }
  } else {
    computedDateRange = computedDateRange.replace(/\b\d{4}-\d{2}-\d{2}\b/g, (match) => formatPdfDate(match));
    if (isMy) {
      computedDateRange = computedDateRange
        .replace(/All Time/gi, 'အချိန်တိုင်း')
        .replace(/From /gi, 'မှ ')
        .replace(/Until /gi, 'ထိ ')
        .replace(/All Months/gi, 'လအားလုံး')
        .replace(/All Years/gi, 'နှစ်အားလုံး');
    }
  }

  // Pagination calculations:
  // Page 1 has header + summary cards + ~14 transactions
  // Subsequent pages have mini-header + ~22 transactions
  const PAGE_1_ROWS = 14;
  const SUBSEQUENT_PAGE_ROWS = 22;

  const pagesData: Transaction[][] = [];
  if (transactions.length === 0) {
    pagesData.push([]);
  } else {
    pagesData.push(transactions.slice(0, PAGE_1_ROWS));
    let startIdx = PAGE_1_ROWS;
    while (startIdx < transactions.length) {
      pagesData.push(transactions.slice(startIdx, startIdx + SUBSEQUENT_PAGE_ROWS));
      startIdx += SUBSEQUENT_PAGE_ROWS;
    }
  }

  const totalPages = pagesData.length;
  const generatedDateStr = new Date().toLocaleDateString(isMy ? 'my-MM' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Create temporary off-screen container for rendering
  const renderContainer = document.createElement('div');
  renderContainer.id = 'pdf-render-container';
  renderContainer.style.position = 'fixed';
  renderContainer.style.top = '0';
  renderContainer.style.left = '-9999px';
  renderContainer.style.width = '794px';
  renderContainer.style.zIndex = '-1000';
  renderContainer.style.opacity = '1';
  renderContainer.style.pointerEvents = 'none';
  renderContainer.style.fontFamily = '"Plus Jakarta Sans", "Noto Sans Myanmar", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  document.body.appendChild(renderContainer);

  const getTranslatedCategory = (cat: string) => {
    if (isMy) {
      return CATEGORY_TRANSLATIONS.my[cat] || cat;
    }
    return CATEGORY_TRANSLATIONS.en[cat] || cat;
  };

  const netIsPositive = netBalance >= 0;
  const formattedNet = (netIsPositive ? '+' : '') + formatAmount(netBalance);
  const formattedIncome = formatAmount(incomeTotal);
  const formattedExpense = formatAmount(expenseTotal);

  try {
    // Construct HTML for all pages with embedded style guaranteeing Plus Jakarta Sans
    let fullHtml = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Noto+Sans+Myanmar:wght@400;500;700&display=swap');
        
        #pdf-render-container, #pdf-render-container * {
          font-family: "Plus Jakarta Sans", "Noto Sans Myanmar", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
          text-rendering: geometricPrecision !important;
        }
      </style>
    `;

    pagesData.forEach((pageTxList, pageIndex) => {
      const isFirstPage = pageIndex === 0;
      const pageNum = pageIndex + 1;

      fullHtml += `
        <div class="pdf-page" style="
          width: 794px;
          height: 1123px;
          box-sizing: border-box;
          padding: 38px 42px 36px 42px;
          background: #ffffff;
          color: #0f172a;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-family: 'Plus Jakarta Sans', 'Noto Sans Myanmar', -apple-system, BlinkMacSystemFont, sans-serif;
          overflow: hidden;
        ">
          <!-- Top Accent Bar -->
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 6px; background: #007aff;"></div>

          <div style="flex: 1; display: flex; flex-direction: column;">
            <!-- Header Section -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 14px; border-bottom: 1.5px solid #e2e8f0;">
              <div>
                <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; line-height: 1.2; font-family: 'Plus Jakarta Sans', 'Noto Sans Myanmar', sans-serif;">
                  ${isFirstPage
                    ? (isMy ? 'ဘဏ္ဍာရေး အစီရင်ခံစာ မှတ်တမ်း' : 'FINANCIAL STATEMENT REPORT')
                    : (isMy ? `ဘဏ္ဍာရေး အစီရင်ခံစာ (စာမျက်နှာ ${pageNum})` : `FINANCIAL STATEMENT (Page ${pageNum})`)}
                </h1>
                <div style="margin-top: 5px; font-size: 11px; color: #64748b; font-weight: 500; font-family: 'Plus Jakarta Sans', 'Noto Sans Myanmar', sans-serif;">
                  <span>${isMy ? 'ထုတ်ယူသည့် ရက်စွဲ' : 'Generated'}: <strong style="font-weight: 700; color: #334155;">${generatedDateStr}</strong></span>
                  <span style="margin: 0 8px; color: #cbd5e1;">•</span>
                  <span>${isMy ? 'ကာလအပိုင်းအခြား' : 'Period'}: <strong style="font-weight: 700; color: #334155;">${sanitizeText(computedDateRange)}</strong></span>
                </div>
              </div>

              <!-- Brand Pill Badge -->
              <div style="
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 6px 14px;
                text-align: right;
                display: flex;
                align-items: center;
                gap: 6px;
              ">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #007aff; display: inline-block;"></span>
                <span style="font-size: 11px; font-weight: 800; color: #007aff; letter-spacing: 0.05em; font-family: 'Plus Jakarta Sans', sans-serif;">MONEY MANAGER</span>
              </div>
            </div>

            ${isFirstPage ? `
              <!-- Executive Summary Section (Page 1 Only) -->
              <div style="margin-top: 16px;">
                <div style="font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.04em; font-family: 'Plus Jakarta Sans', 'Noto Sans Myanmar', sans-serif;">
                  ${isMy ? 'ဘဏ္ဍာရေး အနှစ်ချုပ် အကျဉ်း' : 'Executive Financial Summary'}
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                  <!-- Card 1: Net Cash Flow -->
                  <div style="
                    background: #f8fafc;
                    border: 1.5px solid ${netIsPositive ? '#10b981' : '#ef4444'};
                    border-radius: 12px;
                    padding: 12px 14px;
                  ">
                    <div style="font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 4px; text-transform: uppercase; font-family: 'Plus Jakarta Sans', 'Noto Sans Myanmar', sans-serif;">
                      ${isMy ? 'အသားတင် စုဆောင်းငွေ' : 'Net Cash Flow'}
                    </div>
                    <div style="font-size: 16px; font-weight: 800; color: ${netIsPositive ? '#10b981' : '#ef4444'}; line-height: 1.2; font-family: 'Plus Jakarta Sans', sans-serif;">
                      ${sanitizeText(formattedNet)}
                    </div>
                  </div>

                  <!-- Card 2: Total Revenue -->
                  <div style="
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 12px 14px;
                  ">
                    <div style="font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 4px; text-transform: uppercase; font-family: 'Plus Jakarta Sans', 'Noto Sans Myanmar', sans-serif;">
                      ${isMy ? 'စုစုပေါင်း ဝင်ငွေ' : 'Total Revenue'}
                    </div>
                    <div style="font-size: 16px; font-weight: 800; color: #10b981; line-height: 1.2; font-family: 'Plus Jakarta Sans', sans-serif;">
                      ${sanitizeText(formattedIncome)}
                    </div>
                  </div>

                  <!-- Card 3: Total Expenses -->
                  <div style="
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 12px 14px;
                  ">
                    <div style="font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 4px; text-transform: uppercase; font-family: 'Plus Jakarta Sans', 'Noto Sans Myanmar', sans-serif;">
                      ${isMy ? 'စုစုပေါင်း အသုံးစရိတ်' : 'Total Expenses'}
                    </div>
                    <div style="font-size: 16px; font-weight: 800; color: #ef4444; line-height: 1.2; font-family: 'Plus Jakarta Sans', sans-serif;">
                      ${sanitizeText(formattedExpense)}
                    </div>
                  </div>
                </div>
              </div>
            ` : ''}

            <!-- Transaction Table Section -->
            <div style="margin-top: ${isFirstPage ? '18px' : '14px'}; flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="font-size: 12px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.04em; font-family: 'Plus Jakarta Sans', 'Noto Sans Myanmar', sans-serif;">
                  ${isMy
                    ? `မှတ်တမ်း အသေးစိတ် (${transactions.length} ခု)`
                    : `Transaction Logs (${transactions.length} ${transactions.length === 1 ? 'entry' : 'entries'})`}
                </div>
                ${!isFirstPage ? `
                  <div style="font-size: 10.5px; color: #64748b; font-weight: 600; font-family: 'Plus Jakarta Sans', 'Noto Sans Myanmar', sans-serif;">
                    ${isMy ? `စာမျက်နှာ ${pageNum} မှ ${totalPages}` : `Page ${pageNum} of ${totalPages}`}
                  </div>
                ` : ''}
              </div>

              <!-- Table Grid -->
              <div style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left; font-family: 'Plus Jakarta Sans', 'Noto Sans Myanmar', sans-serif;">
                  <thead>
                    <tr style="background: #1e293b; color: #ffffff; font-weight: 700; font-size: 10.5px;">
                      <th style="padding: 7px 10px; width: 85px;">${isMy ? 'ရက်စွဲ' : 'DATE'}</th>
                      <th style="padding: 7px 10px; width: 65px;">${isMy ? 'အမျိုးအစား' : 'TYPE'}</th>
                      <th style="padding: 7px 10px; width: 140px;">${isMy ? 'ကဏ္ဍ' : 'CATEGORY'}</th>
                      <th style="padding: 7px 10px;">${isMy ? 'အကြောင်းအရာ' : 'DESCRIPTION'}</th>
                      <th style="padding: 7px 10px; width: 110px; text-align: right;">${isMy ? 'ပမာဏ' : 'AMOUNT'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${pageTxList.length === 0 ? `
                      <tr>
                        <td colspan="5" style="padding: 24px; text-align: center; color: #64748b; font-size: 12px;">
                          ${isMy ? 'ရွေးချယ်ထားသော ကာလအတွင်း မှတ်တမ်းများ မရှိသေးပါ။' : 'No transaction records found for the selected period.'}
                        </td>
                      </tr>
                    ` : pageTxList.map((tx, idx) => {
                      const isIncome = tx.type === 'income';
                      const formattedDate = formatPdfDate(tx.date);
                      const displayCat = getTranslatedCategory(tx.category);
                      const displayDesc = tx.description ? tx.description : displayCat;
                      const amtStr = (isIncome ? '+' : '-') + formatAmount(tx.amount);
                      const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';

                      return `
                        <tr style="background: ${rowBg}; border-top: 1px solid #e2e8f0;">
                          <td style="padding: 6px 10px; color: #334155; font-weight: 600; white-space: nowrap;">
                            ${sanitizeText(formattedDate)}
                          </td>
                          <td style="padding: 6px 10px;">
                            <span style="
                              display: inline-block;
                              padding: 2px 6px;
                              border-radius: 4px;
                              font-size: 9.5px;
                              font-weight: 700;
                              background: ${isIncome ? '#ecfdf5' : '#fef2f2'};
                              color: ${isIncome ? '#059669' : '#dc2626'};
                              border: 0.5px solid ${isIncome ? '#a7f3d0' : '#fecaca'};
                            ">
                              ${isIncome ? (isMy ? 'ဝင်ငွေ' : 'INCOME') : (isMy ? 'ထွက်ငွေ' : 'EXPENSE')}
                            </span>
                          </td>
                          <td style="padding: 6px 10px; color: #0f172a; font-weight: 600;">
                            ${sanitizeText(displayCat)}
                          </td>
                          <td style="padding: 6px 10px; color: #475569; font-weight: 400; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${sanitizeText(displayDesc)}
                          </td>
                          <td style="padding: 6px 10px; text-align: right; font-weight: 700; color: ${isIncome ? '#059669' : '#dc2626'}; white-space: nowrap;">
                            ${sanitizeText(amtStr)}
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Footer Section -->
          <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b; font-family: 'Plus Jakarta Sans', 'Noto Sans Myanmar', sans-serif;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-weight: 700; color: #0f172a;">Personal Money Manager</span>
              <span>•</span>
              <span>${isMy ? 'တရားဝင် ဘဏ္ဍာရေး အစီရင်ခံစာ မှတ်တမ်း' : 'Official Financial Statement'}</span>
            </div>
            <div style="font-weight: 700; color: #334155;">
              ${isMy ? `စာမျက်နှာ ${pageNum} / ${totalPages}` : `Page ${pageNum} of ${totalPages}`}
            </div>
          </div>
        </div>
      `;
    });

    renderContainer.innerHTML = fullHtml;

    // Wait for web fonts (Plus Jakarta Sans & Noto Sans Myanmar) to be loaded and rasterized
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
      try {
        await Promise.all([
          document.fonts.load('400 12px "Plus Jakarta Sans"'),
          document.fonts.load('600 12px "Plus Jakarta Sans"'),
          document.fonts.load('700 14px "Plus Jakarta Sans"'),
          document.fonts.load('800 20px "Plus Jakarta Sans"')
        ]);
      } catch {
        // Fallback gracefully if already cached
      }
    }
    // Brief layout settle delay for crystal clear font metrics rendering
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Initialize jsPDF (A4, portrait, mm)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageElements = renderContainer.querySelectorAll<HTMLElement>('.pdf-page');

    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i];

      const canvas = await html2canvas(pageEl, {
        scale: 2.5, // 2.5x high-DPI scaling for sharp typography
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Use lossless PNG to avoid JPEG compression blur on text
      const imgData = canvas.toDataURL('image/png');

      if (i > 0) {
        doc.addPage('a4', 'portrait');
      }

      // A4 dimensions: 210mm x 297mm
      doc.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
    }

    const fileDate = getLocalDateStr();
    const fileName = isMy ? `Financial_Statement_${fileDate}.pdf` : `Ledger_Report_${fileDate}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('High-fidelity PDF generation encountered an error, falling back to direct canvas renderer:', error);

    // Fallback: simple jsPDF generation in case of unforeseen canvas render issue
    const fallbackDoc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    fallbackDoc.setFont('helvetica', 'bold');
    fallbackDoc.setFontSize(16);
    fallbackDoc.text(isMy ? 'FINANCIAL STATEMENT (MYANMAR)' : 'FINANCIAL STATEMENT REPORT', 15, 20);

    fallbackDoc.setFont('helvetica', 'normal');
    fallbackDoc.setFontSize(10);
    fallbackDoc.text(`Period: ${computedDateRange}`, 15, 28);
    fallbackDoc.text(`Total Income: ${formatAmount(incomeTotal)}`, 15, 36);
    fallbackDoc.text(`Total Expense: ${formatAmount(expenseTotal)}`, 15, 42);
    fallbackDoc.text(`Net Cash Flow: ${formatAmount(netBalance)}`, 15, 48);

    const fileDate = getLocalDateStr();
    fallbackDoc.save(`Ledger_Report_${fileDate}.pdf`);
  } finally {
    // Clean up DOM node
    if (renderContainer.parentNode) {
      renderContainer.parentNode.removeChild(renderContainer);
    }
  }
}
