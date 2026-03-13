# 合約：MNA 電路求解器介面

**模組**：`src/solver/mna.ts`  
**類型**：TypeScript 模組公開 API

---

## 公開函數

### `solveCircuit(circuit: Circuit): SimulationResult`

執行 DC 電路分析（Modified Nodal Analysis）。

**輸入**：
```typescript
circuit: Circuit  // 包含 components 與 wires 的完整電路
```

**輸出**：
```typescript
SimulationResult {
  circuitId: string;
  status: 'ok' | 'error';
  error?: SimulationError;
  nodeVoltages: Record<string, number>;   // 節點 ID → 電壓（V）
  branchCurrents: Record<string, number>; // 導線 ID → 電流（A）
  componentPower: Record<string, number>; // 元件 ID → 功率（W）
  solvedAt: number;
}
```

**前置條件**：
- 電路中必須有至少一個 `ground` 元件（提供參考電位）
- 所有導線的 `fromTerminalId` 與 `toTerminalId` 必須對應到真實的 `Terminal.id`

**後置條件**：
- 若 `status === 'ok'`：`nodeVoltages` 中所有節點均有對應電壓值；`error` 為 `undefined`
- 若 `status === 'error'`：`error.type` 為以下之一：
  - `'short-circuit'`：電路中存在零電阻迴路
  - `'floating-node'`：存在未接地的孤立節點
  - `'singular-matrix'`：MNA 矩陣奇異（無法求解）
  - `'component-limit'`：元件數超過最大限制（50）
- `nodeVoltages`、`branchCurrents`、`componentPower` 中**不得**出現 `Infinity`、`-Infinity` 或 `NaN`

---

### `detectShortCircuit(circuit: Circuit): string[]`

偵測電路中的短路元件 ID 清單。

**輸出**：短路迴路中涉及的元件 ID 陣列；若無短路則返回空陣列。

---

### `getConnectedNodes(circuit: Circuit): Map<string, string>`

分析電路拓撲，返回各端子所屬的節點集合。

**輸出**：`Map<terminalId, nodeId>`  
同一節點（連通分量）中的所有端子映射至相同的 `nodeId`。

---

## 行為規範

| 情境 | 期望行為 |
|------|----------|
| 空電路（無元件） | 返回 `status: 'ok'`，所有結果映射為空 |
| 只有接地，無其他元件 | 返回 `status: 'ok'`，無節點電壓 |
| 5V 電壓源 + 10Ω 電阻 + 接地 | 電流 = 0.5A，功率 = 2.5W |
| 零電阻短路迴路 | 返回 `status: 'error'`，`type: 'short-circuit'` |
| 元件未接線（浮接） | 返回 `status: 'error'`，`type: 'floating-node'` |
| 超過 50 個元件 | 返回 `status: 'error'`，`type: 'component-limit'` |

---

## 不變量

- 函數為**純函數**（pure function）：不修改輸入，不產生副作用
- 執行時間在 50 個元件以下時**不超過 100ms**（SC-002 的計算部分）
- 對 `NaN`、`Infinity` 等異常值進行防禦性處理
