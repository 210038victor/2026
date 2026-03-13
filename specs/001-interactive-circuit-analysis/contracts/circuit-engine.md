# 合約：電路求解引擎（Circuit Engine）

**分支**：`001-interactive-circuit-analysis` | **日期**：2026-03-13  
**類型**：模組公開 API 合約（TypeScript）

---

## 概述

電路求解引擎（`src/engine/solver.ts`）是本功能的核心運算模組，負責接受電路拓撲資料並返回 DC 工作點分析結果。此合約定義求解器的公開介面，確保 UI 元件與引擎實作之間的解耦。

---

## 公開 API

### `solveCircuit(circuit: Circuit): CircuitSolverResult`

執行 DC 工作點分析（MNA 方法）。

**輸入**：

| 參數 | 類型 | 說明 |
|------|------|------|
| `circuit` | `Circuit` | 包含元件清單與導線清單的電路物件 |

**輸出**：`CircuitSolverResult`

```typescript
// 成功案例
{
  status: 'ok',
  nodeVoltages: { 'node-1': 5.0, 'node-2': 0.0 },  // 單位：V
  branchCurrents: { 'wire-abc': 0.5 },              // 單位：A
  componentPower: { 'comp-r1': 2.5 }                // 單位：W
}

// 錯誤案例（如短路、孤立節點）
{
  status: 'error',
  nodeVoltages: {},
  branchCurrents: {},
  componentPower: {},
  errorMessage: '短路偵測：導線 wire-xyz 形成零阻抗迴路'
}
```

**合約保證**：
- 無論輸入電路拓撲為何，函數**永遠**返回 `CircuitSolverResult`，不拋出例外
- 若電路包含短路，返回 `status: 'error'` 而非 NaN 或 Infinity（FR-004）
- 執行時間在最多 50 個元件的電路中 < 50 ms（保留 SC-002 的 1 秒預算中的計算份額）

---

### `formatWithSIPrefix(value: number, unit: SIUnit): string`

將數值格式化為帶 SI 前綴的字串（FR-015）。

**輸入**：

| 參數 | 類型 | 說明 |
|------|------|------|
| `value` | `number` | 以 SI 基本單位表示的數值 |
| `unit` | `SIUnit` | 基本單位符號 |

**輸出**：`string`

```typescript
formatWithSIPrefix(1000, 'Ω')   // → '1 kΩ'
formatWithSIPrefix(0.001, 'F')  // → '1 mF'
formatWithSIPrefix(1e-12, 'F')  // → '1 pF'
formatWithSIPrefix(0, 'V')      // → '0 V'
```

---

### `validateCircuit(circuit: Circuit): ValidationResult`

在求解前驗證電路拓撲的合法性。

**輸入**：`Circuit`

**輸出**：

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  code: CircuitErrorCode;
  message: string;              // 給使用者看的繁體中文訊息
  affectedIds?: string[];       // 相關元件或導線 ID
}

type CircuitErrorCode =
  | 'SHORT_CIRCUIT'             // 零阻抗迴路
  | 'FLOATING_NODE'             // 未接地的孤立節點
  | 'NO_GROUND'                 // 缺少接地節點
  | 'DISCONNECTED_COMPONENT'    // 未連接的元件
  | 'COMPONENT_LIMIT_EXCEEDED'; // 超過最大元件數量
```

---

## 內部實作概要（供開發者參考）

```
buildMNAMatrix(circuit)
    ↓
validateCircuit(circuit) → 錯誤時提早返回
    ↓
組建 G 矩陣（電阻的電導值）
組建 B、C 矩陣（電壓源關聯）
組建 z 向量（已知電流源與電壓源）
    ↓
math.lusolve(A, z) → 解向量 x
    ↓
檢查 x 是否含 NaN 或 Infinity（第二層防護）
    ↓
解析 x → nodeVoltages、branchCurrents、componentPower
```

---

## 測試合約

引擎模組的單元測試必須覆蓋以下案例：

| 測試案例 | 預期結果 |
|---------|---------|
| 單一電阻 + 直流電壓源 | 電流 = V/R，功率 = V²/R |
| 串聯電阻（兩個） | 分壓定律正確 |
| 並聯電阻（兩個） | 合成電阻 = R1×R2/(R1+R2) |
| 短路（零阻抗迴路） | status: 'error'，不含 NaN/Infinity |
| 無接地節點 | status: 'error'，錯誤碼 NO_GROUND |
| 元件數量超過 50 | ValidationResult.valid: false |
| SI 前綴格式化（各前綴） | 字串格式符合規格 |
