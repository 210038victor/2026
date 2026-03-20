import React from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { useCircuitStore } from '../../stores/circuitStore';
import { formatSI } from '../../utils/siFormat';

export function SimulationPanel() {
  const { result } = useSimulationStore();
  const { circuit } = useCircuitStore();

  if (!result) {
    return (
      <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', color: '#94a3b8', fontSize: 13 }}>
        <p style={{ margin: 0 }}>執行模擬後，此處將顯示電路分析結果。</p>
      </div>
    );
  }

  if (!result.ok) {
    return (
      <div style={{ padding: 16, background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
        <h4 style={{ margin: '0 0 8px', color: '#dc2626', fontSize: 14 }}>模擬失敗</h4>
        <p style={{ margin: 0, color: '#ef4444', fontSize: 13 }}>{result.error.message}</p>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 11 }}>錯誤代碼：{result.error.code}</p>
      </div>
    );
  }

  const compMap = new Map(circuit.components.map(c => [c.id, c]));

  return (
    <div style={{ padding: 12, background: '#f0fdf4', borderRadius: 8, border: '1px solid #86efac' }}>
      <h4 style={{ margin: '0 0 10px', color: '#15803d', fontSize: 14, fontWeight: 600 }}>✓ 模擬結果</h4>

      {/* Node voltages */}
      <div style={{ marginBottom: 10 }}>
        <h5 style={{ margin: '0 0 4px', fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>節點電壓</h5>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {result.nodeVoltages.map(nv => (
            <span key={nv.nodeId} style={{ padding: '2px 8px', background: 'white', border: '1px solid #86efac', borderRadius: 4, fontSize: 12 }}>
              N{nv.nodeId}: {formatSI(nv.voltage, 'V')}
            </span>
          ))}
        </div>
      </div>

      {/* Branch currents */}
      {result.branchCurrents.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <h5 style={{ margin: '0 0 4px', fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>支路電流</h5>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {result.branchCurrents.map(bc => {
              const comp = compMap.get(bc.componentId);
              return (
                <span key={bc.componentId} style={{ padding: '2px 8px', background: 'white', border: '1px solid #86efac', borderRadius: 4, fontSize: 12 }}>
                  {comp?.label ?? bc.componentId}: {formatSI(bc.current, 'A')}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Power */}
      {result.componentPower.length > 0 && (
        <div>
          <h5 style={{ margin: '0 0 4px', fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>功率</h5>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {result.componentPower.map(cp => {
              const comp = compMap.get(cp.componentId);
              return (
                <span key={cp.componentId} style={{ padding: '2px 8px', background: 'white', border: '1px solid #86efac', borderRadius: 4, fontSize: 12 }}>
                  {comp?.label ?? cp.componentId}: {formatSI(cp.power, 'W')}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
