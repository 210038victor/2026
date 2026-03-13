# 合約：UI 元件介面（UI Contracts）

**分支**：`001-interactive-circuit-analysis` | **日期**：2026-03-13  
**類型**：UI 元件公開 Props 合約（React / TypeScript）

---

## 概述

本文件定義關鍵 UI 元件的公開 Props 介面，作為元件開發與測試的合約基準。實作必須符合這些介面，使用者故事的驗收測試也以此為依據。

---

## CircuitCanvas（電路畫布）

負責渲染 SVG 畫布、處理拖放與觸控操作，並顯示求解結果標籤。

```typescript
interface CircuitCanvasProps {
  circuit: Circuit;
  solverResult: CircuitSolverResult | null;
  mode: CanvasMode;
  onComponentAdd: (type: ComponentType, position: Position) => void;
  onComponentMove: (id: string, position: Position) => void;
  onComponentRotate: (id: string) => void;
  onComponentDelete: (id: string) => void;
  onComponentValueChange: (id: string, value: number) => void;
  onWireAdd: (from: TerminalRef, to: TerminalRef) => void;
  onWireDelete: (id: string) => void;
  readonly?: boolean;     // 課程預建電路不可編輯時設為 true
}

type CanvasMode = 'select' | 'wire' | 'pan';
```

**行為合約**：
- `mode === 'select'` 時：點擊元件顯示選取框；拖曳元件觸發 `onComponentMove`；右鍵選單提供旋轉與刪除
- `mode === 'wire'` 時：點擊端子開始畫線；再次點擊另一端子完成連線，觸發 `onWireAdd`
- `readonly === true` 時：所有編輯操作停用，不觸發任何 `on*` 回呼
- `solverResult.status === 'error'` 時：在畫布上顯示紅色警告橫幅，說明錯誤原因

---

## ComponentPalette（元件面板）

側邊或底部的元件選擇面板，提供可拖曳至畫布的元件圖示。

```typescript
interface ComponentPaletteProps {
  onComponentDragStart: (type: ComponentType) => void;
  disabled?: boolean;    // 課程限制編輯時禁用面板
}
```

**行為合約**：
- 面板列出所有 6 種元件類型（電阻、電容、電感、直流電壓源、直流電流源、接地）
- 在行動裝置上（畫面寬度 < 768 px），面板以橫向捲動條呈現於畫面底部
- `disabled === true` 時：元件圖示呈灰色，拖曳無效

---

## LessonPanel（課程步驟面板）

在課程模式下顯示當前步驟說明、答案輸入與回饋訊息。

```typescript
interface LessonPanelProps {
  lesson: Lesson;
  progress: LessonProgress;
  onAnswerSubmit: (answer: StepAnswer) => void;
  onStepSkip: () => void;
}
```

**行為合約**：
- 顯示課程標題、步驟進度（如「步驟 2 / 5」）
- 根據 `currentStep.type` 渲染對應輸入控制項：
  - `numeric-input` → 數字輸入欄位 + 單位標籤
  - `multiple-choice` → 選項按鈕組
  - `node-label` → 節點選擇介面（在畫布上點擊節點）
  - `component-place` → 說明文字，引導學生操作畫布
- 提交後立即（< 2 秒，FR-009）顯示 `correct`、`incorrect` 或 `partial` 狀態
- `incorrect` 時顯示提示（不給直接答案）
- `correct` 時顯示解說並出現「下一步」按鈕

---

## ExercisePanel（練習題面板）

在練習題模式下顯示題目、答案輸入與評分結果。

```typescript
interface ExercisePanelProps {
  exercise: Exercise;
  progress: ExerciseProgress | null;
  onAnswerSubmit: (value: number) => void;
}
```

**行為合約**：
- 顯示題目描述與固定電路圖（CircuitCanvas 唯讀模式）
- 答案輸入欄位支援數字與單位選擇
- 剩餘嘗試次數顯示（如「剩餘 2 次機會」）
- `attempts >= maxAttempts` 後：隱藏輸入欄位，展開逐步解析
- 容差計算：`|學生答案 - 正確答案| / |正確答案| ≤ exercise.answer.tolerance / 100`

---

## ProgressDashboard（進度儀表板）

顯示學生整體學習進度的摘要頁面。

```typescript
interface ProgressDashboardProps {
  store: StudentProgressStore;
  lessons: Lesson[];
  exercises: Exercise[];
  onLessonSelect: (lessonId: string) => void;
  onExerciseSelect: (exerciseId: string) => void;
}
```

**行為合約**：
- 課程清單：依主題分組，每課程顯示完成狀態、分數、最後操作日期
- 練習題清單：顯示嘗試次數、是否答對
- `status === 'not-started'` 的課程顯示「開始」按鈕
- `status === 'in-progress'` 的課程顯示「繼續」按鈕
- `status === 'completed'` 的課程顯示分數徽章與「複習」按鈕
- 若所有進度為空，顯示引導語「尚無學習記錄，前往課程目錄開始學習！」

---

## 響應式斷點（Responsive Breakpoints）

所有元件必須在以下斷點正確顯示（FR-013）：

| 斷點名稱 | 寬度範圍 | 佈局變化 |
|---------|---------|---------|
| mobile | 320–767 px | 元件面板移至底部橫向捲動；面板以全寬浮層顯示 |
| tablet | 768–1023 px | 側邊面板摺疊為圖示列；課程面板以抽屜形式顯示 |
| desktop | 1024–2560 px | 三欄佈局（面板 | 畫布 | 課程／練習） |

---

## 無障礙性合約（Accessibility）

- 所有 SVG 元件包含 `<title>` 元素（描述元件類型與數值）
- 鍵盤導航：Tab 可聚焦到畫布元件；Delete 鍵刪除已選元件；Ctrl+Z / Ctrl+Y 觸發復原／重做
- 數字輸入欄位設有 `aria-label` 描述
- 錯誤訊息透過 `role="alert"` 向輔助技術公告
