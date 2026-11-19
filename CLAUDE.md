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
| Navegación | Expo Router (rutas por archivo en `src/app/`), tabs nativas (`expo-router/native-tabs`) |
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
  app/              # SOLO pantallas/rutas (Expo Router)
    _layout.tsx     # layout raíz: tema + tabs + splash
    index.tsx       # "Hoy": meta calórica, consumo, macros, registros del día
    foods.tsx       # "Alimentos": catálogo con búsqueda
  components/       # componentes reutilizables (ThemedText, ThemedView, app-tabs…)
    app-tabs.tsx      # tabs nativas (iOS/Android)
    app-tabs.web.tsx  # tabs para web
  constants/theme.ts  # colores (light/dark, incluye `accent`), spacing, fuentes
  hooks/            # useTheme, useColorScheme
  lib/calories.ts   # lógica pura de cálculo (BMR, TDEE, meta, sumas de macros)
  data/foods.ts     # catálogo semilla + perfil/registros MOCK
  data/smae.ts      # grupos del Sistema Mexicano de Alimentos Equivalentes (Tabla 2)
  types/nutrition.ts# tipos de dominio (UserProfile, Food, FoodEntry, Macros…)
assets/             # íconos, splash, imágenes
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
- **Meta diaria** = TDEE + ajuste por objetivo (bajar −500, mantener 0, subir +300 kcal).
- Comidas (`MealType`): desayuno, comida, cena, colación.
- Fechas de registros en formato ISO `yyyy-mm-dd`.

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
    3. build-android (si hubo release)  ── `eas build --profile production` → APK adjunto al Release
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
  2. Crear un access token en expo.dev → *Access tokens* y guardarlo en GitHub como secret
     `EXPO_TOKEN` (repo → Settings → Secrets and variables → Actions). Sin él, el release se
     publica pero el build se omite con un warning.
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

## Convenciones

- UI en **español**; código (nombres de variables, funciones, tipos) en **inglés**.
- Lógica de negocio pura en `src/lib/` (sin React), para poder testearla aislada.
- Nada que no sea ruta dentro de `src/app/`.
- Usar `ThemedText` / `ThemedView` / `useTheme()` para respetar modo claro/oscuro;
  colores nuevos van en `constants/theme.ts` (en `light` y `dark`).
- No crear/editar `android/` ni `ios/` a mano (Continuous Native Generation);
  configurar vía `app.json` y config plugins.

## Estado actual / pendientes

- [x] Base Expo + Expo Router + TypeScript
- [x] Pantalla "Hoy" y "Alimentos" con datos **mock**
- [x] Lógica de cálculo de calorías/macros
- [ ] Onboarding / pantalla de perfil (edad, peso, estatura, actividad, objetivo)
- [ ] Persistencia local (p. ej. `expo-sqlite`)
- [ ] Flujo para agregar/editar/eliminar registros de comida
- [ ] Asignar grupo SMAE y porción equivalente a cada alimento; vista de equivalentes por grupo
- [ ] Capturar las listas de alimentos del SMAE como catálogo local
- [ ] Base de datos de alimentos real (local o API) y escaneo de código de barras (`expo-camera`)
- [ ] Historial y gráficas por día/semana
- [ ] Ícono propio para la tab "Alimentos" (hoy reutiliza `tabIcons/explore.png`) y branding/ícono de app
- [ ] Tests unitarios para `src/lib/calories.ts`

## Bitácora de cambios

Formato: `AAAA-MM-DD — autor — descripción`. Lo más reciente arriba.
(Desde 2026-11-18 el detalle por versión se genera también en `CHANGELOG.md`; aquí se
registran decisiones y contexto que no caben en un mensaje de commit.)

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
