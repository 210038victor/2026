import type { Circuit, SimulationResult, NodeVoltage, BranchCurrent, ComponentPower } from '../types/circuit';

// Gaussian elimination with partial pivoting
function gaussianElimination(A: number[][], b: number[]): number[] | null {
  const n = A.length;
  // Augmented matrix
  const M: number[][] = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxRow = col;
    let maxVal = Math.abs(M[col][col]);
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > maxVal) {
        maxVal = Math.abs(M[row][col]);
        maxRow = row;
      }
    }
    if (maxVal < 1e-12) return null; // singular
    // Swap rows
    [M[col], M[maxRow]] = [M[maxRow], M[col]];
    // Eliminate
    for (let row = col + 1; row < n; row++) {
      const factor = M[row][col] / M[col][col];
      for (let k = col; k <= n; k++) {
        M[row][k] -= factor * M[col][k];
      }
    }
  }

  // Back substitution
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = M[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= M[i][j] * x[j];
    }
    x[i] /= M[i][i];
  }
  return x;
}

export function solveCircuit(circuit: Circuit): SimulationResult {
  const { components, wires } = circuit;

  if (components.length === 0) {
    return { ok: false, error: { code: 'EMPTY_CIRCUIT', message: '電路為空，請新增元件。' } };
  }

  // Build node map: terminal -> node number
  // Ground terminal gets node 0
  // Build adjacency from wires
  const terminalToNode = new Map<string, number>();

  // Each terminal starts as its own node
  // Union-Find to merge connected terminals via wires
  const parent = new Map<string, string>();

  const find = (id: string): string => {
    if (!parent.has(id)) parent.set(id, id);
    if (parent.get(id) !== id) parent.set(id, find(parent.get(id)!));
    return parent.get(id)!;
  };

  const union = (a: string, b: string) => {
    const ra = find(a), rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  // All terminal IDs
  const allTerminals: string[] = [];
  for (const comp of components) {
    for (const t of comp.terminals) {
      allTerminals.push(t.id);
    }
  }

  // Initialize union-find
  for (const tid of allTerminals) {
    parent.set(tid, tid);
  }

  // Union terminals connected by wires
  for (const wire of wires) {
    union(wire.from.terminalId, wire.to.terminalId);
  }

  // Find ground terminal
  const groundComp = components.find(c => c.type === 'ground');
  let groundRoot: string | null = null;
  if (groundComp && groundComp.terminals.length > 0) {
    groundRoot = find(groundComp.terminals[0].id);
  }

  if (!groundRoot) {
    return { ok: false, error: { code: 'NO_GROUND', message: '電路中未找到接地元件，請新增接地。' } };
  }

  // Assign node numbers: ground = 0
  const rootToNode = new Map<string, number>();
  rootToNode.set(groundRoot, 0);
  let nodeCount = 1;

  const roots = new Set<string>();
  for (const tid of allTerminals) {
    roots.add(find(tid));
  }

  for (const root of roots) {
    if (root !== groundRoot) {
      rootToNode.set(root, nodeCount++);
    }
  }

  // Map terminal to node
  for (const tid of allTerminals) {
    const root = find(tid);
    terminalToNode.set(tid, rootToNode.get(root)!);
  }

  // Get node for a terminal
  const nodeOf = (terminalId: string): number => terminalToNode.get(terminalId) ?? 0;

  // Collect non-ground, non-voltage-source elements for MNA
  // Variables: [v1, v2, ..., v_{n-1}, i_vs1, i_vs2, ...]
  // n = nodeCount (including ground)
  // unknowns: (nodeCount - 1) voltages + num voltage sources currents

  const voltageSources = components.filter(
    c => c.type === 'voltage-source'
  );
  const numNodes = nodeCount; // including ground (node 0)
  const numVS = voltageSources.length;
  const size = (numNodes - 1) + numVS;

  if (size === 0) {
    return {
      ok: true,
      nodeVoltages: [{ nodeId: '0', voltage: 0 }],
      branchCurrents: [],
      componentPower: [],
    };
  }

  // MNA matrix A (size x size) and vector z (size)
  const A: number[][] = Array.from({ length: size }, () => new Array(size).fill(0));
  const z: number[] = new Array(size).fill(0);

  // Helper: add conductance between nodes p and n
  const addConductance = (np: number, nn: number, g: number) => {
    if (np > 0) { A[np - 1][np - 1] += g; }
    if (nn > 0) { A[nn - 1][nn - 1] += g; }
    if (np > 0 && nn > 0) {
      A[np - 1][nn - 1] -= g;
      A[nn - 1][np - 1] -= g;
    }
  };

  // Stamp passive elements
  for (const comp of components) {
    if (comp.type === 'ground') continue;
    if (comp.type === 'voltage-source') continue; // handled below

    const terminals = comp.terminals;
    if (terminals.length < 2) continue;

    const np = nodeOf(terminals[0].id); // positive / a
    const nn = nodeOf(terminals[1].id); // negative / b

    if (comp.type === 'resistor') {
      const g = comp.value > 0 ? 1 / comp.value : 0;
      addConductance(np, nn, g);
    } else if (comp.type === 'capacitor') {
      // DC: open circuit - do nothing
    } else if (comp.type === 'inductor') {
      // DC: short circuit - very small resistance
      addConductance(np, nn, 1e6);
    } else if (comp.type === 'current-source') {
      // Current flows from n to p (conventional: + terminal)
      const I = comp.value;
      if (np > 0) z[np - 1] += I;
      if (nn > 0) z[nn - 1] -= I;
    }
  }

  // Stamp voltage sources
  for (let k = 0; k < voltageSources.length; k++) {
    const vs = voltageSources[k];
    const vsIdx = (numNodes - 1) + k; // index in A for this VS current
    const terminals = vs.terminals;
    if (terminals.length < 2) continue;

    const np = nodeOf(terminals[0].id); // positive
    const nn = nodeOf(terminals[1].id); // negative

    // B matrix (KVL row)
    if (np > 0) { A[vsIdx][np - 1] = 1; A[np - 1][vsIdx] = 1; }
    if (nn > 0) { A[vsIdx][nn - 1] = -1; A[nn - 1][vsIdx] = -1; }
    z[vsIdx] = vs.value;
  }

  // Solve
  const solution = gaussianElimination(A, z);
  if (!solution) {
    return { ok: false, error: { code: 'SINGULAR_MATRIX', message: '矩陣奇異，可能存在短路或懸浮節點。' } };
  }

  // Extract node voltages
  const nodeVoltages: NodeVoltage[] = [{ nodeId: '0', voltage: 0 }];
  for (let i = 1; i < numNodes; i++) {
    nodeVoltages.push({ nodeId: String(i), voltage: solution[i - 1] });
  }

  // Extract branch currents
  const branchCurrents: BranchCurrent[] = [];
  const componentPower: ComponentPower[] = [];

  // VS currents
  for (let k = 0; k < voltageSources.length; k++) {
    const vs = voltageSources[k];
    const current = solution[(numNodes - 1) + k];
    branchCurrents.push({ componentId: vs.id, current });
    componentPower.push({ componentId: vs.id, power: vs.value * current });
  }

  // Resistor currents: I = (V_p - V_n) / R
  for (const comp of components) {
    if (comp.type !== 'resistor') continue;
    const terminals = comp.terminals;
    if (terminals.length < 2) continue;
    const np = nodeOf(terminals[0].id);
    const nn = nodeOf(terminals[1].id);
    const vp = np === 0 ? 0 : solution[np - 1];
    const vn = nn === 0 ? 0 : solution[nn - 1];
    const current = comp.value > 0 ? (vp - vn) / comp.value : 0;
    branchCurrents.push({ componentId: comp.id, current });
    componentPower.push({ componentId: comp.id, power: (vp - vn) * current });
  }

  // Current source power
  for (const comp of components) {
    if (comp.type !== 'current-source') continue;
    const terminals = comp.terminals;
    if (terminals.length < 2) continue;
    const np = nodeOf(terminals[0].id);
    const nn = nodeOf(terminals[1].id);
    const vp = np === 0 ? 0 : solution[np - 1];
    const vn = nn === 0 ? 0 : solution[nn - 1];
    branchCurrents.push({ componentId: comp.id, current: comp.value });
    componentPower.push({ componentId: comp.id, power: -(vp - vn) * comp.value });
  }

  return { ok: true, nodeVoltages, branchCurrents, componentPower };
}
