import React from 'react';
import { useCircuitStore } from '../../stores/circuitStore';
import type { ComponentType } from '../../types/circuit';

const COMPONENTS: Array<{ type: ComponentType; label: string; icon: string; description: string }> = [
  { type: 'resistor', label: '電阻', icon: '⊟', description: '阻礙電流流動' },
  { type: 'capacitor', label: '電容', icon: '⊤⊤', description: '儲存電荷' },
  { type: 'inductor', label: '電感', icon: '∿∿', description: '儲存磁能' },
  { type: 'voltage-source', label: '電壓源', icon: '⊕', description: '提供固定電壓' },
  { type: 'current-source', label: '電流源', icon: '⊙', description: '提供固定電流' },
  { type: 'ground', label: '接地', icon: '⏚', description: '參考節點 (0V)' },
];

export function ComponentPalette() {
  const addComponent = useCircuitStore(s => s.addComponent);

  const handleDragStart = (e: React.DragEvent, type: ComponentType) => {
    e.dataTransfer.setData('componentType', type);
  };

  return (
    <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 13, color: '#64748b', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        元件庫
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {COMPONENTS.map(({ type, label, icon, description }) => (
          <button
            key={type}
            draggable
            onDragStart={(e) => handleDragStart(e, type)}
            onClick={() => addComponent(type, 300, 300)}
            title={description}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              background: 'white',
              cursor: 'grab',
              fontSize: 13,
              textAlign: 'left',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#eff6ff'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#93c5fd'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'white'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0'; }}
          >
            <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
      <p style={{ margin: '8px 0 0', fontSize: 11, color: '#94a3b8' }}>
        拖曳到畫布或點擊新增
      </p>
    </div>
  );
}
