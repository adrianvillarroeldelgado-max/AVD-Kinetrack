# Kinetrack

Diagnóstico orientativo, pruebas clínicas y programas de rehabilitación de lesiones deportivas.

Este repositorio hace dos cosas solo con subirlo a GitHub:

1. **Publica la web** gratis con GitHub Pages: `https://adrianvillarroeldelgado-max.github.io/AVD-Kinetrack/`. Se puede instalar desde el navegador del móvil.
2. **Compila el APK de Android** con GitHub Actions cada vez que cambias algo. El archivo `Kinetrack.apk` aparece en la sección **Releases**.

---

## Tutorial paso a paso

### 1. Crea el repositorio
1. Entra en [github.com](https://github.com) y crea una cuenta, o inicia sesión.
2. Arriba a la derecha: **+ → New repository**.
3. **Repository name:** `kinetrack`. Elige **Public** (GitHub Pages es gratis para repositorios públicos).
4. **No** marques «Add a README». Pulsa **Create repository**.

### 2. Sube los archivos
La carpeta incluye archivos ocultos (`.github`, `.nojekyll`) que son los que hacen el trabajo automático.

**Opción A: GitHub Desktop (la más segura)**
1. Instala [GitHub Desktop](https://desktop.github.com) e inicia sesión.
2. **File → Add local repository** y elige esta carpeta. Si dice que no es un repositorio, pulsa **create a repository**.
3. Escribe un resumen («Primera versión») y pulsa **Commit to main**.
4. Pulsa **Publish repository**, desmarca «Keep this code private» y confirma con el nombre `kinetrack`. Si ya creaste el repositorio en el paso 1, usa **Repository → Repository settings → Remote** y pega su dirección.

**Opción B: desde el navegador**
1. En el repositorio vacío, pulsa **uploading an existing file**.
2. Arrastra **todo el contenido** de esta carpeta (no la carpeta en sí).
   - En Mac pulsa `Cmd + Shift + .` en el Finder para ver la carpeta oculta `.github` y arrastrarla también.
   - En Windows, activa **Vista → Elementos ocultos**.
3. Pulsa **Commit changes**.
4. Comprueba que en el repositorio aparece la carpeta `.github/workflows`. Si no está, créala con **Add file → Create new file**, escribiendo `.github/workflows/apk.yml` como nombre y pegando el contenido del archivo.

### 3. Activa la web (GitHub Pages)
1. En el repositorio: **Settings → Pages**.
2. **Source:** Deploy from a branch. **Branch:** `main` y carpeta `/ (root)`. Pulsa **Save**.
3. En 1–2 minutos la web estará en `https://adrianvillarroeldelgado-max.github.io/AVD-Kinetrack/`.

### 4. Descarga el APK
1. Ve a la pestaña **Actions**. Verás el flujo **Generar APK** en marcha (tarda unos 5–10 minutos). Si GitHub pide activar los workflows, pulsa el botón verde.
2. Cuando termine con ✓, ve a la página principal del repositorio → **Releases** (columna derecha) → **Kinetrack 1.0.1** → descarga **Kinetrack.apk**.
3. Si falla (✗), abre el paso en rojo, copia el error y pídele ayuda a Claude con ese texto.

### 5. Instálalo en Android
1. Pasa `Kinetrack.apk` al móvil (WhatsApp, Drive, correo o cable) y ábrelo.
2. Acepta **«Permitir instalar apps de esta fuente»**.
3. Si aparece Play Protect, pulsa **Más detalles → Instalar de todas formas**: el aviso sale porque la app no viene de Google Play.

### 6. Clave de firma fija (hazlo antes de repartir la app)
Sin este paso, cada APK se firma con una clave nueva y para actualizar hay que desinstalar la versión anterior (y se pierden los datos del teléfono).
1. **Actions → Crear clave de firma → Run workflow**.
2. Al terminar, abre la ejecución y descarga el artefacto **clave-de-firma-BORRAR-DESPUES**. Guarda la carpeta en un lugar seguro.
3. **Settings → Secrets and variables → Actions → New repository secret** y crea tres secretos copiando el contenido de cada archivo:
   - `KEYSTORE_BASE64` ← `KEYSTORE_BASE64.txt`
   - `KEYSTORE_PASSWORD` ← `KEYSTORE_PASSWORD.txt`
   - `KEY_ALIAS` ← `KEY_ALIAS.txt`
4. Borra el artefacto de la ejecución (icono de papelera).
5. **Actions → Generar APK → Run workflow**. A partir de ahora todos los APK se firman con tu clave y se actualizan sin desinstalar.

### 7. Actualizar la app
Cambia o sustituye los archivos y haz commit. GitHub actualiza la web y genera un APK nuevo con número de versión mayor. Instálalo encima del anterior.

---

## Qué hay en el repositorio
| Archivo o carpeta | Función |
|---|---|
| `index.html` | La app completa |
| `manifest.webmanifest`, `sw.js`, `icon*` | Instalación desde el navegador y uso sin conexión |
| `privacidad.html` | Política de privacidad y aviso legal (añade tu correo de contacto) |
| `.github/workflows/apk.yml` | Compila y firma el APK y lo publica en Releases |
| `.github/workflows/crear-clave.yml` | Genera la clave de firma |
| `capacitor.config.json`, `package.json`, `scripts/`, `android-res/` | Configuración del APK (identificador `com.kinetrack.app`, iconos, versión) |
| `fuente/` | Código fuente por partes; `python3 fuente/build.py` regenera `index.html` |

## Diferencias entre versiones
- **Web (GitHub Pages) y APK:** los datos se guardan en el dispositivo; no hay cuentas ni panel de pacientes en la nube. Para trabajar con el profesional se usan el informe PDF y las copias de casos.
- **En el APK:** el informe PDF y las copias se comparten con el menú de Android, y los recordatorios llegan como notificaciones del teléfono.
- **Versión en claude.ai:** añade cuentas, sincronización, panel profesional, mensajes y vídeos de técnica.

## Aviso
Herramienta orientativa y educativa. No sustituye la valoración de un profesional sanitario ni es un dispositivo médico certificado. Antes de un uso clínico o comercial, haz revisar el contenido por profesionales y consulta la normativa de tu país.
