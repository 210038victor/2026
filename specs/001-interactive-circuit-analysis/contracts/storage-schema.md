# 合約：localStorage 儲存綱要（Storage Schema）

**分支**：`001-interactive-circuit-analysis` | **日期**：2026-03-13  
**類型**：客戶端持久化合約（localStorage）

---

## 概述

本功能使用 localStorage 持久化學生的學習進度，滿足 FR-010 與 SC-006（重新整理或關閉分頁後進度不遺失）。儲存由 Zustand `persist` middleware 管理，透過 `src/utils/storage.ts` 封裝存取介面。

---

## 儲存鍵值（Storage Keys）

| 鍵值 | 內容 | 更新時機 |
|------|------|---------|
| `circuit-learning:progress` | `StudentProgressStore` JSON | 每次步驟完成、答案提交後 |
| `circuit-learning:workspace` | `Circuit` JSON（自由工作區） | 每次畫布變更後（防抖 500 ms） |

---

## 綱要版本管理

```typescript
interface StoredData<T> {
  version: number;    // 當前版本：1
  data: T;
  savedAt: number;    // Unix timestamp（毫秒）
}
```

**版本遷移規則**：
- 讀取時若 `version < 當前版本`，執行遷移函數升級資料
- 若遷移失敗，清除舊資料並以空狀態重新開始（不讓版本衝突阻斷學習流程）

---

## `circuit-learning:progress` 綱要

```json
{
  "version": 1,
  "savedAt": 1741842000000,
  "data": {
    "studentId": "stu-123",
    "lessonProgress": {
      "002-kvl": {
        "lessonId": "002-kvl",
        "status": "in-progress",
        "currentStepIndex": 2,
        "stepResults": [
          {
            "stepIndex": 0,
            "attempts": 1,
            "correct": true,
            "skipped": false,
            "timeSpentSeconds": 45
          },
          {
            "stepIndex": 1,
            "attempts": 2,
            "correct": true,
            "skipped": false,
            "timeSpentSeconds": 120
          }
        ],
        "startedAt": 1741841000000,
        "completedAt": null,
        "score": 90
      }
    },
    "exerciseProgress": {
      "001-series-resistance": {
        "exerciseId": "001-series-resistance",
        "attempts": 1,
        "correct": true,
        "score": 100,
        "lastAttemptAt": 1741840000000
      }
    },
    "lastUpdated": 1741842000000
  }
}
```

---

## `circuit-learning:workspace` 綱要

```json
{
  "version": 1,
  "savedAt": 1741842000000,
  "data": {
    "id": "circuit-workspace",
    "name": "我的工作區",
    "components": [
      {
        "id": "comp-r1",
        "type": "resistor",
        "value": 10,
        "unit": "Ω",
        "position": { "x": 200, "y": 150 },
        "rotation": 0,
        "terminals": [
          { "id": "p", "position": { "x": -30, "y": 0 } },
          { "id": "n", "position": { "x": 30, "y": 0 } }
        ]
      }
    ],
    "wires": [],
    "createdAt": 1741840000000,
    "context": { "type": "workspace" }
  }
}
```

---

## 合約保證

- **寫入保證**：每次狀態變更後，Zustand persist middleware 自動序列化並寫入 localStorage
- **讀取保證**：應用程式啟動時自動從 localStorage 還原狀態，若鍵值不存在則使用初始空狀態
- **容量保證**：預估最大儲存量 < 50 KB，遠低於 localStorage 5 MB 限制
- **隔離保證**：使用命名空間前綴 `circuit-learning:` 避免與同域名其他應用衝突

---

## 測試合約

儲存合約測試位於 `tests/contract/storage/`，必須覆蓋：

| 測試案例 | 預期行為 |
|---------|---------|
| 儲存並讀取課程進度 | 資料完整還原，無欄位遺失 |
| 瀏覽器重新整理後進度存在 | SC-006 驗證 |
| 版本 1 → 未來版本遷移 | 資料成功升級或清除並重設 |
| localStorage 不可用 | 應用程式仍可運行（進度無法保存時顯示警告） |
| 儲存損毀的 JSON | 清除並以空狀態重設，不崩潰 |
