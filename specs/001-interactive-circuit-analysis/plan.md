# 實作計畫：響應式互動學習電路分析

**分支**: `001-interactive-circuit-analysis` | **日期**: 2026-03-13 | **規格**: [spec.md](./spec.md)  
**輸入**: 功能規格 `/specs/001-interactive-circuit-analysis/spec.md`

---

## 摘要

建置一個純前端靜態單頁應用程式（SPA），讓學生能在瀏覽器中互動式地組裝電路、即時查看 DC 模擬結果，並透過引導式課程、練習題與進度追蹤學習電路分析理論。

技術方案：React 18 + Vite（靜態匯出）+ Konva.js（互動畫布）+ Zustand（狀態管理）+ 自製 MNA 模擬引擎 + localStorage/IndexedDB（本機持久化），部署至 GitHub Pages，無需後端伺服器。

---

## 技術背景

**語言/版本**：TypeScript 5.x  
**主要依賴**：React 18、Vite 5、Konva.js 10 + react-konva、Zustand 5 + Immer 10  
**儲存**：localStorage（進度元資料）+ IndexedDB（電路資料）  
**測試**：Vitest 2 + React Testing Library 16 + Playwright 1  
**目標平台**：現代瀏覽器（Chrome 110+、Firefox 110+、Safari 16+、Edge 110+），桌面/平板/行動裝置  
**專案類型**：靜態 SPA（可部署至 GitHub Pages）  
**效能目標**：電路值更新 < 1s；UI 互動 60 fps；頁面載入 < 3s（4G 網路）  
**限制**：無後端伺服器；離線可用；支援 320px–2560px 螢幕寬度；最大 50 個元件  
**規模/範疇**：初版 10 堂課程、10 個練習題；個人工作區電路不限數量（受 IndexedDB 空間限制）

---

## 憲法合規檢查

*重要門檻：Phase 0 研究前必須通過；Phase 1 設計後重新驗證。*

| 原則 | 狀態 | 說明 |
|------|------|------|
| **I. 繁體中文優先** | ✅ 通過 | 所有文件（plan.md、research.md 等）以繁體中文撰寫 |
| **II. 簡約設計** | ✅ 通過 | 純前端 SPA，無後端；自製 MNA 而非引入重型 SPICE 函式庫；Zustand 而非 Redux |
| **III. 精簡文檔** | ✅ 通過 | 僅建立必要的 speckit 文件；無額外 CHANGELOG 或報告 |
| **IV. Git 流程紀律** | ✅ 通過 | 計畫文件完成後統一提交；任務於 tasks.md 追蹤 |
| **V. 測試驅動開發** | ✅ 通過 | tasks.md 中測試任務排在實作任務之前；合約、整合、單元測試均涵蓋 |
| **VI. 任務追蹤** | ✅ 通過 | 實施階段透過 tasks.md 打勾機制追蹤 |
| **VII. 規格保護** | ✅ 通過 | 前端框架初始化使用 `frontend/` 子目錄，不影響 `specs/` |
| **VIII. 靜態網站優先** | ✅ 通過 | Vite 靜態匯出，部署 GitHub Pages；無伺服器端程式碼 |

**Phase 1 後重新驗證（2026-03-13）**：所有原則仍符合，無新增違反。

---

## 專案結構

### 文件（本功能）

```text
specs/001-interactive-circuit-analysis/
├── plan.md              # 本檔案（/speckit.plan 輸出）
├── research.md          # Phase 0 輸出（技術研究）
├── data-model.md        # Phase 1 輸出（資料模型）
├── quickstart.md        # Phase 1 輸出（快速入門）
├── contracts/           # Phase 1 輸出（介面契約）
│   ├── simulation-engine.md
│   ├── state-stores.md
│   └── ui-components.md
└── tasks.md             # Phase 2 輸出（由 /speckit.tasks 產生）
```

### 原始碼（儲存庫根目錄）

```text
frontend/
├── src/
│   ├── components/
│   │   ├── canvas/        # CircuitCanvas、GridLayer、ComponentLayer、WireLayer、SelectionLayer
│   │   ├── lesson/        # LessonPanel、LessonCatalog、StepIndicator
│   │   ├── exercise/      # ExercisePage、AnswerInput、SolutionWalkthrough
│   │   └── progress/      # ProgressDashboard、LessonCard、ScoreBadge
│   ├── stores/
│   │   ├── circuitStore.ts
│   │   ├── lessonStore.ts
│   │   ├── progressStore.ts
│   │   └── uiStore.ts
│   ├── simulation/
│   │   ├── mna.ts          # MNA 演算法核心（DC 工作點分析）
│   │   ├── netlist.ts      # Circuit → SimComponent[] 轉換
│   │   └── formatter.ts    # SI 單位前綴格式化
│   ├── data/
│   │   ├── lessons/        # 各課程靜態 JSON（10 個主題）
│   │   └── exercises/      # 各練習題靜態 JSON
│   ├── types/
│   │   └── index.ts        # 全域型別定義
│   ├── utils/
│   │   └── persistence.ts  # localStorage + IndexedDB 存取工具
│   └── App.tsx
├── tests/
│   ├── unit/               # MNA 演算法、formatter、純函數測試
│   ├── integration/        # 元件互動測試（RTL）
│   └── e2e/                # 完整使用者流程（Playwright）
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

**結構決策**：採用 Option 2（前端單應用）但無後端；所有資料以靜態 JSON 打包至前端。此決策符合「靜態網站優先」原則，避免引入不必要的後端複雜度。

---

## 複雜度追蹤

> 僅在憲法檢查有需正當化的例外時填寫

本功能無憲法違反，無需填寫。
