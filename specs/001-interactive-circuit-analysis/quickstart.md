# 快速入門指南：響應式互動學習電路分析

**分支**：`001-interactive-circuit-analysis` | **日期**：2026-03-13

---

## 前置需求

| 工具 | 版本需求 | 安裝方式 |
|------|---------|---------|
| Node.js | 18 LTS 以上 | https://nodejs.org 或 `nvm install 18` |
| npm | 隨 Node.js 安裝 | — |
| Git | 任意現代版本 | https://git-scm.com |

---

## 專案初始化步驟

> ⚠️ **重要（憲法原則 VII）**：Vite 需於 `frontend/` 子目錄初始化，以保護 `specs/` 目錄不被覆蓋。

### 步驟 1：確認目前分支

```bash
git checkout 001-interactive-circuit-analysis
# 或在 CI 環境使用：
SPECIFY_FEATURE=001-interactive-circuit-analysis
```

### 步驟 2：初始化前端專案

```bash
# 在儲存庫根目錄執行
npm create vite@latest frontend -- --template react-ts

# 進入前端目錄
cd frontend
```

### 步驟 3：安裝依賴

```bash
npm install
npm install mathjs zustand
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
```

### 步驟 4：確認 specs/ 目錄完整（憲法原則 VII 驗證點）

```bash
# 回到根目錄
cd ..
ls specs/001-interactive-circuit-analysis/
# 應顯示：spec.md  plan.md  research.md  data-model.md  quickstart.md  contracts/  checklists/
```

---

## 開發伺服器

```bash
cd frontend
npm run dev
# 開啟瀏覽器：http://localhost:5173
```

---

## 執行測試

```bash
cd frontend

# 執行全部測試
npm run test

# 執行測試（監看模式）
npm run test -- --watch

# 執行特定模組測試
npm run test -- tests/unit/engine/

# 查看覆蓋率報告
npm run test -- --coverage
```

---

## 建置靜態網站

```bash
cd frontend
npm run build
# 輸出至 frontend/dist/
```

### 本機預覽建置結果

```bash
npm run preview
# 開啟瀏覽器：http://localhost:4173
```

---

## 部署至 GitHub Pages

```bash
# 從儲存庫根目錄
cd frontend
npm run build

# 將 dist/ 部署至 gh-pages 分支
npx gh-pages -d dist
```

或在 GitHub Actions 中設定自動部署（建議方式）。

---

## 目錄結構速覽

```text
frontend/src/
├── engine/
│   ├── mna.ts          ← 從 MNA 矩陣組建開始實作
│   ├── solver.ts       ← 電路求解器入口（見 contracts/circuit-engine.md）
│   └── units.ts        ← SI 前綴格式化
├── components/
│   ├── canvas/         ← SVG 畫布（最複雜的 UI 元件）
│   ├── palette/        ← 元件選擇面板
│   ├── lesson/         ← 課程步驟面板
│   ├── exercise/       ← 練習題面板
│   └── dashboard/      ← 進度儀表板
├── store/              ← Zustand store（電路、課程、進度）
├── data/               ← 靜態 JSON 課程與練習題資料
└── utils/
    └── storage.ts      ← localStorage 封裝（見 contracts/storage-schema.md）
```

---

## 開發順序建議（遵循 TDD 原則）

依照 `tasks.md` 的順序執行，大致如下：

1. **P1 — 電路求解引擎**（最核心）
   - 先寫 `tests/unit/engine/` 測試（對照 `contracts/circuit-engine.md`）
   - 再實作 `src/engine/mna.ts` 與 `solver.ts`

2. **P1 — 電路畫布 UI**
   - 先寫畫布整合測試
   - 再實作 SVG 元件與拖放邏輯

3. **P2 — 課程系統**
   - 先寫課程流程測試
   - 再實作課程面板與進度追蹤

4. **P3 — 進度儀表板**

5. **P4 — 練習題系統**

---

## 常見問題

**Q：如何新增一個課程？**  
在 `src/data/lessons/` 建立新的 JSON 檔案，遵循 `data-model.md` 中 `Lesson` 介面的格式。

**Q：短路錯誤如何觸發？**  
將兩個端子用導線直接連接（形成零阻抗迴路），畫布上應顯示紅色警告橫幅。

**Q：進度在哪裡儲存？**  
瀏覽器的 localStorage，鍵值為 `circuit-learning:progress`。可在開發者工具的「Application → Local Storage」中查看。

**Q：如何切換學生 ID（模擬不同使用者）？**  
在開發環境中，可在 `src/store/progressStore.ts` 設定 `studentId`。正式環境中 ID 由外部認證系統提供。
