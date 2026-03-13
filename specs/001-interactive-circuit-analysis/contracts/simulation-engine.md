# 介面契約：電路模擬引擎（Circuit Simulation Engine）

**模組**: `src/simulation/mna.ts`  
**類型**: 純函數 TypeScript 模組（無副作用）  
**日期**: 2026-03-13

---

## 概述

電路模擬引擎採用**修正節點分析（MNA）**演算法，接受電路拓撲作為輸入，回傳節點電壓、支路電流與元件功率。

---

## 型別定義

```typescript
/** 支援的元件類型 */
type ComponentType =
  | 'resistor'
  | 'capacitor'
  | 'inductor'
  | 'voltage_source'
  | 'current_source'
  | 'ground';

/** 電路元件（模擬引擎視角，簡化版） */
interface SimComponent {
  id: string;
  type: ComponentType;
  value: number;        // 數值（Ω / F / H / V / A）
  nodeA: string;        // 正端節點 ID（接地節點為 '0'）
  nodeB: string;        // 負端節點 ID（接地節點為 '0'）
}

/** 模擬輸入 */
interface CircuitNetlist {
  components: SimComponent[];
}

/** 模擬輸出 */
interface SimulationResult {
  isValid: boolean;
  nodeVoltages: Record<string, number>;     // { 節點ID: 電壓(V) }
  branchCurrents: Record<string, number>;   // { 元件ID: 電流(A) }
  componentPower: Record<string, number>;   // { 元件ID: 功率(W) }
  errorMessage: string | null;
}
```

---

## 主要 API

### `simulateDC(netlist: CircuitNetlist): SimulationResult`

執行 DC 直流工作點分析。

**前置條件**：
- `netlist.components` 中至少有一個 `ground` 節點
- 所有 `nodeA`、`nodeB` 為非空字串

**後置條件**：
- 若電路有效：`isValid = true`，`nodeVoltages['0'] = 0`
- 若電路無效（短路、奇異矩陣）：`isValid = false`，`errorMessage` 含說明文字

**邊界情況**：
| 情況 | 處理方式 |
|------|---------|
| 短路（R = 0 Ω）| `isValid = false`，`errorMessage = '電路短路：零電阻迴路'` |
| 無接地節點 | `isValid = false`，`errorMessage = '電路缺少接地參考點'` |
| 浮空節點（無路徑）| `isValid = false`，`errorMessage = '浮空節點：{nodeId}'` |
| 超過 50 個元件 | `isValid = false`，`errorMessage = '超過最大元件數量限制（50）'` |
| 空電路 | `isValid = false`，`errorMessage = '電路為空'` |

**範例**：
```typescript
// 輸入：5V 電源 + 10Ω 電阻
const result = simulateDC({
  components: [
    { id: 'v1', type: 'voltage_source', value: 5, nodeA: '1', nodeB: '0' },
    { id: 'r1', type: 'resistor',       value: 10, nodeA: '1', nodeB: '0' },
    { id: 'gnd', type: 'ground',        value: 0, nodeA: '0', nodeB: '0' },
  ]
});

// 預期輸出
// result.isValid === true
// result.nodeVoltages['1'] === 5
// result.branchCurrents['r1'] === 0.5   // I = V/R = 5/10
// result.componentPower['r1'] === 2.5   // P = V²/R = 25/10
```

---

### `formatSIValue(value: number, unit: string): string`

將數值格式化為含 SI 前綴的字串。

**契約**：
```typescript
formatSIValue(0.005, 'A')   // → '5 mA'
formatSIValue(1500, 'Ω')    // → '1.5 kΩ'
formatSIValue(0.000001, 'F')// → '1 µF'
formatSIValue(1e12, 'Ω')    // → '1 TΩ'
formatSIValue(1e-12, 'F')   // → '1 pF'
```

**精度規則**：最多 3 位有效數字

---

### `validateCircuit(netlist: CircuitNetlist): { valid: boolean; errors: string[] }`

靜態驗證電路（不執行模擬），回傳所有驗證錯誤。

**用途**：在模擬前提供即時使用者回饋

---

## 非責任範圍

- **AC 分析**：不支援相量、阻抗、頻率響應（Future Enhancement）
- **暫態分析**：不支援電容充放電時域模擬
- **非線性元件**：不支援二極體、BJT、MOSFET
