# 實作計畫：響應式互動學習電路分析

**分支**：`001-interactive-circuit-analysis` | **日期**：2026-03-13 | **規格**：[spec.md](spec.md)  
**輸入**：功能規格來自 `/specs/001-interactive-circuit-analysis/spec.md`

## 摘要

本功能建立一個響應式、互動式的電路分析學習平台，讓學生能夠在瀏覽器中組裝電路、即時模擬直流分析結果，並透過有引導的課程與練習題提升電路分析能力。採用靜態單頁應用（SPA）架構，可部署於 GitHub Pages，無需後端伺服器。電路求解採用改良節點分析法（MNA），畫布渲染採用 SVG，進度資料持久化至 localStorage。

## 技術背景

**語言／版本**：TypeScript 5.x  
**主要依賴**：Vite 5（建置工具）、React 18（UI 框架）、math.js（矩陣運算，支援 MNA 線性方程組）  
**儲存**：localStorage（客戶端進度持久化，無需伺服器）  
**測試**：Vitest + React Testing Library  
**目標平台**：瀏覽器靜態 SPA，可部署至 GitHub Pages  
**專案類型**：網頁應用（靜態前端 SPA）  
**效能目標**：電路計算更新 < 1 秒（SC-002）；初次頁面互動 < 3 秒（一般 4G 連線）  
**限制**：無伺服器依賴、響應式支援 320–2560 px、支援觸控操作（FR-013、FR-014）  
**規模／範圍**：~10 課程、~20 練習題；最多 50 個元件／畫布（邊界限制）

## 憲法檢查

*關卡：Phase 0 研究前必須通過。Phase 1 設計後再次檢查。*

| 原則 | Phase 0 狀態 | Phase 1 狀態（設計後） | 說明 |
|------|------------|-------------------|------|
| I. 繁體中文優先 | ✅ | ✅ | 所有規格、計畫、研究、合約文件均以繁體中文撰寫 |
| II. 簡約設計 | ✅ | ✅ | Vite + React + math.js + Zustand；無不必要依賴；MNA 最小實作 |
| III. 精簡文檔 | ✅ | ✅ | 僅建立 speckit 工作流程所需文件 |
| IV. Git 流程紀律 | ✅ | ✅ | 每個階段結束後提交；工作目錄保持乾淨 |
| V. 測試驅動開發 | ✅ | ✅ | contracts/ 已定義測試案例；tasks.md 測試任務排在實作之前 |
| VI. 任務追蹤 | ✅ | ✅ | tasks.md 打勾機制；每次提交同步更新 |
| VII. 規格保護 | ✅ | ✅ | Vite 初始化至 `frontend/` 子目錄；quickstart.md 有明確驗證步驟 |
| VIII. 靜態網站優先 | ✅ | ✅ | 純前端 SPA；localStorage 持久化；可部署至 GitHub Pages |

**Phase 1 後結論**：所有原則均通過，無需填寫複雜度追蹤。

## 專案結構

### 文件（本功能）

```text
specs/001-interactive-circuit-analysis/
├── plan.md              # 本檔案（/speckit.plan 輸出）
├── research.md          # Phase 0 輸出（/speckit.plan）
├── data-model.md        # Phase 1 輸出（/speckit.plan）
├── quickstart.md        # Phase 1 輸出（/speckit.plan）
├── contracts/           # Phase 1 輸出（/speckit.plan）
│   ├── circuit-engine.md
│   ├── storage-schema.md
│   └── ui-contracts.md
└── tasks.md             # Phase 2 輸出（由 /speckit.tasks 建立）
```

### 原始碼（儲存庫根目錄）

```text
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── canvas/          # 電路畫布（SVG 渲染）
│   │   ├── palette/         # 元件選擇面板
│   │   ├── lesson/          # 課程步驟面板
│   │   ├── exercise/        # 練習題面板
│   │   └── dashboard/       # 學習進度儀表板
│   ├── engine/
│   │   ├── mna.ts           # 改良節點分析（Modified Nodal Analysis）
│   │   ├── solver.ts        # 電路求解器入口
│   │   └── units.ts         # SI 單位前綴處理
│   ├── data/
│   │   ├── lessons/         # 課程 JSON 資料檔
│   │   └── exercises/       # 練習題 JSON 資料檔
│   ├── store/
│   │   ├── circuitStore.ts  # 電路畫布狀態（Zustand）
│   │   ├── lessonStore.ts   # 課程進度狀態
│   │   └── progressStore.ts # 整體學習進度
│   └── utils/
│       └── storage.ts       # localStorage 存取工具
└── tests/
    ├── unit/
    │   ├── engine/          # 電路求解器單元測試
    │   └── utils/           # 工具函數測試
    ├── integration/
    │   ├── canvas/          # 畫布互動整合測試
    │   └── lesson/          # 課程流程整合測試
    └── contract/
        └── storage/         # localStorage 合約測試
```

**結構決策**：採用 Web 應用前端子目錄結構，後端不存在（靜態 SPA）。`frontend/` 子目錄確保 Vite 初始化時不影響 `specs/` 目錄（遵循憲法原則 VII）。狀態管理採用 Zustand（輕量，無 Redux 樣板代碼）。
