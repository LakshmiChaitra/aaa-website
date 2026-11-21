"""Build only public frontend files; keep server code and credentials out."""
import json
import os
from pathlib import Path
import shutil
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
base = os.environ.get('ACADEMY_API_BASE', 'https://anusha-art-academy.onrender.com').rstrip('/')
parts = urlsplit(base)
if parts.scheme != 'https' or not parts.hostname or parts.path or parts.query or parts.fragment or parts.username:
    raise ValueError('ACADEMY_API_BASE must be an HTTPS origin')
target = ROOT / 'dist'
shutil.rmtree(target, ignore_errors=True)
shutil.copytree(ROOT / 'saved' / '1', target)
(target / 'hosting-config.js').write_text('window.AAA_API_BASE = ' + json.dumps(base) + ';\n')
preview = (ROOT / 'phone-preview.html').read_text().replace('/saved/1/', '/')
(target / 'phone-preview.html').write_text(preview)
print('Public static build ready in dist/')
