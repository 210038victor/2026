# 介面契約：UI 元件

**模組**: `src/components/`  
**技術**: React 18 + TypeScript + Konva.js  
**日期**: 2026-03-13

---

## 核心 UI 元件樹

```
App
├── CircuitCanvas          # 互動畫布（Konva Stage）
│   ├── GridLayer          # 背景格線
│   ├── WireLayer          # 導線繪製
│   ├── ComponentLayer     # 電路元件
│   └── SelectionLayer     # 選擇框
├── Toolbar                # 工具列（元件選取）
├── ComponentPanel         # 元件屬性面板
├── SimulationOverlay      # 節點電壓/電流顯示
├── LessonPanel            # 課程步驟面板
├── LessonCatalog          # 課程目錄頁面
├── ExercisePage           # 練習題頁面
└── ProgressDashboard      # 學習進度儀表板
```

---

## CircuitCanvas

**Props**：
```typescript
interface CircuitCanvasProps {
  readOnly?: boolean;       // 課程/練習題模式下為 true
  width: number;            // 容器寬度（px）
  height: number;           // 容器高度（px）
}
```

**行為契約**：
- 支援以下互動：拖曳放置、點擊選取、觸控平移/縮放
- 縮放範圍：0.25x – 4.0x
- `readOnly=true` 時：禁用元件拖曳、新增、刪除，保留平移/縮放

---

## ComponentPanel

**Props**：
```typescript
interface ComponentPanelProps {
  componentId: string | null;   // null 時顯示空白/提示
}
```

**行為契約**：
- 顯示當前選取元件的值、單位、標籤
- 數值輸入時，即時觸發 `circuitStore.updateComponent`（debounce 300ms）
- 顯示模擬結果中對應元件的電壓差、電流、功率
- 數值欄位支援 SI 前綴輸入（如輸入 `1k` 解析為 1000）

---

## SimulationOverlay

**行為契約**：
- 在每個節點旁顯示節點電壓標籤
- 在每條導線旁顯示電流方向箭頭與數值
- 若 `simulationResult.isValid === false`：顯示紅色警告橫幅 + `errorMessage`
- 所有數值使用 `formatSIValue` 格式化

---

## LessonPanel

**Props**：
```typescript
interface LessonPanelProps {
  lesson: Lesson;
  currentStepIndex: number;
  lastSubmission: SubmissionResult | null;
}
```

**行為契約**：
- 顯示當前步驟說明
- 答案提交後 < 2s 顯示回饋
- 答錯顯示提示；正確後顯示解析並啟用「下一步」按鈕
- 進度指示器顯示 `{current}/{total}` 步驟

---

## ProgressDashboard

**行為契約**：
- 若無任何進度：顯示引導提示，連結至課程目錄
- 列出所有已嘗試課程/練習題，含：標題、狀態、分數、完成日期
- 在行動裝置（< 768px）上以單欄卡片顯示
- 在桌面（≥ 1024px）上以表格顯示

---

## 響應式斷點

| 斷點 | 寬度範圍 | 說明 |
|------|---------|------|
| `xs` | 320px – 479px | 最小支援寬度，單欄佈局 |
| `sm` | 480px – 767px | 行動裝置，面板可折疊 |
| `md` | 768px – 1023px | 平板，雙欄佈局 |
| `lg` | 1024px – 1439px | 桌面，三欄佈局 |
| `xl` | 1440px – 2560px | 大螢幕，擴大畫布空間 |

**注意**：320px 以下顯示「最小支援寬度提示」，功能不保證可用。
