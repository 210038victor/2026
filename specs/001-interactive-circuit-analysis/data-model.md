# 資料模型：響應式互動學習電路分析

**分支**：`001-interactive-circuit-analysis` | **日期**：2026-03-13

---

## 1. 核心實體

### 1.1 Component（電路元件）

```typescript
interface Component {
  id: string;                    // nanoid() 生成的唯一識別碼
  type: ComponentType;           // 元件類型
  value: number;                 // 數值（單位見 unit）
  unit: string;                  // 'Ω' | 'F' | 'H' | 'V' | 'A'
  position: { x: number; y: number }; // 畫布座標（像素）
  rotation: 0 | 90 | 180 | 270;  // 旋轉角度（度）
  label?: string;                // 使用者自訂標籤（可選）
  terminals: Terminal[];         // 連接端子（見下方）
}

type ComponentType =
  | 'resistor'        // 電阻
  | 'capacitor'       // 電容（DC 時視為開路）
  | 'inductor'        // 電感（DC 時視為短路）
  | 'voltage-source'  // 電壓源
  | 'current-source'  // 電流源
  | 'ground';         // 接地節點（參考零電位）

interface Terminal {
  id: string;                    // `${componentId}-${name}`
  name: 'positive' | 'negative' | 'anode' | 'cathode' | 'gnd';
  offset: { x: number; y: number }; // 相對於元件中心的偏移（像素）
}
```

**驗證規則**：
- `value` 必須為正數（電阻、電容、電感、電壓源振幅、電流源振幅）
- `type === 'ground'` 時 `value` 可為任意（忽略）
- 每個 Component 最多 2 個 Terminal（ground 僅 1 個）

---

### 1.2 Wire（導線）

```typescript
interface Wire {
  id: string;                   // nanoid()
  fromTerminalId: string;       // 來源端子 ID
  toTerminalId: string;         // 目標端子 ID
  waypoints?: { x: number; y: number }[]; // 折線中間節點（可選）
}
```

**驗證規則**：
- 不允許 `fromTerminalId === toTerminalId`（不能自連）
- 不允許重複的 `(fromTerminalId, toTerminalId)` 對

---

### 1.3 Circuit（電路）

```typescript
interface Circuit {
  id: string;
  name: string;
  components: Component[];
  wires: Wire[];
  scope: 'workspace' | 'lesson' | 'exercise'; // 電路所屬情境
  ownerId?: string;             // 個人工作區時為 studentId；課程/練習時為靜態 ID
  createdAt: number;            // Unix timestamp（ms）
  updatedAt: number;
}
```

**狀態轉換**：
```
空電路 → 加入元件 → 連接導線 → 可模擬狀態
可模擬狀態 → 修改元件值 → 重新模擬
可模擬狀態 → 偵測到短路 → 錯誤狀態（顯示警告，不顯示計算值）
```

---

### 1.4 SimulationResult（模擬結果）

```typescript
interface SimulationResult {
  circuitId: string;
  status: 'ok' | 'error';
  error?: SimulationError;      // 僅 status === 'error' 時存在
  nodeVoltages: Record<string, number>;   // 節點 ID → 電壓（V）
  branchCurrents: Record<string, number>; // 導線 ID → 電流（A，正方向）
  componentPower: Record<string, number>; // 元件 ID → 功率（W）
  solvedAt: number;             // Unix timestamp（ms）
}

interface SimulationError {
  type: 'short-circuit' | 'floating-node' | 'singular-matrix' | 'component-limit';
  message: string;              // 使用者可見的說明文字
  affectedIds?: string[];       // 相關元件或導線 ID
}
```

---

### 1.5 Lesson（課程）

```typescript
interface Lesson {
  id: string;                   // 例如：'ohms-law', 'kvl'
  title: string;                // 課程標題（繁體中文）
  topic: LessonTopic;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  prerequisiteIds: string[];    // 建議先修課程 ID
  steps: LessonStep[];
}

type LessonTopic =
  | 'ohms-law'         // 歐姆定律
  | 'kvl'              // 克希荷夫電壓定律
  | 'kcl'              // 克希荷夫電流定律
  | 'series-circuit'   // 串聯電路
  | 'parallel-circuit' // 並聯電路
  | 'thevenin'         // 戴維寧等效
  | 'norton'           // 諾頓等效
  | 'nodal-analysis'   // 節點電壓法
  | 'mesh-analysis'    // 網目電流法
  | 'superposition';   // 疊加定理
```

---

### 1.6 LessonStep（課程步驟）

```typescript
interface LessonStep {
  id: string;
  order: number;                // 步驟序號（1-indexed）
  instruction: string;          // 步驟指示（繁體中文）
  type: StepType;
  expectedAnswer: string | number; // 預期答案（字串或數值）
  tolerance?: number;           // 數值答案的允許誤差（百分比，預設 2）
  hint: string;                 // 引導提示（不直接給答案）
  explanation: string;          // 完成後顯示的解說
  prebuiltCircuit?: Circuit;    // 步驟預設電路（可選）
}

type StepType =
  | 'label-node'        // 標記節點電壓
  | 'enter-equation'    // 輸入迴路方程式
  | 'enter-value'       // 輸入數值答案
  | 'place-component'   // 在畫布上放置指定元件
  | 'connect-wire'      // 連接兩個端子
  | 'identify-element'; // 識別電路元素
```

