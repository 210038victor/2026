import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Stage, Layer, Line, Circle, Rect, Group, Text, Arc } from 'react-konva';
import { useCircuitStore } from '../../stores/circuitStore';
import { useSimulationStore } from '../../stores/simulationStore';
import { formatSI } from '../../utils/siFormat';
import type { Component, Wire, Terminal } from '../../types/circuit';
import Konva from 'konva';

const GRID_SIZE = 40;
const CANVAS_W = 1200;
const CANVAS_H = 800;

function GridLayer() {
  const lines: React.ReactElement[] = [];
  for (let x = 0; x <= CANVAS_W; x += GRID_SIZE) {
    lines.push(<Line key={`v${x}`} points={[x, 0, x, CANVAS_H]} stroke="#e0e0e0" strokeWidth={0.5} />);
  }
  for (let y = 0; y <= CANVAS_H; y += GRID_SIZE) {
    lines.push(<Line key={`h${y}`} points={[0, y, CANVAS_W, y]} stroke="#e0e0e0" strokeWidth={0.5} />);
  }
  return <>{lines}</>;
}

interface ComponentShapeProps {
  component: Component;
  isSelected: boolean;
  onClick: () => void;
  onDragEnd: (x: number, y: number) => void;
  onTerminalClick: (terminal: Terminal) => void;
  nodeVoltages?: Record<string, number>;
}

function ComponentShape({ component, isSelected, onClick, onDragEnd, onTerminalClick }: ComponentShapeProps) {
  const { x, y, rotation, type, label, value } = component;

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onDragEnd(e.target.x(), e.target.y());
  };

  const color = isSelected ? '#2563eb' : '#1a1a1a';

  const renderShape = () => {
    switch (type) {
      case 'resistor':
        return (
          <>
            <Line points={[-40, 0, -20, 0]} stroke={color} strokeWidth={2} />
            <Rect x={-20} y={-10} width={40} height={20} stroke={color} strokeWidth={2} fill="white" />
            <Line points={[20, 0, 40, 0]} stroke={color} strokeWidth={2} />
          </>
        );
      case 'capacitor':
        return (
          <>
            <Line points={[-40, 0, -8, 0]} stroke={color} strokeWidth={2} />
            <Line points={[-8, -15, -8, 15]} stroke={color} strokeWidth={3} />
            <Line points={[8, -15, 8, 15]} stroke={color} strokeWidth={3} />
            <Line points={[8, 0, 40, 0]} stroke={color} strokeWidth={2} />
          </>
        );
      case 'inductor':
        return (
          <>
            <Line points={[-40, 0, -30, 0]} stroke={color} strokeWidth={2} />
            <Arc x={-20} y={0} innerRadius={0} outerRadius={10} angle={180} rotation={-180} stroke={color} strokeWidth={2} fill="white" />
            <Arc x={0} y={0} innerRadius={0} outerRadius={10} angle={180} rotation={-180} stroke={color} strokeWidth={2} fill="white" />
            <Arc x={20} y={0} innerRadius={0} outerRadius={10} angle={180} rotation={-180} stroke={color} strokeWidth={2} fill="white" />
            <Line points={[30, 0, 40, 0]} stroke={color} strokeWidth={2} />
          </>
        );
      case 'voltage-source':
        return (
          <>
            <Line points={[0, -40, 0, -18]} stroke={color} strokeWidth={2} />
            <Circle x={0} y={0} radius={18} stroke={color} strokeWidth={2} fill="white" />
            <Text x={-6} y={-14} text="+" fontSize={14} fill={color} />
            <Text x={-4} y={2} text="–" fontSize={14} fill={color} />
            <Line points={[0, 18, 0, 40]} stroke={color} strokeWidth={2} />
          </>
        );
      case 'current-source':
        return (
          <>
            <Line points={[0, -40, 0, -18]} stroke={color} strokeWidth={2} />
            <Circle x={0} y={0} radius={18} stroke={color} strokeWidth={2} fill="white" />
            <Line points={[0, -10, 0, 10]} stroke={color} strokeWidth={2} />
            <Line points={[0, -10, -6, -2]} stroke={color} strokeWidth={2} />
            <Line points={[0, -10, 6, -2]} stroke={color} strokeWidth={2} />
            <Line points={[0, 18, 0, 40]} stroke={color} strokeWidth={2} />
          </>
        );
      case 'ground':
        return (
          <>
            <Line points={[0, 0, 0, 10]} stroke={color} strokeWidth={2} />
            <Line points={[-20, 10, 20, 10]} stroke={color} strokeWidth={2} />
            <Line points={[-12, 16, 12, 16]} stroke={color} strokeWidth={2} />
            <Line points={[-6, 22, 6, 22]} stroke={color} strokeWidth={2} />
          </>
        );
      default:
        return <Rect x={-20} y={-10} width={40} height={20} stroke={color} strokeWidth={2} fill="white" />;
    }
  };

  const formatValue = () => {
    if (type === 'ground') return '';
    if (type === 'resistor') return formatSI(value, 'Ω');
    if (type === 'capacitor') return formatSI(value, 'F');
    if (type === 'inductor') return formatSI(value, 'H');
    if (type === 'voltage-source') return formatSI(value, 'V');
    if (type === 'current-source') return formatSI(value, 'A');
    return `${value}`;
  };

  return (
    <Group
      x={x}
      y={y}
      rotation={rotation}
      draggable
      onClick={onClick}
      onTap={onClick}
      onDragEnd={handleDragEnd}
    >
      {isSelected && (
        <Rect x={-50} y={-30} width={100} height={60} fill="rgba(37,99,235,0.1)" cornerRadius={4} />
      )}
      {renderShape()}
      <Text
        text={label}
        fontSize={11}
        fill="#666"
        x={-20}
        y={-35}
        width={40}
        align="center"
      />
      <Text
        text={formatValue()}
        fontSize={10}
        fill="#888"
        x={-25}
        y={25}
        width={50}
        align="center"
      />
      {/* Terminals */}
      {component.terminals.map(t => {
        // Terminal position relative to component center, accounting for rotation
        const rad = -(rotation * Math.PI) / 180;
        const dx = t.x - x;
        const dy = t.y - y;
        const lx = dx * Math.cos(rad) - dy * Math.sin(rad);
        const ly = dx * Math.sin(rad) + dy * Math.cos(rad);
        return (
          <Circle
            key={t.id}
            x={lx}
            y={ly}
            radius={5}
            fill="white"
            stroke="#2563eb"
            strokeWidth={1.5}
            onClick={(e) => { e.cancelBubble = true; onTerminalClick(t); }}
            onTap={(e) => { e.cancelBubble = true; onTerminalClick(t); }}
          />
        );
      })}
    </Group>
  );
}

