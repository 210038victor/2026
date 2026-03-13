# 資料模型：響應式互動學習電路分析

**分支**: `001-interactive-circuit-analysis` | **日期**: 2026-03-13

---

## 實體總覽

```
Circuit ──────────── Component (1..*)
Circuit ──────────── Wire (0..*)
Lesson ───────────── LessonStep (1..*)
Lesson ───────────── Circuit (1, 範例電路)
Exercise ─────────── Circuit (1, 題目電路)
StudentProgress ──── Lesson / Exercise (多對多)
```

---

## 實體定義

### 1. Component（電路元件）

| 欄位 | 型別 | 說明 | 驗證規則 |
|------|------|------|---------|
| `id` | `string` (UUID) | 唯一識別碼 | 必填，系統生成 |
| `type` | `ComponentType` | 元件類型（見下表） | 必填 |
| `value` | `number` | 元件數值（如電阻值 Ω） | 必填；電阻 > 0；電壓源任意值；電流源任意值 |
| `unit` | `string` | SI 單位（如 `Ω`, `F`, `H`, `V`, `A`） | 必填，依類型決定 |
| `x` | `number` | 畫布 X 座標（px） | 必填，整數 |
| `y` | `number` | 畫布 Y 座標（px） | 必填，整數 |
| `rotation` | `number` | 旋轉角度（度） | 0 / 90 / 180 / 270，預設 0 |
| `terminals` | `Terminal[]` | 元件接端清單 | 依類型固定數量（見下表） |
| `label` | `string` | 使用者自訂標籤 | 選填，最長 20 字元 |

**ComponentType 枚舉**：

| 值 | 中文名 | 接端數 | 預設單位 |
|----|------|------|---------|
| `resistor` | 電阻 | 2 | Ω |
| `capacitor` | 電容 | 2 | F |
| `inductor` | 電感 | 2 | H |
| `voltage_source` | 電壓源 | 2 | V |
| `current_source` | 電流源 | 2 | A |
| `ground` | 接地節點 | 1 | — |

**Terminal（接端）**：

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | `string` | `{componentId}-{終端編號}`（如 `r1-0`）|
| `relativeX` | `number` | 相對元件中心的 X 偏移（px）|
| `relativeY` | `number` | 相對元件中心的 Y 偏移（px）|
| `connectedWireIds` | `string[]` | 連接的導線 ID 清單 |

---

### 2. Wire（導線）

| 欄位 | 型別 | 說明 | 驗證規則 |
|------|------|------|---------|
| `id` | `string` (UUID) | 唯一識別碼 | 必填，系統生成 |
| `fromTerminalId` | `string` | 起點接端 ID | 必填，對應存在的 Terminal |
| `toTerminalId` | `string` | 終點接端 ID | 必填，對應存在的 Terminal |
| `points` | `number[]` | 折線座標序列 `[x1,y1,x2,y2,...]` | 必填，最少 4 個值 |

**驗證規則**：
- `fromTerminalId ≠ toTerminalId`（不可自環）
- 不可重複連接相同兩個接端（防止重複導線）

---

### 3. Circuit（電路）

| 欄位 | 型別 | 說明 | 驗證規則 |
|------|------|------|---------|
| `id` | `string` (UUID) | 唯一識別碼 | 必填，系統生成 |
| `name` | `string` | 電路名稱 | 必填，最長 50 字元 |
| `components` | `Component[]` | 元件清單 | 最多 50 個（含接地節點） |
| `wires` | `Wire[]` | 導線清單 | 無上限（受畫布空間限制） |
| `context` | `CircuitContext` | 所屬情境（見下） | 必填 |
| `createdAt` | `number` | 建立時間戳（Unix ms） | 系統生成 |
| `updatedAt` | `number` | 最後更新時間戳（Unix ms） | 系統更新 |

**CircuitContext 枚舉**：

| 值 | 說明 |
|----|------|
| `workspace` | 學生個人工作區（自由練習） |
| `lesson` | 課程內建示範電路（唯讀） |
| `exercise` | 練習題附屬電路（唯讀） |

---

### 4. SimulationResult（模擬結果，非持久化）

| 欄位 | 型別 | 說明 |
|------|------|------|
| `nodeVoltages` | `Record<string, number>` | 節點電壓，鍵為節點 ID（V）|
| `branchCurrents` | `Record<string, number>` | 支路電流，鍵為元件 ID（A）|
| `componentPower` | `Record<string, number>` | 元件功率，鍵為元件 ID（W）|
| `isValid` | `boolean` | 是否有效（無短路/奇異矩陣）|
| `errorMessage` | `string \| null` | 錯誤描述（如「短路警告」）|

---

### 5. Lesson（課程）

