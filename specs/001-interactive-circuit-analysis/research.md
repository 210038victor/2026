# 技術研究報告：響應式互動學習電路分析

**分支**: `001-interactive-circuit-analysis` | **日期**: 2026-03-13

---

## 決策 1：電路模擬引擎

**決策**：自製輕量 MNA（修正節點分析，Modified Nodal Analysis）實作

**理由**：
- 規格僅需 DC 分析（直流工作點、串並聯化簡、疊加定理），無需完整 SPICE 模擬
- 消除外部依賴，符合「簡約設計」原則
- 純 TypeScript 實作，易於測試與除錯
- 教育情境電路規模小（≤ 50 個元件），MNA 求解效能遠超需求（< 5ms）
- MNA 演算法本身即為課程學習內容，可作為教學材料

**MNA 演算法概要**：
```
1. 解析電路拓撲 → 建立節點清單
2. 構建矩陣 G（導納）與向量 I（電流源）
3. 各元件印記（stamp）：電阻 → 1/R，電壓源 → KVL 約束
4. 求解線性方程組 G·V = I（高斯消去法）
5. 提取節點電壓，計算各支路電流與功率
```

**短路/開路邊界情況**：
- 短路（0 Ω）：數值正規化，顯示警告並阻止計算
- 開路（∞ Ω）：自然對應零電流，不產生奇異矩陣

**考慮過的替代方案**：
| 方案 | 拒絕原因 |
|------|---------|
| spicey (v0.0.14) | 版本過早（pre-release），穩定性未驗證 |
| eecircuit-engine | WebAssembly 包裝，40 MB，遠超本功能需求 |
| circuitjs1 (Falstad) | 未上架 npm，維護停滯 |
| circuit-simulator | 2016 年後無更新，依賴過舊 |

---

## 決策 2：互動畫布函式庫

**決策**：Konva.js (v10.x) + react-konva

**理由**：
- HTML5 Canvas 基礎，適合需要像素精度的電路圖繪製
- 原生支援拖曳、縮放、平移、旋轉、多選
- 內建觸控事件處理（非事後追加），符合行動裝置需求
- 包體積僅 45 KB（與 React Flow 的 1.2 MB 相比節省 96%）
- react-konva 提供宣告式 React API，開發效率佳
- 支援圖層架構，可分離背景、元件、導線、選擇框

**圖層架構**：
```
Stage（Canvas 容器）
├── Layer 0：背景格線
├── Layer 1：導線（Wire）
├── Layer 2：電路元件（Component）
└── Layer 3：選擇框（Transformer / Selection）
```

**考慮過的替代方案**：
| 方案 | 拒絕原因 |
|------|---------|
| React Flow | 包體積 1.2 MB，SVG 精度不足，無旋轉支援 |
| Fabric.js | 包體積 180 KB，1000+ 物件效能較差 |
| D3.js | 資料視覺化用途，觸控支援差，拖曳難以實作 |
| Paper.js | 維護緩慢，React 整合困難 |
| 原生 SVG/Canvas | 開發成本高，不必要的重工 |

---

## 決策 3：前端框架與建置工具

**決策**：React 18 + Vite 5 + TypeScript 5（靜態 SPA）

**理由**：
- 符合憲法原則 VIII「靜態網站優先」，可部署於 GitHub Pages
- Vite 提供極快的開發體驗與最佳化建置
- TypeScript 提供型別安全，有助於複雜資料模型的正確性
- React 18 的並行渲染有助於高頻更新（電路值即時顯示）
- 無需後端伺服器，降低基礎架構複雜度

**部署目標**：GitHub Pages（靜態匯出）

---

## 決策 4：狀態管理

**決策**：Zustand + Immer

**理由**：
- Zustand (~2 KB) 遠比 Redux Toolkit (~30 KB) 輕量
- Immer 中介軟體讓不可變狀態更新語法清晰
- 無 Provider 包裹，可直接在任意元件取用 store
- 適合本案多個關注點分離：電路狀態、課程進度、復原/重做歷史

**Store 架構**：
```
circuitStore     → 電路拓撲、元件值、模擬結果、復原/重做歷史
lessonStore      → 當前課程步驟、提交答案、課程清單
progressStore    → 已完成課程、分數、時間戳
uiStore          → 工具選擇、縮放層級、選取狀態
```

**考慮過的替代方案**：
| 方案 | 拒絕原因 |
|------|---------|
| Redux Toolkit | 樣板程式碼過多，單人學習平台不需要 |
| Jotai | Atom 模型增加認知負擔，無明顯優勢 |
| React Context+useReducer | 無內建持久化，效能較差 |

---

## 決策 5：資料持久化

**決策**：localStorage（進度元資料）+ IndexedDB（電路資料）

**分工策略**：
- `localStorage`：課程完成紀錄、分數、時間戳（小資料，快速存取）
- `IndexedDB`：完整電路資料（元件陣列、導線陣列，可能 > 1 MB）

**離線支援**：
- 網路斷線時，資料暫存於 IndexedDB 的同步佇列
- 恢復連線後，自動清空佇列（未來整合後端時使用）
- 使用 `online`/`offline` DOM 事件偵測網路狀態

**考慮過的替代方案**：
| 方案 | 拒絕原因 |
|------|---------|
| 僅用 localStorage | 5-10 MB 上限，複雜電路資料可能超出 |
| 僅用 IndexedDB | 非同步開銷，對小型進度資料不必要 |
| localForage | 多一層抽象，無明顯效益 |

---

## 決策 6：測試框架

**決策**：Vitest + React Testing Library + Playwright

**分工**：
- `Vitest`：單元測試（MNA 演算法、SI 單位格式化、純函數）
- `React Testing Library`：元件測試（UI 互動、渲染正確性）
- `Playwright`：端對端測試（完整使用者流程驗證）

---

## 技術摘要

| 類別 | 選擇 | 版本 |
|------|------|------|
| 語言 | TypeScript | 5.x |
| UI 框架 | React | 18.x |
| 建置工具 | Vite | 5.x |
| 畫布 | Konva.js + react-konva | 10.x |
| 狀態管理 | Zustand + Immer | 5.x / 10.x |
| 電路模擬 | 自製 MNA（TypeScript） | — |
| 儲存 | localStorage + IndexedDB | 瀏覽器原生 |
| 單元測試 | Vitest | 2.x |
| 元件測試 | React Testing Library | 16.x |
| E2E 測試 | Playwright | 1.x |
| 部署 | GitHub Pages（靜態匯出） | — |
