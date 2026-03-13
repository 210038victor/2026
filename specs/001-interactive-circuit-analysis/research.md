# Research: 響應式互動學習電路分析

**Feature**: `001-interactive-circuit-analysis`  
**Phase**: 0 — 研究與決策  
**Date**: 2026-03-13

---

## 1. 電路求解演算法

**決策**：採用改良節點分析法（Modified Nodal Analysis, MNA）

**理由**：
- MNA 是業界標準（SPICE 模擬器核心演算法），可處理任意電路拓撲
- 對電阻、電壓源、電流源均有統一的矩陣公式，不需針對每種元件特殊處理
- 在初版規模（≤50 元件）下，矩陣規模小（N < 100），LU 分解耗時遠低於 1 ms

**考慮的替代方案**：
- **手算公式法（Rules-based）**：僅適用於簡單串並聯，無法處理橋接電路或含電壓源的網路，已排除
- **疊代法（Gauss-Seidel）**：收斂性不穩定，對含電壓源的電路需額外處理，已排除
- **SPICE.js / Circuit.js 現成函式庫**：這些套件體積大（>200 kB gzip）且維護不穩定，不符合簡約原則。自行實作 MNA 核心約 200 行 TypeScript，更可控

**短路 / 開路處理**：
- 短路：MNA 矩陣行列式趨近於零 → 在求解前偵測，顯示「短路警告」，停止計算，符合 FR-004
- 開路節點：孤立節點電壓設為 0，顯示提示

---

## 2. 前端框架選擇

**決策**：React 18 + Vite 5（靜態匯出）

**理由**：
- 符合憲法原則 VIII（靜態網站優先），可直接部署 GitHub Pages
- React 18 Concurrent Mode 支援高頻率狀態更新，適合即時電路計算
- Vite 5 建置速度快，支援 TypeScript，無需 eject 設定
- 生態系成熟（React Testing Library、React Router v6）

**考慮的替代方案**：
- **Next.js**：功能過剩（SSR/RSC），且 `create-next-app` 可能覆蓋根目錄結構（憲法原則 VII 風險），已排除
- **Vue 3 + Vite**：同樣可行，但團隊規範偏 React，且 React 生態更豐富，已排除
- **原生 HTML/CSS/JS（無框架）**：對複雜狀態管理（畫布互動、多步驟課程）不適合，已排除

---

## 3. 互動式畫布實作

**決策**：SVG + React 狀態管理（`useReducer`），輔以 Pointer Events API 處理拖曳

**理由**：
- SVG 原生支援向量圖形，電路元件符號（電阻、電容等）可直接用 `<path>` 繪製，縮放清晰
- Pointer Events API 統一處理滑鼠與觸控，符合 FR-014（觸控操作）
- 無需引入 Canvas 2D 或 WebGL，複雜度低，符合原則 II

**考慮的替代方案**：
- **Canvas 2D API**：需自行處理碰撞偵測、選取、座標轉換，程式碼量遠大於 SVG，已排除
- **Konva.js / Fabric.js**：第三方函式庫，體積大（>50 kB），且功能遠超需求，已排除
- **D3.js**：適合資料視覺化，但對互動式繪圖的學習曲線陡峭，已排除

---

## 4. 學習進度儲存策略

**決策**：`localStorage` 序列化 JSON，鍵值設計為 `ica_progress_{lessonId}`

**理由**：
- 無需後端，完全靜態部署，符合憲法原則 VIII
- 初版單一使用者（本機）場景，localStorage 5–10 MB 容量已足夠
- 符合 FR-010（跨 session 保存進度）、FR-006（Undo/Redo 歷史存入 sessionStorage）
- 離線可用，符合邊緣案例需求（失去網路連線時保留進度）

**考慮的替代方案**：
- **IndexedDB**：對結構化資料更好，但 API 複雜；初版資料量小，localStorage 已夠，如未來需要可遷移
- **後端 API + 資料庫**：超出靜態網站限制，違反原則 VIII，已排除

---

## 5. 數學運算套件

**決策**：`mathjs` v13（僅引入矩陣模組，tree-shaking 後約 20 kB gzip）

**理由**：
- 提供穩定的 LU 分解（`math.lusolve`），可直接求解 MNA 線性方程組 `Ax = b`
- 支援複數（未來 AC 分析擴充用），設計上具備前瞻性但不過度引入
- Tree-shaking 後體積合理

**考慮的替代方案**：
- **自行實作 Gaussian Elimination**：約 80 行程式碼，但需自行處理主元選取（pivoting）與數值穩定性，易出錯，已排除
- **numeric.js**：已停止維護（2017），已排除
- **ml-matrix**：功能足夠但文件稀少；mathjs 更廣泛使用，已排除

---

## 6. 響應式設計策略

**決策**：CSS Grid + Flexbox，搭配 CSS 自訂屬性（CSS Variables）；不使用 CSS-in-JS

**理由**：
- 原生 CSS 方案零執行時成本，符合簡約原則
- CSS Grid 適合複雜版型（畫布 + 面板），Flexbox 適合元件排列
- 需支援 320 px 至 2560 px（FR-013），採用 mobile-first 撰寫斷點

**考慮的替代方案**：
- **Tailwind CSS**：體積合理但增加建置設定複雜度，且對 SVG 元件樣式支援有限，已排除
- **Styled-components / Emotion（CSS-in-JS）**：執行時開銷，且 SSR 需額外設定，已排除

---

## 7. 路由方案

**決策**：React Router v6（`HashRouter`）

**理由**：
- `HashRouter` 無需伺服器端路由設定，可直接部署 GitHub Pages（無 `_redirects` 需求）
- 路由結構簡單（4 頁面），React Router v6 API 已足夠

**考慮的替代方案**：
- **BrowserRouter + GitHub Pages 404.html hack**：需額外設定，增加維護負擔，已排除
- **手動 `window.location` 路由**：不符合現代開發慣例，已排除

---

## 8. 課程內容資料格式

**決策**：靜態 JSON 檔案（`src/data/lessons/*.json`），建置時打包

**理由**：
- 無需 CMS 或 API，符合靜態部署原則
- JSON 格式對 TypeScript 型別推斷友好，可定義 `Lesson` 介面進行型別檢查
- 課程內容由 SME 提供，初版以 JSON 手工撰寫

**考慮的替代方案**：
- **Markdown + frontmatter（MDX）**：適合以文字為主的內容，但電路分析課程需嵌入結構化的步驟資料（預期答案、提示），JSON 更適合，已排除
- **外部 CMS（Contentful、Sanity）**：需要 API 金鑰與網路請求，違反靜態/離線原則，已排除

---

## 解決的 NEEDS CLARIFICATION 項目

| 原始問題 | 決策 | 狀態 |
|---------|------|------|
| 電路求解演算法 | MNA（改良節點分析法） | ✅ 已解決 |
| 前端框架 | React 18 + Vite 5 | ✅ 已解決 |
| 畫布技術 | SVG + React | ✅ 已解決 |
| 進度儲存 | localStorage | ✅ 已解決 |
| 矩陣運算 | mathjs v13 | ✅ 已解決 |
| 響應式設計 | 原生 CSS Grid/Flexbox | ✅ 已解決 |
| 路由方案 | React Router v6 HashRouter | ✅ 已解決 |
| 課程資料格式 | 靜態 JSON | ✅ 已解決 |
