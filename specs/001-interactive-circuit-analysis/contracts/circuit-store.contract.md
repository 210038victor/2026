# 合約：circuitStore 介面

**模組**：`src/stores/circuitStore.ts`  
**類型**：Zustand store 公開 API

---

## 狀態形狀

```typescript
interface CircuitState {
  circuit: Circuit;
  selectedIds: string[];
}
```

---

## 動作（Actions）

### `addComponent(type: ComponentType, position: {x: number; y: number}): void`

在指定位置新增元件。

**前置條件**：`circuit.components.length < 50`（否則不執行任何動作）  
**後置條件**：
- `circuit.components` 包含新元件，其 `id` 為唯一 nanoid
- `circuit.updatedAt` 更新為當前時間

---

### `removeComponent(id: string): void`

移除指定 ID 的元件及所有連接至其端子的導線。

**後置條件**：
- 元件不再存在於 `circuit.components`
- 所有 `fromTerminalId` 或 `toTerminalId` 屬於該元件的導線均已移除

---

### `moveComponent(id: string, position: {x: number; y: number}): void`

移動元件到新座標。

**後置條件**：對應元件的 `position` 更新；所有端子的 `offset` 相對位置不變

---

### `rotateComponent(id: string): void`

將元件旋轉 90°（循環：0 → 90 → 180 → 270 → 0）。

---

### `updateComponentValue(id: string, value: number): void`

更新元件的數值。

**前置條件**：`value > 0`（若值為 0 或負數則不執行任何動作）

---

### `addWire(fromTerminalId: string, toTerminalId: string): void`

連接兩個端子，新增導線。

**前置條件**：
- `fromTerminalId !== toTerminalId`
- 不存在相同 `(fromTerminalId, toTerminalId)` 組合的導線

**後置條件**：`circuit.wires` 包含新導線

---

### `removeWire(id: string): void`

移除指定導線。

---

### `setSelected(ids: string[]): void`

設定當前選取的元件/導線 ID 集合。

---

### `clearAll(): void`

清除畫布上所有元件與導線，重置為空電路。

---

### `reset(): void`

與 `clearAll()` 相同，提供給 historyStore 復原/重做使用。

---

## 不變量

- `circuit.components` 長度永遠 ≤ 50
- 每個 `Wire.fromTerminalId` 與 `toTerminalId` 必須能在 `circuit.components` 的某個 `terminals` 中找到（若對應元件已刪除，導線自動移除）
- `circuit.updatedAt` 在每次動作後更新
