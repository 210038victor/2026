# 實作計畫：響應式互動學習電路分析

**分支**：`001-interactive-circuit-analysis` | **日期**：2026-03-13 | **規格**：[spec.md](./spec.md)  
**輸入**：功能規格來自 `/specs/001-interactive-circuit-analysis/spec.md`

## 摘要

建立一個可部署至 GitHub Pages 的靜態單頁應用程式（SPA），供學生透過互動式電路畫布（拖放元件、連接導線）即時模擬 DC 電路分析，並配合引導式課程、練習題及學習進度追蹤。技術選型採用 **React + Vite（TypeScript）**、**Konva.js**（畫布）、**自訂 MNA 求解器**（電路分析）、**Zustand**（狀態管理）、**localStorage**（進度儲存）。

---

## 技術環境

**Language/Version**: TypeScript 5.x + React 18  
**Primary Dependencies**: Vite 5、Konva.js（react-konva）、Zustand、numeric.js  
**Storage**: localStorage（進度資料）；靜態 JSON 檔案（課程與練習內容）  
**Testing**: Vitest + React Testing Library + Playwright  
**Target Platform**: 現代瀏覽器（Chrome、Firefox、Safari、Edge），GitHub Pages 靜態部署  
**Project Type**: static-website SPA  
**Performance Goals**: 電路值更新 ≤ 1 秒（FR-003）；頁面首次載入 ≤ 3 秒  
**Constraints**: 無後端伺服器；螢幕寬度 320px–2560px；觸控操作完整支援  
**Scale/Scope**: 初始 10 堂課程、10+ 練習題；單一學生個人使用空間

---

## 憲法符合性檢查

*門檻：Phase 0 研究前必須通過。Phase 1 設計後重新確認。*

| 原則 | 狀態 | 說明 |
|------|------|------|
| I. 繁體中文優先 | ✅ 通過 | 所有規格與計畫文件以繁體中文撰寫 |
| II. 簡約設計 | ✅ 通過 | 無後端伺服器；自訂 MNA 求解器取代大型程式庫；localStorage 取代資料庫 |
| III. 精簡文檔 | ✅ 通過 | 僅建立 plan.md、research.md、data-model.md、contracts/、quickstart.md 等規劃流程必要文件 |
| IV. Git 流程紀律 | ✅ 通過 | 規格階段已提交；計畫階段完成後提交 |
| V. 測試驅動開發 | ✅ 通過 | tasks.md 中測試任務排在實作任務之前；採用 Vitest + RTL + Playwright |
| VI. 任務追蹤 | ✅ 通過 | 實施階段將使用 tasks.md 打勾機制追蹤 |
| VII. 規格保護 | ✅ 通過 | 框架初始化前將保護 `/specs` 目錄；於子目錄執行 Vite 初始化 |
| VIII. 靜態網站優先 | ✅ 通過 | 採用 React + Vite 靜態 SPA；可部署至 GitHub Pages；無需伺服器端程式碼 |

**例外說明（原則 VIII）**：進度持久化僅使用 localStorage，符合靜態網站限制。如未來需跨裝置同步，可於後續版本加入 Cloudflare Worker（屬範疇外）。

---

## 專案結構

### 文件（本功能）

```text
specs/001-interactive-circuit-analysis/
├── plan.md           # 本檔案（/speckit.plan 輸出）
├── research.md       # Phase 0 輸出（/speckit.plan）
├── data-model.md     # Phase 1 輸出（/speckit.plan）
├── quickstart.md     # Phase 1 輸出（/speckit.plan）
├── contracts/        # Phase 1 輸出（/speckit.plan）
│   ├── circuit-store.contract.md
│   ├── mna-solver.contract.md
│   └── progress-store.contract.md
└── tasks.md          # Phase 2 輸出（/speckit.tasks — 本計畫不建立）
```

### 原始碼（儲存庫根目錄）

```text
src/
├── components/
│   ├── canvas/
│   │   ├── CircuitCanvas.tsx       # 主畫布（Konva Stage）
│   │   ├── ComponentLayer.tsx      # 可拖放元件圖層
│   │   ├── WireLayer.tsx           # 導線圖層
│   │   ├── GridLayer.tsx           # 背景格線
│   │   └── SelectionOverlay.tsx    # 選取框圖層
│   ├── toolbar/
│   │   ├── ComponentPalette.tsx    # 元件選擇面板
│   │   └── ActionBar.tsx           # 復原/重做/清除操作列
│   ├── simulation/
│   │   ├── NodeVoltageDisplay.tsx  # 節點電壓顯示
│   │   └── SimulationPanel.tsx     # 模擬結果面板
│   ├── lessons/
│   │   ├── LessonCatalog.tsx       # 課程目錄
│   │   ├── LessonPlayer.tsx        # 課程步驟播放器
│   │   └── StepFeedback.tsx        # 步驟回饋元件
│   ├── exercises/
│   │   ├── ExerciseList.tsx        # 練習題清單
│   │   └── ExercisePlayer.tsx      # 練習題解題畫面
│   └── dashboard/
│       └── ProgressDashboard.tsx   # 學習進度儀表板
├── solver/
│   ├── mna.ts                      # Modified Nodal Analysis 求解器
│   ├── topology.ts                 # 電路拓撲分析（短路偵測、連通性）
│   └── simplify.ts                 # 串聯/並聯化簡、疊加定理
├── stores/
│   ├── circuitStore.ts             # 畫布狀態（元件、導線）
│   ├── simulationStore.ts          # 模擬結果狀態
│   ├── lessonStore.ts              # 課程進度狀態
│   └── historyStore.ts             # 復原/重做歷史（20 步）
├── data/
│   ├── lessons/                    # 課程 JSON 靜態資料
│   │   ├── ohms-law.json
│   │   ├── kvl.json
│   │   └── ...（共 10 堂）
│   └── exercises/                  # 練習題 JSON 靜態資料
├── utils/
│   ├── siFormat.ts                 # SI 單位前綴格式化工具
│   ├── persistence.ts              # localStorage 讀寫封裝
│   └── connectivity.ts             # 電路連通性工具函數
├── hooks/
│   ├── useKeyboardShortcuts.ts     # Ctrl+Z / Ctrl+Y 快捷鍵
│   └── useResponsive.ts            # 響應式斷點偵測
├── types/
│   └── circuit.ts                  # 所有 TypeScript 介面/類型定義
└── App.tsx                         # 根元件（路由：畫布 / 課程 / 儀表板）

tests/
├── unit/
│   ├── solver/
│   │   ├── mna.test.ts             # MNA 求解器單元測試
│   │   └── topology.test.ts        # 拓撲分析單元測試
│   └── utils/
│       └── siFormat.test.ts        # SI 格式化單元測試
├── component/
│   ├── CircuitCanvas.test.tsx      # 畫布元件測試
│   └── LessonPlayer.test.tsx       # 課程播放器元件測試
└── e2e/
    ├── us1-simulate-circuit.spec.ts  # US1：組建並模擬電路
    ├── us2-guided-lesson.spec.ts     # US2：引導式課程
    ├── us3-progress-dashboard.spec.ts # US3：進度儀表板
    └── us4-exercise.spec.ts          # US4：練習題
```

**結構決策**：採用**單一前端專案**（Option 1 變體）。無後端目錄，符合靜態網站原則（VIII）。課程與練習資料以靜態 JSON 儲存於 `src/data/`，在建置時捆包進 SPA。

---

## 複雜度追蹤

> **僅在憲法符合性檢查有需要正當理由的違規時填寫**

本功能無憲法違規。所有選型均符合簡約設計原則（II）。
