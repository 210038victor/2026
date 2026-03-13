# 研究報告：響應式互動學習電路分析

**分支**：`001-interactive-circuit-analysis` | **日期**：2026-03-13  
**來源**：Phase 0 研究，解決 plan.md 技術背景中的所有 NEEDS CLARIFICATION 事項

---

## 決策 1：電路求解演算法

**決策**：採用改良節點分析法（Modified Nodal Analysis，MNA）

**理由**：
- MNA 是業界標準的電路求解方法（SPICE 使用同一核心原理），適用於直流工作點分析
- 可在瀏覽器內以 TypeScript 實作，無需後端，滿足靜態網站優先原則
- 僅需線性代數（組建 G 矩陣 + B/C/D 子矩陣 → 求解 Ax = z），可使用 math.js 的矩陣求解 API
- 對於本功能的規模（最多 50 個元件），MNA 的計算量遠低於 1 秒門檻（SC-002）

**考慮過的替代方案**：
- **迭代法（Gauss-Seidel）**：收斂速度慢，不適合即時互動；拒絕
- **引入 WebAssembly SPICE 函式庫**：依賴過重，違反簡約設計原則（憲法 II）；拒絕
- **直接用 JavaScript 模擬器（e.g., circuit.js）**：現有套件維護狀態不佳；拒絕

**MNA 方程組形式**：

```
[G  B] [v]   [i]
[C  D] [j] = [e]
```

- G：導納矩陣（節點電導）
- B/C：電壓源關聯矩陣
- D：通常為零矩陣（標準 DC 分析）
- v：未知節點電壓向量
- j：電壓源電流向量
- i：已知電流源向量
- e：已知電壓源電壓向量

---

## 決策 2：電路畫布渲染方式

**決策**：採用 SVG（Scalable Vector Graphics）渲染電路元件與導線

**理由**：
- SVG 元素是 DOM 節點，可直接綁定 React 事件（onClick、onMouseMove、onTouchStart），無需額外的事件映射層
- SVG 天然支援縮放（viewBox），在 320–2560 px 的響應式範圍內不失真
- 無障礙性（accessibility）優於 Canvas：可為每個元件加 `<title>` 和 `aria-*` 屬性
- 對於本功能規模（< 50 個元件），SVG 的渲染效能完全充足，不需 Canvas 的效能優勢

**考慮過的替代方案**：
- **HTML5 Canvas API**：事件處理需自行計算座標，觸控支援實作複雜；拒絕
- **Konva.js（Canvas 函式庫）**：額外套件依賴，且同樣增加事件複雜度；拒絕
- **Three.js／WebGL**：對 2D 電路圖嚴重過度設計；拒絕

---

## 決策 3：狀態管理方案

**決策**：採用 Zustand 管理全域狀態

**理由**：
- Zustand 是輕量狀態管理函式庫（< 1 KB gzip），API 簡潔，無 Redux 的樣板代碼
- 支援 middleware（`persist`），可直接將 store 內容持久化至 localStorage，滿足 FR-010
- 與 React 18 Concurrent Mode 相容

**考慮過的替代方案**：
- **Redux Toolkit**：功能強大但對本功能規模過重；違反簡約設計原則；拒絕
- **React Context + useReducer**：進度持久化需額外自寫 localStorage 同步邏輯；拒絕
- **Jotai / Recoil**：原子狀態模型不適合電路拓撲這類圖結構資料；拒絕

---

## 決策 4：進度持久化方案

**決策**：使用 Zustand `persist` middleware 將進度資料存入 localStorage

**理由**：
- 滿足 SC-006（瀏覽器重新整理、分頁關閉、裝置休眠後進度保留）
- 無需後端 API，符合靜態網站優先原則（憲法 VIII）
- localStorage 的同步 API 確保寫入立即完成，無非同步競態問題
- 規格假設認證由外部系統處理，因此進度以學生 ID 為鍵值隔離

**考慮過的替代方案**：
- **IndexedDB**：容量更大但 API 複雜；對本功能的資料量（< 100 KB）無必要；拒絕
- **sessionStorage**：不跨分頁／重啟持久；不符合 SC-006；拒絕
- **遠端 API**：需後端，違反靜態網站優先原則；拒絕

**localStorage 容量評估**：
- 每課程進度記錄：約 500 bytes
- 10 課程 × 最多 20 步 = 約 5 KB
- 20 練習題記錄：約 2 KB
- 總計：遠低於 localStorage 5 MB 限制

---

## 決策 5：課程與練習題資料格式

**決策**：採用靜態 JSON 檔案打包於前端，無需 API 呼叫

**理由**：
- 課程內容由領域專家預先撰寫（規格假設），不需要動態 CMS
- JSON 資料可直接 import 至 TypeScript，享有型別檢查
- 無網路請求，支援離線使用（符合邊緣案例：網路中斷時仍可繼續學習）

**資料組織**：
```
src/data/
├── lessons/
│   ├── 001-ohms-law.json
│   ├── 002-kvl.json
│   ├── 003-kcl.json
│   └── ...（共 10 課程）
└── exercises/
    ├── 001-series-resistance.json
    ├── 002-parallel-resistance.json
    └── ...（共 20 練習題）
```

---

## 決策 6：短路偵測方式

**決策**：在 MNA 求解前先檢查電路拓撲，偵測零阻抗迴路；求解後檢查是否出現 NaN 或 Infinity

**理由**：
- 純電壓源形成的零阻抗迴路會使 MNA 矩陣奇異（det = 0），math.js 的 `lusolve` 會返回 NaN
- 雙重檢查（拓撲前驗證 + 結果後驗證）確保 FR-004（不顯示無定義值）和 SC-007

---

## 所有 NEEDS CLARIFICATION 已解決

| 項目 | 狀態 |
|------|------|
| 電路求解演算法 | ✅ MNA（math.js） |
| 畫布渲染方式 | ✅ SVG + React 事件 |
| 狀態管理 | ✅ Zustand + persist |
| 進度持久化 | ✅ localStorage |
| 課程資料格式 | ✅ 靜態 JSON |
| 短路偵測 | ✅ 拓撲驗證 + 結果驗證 |
