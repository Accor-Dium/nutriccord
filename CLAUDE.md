# CLAUDE.md — Contexto del proyecto Nutriccord

> Archivo de contexto compartido para cualquier developer (y su asistente de IA).
> **Regla:** todo cambio relevante (features, dependencias, decisiones de arquitectura,
> convenciones) se registra en la sección [Bitácora de cambios](#bitácora-de-cambios).
> Las reglas específicas de Expo están en [AGENTS.md](AGENTS.md) — léelo también.

## Qué es

Nutriccord es una app móvil (Android / iOS) de **conteo de calorías** para el ámbito
nutrimental: el usuario registra lo que come y ve su consumo de calorías y
macronutrientes (proteína, carbohidratos, grasa) contra una meta diaria calculada
a partir de su perfil.

## Stack

| Área | Tecnología |
|---|---|
| Framework | React Native **0.88** con **Expo SDK 58** |
| Lenguaje | TypeScript (strict) |
| Navegación | Expo Router (rutas por archivo en `src/app/`); tabs personalizadas con `expo-router/ui` + Stack con modales |
| UI | Diseño propio (ver "Diseño"); gráficas con `react-native-svg`; fuentes Inter + Space Grotesk (`@expo-google-fonts`) |
| Datos | Locales en el teléfono: `expo-sqlite/kv-store` (iOS/Android), `localStorage` (web) |
| Animaciones | react-native-reanimated 4 |
| React | 19.3, React Compiler activado (`app.json > experiments.reactCompiler`) |
| Builds | EAS (`npx eas-cli@latest build`) o local con `npx expo run:android` |

> **Decisión (2026-11-18):** se evaluó Tauri 2 y se descartó a favor de React Native/Expo
> para tener UI nativa real y el ecosistema móvil de Expo. No mezclar con Tauri.

## Comandos

```bash
npm install            # instalar dependencias
npm start              # servidor de desarrollo (abrir con Expo Go o dev build)
npm run android        # abrir en emulador/dispositivo Android
npm run web            # versión web (útil para iterar UI)
npm run lint           # ESLint (expo lint)
npm run typecheck      # tsc --noEmit
npx expo install <pkg> # SIEMPRE usar esto para agregar dependencias
npx expo-doctor        # diagnosticar dependencias/config
npm run release:dry    # simular qué versión generaría el pipeline (Node >= 26.13)
```

Antes de dar una tarea por terminada: `npm run lint` y `npm run typecheck`.

## Estructura

```
src/
  app/                    # SOLO pantallas/rutas (Expo Router)
    _layout.tsx           # raíz: fuentes, splash, tema, Stack (tabs + modales), banner de updates
    (tabs)/_layout.tsx    # barra inferior: Hoy · Diario · (+) · Actividad · Progreso
    (tabs)/index.tsx      # Hoy: anillo de kcal, macros, actividad, equivalentes, últimos 7 días
    (tabs)/diario.tsx     # Diario: selector de día, comidas por tiempo, eliminar registros
    (tabs)/actividad.tsx  # Registrar actividad (tipo, intensidad, minutos → kcal por MET)
    (tabs)/progreso.tsx   # Progreso: kcal por día, peso, distribución de macros, plan SMAE
    agregar.tsx           # Modal: buscar alimento, cantidad (porción/gramos/equivalentes), tiempo de comida
    perfil.tsx            # Modal: perfil y metas (sexo, edad, peso, estatura, actividad, objetivo)
  components/
    ui/                   # sistema de diseño: text, primitives (Card, Screen, Segmented, ChipGrid,
                          #   Stepper, ProgressBar, PrimaryButton, IconButton), icons, calorie-ring
    activity-row.tsx      # fila de actividad registrada
    update-banner.tsx     # banner "Reiniciar" / "Descargar"
  constants/theme.ts      # tokens de diseño (colores light/dark, FontFamily, Spacing, Radius)
  constants/app.ts        # GITHUB_REPO, IOS_STORE_URL, intervalo de revisión de updates
  store/app-store.ts      # estado global persistido (perfil, registros, actividades, peso) + actions
  hooks/                  # useTheme, useDaySummary, useWeek, useAppUpdates, useColorScheme
  lib/calories.ts         # BMR, TDEE, meta, metas de macros, porciones, sumas
  lib/equivalents.ts      # grupos del plan, metas y consumo de equivalentes SMAE
  lib/activity.ts         # tipos de actividad y valores MET
  lib/meals.ts            # tiempos de comida, texto de cantidades
  lib/dates.ts            # fechas locales ISO y formatos en español
  lib/storage(.web).ts    # key-value persistente (SQLite / localStorage)
  lib/semver.ts, lib/native-release.ts  # aviso de versión nativa nueva
  data/foods.ts           # catálogo de ~55 alimentos con grupo SMAE, porción casera y equivalente
  data/smae.ts            # grupos del Sistema Mexicano de Alimentos Equivalentes (Tabla 2)
  types/nutrition.ts      # tipos de dominio (UserProfile, Food, FoodEntry, ActivityEntry…)
assets/                   # íconos, splash, imágenes
.claude/launch.json       # `web`: servidor de Expo web para previsualizar
scripts/sync-app-version.js  # sincroniza versión en app.json y package.json (release)
.github/workflows/  # ci.yml y release.yml (pipeline)
.releaserc.json     # configuración de semantic-release
eas.json            # perfiles de build de EAS
```

Alias de import: `@/*` → `src/*`, `@/assets/*` → `assets/*`.

## Dominio y reglas de negocio

- **Alimentos** se guardan con valores **por 100 g** (`kcalPer100g`, `macrosPer100g`).
  Una porción se calcula con `nutrientsForPortion(food, grams)`.
- **BMR**: fórmula Mifflin-St Jeor (`calculateBmr`).
  - Hombre: `10·kg + 6.25·cm − 5·edad + 5`
  - Mujer: `10·kg + 6.25·cm − 5·edad − 161`
- **TDEE** = BMR × factor de actividad (1.2 / 1.375 / 1.55 / 1.725 / 1.9).
- **Meta diaria** = TDEE + ajuste por objetivo (bajar −500, mantener 0, subir +300 kcal),
  redondeada a 10 kcal.
- **Calorías restantes** = meta − comido + ejercicio (`remainingKcal`).
- **Metas de macros**: 25 % proteína, 45 % carbohidratos, 30 % grasa de la meta
  (4/4/9 kcal por gramo) — `MACRO_SPLIT`, `macroGoals`.
- **Actividad física**: kcal = MET × peso (kg) × minutos ÷ 60, con el peso del perfil.
  Tabla MET por tipo e intensidad en `lib/activity.ts`.
- **Cantidades**: se capturan en porción casera (pieza, taza…), gramos o equivalentes SMAE y se
  guardan siempre convertidas a gramos (`amountToGrams`), junto con la unidad original.
- **Equivalentes por día**: plan base de ~1,880 kcal (cereales 7, verduras 4, frutas 3, origen
  animal 7, leguminosas 2, leche 2, grasas 5, azúcares 1) escalado a la meta y redondeado a ½.
  Consumo = gramos ÷ gramos por equivalente del alimento.
- **Peso**: un registro por día; guardar el perfil con otro peso también lo registra.
- Comidas (`MealType`): desayuno, comida, colación, cena (en ese orden en la UI).
- Fechas de registros en formato ISO `yyyy-mm-dd`, hora local.
- **Persistencia**: todo el estado vive en `store/app-store.ts` bajo la llave
  `nutriccord:state` (`version: 1`). Si cambia la forma de los datos, subir `STORAGE_VERSION`
  y migrar en `load()`; borrar datos de usuarios es un cambio MAYOR.

## Diseño

- Fuente de verdad: lienzo **"Nutriccord App"** en claude.ai
  (`https://claude.ai/artifact/5K9H4PmsPikQKrezasDCRT`), pantallas Hoy, Diario, Agregar,
  Actividad y Progreso. La app agrega la pantalla de Perfil con el mismo estilo.
- Tokens en `constants/theme.ts`: fondo `#F5F6F2`, tarjetas blancas radio 20, verde primario
  `#1A6B43`, actividad naranja `#A84A0C`; proteína azul, carbohidratos mostaza, grasa magenta.
  Modo oscuro definido con los mismos roles.
- Tipografía: Inter (texto) y Space Grotesk (títulos y números), vía `components/ui/text.tsx`
  (`variant`). En Android los pesos se eligen por familia (`Inter_700Bold`…), no con `fontWeight`.
- Texto siempre con `<Text variant color>` de `components/ui/text`; colores solo por token.
- Accesibilidad: objetivos táctiles ≥ 44 px, `accessibilityRole`/`accessibilityLabel` en
  botones de ícono, radios y pestañas.

## Sistema de equivalentes (SMAE)

La app debe considerar el **Sistema Mexicano de Alimentos Equivalentes (SMAE), 5a edición**
(Ana Bertha Pérez Lizaur et al.; Fomento de Nutrición y Salud, A.C.). Es el estándar usado por nutriólogos en México: los
alimentos se agrupan y cada **equivalente** (porción) de un grupo aporta en promedio la misma
energía y macros, así que se pueden intercambiar dentro del grupo.

- **Fuente:** el PDF **no está en el repo** (pesa ~42 MB y tiene derechos de autor). Cada developer
  lo consigue por su cuenta (Fomento de Nutrición y Salud, A.C.). Copias locales:
  `SMAE_5a_ed_Ana_Bertha_Perez_Lizaur.pdf`.
- **En código:** `src/data/smae.ts` (`SMAE_GROUPS`, `SMAE_GROUPS_BY_ID`) contiene la Tabla 2.

**Tabla 2 — Aporte nutrimental promedio por equivalente**

| Grupo | Subgrupo | kcal | Proteína (g) | Lípidos (g) | HC (g) | Conteo HC |
|---|---|---:|---:|---:|---:|---:|
| Verduras | — | 25 | 2 | 0 | 4 | 0.3 |
| Frutas | — | 60 | 0 | 0 | 15 | 1 |
| Cereales y tubérculos | a. Sin grasa | 70 | 2 | 0 | 15 | 1 |
| | b. Con grasa | 115 | 2 | 5 | 15 | 1 |
| Leguminosas | — | 120 | 8 | 1 | 20 | 1.3 |
| Alimentos de origen animal | a. Muy bajo aporte de grasa | 40 | 7 | 1 | 0 | 0 |
| | b. Bajo aporte de grasa | 55 | 7 | 3 | 0 | 0 |
| | c. Moderado aporte de grasa | 75 | 7 | 5 | 0 | 0 |
| | d. Alto aporte de grasa | 100 | 7 | 8 | 0 | 0 |
| Leche | a. Descremada | 95 | 9 | 2 | 12 | 0.8 |
| | b. Semidescremada | 110 | 9 | 4 | 12 | 0.8 |
| | c. Entera | 150 | 9 | 8 | 12 | 0.8 |
| | d. Con azúcar | 200 | 8 | 5 | 30 | 2 |
| Aceites y grasas | a. Sin proteína | 45 | 0 | 5 | 0 | 0 |
| | b. Con proteína | 70 | 3 | 5 | 3 | 0.2 |
| Azúcares | a. Sin grasa | 40 | 0 | 0 | 10 | 0.7 |
| | b. Con grasa | 85 | 0 | 5 | 10 | 0.7 |
| Alimentos libres en energía | — | 0 | 0 | 0 | 0 | 0 |
| Bebidas alcohólicas | — | 140 | 0 | 0 | 20 g alcohol | 1.3 |

"Conteo HC" = conteo de hidratos de carbono (raciones de ~15 g de HC, usado en diabetes).

**Listas de alimentos del SMAE.** Para cada grupo el libro lista alimentos con estas columnas:
cantidad sugerida, unidad, peso bruto (g), peso neto (g), energía (kcal), proteína, lípidos,
hidratos de carbono, AG saturados / monoinsaturados / poliinsaturados, colesterol (mg),
azúcar, fibra, vitamina A (RE), ácido ascórbico, ácido fólico, calcio, hierro, potasio,
sodio, fósforo, etanol, índice glucémico (IG) y carga glucémica.

**Cómo aplicarlo en la app (lineamientos):**
- Cada `Food` del catálogo debería llevar su grupo SMAE (`SmaeGroupId`) y la **porción de 1
  equivalente** (cantidad sugerida + unidad casera + peso neto en g), además de los valores por 100 g.
- Mostrar el consumo del día también en **equivalentes por grupo** (p. ej. "3 de 5 cereales"),
  no solo en kcal; un plan de alimentación de nutriólogo se expresa así.
- La meta de equivalentes por grupo se deriva de la meta calórica y de la distribución de macros.
- Registrar alimentos por **unidad casera** (taza, pieza, cucharada) además de gramos.

**Nota técnica para leer el PDF:** está escaneado con las páginas rotadas 180° y el OCR
embebido sale ilegible. Lo que funciona: extraer de cada página la capa de texto
`CCITTFaxDecode` (envolverla en un TIFF G4) y la capa `DCTDecode` (JPEG, contiene los rellenos
grises de las tablas), rotar 180° y leer las imágenes. La Tabla 2 está en la página 13 del PDF
(página 11 impresa); las listas de alimentos empiezan alrededor de la página 16.

## Versionamiento (SemVer 2.0.0) — OBLIGATORIO

Toda build/release lleva una versión **[Semantic Versioning 2.0.0](https://semver.org/lang/es/)**
`MAYOR.MENOR.PARCHE`, determinada por el **nivel de cambio**:

| Nivel | Cuándo | Ejemplo |
|---|---|---|
| **MAYOR** | Cambio incompatible: rompe datos guardados, flujos o APIs existentes | `1.4.2 → 2.0.0` |
| **MENOR** | Funcionalidad nueva compatible hacia atrás | `1.4.2 → 1.5.0` |
| **PARCHE** | Corrección de bugs compatible, sin funcionalidad nueva | `1.4.2 → 1.4.3` |

- Mientras la app esté en desarrollo inicial la versión es **0.y.z** (empezó en `0.1.0`).
  En 0.x un cambio incompatible sube MENOR. Se pasa a `1.0.0` con la primera versión pública
  estable, mediante un commit con `BREAKING CHANGE:` y `"major"` explícito (ver abajo).
- **La versión NO se edita a mano.** La calcula el pipeline a partir de los mensajes de commit,
  que deben seguir **[Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/)**:

| Commit | Efecto en la versión |
|---|---|
| `fix: ...` / `perf: ...` | PARCHE |
| `feat: ...` | MENOR |
| `feat!: ...` o pie `BREAKING CHANGE: ...` | MAYOR |
| `docs:`, `chore:`, `refactor:`, `test:`, `ci:`, `style:`, `build:` | sin release |

  Ejemplos: `feat(registro): agregar comidas por unidad casera`,
  `fix(calorias): redondeo de meta diaria`. Scope opcional, descripción en español, imperativo.
- Fuentes de la versión: `app.json > expo.version` y `package.json > version` (las sincroniza
  `scripts/sync-app-version.js`). El número de build interno (Android `versionCode`, iOS
  `buildNumber`) lo autoincrementa EAS (`eas.json`: `appVersionSource: "remote"`, `autoIncrement`).
- Cada release queda con tag git `vX.Y.Z`, GitHub Release con notas y `CHANGELOG.md` generado.
- Si haces squash-merge de un PR, el **título del PR** debe seguir Conventional Commits
  (es el mensaje que llega a `main`).

## Pipeline CI/CD (GitHub Actions)

```
PR → main ──► ci.yml: lint + typecheck (debe pasar para mergear)
push/merge a main ──► release.yml:
    1. ci (lint + typecheck)            ── si falla, se detiene
    2. semantic-release                 ── calcula versión, actualiza app.json/package.json/
                                           CHANGELOG.md, commit "chore(release): vX.Y.Z [skip ci]",
                                           tag vX.Y.Z y GitHub Release
    3a. ota-update (si hubo release)    ── `eas update --channel production` (Android + iOS)
    3b. build-android (si hubo release) ── solo si no existe build para el runtime (fingerprint)
                                           actual: `eas build --profile production` → APK
                                           adjunto al Release. Si existe, anota en el Release
                                           que la versión llega por OTA.
```

- Archivos: `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `.releaserc.json`,
  `eas.json`, `scripts/sync-app-version.js`.
- Si en `main` solo hay commits `docs/chore/...` no se genera release ni build.
- Probar localmente qué versión saldría: `npm run release:dry` (requiere Node ≥ 26.13 por
  semantic-release; en CI ya se usa Node 26).
- **Configuración pendiente (una sola vez, la hace un admin):**
  1. ✅ Hecho (2026-11-18): proyecto `@accor-dium/Nutriccord` en
     [expo.dev](https://expo.dev/accounts/accor-dium/projects/Nutriccord); `extra.eas.projectId`
     y `owner` ya están en `app.json`.
  2. ✅ Hecho (2026-11-18): secret `EXPO_TOKEN` en GitHub (access token de expo.dev). Sin él,
     el release se publica pero la OTA y el build se omiten con un warning.
  3. ✅ Hecho (2026-11-18): keystore de Android generado y guardado en los servidores de EAS
     (credenciales remotas) con el primer build. No borrarlo: sin él no se pueden publicar
     actualizaciones de la app en Google Play.
  4. Repo → Settings → Actions → General → *Workflow permissions*: "Read and write".
  5. Protección de `main`: exigir que pase el check **CI / Lint y typecheck**. Si se exige PR
     para todo push, permitir que `github-actions[bot]` haga bypass, porque semantic-release
     sube el commit de versión a `main`.
- Builds: perfil `production` genera **APK** (instalable directo). Para Google Play cambiar
  `android.buildType` a `app-bundle` y usar `eas submit`. iOS requiere cuenta de Apple
  Developer; agregar job `--platform ios` cuando exista.

## Actualizaciones de la app (OTA + aviso de versión nativa)

La app se actualiza sola; nadie debería tener que bajar el APK a mano en cada release.

| Tipo de cambio | Cómo llega al usuario | Android | iOS |
|---|---|---|---|
| Solo JS / estilos / assets (lo normal) | **OTA** con EAS Update (`expo-updates`), canal `production` | ✅ automático | ✅ automático |
| Cambio nativo (librería nativa nueva, SDK, permisos, `app.json` nativo, íconos) | **Build nueva** | Banner "Nueva versión X disponible → Descargar" (APK del GitHub Release) | App Store / TestFlight (cuando exista; `IOS_STORE_URL`) |

- **Runtime version = `fingerprint`** (`app.json > runtimeVersion.policy`). Es un hash del
  código/config **nativos**; NO depende de `expo.version`. Así una OTA llega a todas las builds
  con el mismo nativo aunque la versión SemVer suba. **No cambiar a `appVersion`**: como el
  pipeline sube la versión en cada release, ninguna OTA llegaría a builds instaladas.
- Flujo en la app (`src/hooks/use-app-updates.ts`, `src/components/update-banner.tsx`):
  al abrir y al volver a primer plano (máx. 1 vez/hora) revisa OTA → la descarga en segundo
  plano → banner "Actualización lista → Reiniciar". En Android además consulta la API pública de
  GitHub Releases (`src/lib/native-release.ts`) y compara el último Release **con APK** contra
  `Application.nativeApplicationVersion` (la versión del APK instalado; no cambia con OTA).
- No hace nada en desarrollo (`__DEV__`), Expo Go ni web.
- El repo debe seguir **público** para que la app pueda leer los Releases sin token
  (`src/constants/app.ts > GITHUB_REPO`). Límite de la API sin token: 60 req/h por IP.
- **iOS:** recibe OTA igual que Android. Para versiones nativas falta cuenta de Apple Developer,
  builds iOS y `IOS_STORE_URL`; la App Store / TestFlight ya notifican sus propias actualizaciones.
- Probar una OTA en un build release: cerrar la app por completo y reabrir; puede tomar
  **hasta dos arranques en frío** (uno descarga, el siguiente aplica) o usar el botón "Reiniciar".
- Las builds anteriores a `expo-updates` (el APK de `v0.1.0`) **no** reciben OTA ni ven el
  banner: hay que instalar a mano, una sola vez, el primer APK que ya lo incluya.

## Convenciones

- UI en **español**; código (nombres de variables, funciones, tipos) en **inglés**.
- Lógica de negocio pura en `src/lib/` (sin React), para poder testearla aislada.
- Nada que no sea ruta dentro de `src/app/`.
- Usar `Text` y los componentes de `components/ui/` con `useTheme()` para respetar modo
  claro/oscuro; colores nuevos van en `constants/theme.ts` (en `light` y `dark`).
- Con `Link asChild` / `TabTrigger asChild` de Expo Router, el hijo debe recibir estilos
  planos (`StyleSheet.flatten`), no arreglos ni funciones de estilo.
- Web usa `web.output: "single"` (SPA): el estado viene de `localStorage` y un render en
  servidor causaría diferencias de hidratación.
- No crear/editar `android/` ni `ios/` a mano (Continuous Native Generation);
  configurar vía `app.json` y config plugins.

## Estado actual / pendientes

- [x] Base Expo + Expo Router + TypeScript
- [x] Lógica de cálculo de calorías/macros, actividad (MET) y equivalentes SMAE
- [x] Pantallas del diseño: Hoy, Diario, Agregar, Actividad, Progreso + Perfil
- [x] Persistencia local (`expo-sqlite/kv-store`)
- [x] Agregar y eliminar registros de comida y de actividad; registro de peso
- [x] Grupo SMAE, porción casera y equivalente por alimento; vista de equivalentes por grupo
- [ ] Editar un registro existente (hoy solo se elimina y se vuelve a agregar)
- [ ] Capturar las listas completas de alimentos del SMAE como catálogo local (hoy ~55)
- [ ] Alimentos personalizados del usuario y escaneo de código de barras (`expo-camera`)
- [ ] Historial más allá de 7 días (mes, tendencias)
- [ ] Ícono y splash propios de Nutriccord (hoy son los del template)
- [ ] Tests unitarios para `src/lib/` (calories, equivalents, activity, dates)

## Bitácora de cambios

Formato: `AAAA-MM-DD — autor — descripción`. Lo más reciente arriba.
(Desde 2026-11-18 el detalle por versión se genera también en `CHANGELOG.md`; aquí se
registran decisiones y contexto que no caben en un mensaje de commit.)

- **2026-11-18 — Implementación del diseño "Nutriccord App" (Claude Code)**
  - Nueva navegación: tabs personalizadas (`expo-router/ui`) con botón central "+" y modales
    `agregar` y `perfil` en un Stack. Se eliminaron `foods.tsx`, las NativeTabs y los
    componentes del template (`themed-*`, `animated-icon`, `external-link`, `global.css`).
  - Pantallas Hoy, Diario, Agregar, Actividad, Progreso y Perfil según el diseño.
  - Estado global persistido (`store/app-store.ts`) en SQLite key-value; sin datos mock.
  - Catálogo de ~55 alimentos con grupo SMAE, porción casera y gramos por equivalente.
  - Dependencias nuevas: `react-native-svg`, `expo-sqlite`, `@expo-google-fonts/inter`,
    `@expo-google-fonts/space-grotesk` (cambio nativo → el pipeline compila APK nuevo).
  - `web.output` cambiado a `single` para evitar errores de hidratación en web.

- **2026-11-18 — Actualizaciones automáticas (Claude Code)**
  - `expo-updates` + EAS Update (canales development/preview/production en `eas.json`),
    `updates.url` en `app.json`. Runtime policy `fingerprint` (decisión: ver sección
    "Actualizaciones de la app").
  - `expo-application` para leer la versión nativa instalada.
  - Banner in-app: OTA lista → Reiniciar; versión nativa nueva (Android) → Descargar APK.
  - Pipeline: job `ota-update` en cada release; `build-android` solo si cambió el runtime nativo.

- **2026-11-18 — Versionamiento y pipeline (Claude Code)**
  - Directiva SemVer 2.0.0 + Conventional Commits (sección "Versionamiento").
  - Versión inicial `0.1.0` (tag `v0.1.0`).
  - GitHub Actions: `ci.yml` (lint + typecheck en PRs) y `release.yml` (semantic-release +
    EAS Build Android en cada push a `main`). `eas.json` con perfiles development/preview/production.
  - Proyecto EAS creado: `@accor-dium/Nutriccord`
    (projectId `e2881d3d-5226-419d-9c04-4b3aebb62fd4`, owner `accor-dium`).
  - Identificador de app: `com.accordium.nutriccord` (Android `package` e iOS `bundleIdentifier`).
    **No cambiarlo** una vez publicada la app en tiendas.

- **2026-11-18 — SMAE y repo remoto (Claude Code)**
  - Se adopta el Sistema Mexicano de Alimentos Equivalentes (SMAE, 5a ed.) como referencia
    nutrimental. Documentado en la sección "Sistema de equivalentes (SMAE)".
  - Nuevo `src/data/smae.ts` con la Tabla 2 (aporte promedio por equivalente).
  - Repo remoto: `https://github.com/Accor-Dium/nutriccord` (rama `main`).

- **2026-11-18 — setup inicial (Claude Code)**
  - Proyecto creado con `create-expo-app` (template default, Expo SDK 58, RN 0.88).
  - Se eliminó el contenido demo (pantalla `explore`, `hint-row`, `web-badge`,
    `ui/collapsible`, script `reset-project`).
  - Se agregaron `src/types/nutrition.ts`, `src/lib/calories.ts`, `src/data/foods.ts`.
  - Pantallas `Hoy` (`index.tsx`) y `Alimentos` (`foods.tsx`); tabs renombradas.
  - Color `accent` (verde) en el tema; script `npm run typecheck`.
  - Arreglos al template para que pasen lint/typecheck: `use-color-scheme.web.ts` usa
    `useSyncExternalStore`; `TabButton` (web) descarta `ref`; ESLint configurado
    (`eslint-config-expo`). `expo-env.d.ts` está en `.gitignore` y lo genera
    `npx expo start` (créalo así si `tsc` no encuentra los módulos `.css`).
  - Creado este `CLAUDE.md`.
