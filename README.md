# Back TUL The Future 🌀

Semestrální projekt pro výuku SQL formou interaktivního detektivního příběhu.

## 📝 O projektu
Projekt kombinuje prvky "Murder Mystery" s výukou databázových systémů. Hráč se v roli studenta FM TUL neúmyslně přenese do roku -6 291 456 v důsledku neošetřeného `INTEGER OVERFLOW` při zápisu do tabulky docházky.

**Cíl hry:** Přežít v pravěku, sestrojit první počítač z dostupných surovin a opravit časoprostor pomocí správně zapsaného a zabezpečeného SQL dotazu.

---

## 🛠 Technická Architektura (Hybridní Engine)
Abychom dosáhli vysoké vizuální kvality při zachování efektivního vývoje, projekt využívá hybridní 2D/3D přístup:

1. **Intro Scéna (Full 3D):** Postaveno na **Three.js**, simulující prostředí učebny a dramatický "glitch" efekt při přetečení integeru.
2. **Herní svět (2D + Interaktivní vrstvy):** - Pozadí generovaná pomocí AI (Midjourney).
   - Logika hry a UI (inventář, terminál) postavená na **Reactu**.
   - Stavový management řešící přechody mezi scénami a progres hráče.

---

## 🤖 AI Stack (Vibe Coding Workflow)
V rámci vývoje je kladen důraz na efektivitu s využitím moderních AI nástrojů:

* **Cursor IDE:** Hlavní nástroj pro generování kódu a logiky aplikace.
* **Midjourney:** Tvorba vizuálně konzistentních 2D prostředí (džungle, jeskyně).
* **Meshy.ai / Luma AI:** Generování 3D modelů pro klíčové interaktivní předměty.
* **GitHub Copilot:** Asistence při psaní bezpečných SQL dotazů a validací.

---

## 🔒 Bezpečnostní zaměření
Hlavním tématem projektu je **validace vstupů**. Hráč se učí:
* Předcházet Integer Overflow.
* Implementovat `CHECK` constraints.
* Psát bezpečné `INSERT` dotazy (ochrana proti SQL injection).

---

## 🚀 Instalace a spuštění
1. `npm install`
2. `npm run dev`

---

## ⚖️ Právní doložka (Disclaimer)
Tento projekt je vytvořen výhradně pro akademické účely jako semestrální práce na **Fakultě mechatroniky, informatiky a mezioborových studií TUL**.

* **Autorská práva:** Veškerý kód je autorským dílem studenta. 
* **AI generovaný obsah:** 3D modely a 2D grafická pozadí byla vytvořena s asistencí AI nástrojů (např. Meshy.ai, Midjourney). Použití těchto nástrojů je v souladu s licencemi pro akademické/nekomerční využití.
* **Ochranné známky:** Název a loga Technické univerzity v Liberci jsou použity v rámci "fair use" pro identifikaci školního díla.
* **Obsah:** Příběh a postavy jsou fiktivní. Jakákoliv podobnost s reálnými osobami (studenty či vyučujícími) je čistě náhodná a nezáměrná.



# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
