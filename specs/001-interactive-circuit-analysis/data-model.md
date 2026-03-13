# Data Model: 響應式互動學習電路分析

**Feature**: `001-interactive-circuit-analysis`  
**Phase**: 1 — 設計  
**Date**: 2026-03-13

---

## 實體定義

### 1. `Circuit`（電路）

電路畫布上所有元件與導線的集合，可屬於個人工作區、課程或練習。

```typescript
interface Circuit {
  id: string;                    // UUID
  name: string;                  // 電路名稱（最長 100 字元）
  components: Component[];       // 電路元件清單
  wires: Wire[];                 // 導線清單
  context: 'workspace' | 'lesson' | 'exercise';
  contextId?: string;            // 關聯的 lessonId 或 exerciseId
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}
```

**驗證規則**：
- `name` 不可為空字串
- `components` 最多 50 個（FR 規格邊緣案例）
- 每個 `Wire` 的兩個端點必須對應到存在的元件終端

**狀態轉換**：
```
草稿（編輯中）→ 求解中（MNA 計算）→ 已求解（顯示結果）
                                  ↘ 求解失敗（短路/開路）
```

---

### 2. `Component`（電路元件）

畫布上的單一電路元件，包含其位置、數值與求解後的量測值。

```typescript
type ComponentType =
  | 'resistor'        // 電阻
  | 'capacitor'       // 電容（DC 開路）
  | 'inductor'        // 電感（DC 短路）
  | 'voltageSource'   // 電壓源（獨立）
  | 'currentSource'   // 電流源（獨立）
  | 'ground';         // 接地節點

interface Terminal {
  id: string;         // e.g., "R1_p", "R1_n"（正極/負極）
  nodeId: string | null;  // 連接的節點 ID（null 表示未連接）
}

interface Component {
  id: string;                    // UUID
  type: ComponentType;
  label: string;                 // 顯示標籤，e.g., "R1", "V1"
  value: number;                 // 元件數值（Ω、F、H、V、A）
  unit: SIUnit;                  // 見下方 SIUnit
  position: { x: number; y: number };  // 畫布座標（px）
  rotation: 0 | 90 | 180 | 270;       // 旋轉角度
  terminals: Terminal[];         // 端點清單（大多數元件 2 個）
  // 求解後填入（計算前為 null）
  voltage?: number | null;       // 跨元件電壓（V）
  current?: number | null;       // 通過電流（A）
  power?: number | null;         // 功率（W）
}
```

**驗證規則**：
- `value` 必須為有限正數（電壓源可為負，接地節點 value 忽略）
- `label` 不可為空字串
- 每個元件至少有 1 個 terminal（ground 節點 1 個，其餘 2 個）

---

### 3. `Wire`（導線）

連接兩個元件終端的電氣連線，定義電路拓撲。

```typescript
interface Wire {
  id: string;                    // UUID
  from: string;                  // 起始 terminal ID
  to: string;                    // 終止 terminal ID
  path?: { x: number; y: number }[];  // 可選折線路徑點（SVG 繪製用）
}
```

**驗證規則**：
- `from` 與 `to` 必須指向存在的 terminal
- 不可自連（`from !== to`）
- 同一對 terminal 不可有重複導線

---

### 4. `SIUnit`（SI 單位與前綴）

用於顯示元件值與量測結果，符合 FR-015。

```typescript
type SIPrefix = 'T' | 'G' | 'M' | 'k' | '' | 'm' | 'µ' | 'n' | 'p';

interface SIUnit {
  baseUnit: 'Ω' | 'F' | 'H' | 'V' | 'A' | 'W';
  prefix: SIPrefix;
  // 實際值 = value × prefixFactor[prefix]
}

const prefixFactor: Record<SIPrefix, number> = {
  T: 1e12, G: 1e9, M: 1e6, k: 1e3, '': 1,
  m: 1e-3, µ: 1e-6, n: 1e-9, p: 1e-12,
};
```

---

### 5. `Lesson`（課程）

結構化學習單元，包含有序的步驟清單。

```typescript
interface Lesson {
  id: string;                    // e.g., "lesson-kvl-001"
  title: string;                 // 課程標題（繁體中文）
  topic: LessonTopic;            // 分類主題
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;      // 預估完成時間
  description: string;           // 摘要說明
  steps: LessonStep[];           // 有序步驟清單
  prebuiltCircuit?: Circuit;     // 預建電路（可選）
}

type LessonTopic =
  | 'ohms-law'
  | 'kvl'
  | 'kcl'
  | 'series-circuits'
  | 'parallel-circuits'
  | 'thevenin'
  | 'norton'
  | 'nodal-analysis'
  | 'mesh-analysis'
  | 'superposition';
```

**驗證規則**：
- `steps` 不可為空陣列
- `estimatedMinutes` 必須為正整數
- 初版至少 10 堂課程（見假設）

---

### 6. `LessonStep`（課程步驟）

課程中的單一互動任務。

