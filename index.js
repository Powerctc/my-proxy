const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express();

app.get('/', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.send('Proxy is running. Use ?url= to stream.');

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': new URL(url).origin }
    });

    const contentType = response.headers.get('content-type');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', contentType || 'application/octet-stream');

    if (url.includes('.m3u8')) {
      let text = await response.text();
      const basePath = url.substring(0, url.lastIndexOf('/') + 1);
      const host = req.get('host');
      const protocol = req.protocol;
      const proxyBase = `${protocol}://${host}/?url=`;

      text = text.replace(/^(?!http)(.*)$/mg, (match) => {
        if (match.trim() === '' || match.startsWith('#')) return match;
        const fullUrl = match.startsWith('/') ? new URL(url).origin + match : basePath + match;
        return proxyBase + encodeURIComponent(fullUrl);
      });
      return res.send(text);
    }

    const data = await response.arrayBuffer();
    res.send(Buffer.from(data));
  } catch (e) {
    res.status(500).send('Error');
  }
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => console.log(`Server on ${port}`));
