Const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 7860;

app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl || targetUrl === 'ping') {
        return res.status(200).send('Proxy is Alive');
    }

    try {
        const response = await axios({
            method: 'get',
            url: targetUrl,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'Referer': new URL(targetUrl).origin
            },
            timeout: 15000
        });

        res.setHeader('Access-Control-Allow-Origin', '*');

        if (targetUrl.includes('.m3u8')) {
            let data = '';
            response.data.on('data', chunk => data += chunk);
            response.data.on('end', () => {
                const urlObj = new URL(targetUrl);
                const basePath = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
                const proxyBase = `https://${req.get('host')}/proxy?url=`;

                // Logic ပြင်လိုက်သည် - http နဲ့စတာရော၊ မစတာရော အကုန်လုံးကို Proxy ခံမည်
                const modifiedData = data.split('\n').map(line => {
                    if (line.startsWith('#') || !line.trim()) return line;
                    
                    let fullUrl;
                    if (line.startsWith('http')) {
                        fullUrl = line; // Full URL ဖြစ်လျှင်
                    } else if (line.startsWith('/')) {
                        fullUrl = urlObj.origin + line; // Relative from root
                    } else {
                        fullUrl = basePath + line; // Relative from base
                    }
                    return proxyBase + encodeURIComponent(fullUrl);
                }).join('\n');

                res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
                res.status(200).send(modifiedData);
            });
        } else {
            response.data.pipe(res);
        }

    } catch (error) {
        res.status(500).send('Proxy Error');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
