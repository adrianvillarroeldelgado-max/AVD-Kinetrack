"""Prepara www/index.html para el APK: carga Capacitor y sus plugins antes del código
de la app y quita el service worker (en el APK los archivos ya van dentro)."""
import sys, re, os
p = sys.argv[1]
html = open(p, encoding='utf8').read()
www = os.path.dirname(p)
tags = ''.join(f'<script src="{f}"></script>\n' for f in
               ['capacitor.js', 'cap-filesystem.js', 'cap-share.js', 'cap-notifications.js']
               if os.path.exists(os.path.join(www, f)))
marker = '<script>\nconst IS_PWA'
if marker not in html:
    sys.exit('No se encontró el script principal en index.html')
html = html.replace(marker, tags + marker, 1)
html = re.sub(r"<script>\s*if\('serviceWorker' in navigator\).*?</script>", '', html, flags=re.S)
html = html.replace('<link rel="manifest" href="manifest.webmanifest">', '')
open(p, 'w', encoding='utf8').write(html)
print('index.html preparado; scripts añadidos:', tags.count('<script'))