| 欄位 | 型別 | 說明 | 驗證規則 |
|------|------|------|---------|
| `id` | `string` | 課程識別碼（如 `ohms-law`）| 必填，URL-safe |
| `title` | `string` | 課程標題 | 必填，最長 60 字元 |
| `topic` | `LessonTopic` | 分析主題（見下） | 必填 |
| `difficulty` | `1 \| 2 \| 3` | 難度（1=入門、2=中階、3=進階）| 必填 |
| `estimatedMinutes` | `number` | 預估完成時間（分鐘）| 必填，> 0 |
| `steps` | `LessonStep[]` | 步驟清單（有序）| 必填，最少 1 步 |
| `circuitId` | `string` | 示範電路 ID | 必填 |
| `prerequisiteIds` | `string[]` | 前置課程 ID | 選填 |

**LessonTopic 枚舉**：
`ohms_law` | `kvl` | `kcl` | `series_circuits` | `parallel_circuits` | `thevenin` | `norton` | `nodal_analysis` | `mesh_analysis` | `superposition`

---

### 6. LessonStep（課程步驟）

| 欄位 | 型別 | 說明 | 驗證規則 |
|------|------|------|---------|
| `id` | `string` | 步驟識別碼 | 必填 |
| `order` | `number` | 步驟順序（從 1 起）| 必填，唯一 |
| `instruction` | `string` | 步驟說明文字 | 必填 |
| `expectedAnswer` | `string \| number` | 期望答案 | 必填 |
| `tolerance` | `number \| null` | 數值容差（%），僅數值題適用 | 選填，預設 2% |
| `hint` | `string` | 提示文字（答錯後顯示）| 必填 |
| `explanation` | `string` | 正確答案解析 | 必填 |
| `isSkippable` | `boolean` | 是否允許略過 | 必填，預設 `false` |

---

### 7. Exercise（練習題）

| 欄位 | 型別 | 說明 | 驗證規則 |
|------|------|------|---------|
| `id` | `string` | 練習題識別碼 | 必填，URL-safe |
| `title` | `string` | 題目標題 | 必填，最長 100 字元 |
| `question` | `string` | 題目敘述 | 必填 |
| `circuitId` | `string` | 題目電路 ID | 必填 |
| `correctAnswer` | `number` | 正確答案 | 必填 |
| `unit` | `string` | 答案單位（如 `Ω`, `A`）| 必填 |
| `tolerance` | `number` | 容差（%）| 必填，預設 2 |
| `maxAttempts` | `number` | 最大嘗試次數 | 必填，預設 3 |
| `solutionWalkthrough` | `string` | 解題步驟說明 | 必填 |
| `relatedLessonIds` | `string[]` | 相關課程 ID | 選填 |

---

### 8. StudentProgress（學習進度紀錄）

| 欄位 | 型別 | 說明 | 驗證規則 |
|------|------|------|---------|
| `id` | `string` | 紀錄 ID（`{type}-{contentId}`）| 必填，系統生成 |
| `contentType` | `'lesson' \| 'exercise'` | 內容類型 | 必填 |
| `contentId` | `string` | 課程或練習題 ID | 必填 |
| `status` | `ProgressStatus` | 完成狀態（見下） | 必填，預設 `not_started` |
| `score` | `number \| null` | 最終分數（0–100）| 選填 |
| `completedSteps` | `string[]` | 已完成步驟 ID（僅課程）| 選填 |
| `attempts` | `number` | 嘗試次數（僅練習題）| 選填，預設 0 |
| `startedAt` | `number \| null` | 開始時間戳 | 系統記錄 |
| `completedAt` | `number \| null` | 完成時間戳 | 系統記錄 |
| `lastUpdatedAt` | `number` | 最後更新時間戳 | 系統更新 |

**ProgressStatus 枚舉**：
`not_started` | `in_progress` | `completed` | `skipped`

---

## 狀態轉換

### StudentProgress 狀態機

```
not_started ──[開始課程/練習題]──→ in_progress
in_progress ──[完成所有步驟]────→ completed
in_progress ──[學生略過]─────→ skipped
skipped     ──[重新開始]─────→ in_progress
completed   ──[重新挑戰]─────→ in_progress（分數可更新）
```

---

## 持久化策略

| 資料 | 儲存位置 | 格式 | 備注 |
|------|--------|------|------|
| `Circuit`（個人工作區）| IndexedDB `circuits` store | JSON | 自動儲存 |
| `StudentProgress` | localStorage `progress:{id}` | JSON | 每次更新即存 |
| `SimulationResult` | 記憶體（Zustand）| 物件 | 不持久化 |
| `Lesson`、`Exercise` | 靜態 JSON 檔（公開資源）| JSON | 部署時打包 |

---

## SI 單位前綴規則

| 前綴 | 符號 | 倍率 |
|------|------|------|
| tera- | T | 10¹² |
| giga- | G | 10⁹ |
| mega- | M | 10⁶ |
| kilo- | k | 10³ |
| （無前綴）| — | 10⁰ |
| milli- | m | 10⁻³ |
| micro- | µ | 10⁻⁶ |
| nano- | n | 10⁻⁹ |
| pico- | p | 10⁻¹² |

**格式化規則**：選取最接近 1 的前綴（如 `0.005 A` → `5 mA`，`1500 Ω` → `1.5 kΩ`）
