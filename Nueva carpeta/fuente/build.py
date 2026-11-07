# Reconstruye ../index.html a partir de fuente/src. Uso: python3 fuente/build.py
import sys,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
R=lambda p:open('src/'+p,encoding='utf8').read()
css=R('base.css')+R('more.css')
js=R('data.js')+R('data2.js')+R('core.js')+R('views.js')+R('extra.js')
head='<title>Kinetrack Lesiones</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&display=swap">\n'
def page(pwa):
    return head+'<style>'+css+'</style>\n'+R('body.html')+'\n<script>\nconst IS_PWA = '+('true' if pwa else 'false')+';\n'+js+'\n</script>\n'
pwa_head='''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0f2c42">
<meta name="description" content="Diagnóstico orientativo, pruebas clínicas y programas de rehabilitación de lesiones deportivas.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);color-scheme:light}html,body{height:100%}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
'''
pwa_tail='''
<script>
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}
</script>
</body>
</html>
'''
open('../index.html','w',encoding='utf8').write(pwa_head+page(True)+pwa_tail)
print('built',len(page(False)))
