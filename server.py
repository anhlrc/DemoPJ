import http.server
import socketserver
import socket
import sys

# Subclass SimpleHTTPRequestHandler to catch client console logs
class DiagnosticsHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/log':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            
            # Write raw UTF-8 bytes to sys.stdout.buffer to avoid Windows cp1258 UnicodeEncodeError
            try:
                sys.stdout.buffer.write(f"[BROWSER] {post_data}\n".encode('utf-8'))
                sys.stdout.buffer.flush()
            except Exception as e:
                # Fallback to simple print if buffer write fails
                print(f"[BROWSER LOG LOG] Log printing error: {e}")
                
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b"OK")
            return
        super().do_POST()

class DualStackServer(socketserver.TCPServer):
    address_family = socket.AF_INET6
    
    def server_bind(self):
        try:
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        except Exception as e:
            print(f"Warning: Could not set IPV6_V6ONLY: {e}")
        super().server_bind()

def find_free_port(start_port=8080):
    port = start_port
    while True:
        v4_free = False
        v6_free = False
        
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('127.0.0.1', port))
                v4_free = True
            except OSError:
                pass
                
        with socket.socket(socket.AF_INET6, socket.SOCK_STREAM) as s:
            try:
                s.bind(('::1', port))
                v6_free = True
            except OSError:
                pass
                
        if v4_free and v6_free:
            return port
            
        port += 1
        if port > 8100:
            raise IOError("No free ports found between 8080 and 8100")

def run_server():
    try:
        port = find_free_port(8080)
        Handler = DiagnosticsHandler
        
        Handler.extensions_map.update({
            '.obj': 'text/plain',
            '.mtl': 'text/plain',
            '.stl': 'application/octet-stream',
            '.glb': 'model/gltf-binary',
            '.gltf': 'model/gltf+json',
            '.jpg': 'image/jpeg',
            '.png': 'image/png',
        })
        
        with DualStackServer(('', port), Handler) as httpd:
            print(f"==================================================")
            print(f" 3D Virtual Museum Server started successfully!")
            print(f" Local URL (IPv4): http://127.0.0.1:{port}/index.html")
            print(f" Local URL (IPv6/Localhost): http://localhost:{port}/index.html")
            print(f"==================================================")
            sys.stdout.flush()
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        sys.exit(0)
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    run_server()
