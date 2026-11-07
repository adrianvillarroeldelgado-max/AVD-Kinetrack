"""Ajusta el proyecto Android generado por Capacitor: versión, iconos, color y pantalla de inicio."""
import sys, os, re, shutil, glob
from PIL import Image
run = int(sys.argv[1]) if len(sys.argv) > 1 else 1
base = 'android/app'
g = os.path.join(base, 'build.gradle')
s = open(g, encoding='utf8').read()
s = re.sub(r'versionCode \d+', f'versionCode {run}', s)
s = re.sub(r'versionName "[^"]*"', f'versionName "1.0.{run}"', s)
open(g, 'w', encoding='utf8').write(s)
res = os.path.join(base, 'src/main/res')
for d in glob.glob('android-res/mipmap-*'):
    dst = os.path.join(res, os.path.basename(d))
    os.makedirs(dst, exist_ok=True)
    for f in os.listdir(d):
        shutil.copy(os.path.join(d, f), os.path.join(dst, f))
bg = os.path.join(res, 'values/ic_launcher_background.xml')
os.makedirs(os.path.dirname(bg), exist_ok=True)
open(bg, 'w').write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#0F2C42</color>\n</resources>\n')
src = Image.open('android-res/splash.png').convert('RGB')
for f in glob.glob(os.path.join(res, 'drawable*/splash.png')):
    w, h = Image.open(f).size
    side = max(w, h)
    big = src.resize((side, side), Image.LANCZOS)
    big.crop(((side - w) // 2, (side - h) // 2, (side - w) // 2 + w, (side - h) // 2 + h)).save(f)
print('Android ajustado: versión 1.0.%d' % run)
