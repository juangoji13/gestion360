const puppeteer = require('puppeteer');

(async () => {
    console.log('Starting puppeteer...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

    console.log('Navigating to http://localhost:5173/');
    await page.goto('http://localhost:5173/');

    console.log('Waiting for email input...');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    // Login
    await page.type('input[type="email"]', 'cuentadeprueba@gmail.com');
    await page.type('input[type="password"]', 'Juanthek13');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    console.log('Waiting for dashboard...');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Navigate to invoices
    console.log('Navigating to Invoices...');
    await page.goto('http://localhost:5173/invoices', { waitUntil: 'networkidle0' });

    console.log('Waiting to capture errors...');
    await new Promise(r => setTimeout(r, 3000));

    console.log('Done.');
    await browser.close();
})();
