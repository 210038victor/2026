# 研究報告：響應式互動學習電路分析

**分支**：`001-interactive-circuit-analysis` | **日期**：2026-03-13  
**目的**：解決 plan.md 技術環境中所有 NEEDS CLARIFICATION 項目，為 Phase 1 設計提供依據。

---

## 決策 1：電路求解器

**決策**：自訂 MNA（Modified Nodal Analysis）求解器，使用 numeric.js 的 `numeric.solve()` 進行矩陣方程式求解

**理由**：
- 自訂 MNA 可精確控制短路偵測（奇異矩陣處理）與開路偵測
- numeric.js 僅需其矩陣求解功能（`solve()`），捆包約 70KB（可接受）
- math.js（約 60KB）功能重疊且不針對稀疏矩陣最佳化
- 純自訂實作可於教學場景中直接展示 MNA 演算步驟

**評估的替代方案**：
- **math.js**：通用數學庫，功能冗余，不適合高頻率矩陣運算
- **完全自訂（無外部庫）**：需自行實作 Gaussian 消元法，維護成本高，不採用
- **SPICE.js**：GPL 授權，難以整合至教育 SPA

**技術細節**：
- 採用 Modified Nodal Analysis：設定節點電壓為未知數，電壓源電流為輔助未知數
- 元件圖章（stamp）矩陣：每種元件類型對應特定的 G 矩陣貢獻
- 短路偵測：矩陣行列式趨近於 0 時（`|det| < 1e-12`）判定為短路或浮接節點

---

## 決策 2：畫布/繪圖程式庫

**決策**：Konva.js（透過 react-konva 與 React 整合）

**理由**：
- Canvas 2D API：60fps 重繪，不因 React 虛擬 DOM 差異產生延遲
- 原生支援拖放、旋轉、縮放、觸控多點事件
- 分層架構（Layer）：格線、導線、元件、選取框各自獨立渲染
- 捆包約 35KB（gzip），小於 Fabric.js（60KB）

**評估的替代方案**：
- **SVG + D3**：文字渲染在大量元素時卡頓；DOM 操作不適合 60fps 電路更新
- **React Flow**：節點-邊界（DAG）範式不符合電路空間拓撲；捆包偏大
- **Fabric.js**：API 較舊，觸控最佳化不如 Konva；與 React 整合複雜度較高
- **純 SVG + React**：每次元件狀態變更都觸發整棵 SVG 樹重新渲染，在行動裝置上效能不佳

---

## 決策 3：前端框架

**決策**：React 18 + Vite 5（TypeScript）

**理由**：
- 無伺服器端渲染需求；純前端 SPA 即可滿足所有功能
- Vite 建置速度最快，原生 ESM 支援，樹搖最佳化（tree-shaking）
- GitHub Pages 部署：`npm run build` 產出 `/dist` 靜態目錄，直接推送 `gh-pages` 分支
- React 生態系最廣，Konva.js（react-konva）、Zustand 均有原生支援

**評估的替代方案**：
- **Next.js（靜態匯出）**：捆包多出 ~40KB；檔案路由機制對 SPA 冗余；Vercel 最佳化但非必要
- **Vue 3 + Vite**：技術上可行，但 react-konva 生態系更成熟

---

## 決策 4：狀態管理

**決策**：Zustand（含自訂復原/重做中介軟體）

**理由**：
- 捆包僅 2.3KB；無複雜 action/reducer 樣板
- 支援 Immer 中介軟體（不可變更新）
- 分離狀態：`circuitStore`（畫布拓撲）、`simulationStore`（模擬結果）、`lessonStore`（課程進度）、`historyStore`（復原/重做）

**復原/重做策略**：動作佇列（action queue）+ 重播（replay）
- 每次使用者操作（新增/刪除/移動/修改值）記錄一個 `CanvasAction`
- 復原：從 past 取出最後一個動作，重播 past 中剩餘的全部動作重建狀態
- 重做：將 future 的第一個動作套用至當前狀態
- 最多保存 20 步（FR-006）

**評估的替代方案**：
- **Redux Toolkit**：捆包 ~15KB；中大型團隊適用，但對本專案過重
- **React Context + useReducer**：復原/重做實作複雜；Context 更新觸發整樹重新渲染

---

## 決策 5：進度持久化

**決策**：localStorage（第一階段）

**理由**：
- 靜態網站無後端；localStorage 完全在客戶端，符合 Constitution Principle VIII
- 約 5MB 配額，足以儲存 100+ 堂課程記錄
- 瀏覽器重新整理、分頁關閉、裝置睡眠後均可恢復（滿足 FR-010 與 SC-006）
- 進度資料結構簡單（見 data-model.md）

**後續擴展路徑**（超出本功能範疇）：
- 可加入 Cloudflare Worker 作為輕量後端，實現跨裝置同步
- Service Worker + Cache API 可強化離線支援

**評估的替代方案**：
- **IndexedDB**：結構化查詢能力強，但對簡單 K/V 進度資料過於複雜
- **sessionStorage**：不持久，不符合 FR-010
- **Cloudflare Worker + KV（第一階段）**：引入後端依賴，違反靜態網站原則

---

## 決策 6：測試策略

**決策**：Vitest + React Testing Library + Playwright

| 測試層 | 工具 | 理由 |
|--------|------|------|
| 單元測試 | Vitest | 與 Vite 同生態系，啟動速度快（~100ms）；原生 ESM |
| 元件測試 | React Testing Library | 以行為驅動測試；鼓勵可訪問性（ARIA）設計 |
| E2E 測試 | Playwright | 多瀏覽器支援（Chrome、Firefox、WebKit）；觸控模擬；行動裝置視窗設定 |

**測試覆蓋重點**：
1. MNA 求解器（所有元件類型、短路、開路、浮接節點）
2. 元件拖放與導線連接（RTL + Playwright）
3. 課程步驟流程（提交正確/錯誤答案、進度儲存）
4. 響應式版面（Playwright 於 320px / 768px / 1440px）

**評估的替代方案**：
- **Jest**：不原生支援 ESM，需額外設定；Vitest 更簡單
- **Cypress**：僅支援 Chromium；啟動較慢；Playwright 更現代化

---

## 決策 7：SI 單位前綴格式化

**決策**：自訂 `formatSI()` 工具函數（無外部套件）

**理由**：
- 功能需求明確（p, n, µ, m, k, M, G, T 前綴，FR-015）
- 約 50 行程式碼，零依賴
- dinero.js / numeral.js 等套件針對貨幣格式，功能過剩且額外增加 10KB+ 捆包

**支援前綴**：T（10¹²）、G（10⁹）、M（10⁶）、k（10³）、（10⁰）、m（10⁻³）、µ（10⁻⁶）、n（10⁻⁹）、p（10⁻¹²）

---

## 待確認假設

| 項目 | 假設 | 影響 |
|------|------|------|
| 驗證整合 | 外部系統提供已登入的學生身分識別（`studentId`），以 URL 參數或全域變數傳入 | 進度儲存以 `studentId` 作為 localStorage 鍵前綴；若無 ID 則使用匿名模式 |
| 課程內容格式 | JSON 靜態檔案，由課程設計者預先準備 | 無需 CMS；於 `src/data/lessons/` 中維護 |
| 瀏覽器支援 | 現代瀏覽器（ES2020+）；不支援 IE | 可使用原生 ESM、可選鏈、空值合併運算子 |
