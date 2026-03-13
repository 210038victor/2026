# Circuit Solver API 合約

**Feature**: `001-interactive-circuit-analysis`  
**Module**: `src/engine/mna.ts`  
**Date**: 2026-03-13

---

## 概述

電路求解引擎是純 TypeScript 函式庫，不依賴任何 UI 框架，接受標準化的電路資料結構並回傳求解結果。此模組為應用程式的核心運算邏輯，對外公開以下函式介面。

---

## 主要函式

### `solveCircuit(circuit: Circuit): SolverResult`

執行改良節點分析法（MNA）並回傳求解結果。

**輸入**：
```typescript
interface Circuit {
  components: Component[];
  wires: Wire[];
}
```

**輸出**：
```typescript
type SolverResult =
  | { success: true; values: SolvedValues }
  | { success: false; error: SolverError };

interface SolvedValues {
  nodeVoltages: Record<string, number>;   // nodeId → 電壓（V）
  componentResults: Record<string, ComponentResult>; // componentId → 結果
}

interface ComponentResult {
  voltage: number;    // 跨元件電壓（V）
  current: number;    // 通過電流（A，正方向依元件定義）
  power: number;      // 消耗功率（W，正值為消耗，負值為產生）
}

type SolverErrorCode =
  | 'SHORT_CIRCUIT'     // 零電阻迴路
  | 'SINGULAR_MATRIX'   // 電路拓撲不合法（如孤立節點形成無解系統）
  | 'NO_GROUND'         // 缺少接地節點
  | 'EMPTY_CIRCUIT'     // 無元件
  | 'DISCONNECTED';     // 電路未完整連接

interface SolverError {
  code: SolverErrorCode;
  message: string;   // 人類可讀說明（英文，UI 層負責翻譯）
  affectedIds?: string[];  // 相關元件或導線 ID（用於 UI 高亮顯示）
}
```

**行為契約**：
1. 任何合法的 DC 電路（含接地節點、至少一個電壓源或電流源、所有元件值有限）必須回傳 `success: true`
2. 短路（電壓源直接以零電阻導線短路）必須回傳 `SHORT_CIRCUIT` 錯誤
3. 缺少接地節點必須回傳 `NO_GROUND` 錯誤
4. 在 50 元件以內，執行時間必須 < 10 ms（排除 UI 更新時間）
5. 結果中所有 `number` 值均為有限數（非 `NaN`、非 `Infinity`）

---

### `validateCircuit(circuit: Circuit): ValidationResult`

在求解前進行快速驗證，不執行完整 MNA 計算。

**輸出**：
```typescript
interface ValidationResult {
  valid: boolean;
  errors: SolverError[];   // 可能有多個錯誤
  warnings: SolverWarning[];
}

interface SolverWarning {
  code: 'FLOATING_NODE' | 'COMPONENT_NOT_CONNECTED';
  message: string;
  affectedIds: string[];
}
```

---

### `formatValue(value: number, baseUnit: string): string`

將數值格式化為適當 SI 前綴的字串，符合 FR-015。

**範例**：
```typescript
formatValue(0.001, 'A')   // → "1 mA"
formatValue(1500, 'Ω')    // → "1.5 kΩ"
formatValue(2.5e-9, 'F')  // → "2.5 nF"
formatValue(1e12, 'Ω')    // → "1 TΩ"
```

**行為契約**：
1. 輸出字串格式為 `"{value} {prefix}{unit}"`，value 最多顯示 3 位有效數字
2. 支援所有 SI 前綴：`T, G, M, k, (無前綴), m, µ, n, p`
3. 輸入值為 0 時回傳 `"0 {unit}"`
4. 輸入為有限非零值，選擇最接近 1–999 範圍的前綴

---

## 使用範例

```typescript
import { solveCircuit, validateCircuit, formatValue } from '@/engine/mna';

// 建構一個簡單電路：5V 電源 + 10Ω 電阻 + 接地
const circuit: Circuit = {
  components: [
    { id: 'V1', type: 'voltageSource', value: 5, /* ... */ },
    { id: 'R1', type: 'resistor', value: 10, /* ... */ },
    { id: 'GND', type: 'ground', /* ... */ },
  ],
  wires: [/* ... 連接關係 ... */],
};

const validation = validateCircuit(circuit);
if (!validation.valid) {
  console.error(validation.errors);
  return;
}

const result = solveCircuit(circuit);
if (result.success) {
  const r1Current = result.values.componentResults['R1'].current;
  console.log(formatValue(r1Current, 'A')); // → "500 mA"
} else {
  console.error(result.error.code); // e.g., "NO_GROUND"
}
```
