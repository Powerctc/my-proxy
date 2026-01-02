from flask import Flask, request, Response
import requests
import re

app = Flask(__name__)

@app.route('/')
def proxy():
    target_url = request.args.get('url')
    if not target_url:
        return "Proxy is running. Use ?url= to stream.", 400

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': target_url
    }

    try:
        resp = requests.get(target_url, headers=headers, stream=True)
        
        # M3U8 Playlist ဖြစ်ခဲ့ရင်
        if ".m3u8" in target_url or "mpegurl" in resp.headers.get('Content-Type', ''):
            text = resp.text
            base_path = target_url.rsplit('/', 1)[0] + '/'
            proxy_base = f"{request.host_url}?url="

            def replace_link(match):
                line = match.group(0)
                if line.startswith('#') or not line.strip():
                    return line
                if line.startswith('http'):
                    return f"{proxy_base}{line}"
                full_url = base_path + line if not line.startswith('/') else f"{target_url.split('//')[0]}//{target_url.split('//')[1].split('/')[0]}{line}"
                return f"{proxy_base}{full_url}"

            new_text = re.sub(r'^(?!#)(.*)$', replace_link, text, flags=re.MULTILINE)
            return Response(new_text, content_type='application/vnd.apple.mpegurl', headers={'Access-Control-Allow-Origin': '*'})

        # Video segments (.ts) သို့မဟုတ် အခြား binary များအတွက်
        return Response(resp.content, content_type=resp.headers.get('Content-Type'), headers={'Access-Control-Allow-Origin': '*'})

    except Exception as e:
        return str(e), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
