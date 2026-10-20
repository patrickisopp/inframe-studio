"""Local dev server for the site that never lets the browser cache (so edits always show up)."""
import functools
import http.server
import sys

ROOT = sys.argv[1]
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 4173


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()


http.server.ThreadingHTTPServer(("", PORT), functools.partial(NoCache, directory=ROOT)).serve_forever()
