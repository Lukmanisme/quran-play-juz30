#!/usr/bin/env python3
"""Lightweight static file server for Qur'an Play: Juz 30 dist/ on WeCHIP."""
import functools
import http.server
import mimetypes
import os
import socketserver

PORT = int(os.environ.get("PORT", "8130"))
BIND = os.environ.get("BIND", "0.0.0.0")
DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")

mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("application/manifest+json", ".webmanifest")


class DistHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args) -> None:
        return

    def end_headers(self) -> None:
        clean_path = self.path.split("?", 1)[0]
        if clean_path in ("/", "/index.html", "/sw.js") or clean_path.endswith(".html"):
            self.send_header("Cache-Control", "no-cache")
        else:
            self.send_header("Cache-Control", "public, max-age=3600")
        super().end_headers()


class ReusableTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True


def main() -> None:
    os.makedirs(DIST_DIR, exist_ok=True)
    handler = functools.partial(DistHandler, directory=DIST_DIR)
    with ReusableTCPServer((BIND, PORT), handler) as httpd:
        print(f"Serving Qur'an Play: Juz 30 from {DIST_DIR} on http://{BIND}:{PORT}", flush=True)
        httpd.serve_forever()


if __name__ == "__main__":
    main()
