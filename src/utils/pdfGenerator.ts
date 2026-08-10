import { jsPDF } from 'jspdf';
import { Transaction, Language } from '../types';
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

export function generateLedgerPDF({
  transactions,
  incomeTotal,
  expenseTotal,
  netBalance,
  currencySymbol,
  language,
  formatAmount,
  dateRangeText
}: PDFGeneratorParams) {
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
      computedDateRange = language === 'my' ? 'အချိန်တိုင်း' : 'All Time';
    }
  } else {
    // Format any raw YYYY-MM-DD occurrences in passed dateRangeText to DD/MM/YYYY
    computedDateRange = computedDateRange.replace(/\b\d{4}-\d{2}-\d{2}\b/g, (match) => formatPdfDate(match));
  }

  // Initialize jsPDF (A4, portrait, mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Colors (RGB)
  const colors = {
    primary: { r: 0, g: 122, b: 255 },       // #007aff (Apple / Modern Blue)
    navy: { r: 15, g: 23, b: 42 },            // #0f172a (Slate 900)
    dark: { r: 30, g: 41, b: 59 },            // #1e293b (Slate 800)
    lightBg: { r: 248, g: 250, b: 252 },      // #f8fafc (Slate 50)
    cardBg: { r: 241, g: 245, b: 249 },       // #f1f5f9 (Slate 100)
    success: { r: 16, g: 185, b: 129 },       // #10b981 (Emerald 500)
    danger: { r: 239, g: 68, b: 68 },         // #ef4444 (Red 500)
    border: { r: 226, g: 232, b: 240 },      // #e2e8f0 (Slate 200)
    textGray: { r: 100, g: 116, b: 139 }     // #64748b (Slate 500)
  };

  let currentPage = 1;

  // Header & Footer drawing function
  const drawHeaderAndFooter = (pageNumber: number) => {
    // Top primary accent line
    doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.rect(0, 0, pageWidth, 3.5, 'F');

    // Title Block
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(colors.navy.r, colors.navy.g, colors.navy.b);
    doc.text('FINANCIAL STATEMENT REPORT', margin, 17);

    // Subtitle with Period only (No duplicate blue date range text)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(colors.textGray.r, colors.textGray.g, colors.textGray.b);
    const generatedDateStr = new Date().toLocaleString(language === 'my' ? 'my-MM' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generated: ${generatedDateStr}   •   Period: ${computedDateRange}`, margin, 23);

    // Decorative right-side app badge
    doc.setFillColor(colors.lightBg.r, colors.lightBg.g, colors.lightBg.b);
    doc.roundedRect(pageWidth - margin - 38, 11, 38, 8, 2, 2, 'F');
    doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
    doc.setLineWidth(0.2);
    doc.roundedRect(pageWidth - margin - 38, 11, 38, 8, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.text('MONEY MANAGER', pageWidth - margin - 34, 16.2);

    // Top Header separator rule
    doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
    doc.setLineWidth(0.25);
    doc.line(margin, 27, pageWidth - margin, 27);

    // Footer rule & text
    doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colors.textGray.r, colors.textGray.g, colors.textGray.b);
    doc.text('Personal Money Manager • Official Financial Statement', margin, pageHeight - 9);
    doc.text(`Page ${pageNumber}`, pageWidth - margin - 12, pageHeight - 9);
  };

  // Draw initial page decoration
  drawHeaderAndFooter(currentPage);

  // Executive Summary Section
  let currentY = 33;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(colors.navy.r, colors.navy.g, colors.navy.b);
  doc.text('EXECUTIVE FINANCIAL SUMMARY', margin, currentY);

  currentY += 4;

  // Draw 3 Summary columns/cards side-by-side
  const cardWidth = (contentWidth - 8) / 3; // 3 equal cards with 4mm spacing
  const cardHeight = 22;

  // Card 1: Net Cash Flow
  const netIsPositive = netBalance >= 0;
  doc.setFillColor(colors.lightBg.r, colors.lightBg.g, colors.lightBg.b);
  doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2.5, 2.5, 'F');
  
  // Card border highlight based on balance status
  doc.setDrawColor(netIsPositive ? colors.success.r : colors.danger.r, netIsPositive ? colors.success.g : colors.danger.g, netIsPositive ? colors.success.b : colors.danger.b);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2.5, 2.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(colors.textGray.r, colors.textGray.g, colors.textGray.b);
  doc.text('NET CASH FLOW', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(netIsPositive ? colors.success.r : colors.danger.r, netIsPositive ? colors.success.g : colors.danger.g, netIsPositive ? colors.success.b : colors.danger.b);
  const formattedNet = (netIsPositive ? '+' : '') + formatAmount(netBalance);
  const netText = formattedNet.length > 18 ? formattedNet.slice(0, 16) + '...' : formattedNet;
  doc.text(netText, margin + 4, currentY + 14);

  // Card 2: Total Revenue / Income
  const card2X = margin + cardWidth + 4;
  doc.setFillColor(colors.lightBg.r, colors.lightBg.g, colors.lightBg.b);
  doc.roundedRect(card2X, currentY, cardWidth, cardHeight, 2.5, 2.5, 'F');
  doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  doc.setLineWidth(0.2);
  doc.roundedRect(card2X, currentY, cardWidth, cardHeight, 2.5, 2.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(colors.textGray.r, colors.textGray.g, colors.textGray.b);
  doc.text('TOTAL REVENUE', card2X + 4, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(colors.success.r, colors.success.g, colors.success.b);
  const formattedIncome = formatAmount(incomeTotal);
  const incomeText = formattedIncome.length > 18 ? formattedIncome.slice(0, 16) + '...' : formattedIncome;
  doc.text(incomeText, card2X + 4, currentY + 14);

  // Card 3: Total Expenses
  const card3X = margin + (cardWidth * 2) + 8;
  doc.setFillColor(colors.lightBg.r, colors.lightBg.g, colors.lightBg.b);
  doc.roundedRect(card3X, currentY, cardWidth, cardHeight, 2.5, 2.5, 'F');
  doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  doc.setLineWidth(0.2);
  doc.roundedRect(card3X, currentY, cardWidth, cardHeight, 2.5, 2.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(colors.textGray.r, colors.textGray.g, colors.textGray.b);
  doc.text('TOTAL EXPENSES', card3X + 4, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(colors.danger.r, colors.danger.g, colors.danger.b);
  const formattedExpense = formatAmount(expenseTotal);
  const expenseText = formattedExpense.length > 18 ? formattedExpense.slice(0, 16) + '...' : formattedExpense;
  doc.text(expenseText, card3X + 4, currentY + 14);

  currentY += cardHeight + 9;

  // List section header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(colors.navy.r, colors.navy.g, colors.navy.b);
  doc.text(`TRANSACTION LOGS (${transactions.length} ${transactions.length === 1 ? 'entry' : 'entries'})`, margin, currentY);
  currentY += 4;

  // Table header setup (Total width = 180mm)
  const colWidths = {
    date: 26,
    type: 20,
    category: 36,
    description: 63,
    amount: 35
  };

  const colPositions = {
    date: margin,
    type: margin + colWidths.date,
    category: margin + colWidths.date + colWidths.type,
    description: margin + colWidths.date + colWidths.type + colWidths.category,
    amount: margin + colWidths.date + colWidths.type + colWidths.category + colWidths.description
  };

  const drawTableHeader = (y: number) => {
    // Header Bar Background
    doc.setFillColor(colors.dark.r, colors.dark.g, colors.dark.b);
    doc.rect(margin, y, contentWidth, 7.5, 'F');

    // Headers Text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);

    doc.text('DATE', colPositions.date + 2, y + 5);
    doc.text('TYPE', colPositions.type + 2, y + 5);
    doc.text('CATEGORY', colPositions.category + 2, y + 5);
    doc.text('DESCRIPTION', colPositions.description + 2, y + 5);
    doc.text('AMOUNT', colPositions.amount + colWidths.amount - 2, y + 5, { align: 'right' });
  };

  drawTableHeader(currentY);
  currentY += 7.5;

  if (transactions.length === 0) {
    doc.setFillColor(colors.lightBg.r, colors.lightBg.g, colors.lightBg.b);
    doc.rect(margin, currentY, contentWidth, 12, 'F');
    doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
    doc.setLineWidth(0.2);
    doc.rect(margin, currentY, contentWidth, 12, 'D');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(colors.textGray.r, colors.textGray.g, colors.textGray.b);
    doc.text('No transaction records found for the selected period.', margin + (contentWidth / 2), currentY + 7.5, { align: 'center' });
  } else {
    // Draw transaction list
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    transactions.forEach((tx, idx) => {
      // If we exceed printable height, add page and wrap
      if (currentY > pageHeight - 22) {
        doc.addPage();
        currentPage += 1;
        drawHeaderAndFooter(currentPage);
        currentY = 32; // Start table below header on subsequent pages
        drawTableHeader(currentY);
        currentY += 7.5;
      }

      // Zebra striping
      const isEven = idx % 2 === 0;
      if (isEven) {
        doc.setFillColor(colors.lightBg.r, colors.lightBg.g, colors.lightBg.b);
        doc.rect(margin, currentY, contentWidth, 7, 'F');
      }

      // Bottom row separator
      doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
      doc.setLineWidth(0.15);
      doc.line(margin, currentY + 7, pageWidth - margin, currentY + 7);

      // Content mapping
      doc.setTextColor(colors.navy.r, colors.navy.g, colors.navy.b);
      doc.setFont('helvetica', 'normal');

      // Date (dd/mm/yyyy formatting from yyyy-mm-dd)
      let displayDate = tx.date;
      const parts = tx.date.split('-');
      if (parts.length === 3) {
        displayDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      doc.text(displayDate, colPositions.date + 2, currentY + 4.8);

      // Type text
      const isIncome = tx.type === 'income';
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(isIncome ? colors.success.r : colors.danger.r, isIncome ? colors.success.g : colors.danger.g, isIncome ? colors.success.b : colors.danger.b);
      doc.text(tx.type.toUpperCase(), colPositions.type + 2, currentY + 4.8);

      // Category
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.navy.r, colors.navy.g, colors.navy.b);
      const cleanCat = tx.category.length > 18 ? tx.category.slice(0, 16) + '...' : tx.category;
      doc.text(cleanCat, colPositions.category + 2, currentY + 4.8);

      // Description (Truncate if excessively long)
      const rawDesc = tx.description || tx.category;
      const cleanDesc = rawDesc.length > 35 ? rawDesc.slice(0, 32) + '...' : rawDesc;
      doc.text(cleanDesc, colPositions.description + 2, currentY + 4.8);

      // Amount
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(isIncome ? colors.success.r : colors.danger.r, isIncome ? colors.success.g : colors.danger.g, isIncome ? colors.success.b : colors.danger.b);
      const amtStr = (isIncome ? '+' : '-') + formatAmount(tx.amount);
      doc.text(amtStr, colPositions.amount + colWidths.amount - 2, currentY + 4.8, { align: 'right' });

      currentY += 7;
    });
  }

  // Save the PDF locally
  const fileDate = getLocalDateStr();
  doc.save(`Ledger_Report_${fileDate}.pdf`);
}
