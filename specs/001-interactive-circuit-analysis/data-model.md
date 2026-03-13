# 資料模型：響應式互動學習電路分析

**分支**：`001-interactive-circuit-analysis` | **日期**：2026-03-13  
**來源**：Phase 1 設計，基於 spec.md 的關鍵實體定義

---

## 核心實體

### Circuit（電路）

電路畫布的完整狀態，包含所有元件與導線。

```typescript
interface Circuit {
  id: string;                    // UUID
  name: string;                  // 電路名稱（可編輯）
  components: Component[];       // 畫布上的元件清單
  wires: Wire[];                 // 導線清單
  createdAt: number;             // Unix timestamp（毫秒）
  context: CircuitContext;       // 所屬情境
}

type CircuitContext =
  | { type: 'workspace' }                        // 學生自由工作區
  | { type: 'lesson'; lessonId: string; stepIndex: number }
  | { type: 'exercise'; exerciseId: string };
```

**驗證規則**：
- `components.length` ≤ 50（邊界限制，FR-001 邊緣案例）
- 每個 `Component.id` 在同一 Circuit 內唯一
- 每個 `Wire` 的兩端 nodeRef 必須指向已存在的 Component terminal

**狀態轉換**：

```
空畫布 → 放置元件 → 連接導線 → 求解完成
                              ↓
                        修改元件值 → 求解完成（自動觸發）
```

---

### Component（電路元件）

畫布上的單一電路元件。

```typescript
interface Component {
  id: string;                    // UUID
  type: ComponentType;           // 元件類型
  value: number;                 // 元件數值（SI 基本單位，如歐姆、法拉）
  unit: SIUnit;                  // 基本單位符號
  position: Position;            // 畫布座標（px）
  rotation: 0 | 90 | 180 | 270; // 旋轉角度（度）
  terminals: Terminal[];         // 接線端子（固定 2 個，ground 除外為 1 個）
  label?: string;                // 使用者自訂標籤（選填）
}

type ComponentType =
  | 'resistor'
  | 'capacitor'
  | 'inductor'
  | 'voltage_source_dc'
  | 'current_source_dc'
  | 'ground';

interface Terminal {
  id: string;                    // 端子 ID（如 'p' 正極、'n' 負極）
  position: Position;            // 相對於元件中心的偏移座標
}

interface Position {
  x: number;
  y: number;
}

type SIUnit = 'Ω' | 'F' | 'H' | 'V' | 'A';
```

**SI 前綴顯示規則**（FR-015）：

| 範圍 | 前綴 | 範例 |
|------|------|------|
| ≥ 1e12 | T（兆） | 1 TΩ |
| ≥ 1e9 | G（吉） | 1 GΩ |
| ≥ 1e6 | M（百萬） | 1 MΩ |
| ≥ 1e3 | k（千） | 10 kΩ |
| ≥ 1 | （無） | 1 Ω |
| ≥ 1e-3 | m（毫） | 100 mΩ |
| ≥ 1e-6 | µ（微） | 10 µF |
| ≥ 1e-9 | n（奈） | 100 nF |
| ≥ 1e-12 | p（皮） | 1 pF |

---

### Wire（導線）

連接兩個元件端子的導線，定義電路拓撲。

```typescript
interface Wire {
  id: string;                    // UUID
  from: TerminalRef;             // 起始端子
  to: TerminalRef;               // 結尾端子
  waypoints?: Position[];        // 折線路徑點（選填，預設直線）
}

interface TerminalRef {
  componentId: string;
  terminalId: string;
}
```

---

### CircuitSolverResult（電路求解結果）

MNA 求解後的輸出結果。

```typescript
interface CircuitSolverResult {
  status: 'ok' | 'error';
  nodeVoltages: Record<string, number>;     // 節點 ID → 電壓（V）
  branchCurrents: Record<string, number>;   // 導線 ID → 電流（A）
  componentPower: Record<string, number>;   // 元件 ID → 功率（W）
  errorMessage?: string;                    // 錯誤描述（status === 'error' 時）
}
```

---

### Lesson（課程）

引導式學習單元的靜態定義（JSON 資料檔）。

