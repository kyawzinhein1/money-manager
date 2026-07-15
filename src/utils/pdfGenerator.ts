import { jsPDF } from 'jspdf';
import { Transaction, Language } from '../types';

interface PDFGeneratorParams {
  transactions: Transaction[];
  incomeTotal: number;
  expenseTotal: number;
  netBalance: number;
  currencySymbol: string;
  language: Language;
  formatAmount: (amount: number) => string;
}

export function generateLedgerPDF({
  transactions,
  incomeTotal,
  expenseTotal,
  netBalance,
  currencySymbol,
  language,
  formatAmount
}: PDFGeneratorParams) {
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
    primary: { r: 0, g: 122, b: 255 },       // #007aff (Apple Blue)
    dark: { r: 28, g: 28, b: 30 },            // #1c1c1e
    lightBg: { r: 242, g: 242, b: 247 },      // #f2f2f7
    success: { r: 52, g: 199, b: 89 },       // #34c759 (Apple Green)
    danger: { r: 255, g: 59, b: 48 },        // #ff3b30 (Apple Red)
    border: { r: 229, g: 229, b: 234 },      // #e5e5ea
    textGray: { r: 142, g: 142, b: 147 }     // #8e8e93
  };

  // Helper to draw horizontal line
  const drawLine = (y: number) => {
    doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
  };

  let currentPage = 1;

  // Header drawing function
  const drawHeaderAndFooter = (pageNumber: number) => {
    // Top primary accent bar
    doc.setFillColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.rect(0, 0, pageWidth, 4, 'F');

    // Title Block
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    doc.text('FINANCIAL STATEMENT REPORT', margin, 18);

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(colors.textGray.r, colors.textGray.g, colors.textGray.b);
    const dateStr = new Date().toLocaleString(language === 'my' ? 'my-MM' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generated on: ${dateStr} | Ledger Summary Statement`, margin, 24);

    // Decorative right-side tag
    doc.setFillColor(colors.lightBg.r, colors.lightBg.g, colors.lightBg.b);
    doc.roundedRect(pageWidth - margin - 35, 12, 35, 8, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(colors.primary.r, colors.primary.g, colors.primary.b);
    doc.text('MONEY MANAGER', pageWidth - margin - 30, 17.5);

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colors.textGray.r, colors.textGray.g, colors.textGray.b);
    doc.text('This statement represents personal ledger cashflows. Keep your spending safe.', margin, pageHeight - 10);
    doc.text(`Page ${pageNumber}`, pageWidth - margin - 15, pageHeight - 10);
  };

  // Draw initial page decoration
  drawHeaderAndFooter(currentPage);

  // Executive Summary Card Blocks
  let currentY = 32;

  // Title for Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  doc.text('EXECUTIVE FINANCIAL ANALYSIS', margin, currentY);
  currentY += 4;

  // Draw 3 Summary columns/cards side-by-side
  const cardWidth = (contentWidth - 8) / 3; // 3 equal cards with 4mm spacing
  const cardHeight = 22;

  // Card 1: Filtered Net Balance
  const netIsPositive = netBalance >= 0;
  doc.setFillColor(colors.lightBg.r, colors.lightBg.g, colors.lightBg.b);
  doc.roundedRect(margin, currentY, cardWidth, cardHeight, 3, 3, 'F');
  
  // Card border highlight based on balance health
  doc.setDrawColor(netIsPositive ? colors.success.r : colors.danger.r, netIsPositive ? colors.success.g : colors.danger.g, netIsPositive ? colors.success.b : colors.danger.b);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, currentY, cardWidth, cardHeight, 3, 3, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(colors.textGray.r, colors.textGray.g, colors.textGray.b);
  doc.text('NET CASH FLOW', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(netIsPositive ? colors.success.r : colors.danger.r, netIsPositive ? colors.success.g : colors.danger.g, netIsPositive ? colors.success.b : colors.danger.b);
  const formattedNet = (netIsPositive ? '+' : '') + formatAmount(netBalance);
  // Truncate if too long to prevent card spill
  const netText = formattedNet.length > 18 ? formattedNet.slice(0, 16) + '...' : formattedNet;
  doc.text(netText, margin + 4, currentY + 14);

  // Card 2: Total Income
  const card2X = margin + cardWidth + 4;
  doc.setFillColor(colors.lightBg.r, colors.lightBg.g, colors.lightBg.b);
  doc.roundedRect(card2X, currentY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  doc.setLineWidth(0.2);
  doc.roundedRect(card2X, currentY, cardWidth, cardHeight, 3, 3, 'D');

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

  // Card 3: Total Expense
  const card3X = margin + (cardWidth * 2) + 8;
  doc.setFillColor(colors.lightBg.r, colors.lightBg.g, colors.lightBg.b);
  doc.roundedRect(card3X, currentY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
  doc.roundedRect(card3X, currentY, cardWidth, cardHeight, 3, 3, 'D');

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

  currentY += cardHeight + 10;

  // List section header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
  doc.text(`ITEMIZED ENTRIES (${transactions.length} records)`, margin, currentY);
  currentY += 4;

  // Table header setup
  const colWidths = {
    date: 24,
    type: 18,
    category: 35,
    description: 68,
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
    doc.rect(margin, y, contentWidth, 8, 'F');

    // Headers Text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);

    doc.text('DATE', colPositions.date + 2, y + 5.5);
    doc.text('TYPE', colPositions.type + 2, y + 5.5);
    doc.text('CATEGORY', colPositions.category + 2, y + 5.5);
    doc.text('DESCRIPTION', colPositions.description + 2, y + 5.5);
    doc.text('AMOUNT', colPositions.amount + colWidths.amount - 2, y + 5.5, { align: 'right' });
  };

  drawTableHeader(currentY);
  currentY += 8;

  // Draw transaction list
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  transactions.forEach((tx, idx) => {
    // If we exceed printable height, add page and wrap
    if (currentY > pageHeight - 25) {
      doc.addPage();
      currentPage += 1;
      drawHeaderAndFooter(currentPage);
      currentY = 22; // Start table close to top on subsequent pages
      drawTableHeader(currentY);
      currentY += 8;
    }

    // Zebra striping
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(colors.lightBg.r, colors.lightBg.g, colors.lightBg.b);
      doc.rect(margin, currentY, contentWidth, 7.5, 'F');
    }

    // Bottom row separator
    doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
    doc.setLineWidth(0.15);
    doc.line(margin, currentY + 7.5, pageWidth - margin, currentY + 7.5);

    // Content mapping
    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    doc.setFont('helvetica', 'normal');

    // Date (dd/mm/yyyy formatting from yyyy-mm-dd)
    let displayDate = tx.date;
    const parts = tx.date.split('-');
    if (parts.length === 3) {
      displayDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    doc.text(displayDate, colPositions.date + 2, currentY + 5);

    // Type text
    const isIncome = tx.type === 'income';
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isIncome ? colors.success.r : colors.danger.r, isIncome ? colors.success.g : colors.danger.g, isIncome ? colors.success.b : colors.danger.b);
    doc.text(tx.type.toUpperCase(), colPositions.type + 2, currentY + 5);

    // Category
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(colors.dark.r, colors.dark.g, colors.dark.b);
    doc.text(tx.category, colPositions.category + 2, currentY + 5);

    // Description (Truncate if excessively long)
    const rawDesc = tx.description || tx.category;
    const cleanDesc = rawDesc.length > 34 ? rawDesc.slice(0, 31) + '...' : rawDesc;
    doc.text(cleanDesc, colPositions.description + 2, currentY + 5);

    // Amount
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isIncome ? colors.success.r : colors.danger.r, isIncome ? colors.success.g : colors.danger.g, isIncome ? colors.success.b : colors.danger.b);
    const amtStr = (isIncome ? '+' : '-') + formatAmount(tx.amount);
    doc.text(amtStr, colPositions.amount + colWidths.amount - 2, currentY + 5, { align: 'right' });

    currentY += 7.5;
  });

  // Save the PDF locally
  const fileDate = new Date().toISOString().slice(0, 10);
  doc.save(`Ledger_Report_${fileDate}.pdf`);
}
