from http.server import HTTPServer, SimpleHTTPRequestHandler
import ssl

server_address = ('0.0.0.0', 8000)
httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)

context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(
    certfile="C:/Users/jorda/Downloads/192.168.1.105.pem",
    keyfile="C:/Users/jorda/Downloads/192.168.1.105-key.pem"
)

httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print("HTTPS server running on https://192.168.1.105:8000")
httpd.serve_forever()
