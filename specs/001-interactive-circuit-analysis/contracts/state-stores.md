# 介面契約：狀態管理 Stores

**模組**: `src/stores/`  
**技術**: Zustand + Immer  
**日期**: 2026-03-13

---

## circuitStore（電路狀態）

**檔案**: `src/stores/circuitStore.ts`

### 狀態結構

```typescript
interface CircuitState {
  // 核心資料
  circuit: Circuit;                    // 當前編輯中的電路
  simulationResult: SimulationResult | null; // 最新模擬結果

  // 復原/重做
  history: CircuitSnapshot[];          // 最多 20 個快照
  historyIndex: number;                // 當前歷史位置

  // 動作
  addComponent(component: Component): void;
  updateComponent(id: string, updates: Partial<Component>): void;
  removeComponent(id: string): void;
  addWire(wire: Wire): void;
  removeWire(id: string): void;
  setSimulationResult(result: SimulationResult): void;
  undo(): void;
  redo(): void;
  loadCircuit(circuit: Circuit): void;
  clearCircuit(): void;
}
```

### 行為契約

| 動作 | 觸發快照 | 觸發模擬 |
|------|---------|---------|
| `addComponent` | ✅ | ✅ |
| `updateComponent` | ✅ | ✅ |
| `removeComponent` | ✅ | ✅ |
| `addWire` | ✅ | ✅ |
| `removeWire` | ✅ | ✅ |
| `setSimulationResult` | ❌ | ❌（結果更新） |
| `undo` / `redo` | ❌（已是歷史操作）| ✅ |

**快照規則**：歷史深度上限 20；超過後移除最舊快照。

---

## lessonStore（課程狀態）

**檔案**: `src/stores/lessonStore.ts`

```typescript
interface LessonState {
  lessons: Lesson[];                   // 課程清單（靜態資料）
  currentLesson: Lesson | null;        // 當前進行中課程
  currentStepIndex: number;            // 當前步驟索引（從 0 起）
  lastSubmission: SubmissionResult | null; // 最後一次提交結果

  loadLessons(lessons: Lesson[]): void;
  startLesson(lessonId: string): void;
  submitAnswer(answer: string | number): SubmissionResult;
  skipStep(): void;
  exitLesson(): void;
}

interface SubmissionResult {
  isCorrect: boolean;
  isPartiallyCorrect: boolean;
  feedback: string;                    // '正確！' / '錯誤，提示：...' / '部分正確'
  showExplanation: boolean;            // 完成步驟後顯示解析
}
```

**`submitAnswer` 契約**：
- 數值題：`|submitted - expected| / expected ≤ tolerance` → 正確
- 文字題：大小寫不敏感，trim 後比對
- 回應時間：< 100ms（純前端計算）

---

## progressStore（進度狀態）

**檔案**: `src/stores/progressStore.ts`

```typescript
interface ProgressState {
  records: Record<string, StudentProgress>; // 鍵為 progress ID

  recordLessonStart(lessonId: string): void;
  recordStepCompletion(lessonId: string, stepId: string, score: number): void;
  recordLessonCompletion(lessonId: string, finalScore: number): void;
  recordExerciseAttempt(exerciseId: string, isCorrect: boolean): void;
  getProgress(contentId: string): StudentProgress | undefined;
}
```

**持久化契約**：
- 每次狀態更新後，自動寫入 `localStorage`（key: `progress:{id}`）
- 應用啟動時，從 `localStorage` 還原所有進度紀錄

---

## uiStore（UI 狀態）

**檔案**: `src/stores/uiStore.ts`

```typescript
interface UIState {
  selectedTool: ToolType;              // 當前選取的工具
  selectedComponentId: string | null;  // 選取的元件 ID
  zoom: number;                        // 畫布縮放比例（0.25–4.0）
  panX: number;                        // 畫布平移 X（px）
  panY: number;                        // 畫布平移 Y（px）

  setTool(tool: ToolType): void;
  selectComponent(id: string | null): void;
  setZoom(zoom: number): void;
  setPan(x: number, y: number): void;
  resetView(): void;
}

type ToolType = 'select' | 'wire' | 'resistor' | 'capacitor' | 
                'inductor' | 'voltage_source' | 'current_source' | 'ground';
```
