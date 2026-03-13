# 合約：progressStore 介面

**模組**：`src/stores/progressStore.ts`（內部使用 `src/utils/persistence.ts`）  
**類型**：Zustand store 公開 API + localStorage 持久化

---

## 狀態形狀

```typescript
interface ProgressState {
  records: StudentProgressRecord[];
  studentId: string;            // 來自外部系統，或 'anonymous'
}
```

---

## 動作（Actions）

### `loadProgress(studentId: string): void`

從 localStorage 載入指定學生的所有進度記錄。

**鍵格式**：`progress::${studentId}`  
**值格式**：`JSON.stringify(StudentProgressRecord[])`  
**後置條件**：`records` 填充為 localStorage 中的資料；若鍵不存在則 `records = []`

---

### `startLesson(lessonId: string): void`

開始一堂課程，建立或更新進度記錄。

**後置條件**：
- 對應記錄的 `status` 設為 `'in-progress'`
- `startedAt` 設為當前時間（若尚未設定）
- 持久化至 localStorage

---

### `completeStep(lessonId: string, stepOrder: number): void`

標記課程步驟為已完成。

**後置條件**：
- `completedSteps` 包含 `stepOrder`（不重複）
- 若所有步驟已完成，`status` 設為 `'completed'`，`completedAt` 設為當前時間
- 持久化至 localStorage

---

### `recordExerciseAttempt(exerciseId: string, isCorrect: boolean): void`

記錄練習題作答。

**後置條件**：
- `attemptCount` 遞增
- 若 `isCorrect === true`，`status` 設為 `'completed'`，計算 `score`
- 持久化至 localStorage

---

### `getRecordFor(type: 'lesson' | 'exercise', targetId: string): StudentProgressRecord | undefined`

查詢特定課程或練習的進度記錄。

---

## localStorage 合約

| 鍵 | 值類型 | 說明 |
|----|--------|------|
| `progress::${studentId}` | `JSON` | 學生所有進度記錄陣列 |

**寫入時機**：每次動作執行後立即持久化  
**讀取時機**：應用程式初始化時（`loadProgress`）  
**資料遺失保護**：寫入前先讀取現有資料，合併後再寫入（避免並發覆蓋）

---

## 不變量

- `StudentProgressRecord.status` 只能單向轉換：`not-started` → `in-progress` → `completed`
- `completedSteps` 中不含重複的 stepOrder
- `score` 值範圍為 0–100（整數）
- `attemptCount` 永遠 ≥ 0
