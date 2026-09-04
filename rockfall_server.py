import http.server
import json
import mimetypes
import os
import socketserver
import sys
import urllib.parse
import urllib.request

# Register video MIME types
mimetypes.add_type('video/mp4', '.mp4')
mimetypes.add_type('video/webm', '.webm')

PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_API_KEY = "qxLi53LWTad7uwORk5NZ"

# Request handler for static assets and Roboflow detection proxy
class RockfallRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path in ('/', ''):
            self.send_response(302)
            self.send_header('Location', '/rockfall_detector.html')
            self.end_headers()
            return
        return super().do_GET()

    def do_POST(self):
        # Proxy detection requests to Roboflow to avoid CORS restrictions
        if self.path.startswith('/api/detect'):
            try:
                parsed_url = urllib.parse.urlparse(self.path)
                params = urllib.parse.parse_qs(parsed_url.query)
                model_endpoint = params.get('model', ['rockfall-zc0ap-smkwd/2'])[0]
                api_key = params.get('api_key', [DEFAULT_API_KEY])[0]
                confidence = params.get('confidence', ['15'])[0]
                overlap = params.get('overlap', ['40'])[0]

                content_len = int(self.headers.get('Content-Length', 0))
                post_body = self.rfile.read(content_len)

                roboflow_url = f"https://detect.roboflow.com/{model_endpoint}?api_key={api_key}&confidence={confidence}&overlap={overlap}"
                req = urllib.request.Request(
                    roboflow_url,
                    data=post_body,
                    headers={'Content-Type': 'application/x-www-form-urlencoded'}
                )

                with urllib.request.urlopen(req, timeout=12) as response:
                    resp_data = response.read()
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(resp_data)
            except Exception as e:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                err_resp = json.dumps({'error': str(e), 'predictions': []}).encode('utf-8')
                self.wfile.write(err_resp)
            return

        self.send_response(404)
        self.end_headers()

# Start HTTP server
def run_server():
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    try:
        httpd = socketserver.ThreadingTCPServer(("", PORT), RockfallRequestHandler)
    except OSError:
        httpd = socketserver.ThreadingTCPServer(("", 8081), RockfallRequestHandler)

    actual_port = httpd.server_address[1]
    print(f"Rockfall Server running at: http://localhost:{actual_port}/rockfall_detector.html")
    sys.stdout.flush()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.shutdown()

if __name__ == '__main__':
    run_server()
