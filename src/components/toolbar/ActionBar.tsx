import React from 'react';
import { useCircuitStore } from '../../stores/circuitStore';
import { useSimulationStore } from '../../stores/simulationStore';

export function ActionBar() {
  const { circuit, clearAll, selectedIds, removeComponent, setSelected, rotateComponent, updateComponentValue } = useCircuitStore();
  const { runSimulation, isRunning, result } = useSimulationStore();

  const selectedComp = circuit.components.find(c => selectedIds.includes(c.id));

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedComp) {
      const v = parseFloat(e.target.value);
      if (!isNaN(v)) updateComponentValue(selectedComp.id, v);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#1e293b', borderRadius: 8, flexWrap: 'wrap' }}>
      <button
        onClick={() => runSimulation(circuit)}
        disabled={isRunning}
        style={{ padding: '6px 14px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
      >
        {isRunning ? '分析中…' : '▶ 執行模擬'}
      </button>

      <div style={{ width: 1, height: 24, background: '#334155' }} />

      {selectedComp && (
        <>
          <button
            onClick={() => rotateComponent(selectedComp.id)}
            style={{ padding: '6px 10px', background: '#334155', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
            title="旋轉"
          >
            ↻ 旋轉
          </button>
          {selectedComp.type !== 'ground' && (
            <input
              type="number"
              value={selectedComp.value}
              onChange={handleValueChange}
              style={{ padding: '5px 8px', width: 80, borderRadius: 6, border: '1px solid #475569', background: '#334155', color: 'white', fontSize: 13 }}
              title="元件數值"
            />
          )}
          <button
            onClick={() => { removeComponent(selectedComp.id); setSelected([]); }}
            style={{ padding: '6px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
          >
            🗑 刪除
          </button>
        </>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <button
          onClick={clearAll}
          style={{ padding: '6px 10px', background: '#475569', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
        >
          清除全部
        </button>
      </div>

      {result && !result.ok && (
        <div style={{ width: '100%', marginTop: 4, padding: '6px 10px', background: '#fef2f2', color: '#dc2626', borderRadius: 6, fontSize: 12 }}>
          ⚠ {result.error.message}
        </div>
      )}
    </div>
  );
}