```typescript
interface Lesson {
  id: string;                    // 唯一識別碼（如 '002-kvl'）
  title: string;                 // 課程標題（繁體中文）
  topic: CircuitTopic;           // 主題分類
  difficulty: 1 | 2 | 3;        // 難度（1=入門、2=中級、3=進階）
  estimatedMinutes: number;      // 預估完成時間（分鐘）
  description: string;           // 課程簡介
  steps: LessonStep[];           // 步驟清單（順序執行）
  initialCircuit: Circuit;       // 預建電路（課程開始時載入）
}

type CircuitTopic =
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

---

### LessonStep（課程步驟）

課程中的單一互動任務。

```typescript
interface LessonStep {
  index: number;                 // 步驟序號（從 0 開始）
  instruction: string;           // 步驟說明（繁體中文）
  type: StepType;                // 步驟類型
  expectedAnswer: StepAnswer;    // 正確答案
  hint: string;                  // 提示（不直接給出答案）
  explanation: string;           // 正確後顯示的解說
  tolerance?: number;            // 數值答案允許誤差（百分比，預設 2%）
}

type StepType =
  | 'numeric-input'              // 學生輸入數字（如：計算電流）
  | 'node-label'                 // 學生標記節點電壓
  | 'component-place'            // 學生在畫布上放置元件
  | 'multiple-choice';           // 學生選擇選項

type StepAnswer =
  | { kind: 'numeric'; value: number; unit: string }
  | { kind: 'node-label'; nodeId: string; voltage: number }
  | { kind: 'component-place'; componentType: ComponentType; position?: Position }
  | { kind: 'multiple-choice'; choiceIndex: number };
```

---

### Exercise（練習題）

非引導式評量題目的靜態定義。

```typescript
interface Exercise {
  id: string;                    // 唯一識別碼（如 '001-series-resistance'）
  title: string;                 // 題目標題（繁體中文）
  topic: CircuitTopic;           // 主題分類
  difficulty: 1 | 2 | 3;
  question: string;              // 題目描述
  circuit: Circuit;              // 固定電路圖
  answer: ExerciseAnswer;        // 正確答案
  maxAttempts: number;           // 最大嘗試次數（預設 3）
  solutionWalkthrough: string[]; // 解題步驟說明（陣列，逐步呈現）
}

interface ExerciseAnswer {
  value: number;
  unit: string;
  tolerance: number;             // 允許誤差（百分比，預設 2%）
}
```

---

### StudentProgressRecord（學生進度記錄）

持久化至 localStorage 的學生學習狀態。

```typescript
interface StudentProgressStore {
  studentId: string;             // 來自外部認證系統的學生 ID
  lessonProgress: Record<string, LessonProgress>;   // lessonId → 進度
  exerciseProgress: Record<string, ExerciseProgress>; // exerciseId → 進度
  lastUpdated: number;           // Unix timestamp（毫秒）
}

interface LessonProgress {
  lessonId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  currentStepIndex: number;      // 目前進行到的步驟（0-based）
  stepResults: StepResult[];     // 每步驟的結果記錄
  startedAt?: number;
  completedAt?: number;
  score: number;                 // 0–100 分
}

interface StepResult {
  stepIndex: number;
  attempts: number;              // 嘗試次數
  correct: boolean;
  skipped: boolean;
  timeSpentSeconds: number;
}

interface ExerciseProgress {
  exerciseId: string;
  attempts: number;
  correct: boolean;
  score: number;                 // 0–100 分
  lastAttemptAt?: number;
}
```

---

## 狀態轉換圖

### 課程進度狀態機

```
not-started
    │ 開始第一步
    ▼
in-progress ──── 完成所有步驟 ──→ completed
    │
    └── 跳出課程（進度保留，下次 resume）
```

### 練習題評分邏輯

```
提交答案
    │
    ├── |答案 - 正確答案| / 正確答案 ≤ tolerance → 答對 (score = 100)
    │
    └── 答錯
            │
            ├── attempts < maxAttempts → 顯示提示，允許再試
            │
            └── attempts ≥ maxAttempts → 顯示完整解析 (score = 0)
```
