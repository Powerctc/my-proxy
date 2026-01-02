from flask import Flask, request, Response, stream_with_context
import requests

app = Flask(__name__)

@app.route('/')
def proxy():
    url = request.args.get('url')
    if not url: return "Missing URL", 400

    headers = {'User-Agent': 'Mozilla/5.0', 'Referer': url}
    
    # stream=True က ထစ်တာကို လျှော့ချပေးတယ်
    req = requests.get(url, headers=headers, stream=True, timeout=15)

    # Playlist (.m3u8) ဆိုရင် Proxy Link ပြင်ပေးမယ်
    if ".m3u8" in url:
        return Response(req.text, content_type=req.headers.get('Content-Type'))

    # ဗီဒီယိုဖိုင် (.ts) တွေကို chunk အလိုက် ချက်ချင်း ပြန်ပို့ပေးမယ့် logic
    def generate():
        for chunk in req.iter_content(chunk_size=1024 * 16): # 16KB စီ ဖြတ်ပို့မယ်
            yield chunk

    return Response(stream_with_context(generate()), 
                    content_type=req.headers.get('Content-Type'),
                    headers={'Access-Control-Allow-Origin': '*'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
    
