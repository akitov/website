"""Tiny dev server for the personal site.

Wraps the stdlib ``http.server`` and disables HTTP caching so changes to
HTML/CSS/JS show up immediately in the Replit preview iframe (which can
otherwise hold onto stale assets for a long time).

Production serves these same files as a plain static site -- this script
only runs in development.
"""

import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self) -> None:  # type: ignore[override]
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main() -> None:
    port = int(os.environ.get("PORT", "5000"))
    directory = os.path.join(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(directory)
    server = HTTPServer(("0.0.0.0", port), NoCacheHandler)
    print(f"Serving {directory} on http://0.0.0.0:{port} (no-cache dev mode)", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        sys.exit(0)


if __name__ == "__main__":
    main()
