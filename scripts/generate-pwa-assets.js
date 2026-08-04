import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');

async function generateAssets() {
  console.log('Generating PWA Icons & Screenshots with sharp...');

  const svgBuffer = fs.readFileSync(path.join(publicDir, 'icon.svg'));

  // 1. Generate icon-192.png (192x192 PNG)
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('✓ Generated icon-192.png (192x192)');

  // 2. Generate icon-512.png (512x512 PNG)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('✓ Generated icon-512.png (512x512)');

  // 3. Generate apple-touch-icon.png (180x180 PNG)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Generated apple-touch-icon.png (180x180)');

  // 4. Generate icon-maskable.png (512x512 PNG with solid background safe zone)
  const maskableSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="#09090b"/>
    <g transform="translate(51, 51) scale(0.8)">
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#007aff" />
        <stop offset="100%" stop-color="#5856d6" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#a2a2a6" />
      </linearGradient>
      <rect x="32" y="32" width="448" height="448" rx="100" fill="url(#bgGrad)" />
      <text x="256" y="340" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="240" font-weight="900" text-anchor="middle" fill="url(#goldGrad)">$</text>
    </g>
  </svg>
  `;
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-maskable.png'));
  console.log('✓ Generated icon-maskable.png (512x512)');

  // 5. Generate screenshot-narrow.jpg (1080x1920 JPEG) - Mobile App UI mockup
  const narrowSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
    <rect width="1080" height="1920" fill="#09090b" />
    <!-- Top Bar -->
    <rect x="0" y="0" width="1080" height="180" fill="#121215" />
    <text x="60" y="110" font-family="sans-serif" font-size="44" font-weight="bold" fill="#ffffff">Personal Money Manager</text>
    <text x="60" y="150" font-family="sans-serif" font-size="28" fill="#8e8e93">Financial Dashboard</text>
    
    <!-- Balance Card -->
    <rect x="60" y="240" width="960" height="420" rx="40" fill="#007aff" />
    <text x="120" y="330" font-family="sans-serif" font-size="32" fill="#ffffff" opacity="0.8">Total Balance</text>
    <text x="120" y="440" font-family="sans-serif" font-size="72" font-weight="bold" fill="#ffffff">$12,850.50</text>
    <text x="120" y="530" font-family="sans-serif" font-size="28" fill="#ffffff" opacity="0.9">▲ +14.2% vs last month</text>

    <!-- Stat Cards -->
    <rect x="60" y="700" width="460" height="220" rx="32" fill="#1c1c1e" />
    <text x="100" y="760" font-family="sans-serif" font-size="28" fill="#8e8e93">Income</text>
    <text x="100" y="840" font-family="sans-serif" font-size="44" font-weight="bold" fill="#34c759">+$5,400.00</text>

    <rect x="560" y="700" width="460" height="220" rx="32" fill="#1c1c1e" />
    <text x="600" y="760" font-family="sans-serif" font-size="28" fill="#8e8e93">Expenses</text>
    <text x="600" y="840" font-family="sans-serif" font-size="44" font-weight="bold" fill="#ff3b30">-$2,149.50</text>

    <!-- Recent Transactions Header -->
    <text x="60" y="1000" font-family="sans-serif" font-size="36" font-weight="bold" fill="#ffffff">Recent Transactions</text>

    <!-- Transaction 1 -->
    <rect x="60" y="1040" width="960" height="140" rx="28" fill="#1c1c1e" />
    <circle cx="130" cy="1110" r="36" fill="#34c759" opacity="0.2" />
    <text x="200" y="1100" font-family="sans-serif" font-size="32" font-weight="600" fill="#ffffff">Monthly Salary</text>
    <text x="200" y="1140" font-family="sans-serif" font-size="24" fill="#8e8e93">Income • Today</text>
    <text x="960" y="1120" font-family="sans-serif" font-size="32" font-weight="bold" fill="#34c759" text-anchor="end">+$4,500.00</text>

    <!-- Transaction 2 -->
    <rect x="60" y="1210" width="960" height="140" rx="28" fill="#1c1c1e" />
    <circle cx="130" cy="1280" r="36" fill="#ff9500" opacity="0.2" />
    <text x="200" y="1270" font-family="sans-serif" font-size="32" font-weight="600" fill="#ffffff">Supermarket Grocery</text>
    <text x="200" y="1310" font-family="sans-serif" font-size="24" fill="#8e8e93">Food • Yesterday</text>
    <text x="960" y="1290" font-family="sans-serif" font-size="32" font-weight="bold" fill="#ff3b30" text-anchor="end">-$142.80</text>

    <!-- Transaction 3 -->
    <rect x="60" y="1380" width="960" height="140" rx="28" fill="#1c1c1e" />
    <circle cx="130" cy="1450" r="36" fill="#af52de" opacity="0.2" />
    <text x="200" y="1440" font-family="sans-serif" font-size="32" font-weight="600" fill="#ffffff">Electric &amp; Utilities</text>
    <text x="200" y="1480" font-family="sans-serif" font-size="24" fill="#8e8e93">Bills • Aug 01</text>
    <text x="960" y="1460" font-family="sans-serif" font-size="32" font-weight="bold" fill="#ff3b30" text-anchor="end">-$85.00</text>

    <!-- Bottom Nav Bar -->
    <rect x="0" y="1760" width="1080" height="160" fill="#121215" />
    <circle cx="216" cy="1840" r="28" fill="#007aff" />
    <text x="216" y="1848" font-family="sans-serif" font-size="20" fill="#ffffff" text-anchor="middle">Home</text>
    <text x="432" y="1848" font-family="sans-serif" font-size="24" fill="#8e8e93" text-anchor="middle">Analytics</text>
    <text x="648" y="1848" font-family="sans-serif" font-size="24" fill="#8e8e93" text-anchor="middle">Budgets</text>
    <text x="864" y="1848" font-family="sans-serif" font-size="24" fill="#8e8e93" text-anchor="middle">Settings</text>
  </svg>
  `;
  await sharp(Buffer.from(narrowSvg))
    .resize(1080, 1920)
    .png()
    .toFile(path.join(publicDir, 'screenshot-narrow.png'));
  await sharp(Buffer.from(narrowSvg))
    .resize(1080, 1920)
    .jpeg({ quality: 90 })
    .toFile(path.join(publicDir, 'screenshot-narrow.jpg'));
  console.log('✓ Generated screenshot-narrow.png & .jpg (1080x1920)');

  // 6. Generate screenshot-wide (1920x1080) - Desktop / Tablet App UI mockup
  const wideSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
    <rect width="1920" height="1080" fill="#09090b" />
    
    <!-- Sidebar -->
    <rect x="0" y="0" width="320" height="1080" fill="#121215" />
    <text x="40" y="80" font-family="sans-serif" font-size="28" font-weight="bold" fill="#ffffff">Money Manager</text>
    <rect x="20" y="140" width="280" height="60" rx="16" fill="#007aff" />
    <text x="80" y="178" font-family="sans-serif" font-size="20" font-weight="600" fill="#ffffff">Dashboard</text>
    <text x="80" y="258" font-family="sans-serif" font-size="20" fill="#8e8e93">Analytics &amp; Reports</text>
    <text x="80" y="338" font-family="sans-serif" font-size="20" fill="#8e8e93">Budget Planner</text>
    <text x="80" y="418" font-family="sans-serif" font-size="20" fill="#8e8e93">Savings Goals</text>
    <text x="80" y="498" font-family="sans-serif" font-size="20" fill="#8e8e93">Settings</text>

    <!-- Main Content Area Header -->
    <text x="380" y="80" font-family="sans-serif" font-size="36" font-weight="bold" fill="#ffffff">Financial Analytics Overview</text>

    <!-- Top Cards Grid -->
    <rect x="380" y="130" width="460" height="180" rx="24" fill="#1c1c1e" />
    <text x="420" y="180" font-family="sans-serif" font-size="20" fill="#8e8e93">Total Balance</text>
    <text x="420" y="240" font-family="sans-serif" font-size="40" font-weight="bold" fill="#ffffff">$12,850.50</text>

    <rect x="870" y="130" width="460" height="180" rx="24" fill="#1c1c1e" />
    <text x="910" y="180" font-family="sans-serif" font-size="20" fill="#8e8e93">Monthly Income</text>
    <text x="910" y="240" font-family="sans-serif" font-size="40" font-weight="bold" fill="#34c759">+$5,400.00</text>

    <rect x="1360" y="130" width="480" height="180" rx="24" fill="#1c1c1e" />
    <text x="1400" y="180" font-family="sans-serif" font-size="20" fill="#8e8e93">Monthly Expenses</text>
    <text x="1400" y="240" font-family="sans-serif" font-size="40" font-weight="bold" fill="#ff3b30">-$2,149.50</text>

    <!-- Large Chart Card -->
    <rect x="380" y="340" width="1460" height="680" rx="28" fill="#1c1c1e" />
    <text x="420" y="400" font-family="sans-serif" font-size="24" font-weight="bold" fill="#ffffff">Income vs Expense Trend (2026)</text>

    <!-- Simulated Chart Line & Bars -->
    <path d="M 440 850 Q 600 700 800 600 T 1100 500 T 1400 420 T 1760 380" fill="none" stroke="#007aff" stroke-width="8" />
    <path d="M 440 900 Q 600 820 800 780 T 1100 720 T 1400 680 T 1760 620" fill="none" stroke="#ff3b30" stroke-width="6" stroke-dasharray="12 8" />

    <circle cx="1760" cy="380" r="12" fill="#007aff" />
    <text x="1760" y="350" font-family="sans-serif" font-size="20" font-weight="bold" fill="#007aff" text-anchor="middle">$12.8k</text>
  </svg>
  `;
  await sharp(Buffer.from(wideSvg))
    .resize(1920, 1080)
    .png()
    .toFile(path.join(publicDir, 'screenshot-wide.png'));
  await sharp(Buffer.from(wideSvg))
    .resize(1920, 1080)
    .jpeg({ quality: 90 })
    .toFile(path.join(publicDir, 'screenshot-wide.jpg'));
  console.log('✓ Generated screenshot-wide.png & .jpg (1920x1080)');

  console.log('🎉 All PWA assets generated successfully!');
}

generateAssets().catch(err => {
  console.error('Error generating PWA assets:', err);
  process.exit(1);
});
