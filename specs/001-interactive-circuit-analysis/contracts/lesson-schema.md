# Lesson & Exercise JSON Schema 合約

**Feature**: `001-interactive-circuit-analysis`  
**Module**: `src/data/lessons/*.json`, `src/data/exercises/*.json`  
**Date**: 2026-03-13

---

## 概述

課程與練習內容以靜態 JSON 檔案提供，建置時由 Vite 打包。本文件定義 JSON 結構的合約，確保資料撰寫者（SME）與應用程式之間的一致性。

---

## 課程 JSON Schema（`Lesson`）

```json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "type": "object",
  "required": ["id", "title", "topic", "difficulty", "estimatedMinutes", "description", "steps"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^lesson-[a-z0-9-]+-[0-9]{3}$",
      "description": "唯一識別碼，e.g., lesson-kvl-001"
    },
    "title": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "課程標題（繁體中文）"
    },
    "topic": {
      "type": "string",
      "enum": ["ohms-law", "kvl", "kcl", "series-circuits", "parallel-circuits",
               "thevenin", "norton", "nodal-analysis", "mesh-analysis", "superposition"]
    },
    "difficulty": {
      "type": "string",
      "enum": ["beginner", "intermediate", "advanced"]
    },
    "estimatedMinutes": {
      "type": "integer",
      "minimum": 1,
      "maximum": 120
    },
    "description": {
      "type": "string",
      "minLength": 10,
      "description": "課程摘要說明（繁體中文）"
    },
    "steps": {
      "type": "array",
      "minItems": 1,
      "items": { "$ref": "#/definitions/LessonStep" }
    },
    "prebuiltCircuit": {
      "$ref": "#/definitions/CircuitSnapshot",
      "description": "可選：課程預建電路"
    }
  },
  "definitions": {
    "LessonStep": {
      "type": "object",
      "required": ["id", "stepNumber", "type", "instruction", "hint", "explanation"],
      "properties": {
        "id": { "type": "string", "pattern": "^step-[a-z0-9-]+$" },
        "stepNumber": { "type": "integer", "minimum": 1 },
        "type": {
          "type": "string",
          "enum": ["instruction", "label-node", "write-equation", "enter-value",
                   "connect-wire", "place-component"]
        },
        "instruction": { "type": "string", "minLength": 1 },
        "hint": { "type": "string", "minLength": 1 },
        "explanation": { "type": "string", "minLength": 1 },
        "expectedAnswer": { "type": "number" },
        "tolerance": { "type": "number", "minimum": 0, "maximum": 1, "default": 0.02 },
        "unit": { "$ref": "#/definitions/SIUnit" },
        "expectedText": { "type": "string" }
      }
    },
    "SIUnit": {
      "type": "object",
      "required": ["baseUnit"],
      "properties": {
        "baseUnit": { "type": "string", "enum": ["Ω", "F", "H", "V", "A", "W"] },
        "prefix": {
          "type": "string",
          "enum": ["T", "G", "M", "k", "", "m", "µ", "n", "p"],
          "default": ""
        }
      }
    },
    "CircuitSnapshot": {
      "type": "object",
      "required": ["id", "name", "components", "wires"],
      "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "components": { "type": "array" },
        "wires": { "type": "array" }
      }
    }
  }
}
```

---

## 課程 JSON 範例

```json
{
  "id": "lesson-kvl-001",
  "title": "克希荷夫電壓定律（KVL）基礎",
  "topic": "kvl",
  "difficulty": "beginner",
  "estimatedMinutes": 15,
  "description": "學習如何應用克希荷夫電壓定律分析簡單迴路電路，建立系統化的電路方程式。",
  "steps": [
    {
      "id": "step-kvl-001-01",
      "stepNumber": 1,
      "type": "instruction",
      "instruction": "KVL 說明：在任意閉合迴路中，所有電壓升（電源）的總和等於所有電壓降（負載）的總和。",
      "hint": "請仔細閱讀說明後繼續。",
      "explanation": "KVL 是分析電路迴路的基礎定律，由克希荷夫於 1845 年提出。"
    },
    {
      "id": "step-kvl-001-02",
      "stepNumber": 2,
      "type": "enter-value",
      "instruction": "電路中有一個 10 V 電源和兩個電阻 R1 = 3 Ω、R2 = 7 Ω 串聯。請計算流過電路的電流（A）。",
      "hint": "根據 KVL，電源電壓 = R1 × I + R2 × I，求 I。",
      "explanation": "由 KVL：10 = (3 + 7) × I → I = 1 A。",
      "expectedAnswer": 1,
      "tolerance": 0.02,
      "unit": { "baseUnit": "A", "prefix": "" }
    }
  ]
}
```

---

## 練習 JSON Schema（`Exercise`）

```json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "type": "object",
  "required": ["id", "title", "topic", "difficulty", "question", "circuit",
               "correctAnswer", "tolerance", "unit", "maxAttempts", "solutionWalkthrough"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^ex-[a-z0-9-]+-[0-9]{3}$",
      "description": "唯一識別碼，e.g., ex-series-resistance-001"
    },
    "title": { "type": "string", "minLength": 1 },
    "topic": { "$ref": "#/definitions/LessonTopic" },
    "difficulty": { "type": "string", "enum": ["beginner", "intermediate", "advanced"] },
    "question": { "type": "string", "minLength": 1 },
    "circuit": { "$ref": "#/definitions/CircuitSnapshot" },
    "correctAnswer": { "type": "number" },
    "tolerance": { "type": "number", "minimum": 0, "maximum": 1, "default": 0.02 },
    "unit": { "$ref": "#/definitions/SIUnit" },
    "maxAttempts": { "type": "integer", "minimum": 1, "default": 3 },
    "solutionWalkthrough": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["stepNumber", "explanation"],
        "properties": {
          "stepNumber": { "type": "integer", "minimum": 1 },
          "explanation": { "type": "string" },
          "formula": { "type": "string" },
          "result": { "type": "number" }
        }
      }
    }
  }
}
```

---

## 資料目錄結構

```text
src/data/
├── lessons/
│   ├── lesson-ohms-law-001.json
│   ├── lesson-kvl-001.json
│   ├── lesson-kcl-001.json
│   ├── lesson-series-circuits-001.json
│   ├── lesson-parallel-circuits-001.json
│   ├── lesson-thevenin-001.json
│   ├── lesson-norton-001.json
│   ├── lesson-nodal-analysis-001.json
│   ├── lesson-mesh-analysis-001.json
│   └── lesson-superposition-001.json
└── exercises/
    ├── ex-series-resistance-001.json
    ├── ex-parallel-resistance-001.json
    ├── ex-kvl-001.json
    └── ...（初版 ≥ 5 道練習題）
```