```typescript
type StepType =
  | 'instruction'          // 閱讀說明（無需作答）
  | 'label-node'           // 標記節點電壓
  | 'write-equation'       // 寫出方程式（文字答案）
  | 'enter-value'          // 輸入數值答案
  | 'connect-wire'         // 在畫布上連接導線
  | 'place-component';     // 在畫布上放置元件

interface LessonStep {
  id: string;
  stepNumber: number;            // 1-based 順序
  type: StepType;
  instruction: string;           // 步驟說明（繁體中文）
  hint: string;                  // 提示（不直接給出答案）
  explanation: string;           // 完成後顯示的解釋
  // 適用於 enter-value 型別
  expectedAnswer?: number;
  tolerance?: number;            // 允許誤差（預設 0.02 = 2%，FR 規格）
  unit?: SIUnit;
  // 適用於 write-equation 型別
  expectedText?: string;
  // 適用於 connect-wire / place-component 型別
  canvasValidation?: CanvasValidationRule;
}

interface CanvasValidationRule {
  type: 'wire-between' | 'component-present';
  params: Record<string, string | number>;
}
```

---

### 7. `Exercise`（練習題）

無導引的獨立練習，包含固定電路與問題。

```typescript
interface Exercise {
  id: string;                    // e.g., "ex-series-resistance-001"
  title: string;
  topic: LessonTopic;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  question: string;              // 問題敘述（繁體中文）
  circuit: Circuit;              // 題目電路（不可修改）
  correctAnswer: number;
  tolerance: number;             // 預設 0.02
  unit: SIUnit;
  maxAttempts: number;           // 預設 3（FR-012）
  solutionWalkthrough: SolutionStep[];
}

interface SolutionStep {
  stepNumber: number;
  explanation: string;
  formula?: string;              // 可選公式（LaTeX 或純文字）
  result?: number;
}
```

---

### 8. `StudentProgressRecord`（學習進度紀錄）

儲存於 `localStorage`，追蹤學生對課程或練習的完成狀態。

```typescript
type ActivityType = 'lesson' | 'exercise';

interface StudentProgressRecord {
  id: string;                    // `${activityType}_${activityId}`
  activityType: ActivityType;
  activityId: string;            // lessonId 或 exerciseId
  status: 'not-started' | 'in-progress' | 'completed';
  score: number | null;          // 0–100，完成後計算
  startedAt: string | null;      // ISO 8601
  completedAt: string | null;    // ISO 8601
  stepProgress: StepProgressEntry[];  // 僅課程使用
  attempts: number;              // 練習用（嘗試次數）
}

interface StepProgressEntry {
  stepId: string;
  completed: boolean;
  skipped: boolean;
  answeredAt: string | null;
  submittedAnswer?: number | string;
}
```

**localStorage 鍵值設計**：
- 課程進度：`ica_lesson_{lessonId}` → 序列化 `StudentProgressRecord`
- 練習進度：`ica_exercise_{exerciseId}` → 序列化 `StudentProgressRecord`
- 電路草稿：`ica_draft_{circuitId}` → 序列化 `Circuit`

---

### 9. `UndoHistoryEntry`（Undo/Redo 歷史項目）

存於 `sessionStorage`，支援最少 20 步還原（FR-006）。

```typescript
type EditAction =
  | { type: 'ADD_COMPONENT'; component: Component }
  | { type: 'REMOVE_COMPONENT'; componentId: string }
  | { type: 'MOVE_COMPONENT'; componentId: string; from: Position; to: Position }
  | { type: 'ADD_WIRE'; wire: Wire }
  | { type: 'REMOVE_WIRE'; wireId: string }
  | { type: 'UPDATE_VALUE'; componentId: string; oldValue: number; newValue: number }
  | { type: 'ROTATE_COMPONENT'; componentId: string; from: Rotation; to: Rotation };

interface UndoHistoryEntry {
  action: EditAction;
  timestamp: string;
}
```

---

## 實體關係圖

```
Lesson ──── LessonStep (1:N)
  │
  └──── Circuit (可選預建 1:1)

Exercise ──── Circuit (1:1)
           └── SolutionStep (1:N)

StudentProgressRecord ──── Lesson 或 Exercise (N:1)
                      └──── StepProgressEntry (1:N)

Circuit ──── Component (1:N)
        └──── Wire (1:N)

Component ──── Terminal (1:N)
Wire ──── Terminal (N:2)
```

---

## 狀態機：電路求解流程

```
IDLE
  │  (topology or value change)
  ▼
VALIDATING
  │  ✅ valid          ❌ short-circuit / invalid
  ▼                         ▼
SOLVING              ERROR (顯示描述性訊息)
  │  ✅ converged     ❌ singular matrix
  ▼                         ▼
SOLVED               ERROR (顯示描述性訊息)
```

---

## 狀態機：課程進度

```
NOT_STARTED
  │  (open lesson)
  ▼
IN_PROGRESS
  │  (complete all steps)        (navigate away)
  ▼                                    │
COMPLETED ◄──────────────────── PAUSED (progress saved)
```
