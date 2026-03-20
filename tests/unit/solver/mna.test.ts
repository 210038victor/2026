import { describe, it, expect } from 'vitest';
import { solveCircuit } from '../../../src/solver/mna';
import type { Circuit, Component, Terminal } from '../../../src/types/circuit';

function makeTerminal(id: string, componentId: string, name: string, x: number, y: number): Terminal {
  return { id, componentId, name, x, y };
}

function makeComponent(
  id: string,
  type: Component['type'],
  value: number,
  terminals: Terminal[]
): Component {
  return {
    id,
    type,
    label: id,
    value,
    x: 0,
    y: 0,
    rotation: 0,
    terminals,
  };
}

describe('MNA Solver', () => {
  it('returns EMPTY_CIRCUIT error for empty circuit', () => {
    const circuit: Circuit = { components: [], wires: [] };
    const result = solveCircuit(circuit);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('EMPTY_CIRCUIT');
    }
  });

  it('returns NO_GROUND error when no ground component', () => {
    const t1 = makeTerminal('t1', 'r1', 'a', 0, 0);
    const t2 = makeTerminal('t2', 'r1', 'b', 40, 0);
    const r1 = makeComponent('r1', 'resistor', 10, [t1, t2]);
    const circuit: Circuit = { components: [r1], wires: [] };
    const result = solveCircuit(circuit);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('NO_GROUND');
    }
  });

  it('solves simple resistor circuit: 5V source, 10Ω resistor → 0.5A', () => {
    // Circuit:
    //   V+ --wire-- R(a)    R(b) --wire-- GND(g) --wire-- V-
    // Terminals:
    //   vs.p, vs.n, r.a, r.b, gnd.g
    const vsP = makeTerminal('vs-p', 'vs', 'p', 0, 0);
    const vsN = makeTerminal('vs-n', 'vs', 'n', 0, 80);
    const rA = makeTerminal('r-a', 'r1', 'a', 0, 0);
    const rB = makeTerminal('r-b', 'r1', 'b', 0, 80);
    const gG = makeTerminal('gnd-g', 'gnd', 'g', 0, 80);

    const vs = makeComponent('vs', 'voltage-source', 5, [vsP, vsN]);
    const r1 = makeComponent('r1', 'resistor', 10, [rA, rB]);
    const gnd = makeComponent('gnd', 'ground', 0, [gG]);

    const circuit: Circuit = {
      components: [vs, r1, gnd],
      wires: [
        // V+ to R_a (top node)
        { id: 'w1', from: { componentId: 'vs', terminalId: 'vs-p' }, to: { componentId: 'r1', terminalId: 'r-a' }, points: [] },
        // R_b to GND (bottom node)
        { id: 'w2', from: { componentId: 'r1', terminalId: 'r-b' }, to: { componentId: 'gnd', terminalId: 'gnd-g' }, points: [] },
        // GND to V- (bottom node)
        { id: 'w3', from: { componentId: 'gnd', terminalId: 'gnd-g' }, to: { componentId: 'vs', terminalId: 'vs-n' }, points: [] },
      ],
    };

    const result = solveCircuit(circuit);
    expect(result.ok).toBe(true);
    if (result.ok) {
      // Top node should be 5V
      const topNode = result.nodeVoltages.find(nv => nv.nodeId !== '0');
      expect(topNode).toBeDefined();
      expect(Math.abs(topNode!.voltage - 5)).toBeLessThan(0.01);

      // Current through resistor should be 0.5A
      const rCurrent = result.branchCurrents.find(bc => bc.componentId === 'r1');
      expect(rCurrent).toBeDefined();
      expect(Math.abs(Math.abs(rCurrent!.current) - 0.5)).toBeLessThan(0.01);
    }
  });

  it('detects singular matrix for floating node circuit', () => {
    // A circuit where the matrix is singular
    const vsP = makeTerminal('vs-p', 'vs', 'p', 0, 0);
    const vsN = makeTerminal('vs-n', 'vs', 'n', 0, 80);
    const gG = makeTerminal('gnd-g', 'gnd', 'g', 0, 80);
    // Two voltage sources in parallel without resistance → singular
    const vs2P = makeTerminal('vs2-p', 'vs2', 'p', 0, 0);
    const vs2N = makeTerminal('vs2-n', 'vs2', 'n', 0, 80);

    const vs = makeComponent('vs', 'voltage-source', 5, [vsP, vsN]);
    const vs2 = makeComponent('vs2', 'voltage-source', 3, [vs2P, vs2N]);
    const gnd = makeComponent('gnd', 'ground', 0, [gG]);

    const circuit: Circuit = {
      components: [vs, vs2, gnd],
      wires: [
        { id: 'w1', from: { componentId: 'vs', terminalId: 'vs-p' }, to: { componentId: 'vs2', terminalId: 'vs2-p' }, points: [] },
        { id: 'w2', from: { componentId: 'vs', terminalId: 'vs-n' }, to: { componentId: 'gnd', terminalId: 'gnd-g' }, points: [] },
        { id: 'w3', from: { componentId: 'vs2', terminalId: 'vs2-n' }, to: { componentId: 'gnd', terminalId: 'gnd-g' }, points: [] },
      ],
    };

    const result = solveCircuit(circuit);
    // Two different voltage sources directly in parallel = singular matrix (conflicting voltage constraints)
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('SINGULAR_MATRIX');
    }
  });
});
