# Implementation Plan: 響應式互動學習電路分析

**Branch**: `001-interactive-circuit-analysis` | **Date**: 2026-03-13 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-interactive-circuit-analysis/spec.md`

## Summary

建構一個純前端靜態網頁應用，讓學生能夠在互動式電路圖畫布上放置元件、連接電路，並即時看到 DC 節點電壓、支路電流、元件功率等計算結果。同時提供導引式課程、練習題與學習歷程儀表板，支援 320 px 至 2560 px 全響應式佈局。技術方案採用 React + Vite（靜態匯出）以符合憲法「靜態網站優先」原則，電路求解引擎以純 TypeScript 實作改良節點電壓分析法（MNA），所有學習進度儲存於 `localStorage`，無需後端。

## Technical Context

**Language/Version**: TypeScript 5.x / JavaScript ES2022  
**Primary Dependencies**: React 18, Vite 5（靜態匯出），math.js（矩陣計算）  
**Storage**: `localStorage`（學習進度、電路草稿）；無後端資料庫  
**Testing**: Vitest + React Testing Library  
**Target Platform**: 現代瀏覽器（Chrome 100+, Firefox 100+, Safari 15+）；可部署至 GitHub Pages  
**Project Type**: 靜態單頁網頁應用 (SPA)  
**Performance Goals**: 電路重新計算 < 1 秒；初始載入 < 3 秒（LCP）  
**Constraints**: 無伺服器端程式碼；進度離線可用；最小支援螢幕寬度 320 px  
**Scale/Scope**: 初版 ≥10 堂課程；最多 50 個元件/畫布；單一學生本機資料

## Constitution Check

*GATE: 進入 Phase 0 研究前必須通過。Phase 1 設計後重新檢驗。*

| 原則 | 狀態 | 說明 |
|------|------|------|
| I. 繁體中文優先 | ✅ 通過 | 本計畫與所有規格文件均以繁體中文撰寫 |
| II. 簡約設計 | ✅ 通過 | 純前端架構，無後端；進度用 localStorage，不引入資料庫 |
| III. 精簡文檔 | ✅ 通過 | 僅產生規格工作流程所需文件，無額外報告 |
| IV. Git 流程紀律 | ✅ 通過 | 所有變更透過功能分支提交 |
| V. 測試驅動開發 | ✅ 通過 | 電路求解引擎與關鍵元件均需先撰寫測試 |
| VI. 任務追蹤 | ✅ 通過 | 進度透過 tasks.md 打勾機制追蹤 |
| VII. 規格保護 | ✅ 通過 | 使用 `--no-git` / 子目錄初始化，不覆蓋 `/specs` |
| VIII. 靜態網站優先 | ✅ 通過 | Vite 靜態匯出，可部署至 GitHub Pages |

**Post-Phase 1 重新檢驗**：所有原則維持通過。電路求解引擎（MNA）複雜度已有明確需求驅動（FR-003、FR-016），符合原則 II 的正當理由要求。

## Project Structure

### Documentation (this feature)

```text
specs/001-interactive-circuit-analysis/
├── plan.md              # 本檔案（/speckit.plan 輸出）
├── research.md          # Phase 0 輸出
├── data-model.md        # Phase 1 輸出
├── quickstart.md        # Phase 1 輸出
├── contracts/           # Phase 1 輸出
│   ├── circuit-solver-api.md
│   ├── lesson-schema.md
│   └── ui-contracts.md
└── tasks.md             # Phase 2 輸出（/speckit.tasks 產生）
```

### Source Code (repository root)

```text
src/
├── engine/              # 純 TypeScript 電路求解引擎（MNA）
│   ├── mna.ts           # 改良節點分析核心
│   ├── components.ts    # 元件型別定義
│   └── units.ts         # SI 前綴轉換
├── components/          # React UI 元件
│   ├── Canvas/          # 互動式電路畫布（SVG）
│   ├── ComponentPanel/  # 元件選擇面板
│   ├── Lesson/          # 課程步驟元件
│   ├── Dashboard/       # 學習歷程儀表板
│   └── Exercise/        # 練習題元件
├── pages/               # React 頁面
│   ├── HomePage.tsx
│   ├── LessonPage.tsx
│   ├── ExercisePage.tsx
│   └── DashboardPage.tsx
├── data/                # 靜態課程與練習資料（JSON）
│   ├── lessons/
│   └── exercises/
├── hooks/               # React 自訂 Hooks
├── store/               # 狀態管理（useContext + useReducer）
└── utils/               # 通用工具（localStorage、SI 單位等）

tests/
├── unit/                # 電路求解引擎單元測試
├── integration/         # 元件互動整合測試
└── contract/            # UI 合約測試

public/                  # 靜態資產
index.html
vite.config.ts
```

**Structure Decision**：採用「Option 1：單一前端專案」。所有功能（畫布、課程、練習、儀表板）整合於同一 Vite/React SPA，透過 React Router 管理路由。無獨立後端目錄，符合靜態網站原則。

## Complexity Tracking

> **填寫：Constitution Check 有違規需正當理由的項目**

| 複雜度項目 | 為何需要 | 更簡單方案被拒絕的理由 |
|-----------|---------|----------------------|
| MNA 求解引擎（矩陣運算） | FR-003 需即時計算節點電壓與支路電流；FR-016 需支援 DC 工作點、串並聯化簡、疊加定理 | 僅公式查表法無法處理任意電路拓撲；MNA 是業界最小可行的通用電路求解器 |
| math.js 第三方套件 | 需要穩定的矩陣分解（LU decomposition）以求解線性方程組 | 自行實作 LU 分解屬重複造輪子，且增加錯誤風險；math.js 為輕量級標準選擇 |
