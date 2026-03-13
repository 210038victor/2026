# Quickstart: 響應式互動學習電路分析

**Feature**: `001-interactive-circuit-analysis`  
**Date**: 2026-03-13

---

## 前置需求

| 工具 | 最低版本 | 說明 |
|-----|---------|------|
| Node.js | 20 LTS | 建置工具執行環境 |
| npm | 10.x | 套件管理（隨 Node.js 附帶）|
| 現代瀏覽器 | Chrome 100+ / Firefox 100+ / Safari 15+ | 執行應用程式 |

---

## 快速開始

### 1. 初始化專案

```bash
# 在儲存庫根目錄執行，使用 --no-git 避免覆蓋現有 .gitignore
cd /path/to/2026
npm create vite@latest . -- --template react-ts --no-git
```

> ⚠️ **重要**：執行後立即驗證 `specs/` 目錄未被修改：`ls -la specs/`

### 2. 安裝依賴

```bash
npm install
npm install mathjs react-router-dom
npm install --save-dev vitest @testing-library/react @testing-library/user-event jsdom
```

### 3. 啟動開發伺服器

```bash
npm run dev
# 瀏覽器開啟 http://localhost:5173
```

### 4. 執行測試

```bash
npm run test          # 執行所有測試（Vitest）
npm run test -- --watch  # 監看模式
npm run test -- --coverage  # 含覆蓋率報告
```

### 5. 建置靜態產出

```bash
npm run build         # 產出至 dist/
npm run preview       # 預覽建置結果（http://localhost:4173）
```

### 6. 部署至 GitHub Pages

```bash
npm run build
# 將 dist/ 目錄內容推送至 gh-pages 分支，或設定 GitHub Actions 自動部署
```

---

## 電路求解引擎開發指南

電路引擎位於 `src/engine/`，是應用程式最關鍵的核心模組。

### 建立新測試（TDD 流程）

```typescript
// tests/unit/mna.test.ts
import { describe, it, expect } from 'vitest';
import { solveCircuit } from '@/engine/mna';

describe('solveCircuit', () => {
  it('簡單電阻電路：5V / 10Ω = 0.5A', () => {
    const circuit = buildSimpleResistorCircuit({ voltage: 5, resistance: 10 });
    const result = solveCircuit(circuit);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.values.componentResults['R1'].current).toBeCloseTo(0.5, 5);
    }
  });

  it('短路應回傳 SHORT_CIRCUIT 錯誤', () => {
    const circuit = buildShortCircuit();
    const result = solveCircuit(circuit);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('SHORT_CIRCUIT');
    }
  });
});
```

### MNA 矩陣組裝流程

```
1. 編號所有節點（接地節點 = 0）
2. 建構 G 矩陣（電導矩陣，N×N）
3. 加入電壓源：擴展為 (N+M)×(N+M) MNA 矩陣
4. 建構 b 向量（電流源注入 + 電壓源電壓）
5. 呼叫 math.lusolve(A, b) 求解
6. 解析結果向量 → 節點電壓 + 電壓源電流
```

---

## 新增課程內容

1. 在 `src/data/lessons/` 建立新 JSON 檔案，遵守 [lesson-schema.md](./contracts/lesson-schema.md)
2. 在 `src/data/lessons/index.ts` 匯入並加入 `lessons` 陣列
3. 執行測試確認 JSON 格式正確：`npm run test -- --reporter=verbose`

---

## 常見問題

**Q：電路計算結果顯示 NaN？**  
A：確認電路有接地節點（`type: 'ground'`）並已正確連接。缺少接地節點會導致矩陣奇異。

**Q：開發伺服器啟動後 specs/ 目錄被清空？**  
A：Vite 預設清理 `dist/`，不影響 `specs/`。若使用 `create-next-app` 等其他腳手架，請先備份 `specs/`（見憲法原則 VII）。

**Q：如何在行動裝置上測試？**  
A：開發伺服器啟動後，使用 `--host` 參數暴露至區域網路：`npm run dev -- --host`，在同網段行動裝置開啟 `http://{你的IP}:5173`。

**Q：localStorage 資料在哪裡？**  
A：瀏覽器 DevTools → Application → Local Storage → `http://localhost:5173`，鍵名前綴為 `ica_`。

---

## 目錄速查

| 目錄/檔案 | 說明 |
|---------|------|
| `src/engine/` | 電路求解引擎（MNA，純 TypeScript） |
| `src/components/Canvas/` | SVG 互動畫布 |
| `src/components/Lesson/` | 課程步驟介面 |
| `src/data/lessons/` | 課程 JSON 資料 |
| `src/data/exercises/` | 練習 JSON 資料 |
| `tests/unit/` | 引擎單元測試 |
| `tests/integration/` | UI 元件整合測試 |
| `specs/001-interactive-circuit-analysis/` | 功能規格與設計文件 |
