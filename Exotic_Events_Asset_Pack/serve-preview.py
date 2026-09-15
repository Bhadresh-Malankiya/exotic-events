"""Serve this extracted folder locally, without exposing it on the network."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
import webbrowser

if __name__ == '__main__':
    folder = Path(__file__).resolve().parent
    handler = partial(SimpleHTTPRequestHandler, directory=str(folder))
    try:
        server = ThreadingHTTPServer(('127.0.0.1', 8765), handler)
    except OSError as exc:
        raise SystemExit(f'Could not start local preview: {exc}. Close another server using port 8765 and retry.')
    url = 'http://127.0.0.1:8765/START_HERE.html'
    print(f'Local preview: {url}\nPress Ctrl+C to stop. No files are uploaded.')
    webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
