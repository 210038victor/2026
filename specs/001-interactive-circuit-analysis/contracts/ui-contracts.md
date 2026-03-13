# UI 元件合約

**Feature**: `001-interactive-circuit-analysis`  
**Module**: `src/components/`  
**Date**: 2026-03-13

---

## 概述

本文件定義主要 React UI 元件的對外介面（Props）與行為契約。遵守此合約可確保元件替換與重構時不破壞父層使用方。

---

## 1. `CircuitCanvas`

互動式電路畫布核心元件，負責渲染 SVG 電路圖並處理使用者互動。

### Props

```typescript
interface CircuitCanvasProps {
  circuit: Circuit;
  readonly?: boolean;                      // 課程/練習模式下設為 true
  onCircuitChange?: (circuit: Circuit) => void;  // 電路變更回呼
  onSolveResult?: (result: SolverResult) => void; // 求解結果回呼
  highlightedIds?: string[];               // 高亮顯示的元件/導線 ID（錯誤提示用）
  maxComponents?: number;                  // 預設 50
}
```

### 行為契約

| 觸發條件 | 預期行為 |
|---------|---------|
| 使用者拖曳元件面板中的元件到畫布 | 新增元件至 `circuit.components`，觸發 `onCircuitChange` |
| 使用者點擊已放置元件 | 顯示屬性面板（值、標籤），可編輯 |
| 使用者連接兩個終端 | 新增 `Wire`，觸發 `onCircuitChange` |
| 電路改變後 | 自動觸發 `solveCircuit()`，最多等待 1 秒，觸發 `onSolveResult` |
| 短路偵測 | 在畫布上顯示紅色警告橫幅，高亮相關元件，不顯示計算結果 |
| `readonly=true` | 禁用所有編輯操作（拖曳、連線、刪除），僅可平移/縮放 |
| 元件數量達 `maxComponents` | 顯示警告訊息，拒絕新增更多元件 |
| 螢幕寬度 < 480 px | 自動切換為「垂直堆疊」版型（面板在畫布下方） |

---

## 2. `ComponentPanel`

可放置至畫布的元件選擇面板。

### Props

```typescript
interface ComponentPanelProps {
  onComponentSelect: (type: ComponentType, defaultValue: number) => void;
  disabled?: boolean;
}
```

### 行為契約

- 顯示所有可用元件類型：電阻、電容、電感、電壓源、電流源、接地
- 每個元件圖示顯示標準電路符號（IEC/IEEE 標準）
- `disabled=true` 時，所有元件按鈕呈灰色且不可互動
- 觸控裝置上，每個元件可以點按（tap-to-place）

---

## 3. `LessonView`

導引式課程的完整步驟流程介面。

### Props

```typescript
interface LessonViewProps {
  lesson: Lesson;
  progress: StudentProgressRecord;
  onProgressUpdate: (updated: StudentProgressRecord) => void;
  onComplete: (finalRecord: StudentProgressRecord) => void;
}
```

### 行為契約

| 情境 | 行為 |
|-----|-----|
| 載入已有進度的課程 | 恢復至最後完成的步驟後一步（FR-010）|
| 提交正確答案 | 顯示 ✅ 與 `explanation`，解鎖「下一步」按鈕 |
| 提交錯誤答案 | 顯示 ❌ 與 `hint`（不直接給答案，FR-009）|
| 點擊「跳過」 | 標記該步驟為 `skipped: true`，推進至下一步（FR-008）|
| 完成所有步驟 | 計算分數、觸發 `onComplete`、顯示完成畫面 |
| 提交後回饋時間 | ≤ 2 秒（FR-009）|

---

## 4. `ProgressDashboard`

學習歷程儀表板，顯示已完成課程與練習。

### Props

```typescript
interface ProgressDashboardProps {
  lessons: Lesson[];
  exercises: Exercise[];
  progressRecords: StudentProgressRecord[];
}
```

### 行為契約

| 情境 | 行為 |
|-----|-----|
| 無任何進度記錄 | 顯示引導提示，導向課程目錄（FR-011）|
| 有完成記錄 | 顯示清單：課程名稱、分數、完成日期（FR-011）|
| 行動裝置（< 768 px） | 版型調整為單欄清單，無需水平捲動（SC-004）|

---

## 5. `ExerciseView`

獨立練習題介面。

### Props

```typescript
interface ExerciseViewProps {
  exercise: Exercise;
  progress: StudentProgressRecord;
  onProgressUpdate: (updated: StudentProgressRecord) => void;
}
```

### 行為契約

| 情境 | 行為 |
|-----|-----|
| 提交正確答案（±tolerance）| 標記為正確，顯示分數與解題說明（FR-012）|
| 提交錯誤答案，未達 maxAttempts | 顯示錯誤提示，允許重新作答 |
| 達到 maxAttempts 仍未答對 | 顯示正確答案與完整解題說明（FR-012）|
| 電路畫布上的標記/路徑 | 在練習 session 中保持可見（FR-012）|

---

## 6. 響應式斷點（全局 CSS 合約）

所有元件必須在以下斷點正常運作（FR-013）：

| 斷點名稱 | 最小寬度 | 版型 |
|---------|---------|------|
| `xs`   | 320 px  | 最小支援寬度，顯示最低功能集，無水平捲動 |
| `sm`   | 480 px  | 面板折疊至底部或側邊欄收起 |
| `md`   | 768 px  | 側邊欄展開，畫布與面板並排 |
| `lg`   | 1024 px | 完整三欄版型（面板 + 畫布 + 屬性面板）|
| `xl`   | 1440 px | 放大畫布區域 |
| `2xl`  | 2560 px | 最大支援寬度，畫布置中並限制最大寬度 |

**邊緣案例**：若螢幕寬度 < 320 px，顯示「最小支援寬度提示」覆蓋層，告知使用者最小支援螢幕寬度。
