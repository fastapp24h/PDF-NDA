import chromium from 'chrome-aws-lambda';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Only POST method allowed');
  }

  const { html } = req.body;

  if (!html) {
    return res.status(400).send('Missing HTML content');
  }

  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=document.pdf');
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error(error);
    if (browser) await browser.close();
    res.status(500).send('Errore durante la generazione del PDF');
  }
}