interface WireShapeProps {
  wire: Wire;
  components: Component[];
  onClick: () => void;
}

function WireShape({ wire, components, onClick }: WireShapeProps) {
  const fromComp = components.find(c => c.id === wire.from.componentId);
  const toComp = components.find(c => c.id === wire.to.componentId);
  if (!fromComp || !toComp) return null;

  const fromT = fromComp.terminals.find(t => t.id === wire.from.terminalId);
  const toT = toComp.terminals.find(t => t.id === wire.to.terminalId);
  if (!fromT || !toT) return null;

  return (
    <Line
      points={[fromT.x, fromT.y, toT.x, toT.y]}
      stroke="#1a1a1a"
      strokeWidth={2}
      onClick={onClick}
      onTap={onClick}
      hitStrokeWidth={8}
    />
  );
}

export function CircuitCanvas() {
  const { circuit, selectedIds, addComponent, moveComponent, removeComponent, removeWire, setSelected, addWire } = useCircuitStore();
  const { result } = useSimulationStore();
  const [wireStart, setWireStart] = useState<Terminal | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const stageRef = useRef<Konva.Stage>(null);

  const nodeVoltageMap: Record<string, number> = {};
  if (result?.ok) {
    result.nodeVoltages.forEach(nv => { nodeVoltageMap[nv.nodeId] = nv.voltage; });
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        selectedIds.forEach(id => removeComponent(id));
        setSelected([]);
      }
      if (e.key === 'Escape') {
        setWireStart(null);
        setSelected([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, removeComponent, setSelected]);

  const handleTerminalClick = useCallback((terminal: Terminal) => {
    if (!wireStart) {
      setWireStart(terminal);
    } else {
      if (wireStart.id !== terminal.id) {
        addWire({
          from: { componentId: wireStart.componentId, terminalId: wireStart.id },
          to: { componentId: terminal.componentId, terminalId: terminal.id },
          points: [],
        });
      }
      setWireStart(null);
    }
  }, [wireStart, addWire]);

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (pos) setMousePos(pos);
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelected([]);
      setWireStart(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('componentType') as Parameters<typeof addComponent>[0];
    if (!type) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addComponent(type, x, y);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      style={{ border: '1px solid #ccc', borderRadius: 8, overflow: 'hidden', background: '#fafafa', cursor: wireStart ? 'crosshair' : 'default', position: 'relative' }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {wireStart && (
        <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', background: '#2563eb', color: 'white', padding: '4px 12px', borderRadius: 4, fontSize: 12, zIndex: 10 }}>
          點擊另一個端子以連接導線。按 Esc 取消。
        </div>
      )}
      <Stage
        ref={stageRef}
        width={CANVAS_W}
        height={CANVAS_H}
        onMouseMove={handleStageMouseMove}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer>
          <GridLayer />
          {/* Wires */}
          {circuit.wires.map(wire => (
            <WireShape
              key={wire.id}
              wire={wire}
              components={circuit.components}
              onClick={() => removeWire(wire.id)}
            />
          ))}
          {/* In-progress wire */}
          {wireStart && (
            <Line
              points={[wireStart.x, wireStart.y, mousePos.x, mousePos.y]}
              stroke="#2563eb"
              strokeWidth={2}
              dash={[6, 3]}
            />
          )}
          {/* Components */}
          {circuit.components.map(comp => (
            <ComponentShape
              key={comp.id}
              component={comp}
              isSelected={selectedIds.includes(comp.id)}
              onClick={() => setSelected([comp.id])}
              onDragEnd={(x, y) => moveComponent(comp.id, x, y)}
              onTerminalClick={handleTerminalClick}
              nodeVoltages={nodeVoltageMap}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
