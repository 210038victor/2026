# 快速上手：響應式互動學習電路分析

**分支**：`001-interactive-circuit-analysis` | **日期**：2026-03-13

---

## 環境需求

- Node.js 20+
- npm 10+
- 現代瀏覽器（Chrome 120+、Firefox 120+、Safari 17+）

---

## 初始化專案

```bash
# 1. 於儲存庫根目錄建立 Vite + React + TypeScript 專案
#    （注意：於子目錄初始化以保護 /specs 和 .specify 目錄 — Constitution VII）
npm create vite@latest . -- --template react-ts

# 2. 安裝相依套件
npm install

# 3. 安裝執行期套件
npm install konva react-konva zustand numeric

# 4. 安裝開發期套件
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event
npm install -D playwright @playwright/test

# 5. 安裝 Playwright 瀏覽器
npx playwright install --with-deps chromium firefox webkit
```

---

## 目錄結構建立

```bash
mkdir -p src/{components/{canvas,toolbar,simulation,lessons,exercises,dashboard},solver,stores,data/{lessons,exercises},utils,hooks,types}
mkdir -p tests/{unit/{solver,utils},component,e2e}
```

---

## 開發伺服器

```bash
npm run dev
# → http://localhost:5173
```

---

## 執行測試

```bash
# 單元測試 + 元件測試（Vitest）
npm run test

# 監聽模式（開發中使用）
npm run test:watch

# 測試覆蓋率報告
npm run test:coverage

# E2E 測試（Playwright，需先啟動開發伺服器）
npx playwright test

# E2E 測試（含 UI 報告）
npx playwright test --reporter=html
```

---

## 建置與部署至 GitHub Pages

```bash
# 建置靜態檔案
npm run build
# → 產出至 dist/

# 預覽建置結果（本機）
npm run preview

# 部署至 GitHub Pages（gh-pages 分支）
npx gh-pages -d dist
```

**重要**：確認 `vite.config.ts` 中的 `base` 設定符合 GitHub Pages 儲存庫路徑：

```ts
// vite.config.ts
export default defineConfig({
  base: '/2026/', // 替換為實際儲存庫名稱
  // ...
});
```

---

## 關鍵模組使用範例

### 電路求解器

```typescript
import { solveCircuit } from '@/solver/mna';

const result = solveCircuit(circuit);
if (result.status === 'ok') {
  console.log('節點電壓：', result.nodeVoltages);
  console.log('支路電流：', result.branchCurrents);
} else {
  console.error('模擬錯誤：', result.error.message);
}
```

### SI 單位格式化

```typescript
import { formatSI } from '@/utils/siFormat';

formatSI(0.5, 'A');       // "500 mA"
formatSI(4700, 'Ω');      // "4.7 kΩ"
formatSI(0.000001, 'F');  // "1 µF"
```

### 復原/重做

```typescript
import { useHistoryStore } from '@/stores/historyStore';

const { execute, undo, redo, canUndo, canRedo } = useHistoryStore();

// 執行操作（自動記錄歷史）
execute({ type: 'add-component', payload: { ... }, timestamp: Date.now() });

// 復原（Ctrl+Z）
undo();

// 重做（Ctrl+Y）
redo();
```

---

## 課程資料格式（JSON 範例）

```json
{
  "id": "ohms-law",
  "title": "歐姆定律",
  "topic": "ohms-law",
  "difficulty": "beginner",
  "estimatedMinutes": 10,
  "prerequisiteIds": [],
  "steps": [
    {
      "id": "step-1",
      "order": 1,
      "instruction": "在畫布上放置一個 10Ω 的電阻和一個 5V 的電壓源，並用導線連接它們（記得接地）。",
      "type": "place-component",
      "expectedAnswer": "connected",
      "hint": "電壓源需要接地才能形成完整電路。",
      "explanation": "完整電路需要電壓源、負載（電阻）和接地節點構成迴路。"
    },
    {
      "id": "step-2",
      "order": 2,
      "instruction": "根據歐姆定律（I = V/R），計算電路中的電流值（單位：A）。",
      "type": "enter-value",
      "expectedAnswer": 0.5,
      "tolerance": 2,
      "hint": "將電壓除以電阻即可得到電流。",
      "explanation": "I = V/R = 5V / 10Ω = 0.5A。這就是歐姆定律的基本應用。"
    }
  ]
}
```

---

## 開發工作流程摘要

```
1. 依照 Constitution V（TDD）撰寫測試 → 確認失敗（Red）
2. 實作最小可行程式碼使測試通過（Green）
3. 重構程式碼（Refactor）
4. 提交程式碼，同時更新 tasks.md（Constitution VI）
```
