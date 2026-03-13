# 快速入門：響應式互動學習電路分析

**分支**: `001-interactive-circuit-analysis`  
**目標**: 讓開發者在 5 分鐘內啟動開發環境並了解專案結構

---

## 環境需求

| 工具 | 最低版本 | 安裝指令 |
|------|---------|---------|
| Node.js | 20.x LTS | https://nodejs.org |
| npm | 10.x | 隨 Node.js 安裝 |
| Git | 2.x | https://git-scm.com |

---

## 安裝與啟動

```bash
# 1. 進入專案目錄（假設已 clone）
cd /path/to/repo

# 2. 安裝依賴（在前端目錄）
cd frontend
npm install

# 3. 啟動開發伺服器
npm run dev
# → 開啟 http://localhost:5173
```

---

## 專案結構

```text
frontend/
├── src/
│   ├── components/         # React UI 元件
│   │   ├── canvas/         # Konva.js 畫布相關元件
│   │   ├── lesson/         # 課程步驟相關元件
│   │   ├── exercise/       # 練習題相關元件
│   │   └── progress/       # 進度儀表板元件
│   ├── stores/             # Zustand 狀態管理
│   │   ├── circuitStore.ts
│   │   ├── lessonStore.ts
│   │   ├── progressStore.ts
│   │   └── uiStore.ts
│   ├── simulation/         # 電路模擬引擎
│   │   ├── mna.ts          # MNA 演算法核心
│   │   ├── netlist.ts      # 電路→網表轉換
│   │   └── formatter.ts    # SI 單位格式化
│   ├── data/               # 靜態課程與練習題資料
│   │   ├── lessons/        # 各課程 JSON 檔案
│   │   └── exercises/      # 各練習題 JSON 檔案
│   ├── types/              # TypeScript 型別定義
│   │   └── index.ts
│   ├── utils/              # 工具函數
│   └── App.tsx
├── tests/
│   ├── unit/               # 單元測試（Vitest）
│   ├── integration/        # 整合測試（Vitest + RTL）
│   └── e2e/                # 端對端測試（Playwright）
├── public/
│   └── assets/             # 靜態資源
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json

specs/
└── 001-interactive-circuit-analysis/
    ├── spec.md             # 功能規格
    ├── plan.md             # 實作計畫（本文件同目錄）
    ├── research.md         # 技術研究
    ├── data-model.md       # 資料模型
    ├── quickstart.md       # 本檔案
    ├── contracts/          # 介面契約
    └── tasks.md            # 任務清單（由 /speckit.tasks 產生）
```

---

## 常用指令

```bash
# 開發
npm run dev          # 啟動開發伺服器（HMR）

# 測試
npm run test         # 執行單元+整合測試（Vitest）
npm run test:e2e     # 執行 E2E 測試（Playwright）
npm run test:watch   # 監視模式測試

# 品質檢查
npm run lint         # ESLint 檢查
npm run type-check   # TypeScript 型別檢查

# 建置
npm run build        # 建置靜態網站（輸出至 dist/）
npm run preview      # 預覽建置結果
```

---

## 核心模組說明

### 電路模擬引擎

```typescript
import { simulateDC } from '@/simulation/mna';
import { buildNetlist } from '@/simulation/netlist';
import { formatSIValue } from '@/simulation/formatter';

// 從畫布狀態建立網表
const netlist = buildNetlist(circuitStore.circuit);

// 執行 DC 模擬
const result = simulateDC(netlist);

if (result.isValid) {
  console.log(result.nodeVoltages); // { '1': 5, '0': 0 }
  console.log(result.branchCurrents); // { 'r1': 0.5 }
} else {
  console.error(result.errorMessage); // '電路短路：零電阻迴路'
}

// 格式化顯示
console.log(formatSIValue(0.005, 'A')); // '5 mA'
```

### Zustand Store 使用

```typescript
import { useCircuitStore } from '@/stores/circuitStore';

function MyComponent() {
  const { circuit, addComponent, undo } = useCircuitStore();

  return (
    <button onClick={() => addComponent({
      id: crypto.randomUUID(),
      type: 'resistor',
      value: 1000,
      unit: 'Ω',
      x: 100, y: 100,
      rotation: 0,
      terminals: [...],
      label: 'R1'
    })}>
      新增電阻
    </button>
  );
}
```

---

## 部署至 GitHub Pages

```bash
# 建置
npm run build

# 部署（需設定 GitHub Pages 從 dist/ 提供服務）
# 或使用 GitHub Actions 自動部署
```

**GitHub Actions 設定**：見 `.github/workflows/deploy.yml`（由 tasks.md 階段建立）

---

## 測試驗證重點

完成實作後，請依規格驗證以下場景：

1. **電路模擬**：放置 10Ω 電阻 + 5V 電源 → 確認顯示 0.5A / 2.5W
2. **響應式**：在 320px 寬度下確認無水平捲動
3. **進度持久化**：完成課程步驟後重新整理頁面 → 確認進度保留
4. **短路保護**：使用 0Ω 電阻 → 確認顯示警告而非 ∞ 值
5. **復原/重做**：執行 25 次操作 → 確認復原歷史最多保留 20 步

---

## 相關文件

- [功能規格](./spec.md)
- [技術研究](./research.md)
- [資料模型](./data-model.md)
- [介面契約：模擬引擎](./contracts/simulation-engine.md)
- [介面契約：狀態管理](./contracts/state-stores.md)
- [介面契約：UI 元件](./contracts/ui-components.md)