---

### 1.7 Exercise（練習題）

```typescript
interface Exercise {
  id: string;
  title: string;                // 練習題標題
  topic: LessonTopic;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionText: string;         // 題目描述
  circuit: Circuit;             // 預建電路（唯讀，學生不可修改拓撲）
  correctAnswer: number;
  answerUnit: string;           // 'V' | 'A' | 'Ω' | 'W'
  tolerancePercent: number;     // 允許誤差百分比（預設 2，FR-012 AC1）
  maxAttempts: number;          // 最大作答次數（預設 3，FR-012 AC2）
  solutionWalkthrough: string[]; // 逐步解題說明（陣列，每步一段）
}
```

---

### 1.8 StudentProgressRecord（學生進度記錄）

```typescript
interface StudentProgressRecord {
  id: string;                   // `${studentId}::${type}::${targetId}`
  studentId: string;            // 來自外部驗證系統（或 'anonymous'）
  type: 'lesson' | 'exercise';
  targetId: string;             // lessonId 或 exerciseId
  status: 'not-started' | 'in-progress' | 'completed';
  score?: number;               // 0–100（完成時計算）
  completedSteps?: number[];    // Lesson 中已完成的 step.order 陣列
  attemptCount?: number;        // Exercise 的作答次數
  startedAt?: number;           // Unix timestamp（ms）
  completedAt?: number;
  lastUpdatedAt: number;
}
```

**儲存**：以 `progress::${studentId}` 為鍵儲存於 localStorage，值為 `StudentProgressRecord[]` 的 JSON 序列化。

**狀態轉換**：
```
not-started → in-progress（開始任一步驟）→ completed（所有步驟完成）
completed → （不可回退）
```

---

## 2. 客戶端狀態模型

### 2.1 circuitStore（Zustand）

```typescript
interface CircuitState {
  circuit: Circuit;
  selectedIds: string[];        // 當前選取的元件/導線 ID
  addComponent: (type: ComponentType, position: {x:number;y:number}) => void;
  removeSelected: () => void;
  moveComponent: (id: string, position: {x:number;y:number}) => void;
  rotateComponent: (id: string) => void;
  updateComponentValue: (id: string, value: number) => void;
  addWire: (fromTerminalId: string, toTerminalId: string) => void;
  removeWire: (id: string) => void;
  clearAll: () => void;
  reset: () => void;            // 復原/重做用：重置為初始空狀態
}
```

### 2.2 simulationStore（Zustand）

```typescript
interface SimulationState {
  result: SimulationResult | null;
  isStale: boolean;             // 電路改變後尚未重新模擬時為 true
  solve: (circuit: Circuit) => void; // 呼叫 MNA 求解器並更新 result
}
```

### 2.3 historyStore（Zustand）

```typescript
interface HistoryState {
  past: CanvasAction[];         // 最多 20 個
  future: CanvasAction[];
  canUndo: boolean;
  canRedo: boolean;
  execute: (action: CanvasAction) => void;
  undo: () => void;
  redo: () => void;
}

interface CanvasAction {
  type: 'add-component' | 'remove-component' | 'move-component'
      | 'rotate-component' | 'change-value' | 'add-wire' | 'remove-wire';
  payload: unknown;
  timestamp: number;
}
```

### 2.4 lessonStore（Zustand）

```typescript
interface LessonState {
  currentLesson: Lesson | null;
  currentStepIndex: number;
  feedback: StepFeedback | null;
  loadLesson: (lessonId: string) => void;
  submitAnswer: (answer: string | number) => void;
  skipStep: () => void;
}

interface StepFeedback {
  isCorrect: boolean;
  isPartiallyCorrect: boolean;
  message: string;              // 回饋訊息（繁體中文）
  hint?: string;                // 若答案錯誤，提供提示
}
```

---

## 3. 實體關係

```
Student (外部系統)
  │
  ├─ 1:N → StudentProgressRecord
  │           │
  │           ├─ N:1 → Lesson (靜態 JSON)
  │           │           │
  │           │           └─ 1:N → LessonStep
  │           │
  │           └─ N:1 → Exercise (靜態 JSON)
  │                       │
  │                       └─ 1:1 → Circuit (預建，唯讀)
  │
  └─ 1:1 → Circuit (個人工作區)
               │
               ├─ 1:N → Component
               │           └─ 1:N → Terminal
               │
               └─ 1:N → Wire

Circuit → 1:1 → SimulationResult (客戶端計算，不持久化)
```

---

## 4. 元件限制

| 項目 | 最大值 | 說明 |
|------|--------|------|
| 畫布元件數 | 50 | 超過時顯示友善提示（邊緣案例） |
| 復原歷史步數 | 20 | FR-006 |
| 每堂課程步驟數 | 不限（建議 ≤ 15） | 由課程設計者控制 |
| 練習題最大作答次數 | 可設定（預設 3） | FR-012 AC2 |
| localStorage 配額 | ~5MB | 足以儲存 1000+ 進度記錄 |
