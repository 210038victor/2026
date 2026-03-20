import type { Circuit } from '../types/circuit'

/**
 * Union-Find (Disjoint Set Union) for circuit connectivity analysis.
 */
export class UnionFind {
  private parent: Map<string, string> = new Map()
  private rank: Map<string, number> = new Map()

  add(id: string): void {
    if (!this.parent.has(id)) {
      this.parent.set(id, id)
      this.rank.set(id, 0)
    }
  }

  find(id: string): string {
    if (!this.parent.has(id)) return id
    if (this.parent.get(id) !== id) {
      this.parent.set(id, this.find(this.parent.get(id)!))
    }
    return this.parent.get(id)!
  }

  union(a: string, b: string): void {
    const ra = this.find(a)
    const rb = this.find(b)
    if (ra === rb) return
    const rankA = this.rank.get(ra) ?? 0
    const rankB = this.rank.get(rb) ?? 0
    if (rankA < rankB) {
      this.parent.set(ra, rb)
    } else if (rankA > rankB) {
      this.parent.set(rb, ra)
    } else {
      this.parent.set(rb, ra)
      this.rank.set(ra, rankA + 1)
    }
  }

  connected(a: string, b: string): boolean {
    return this.find(a) === this.find(b)
  }
}

/**
 * Build a map from terminalId -> nodeId (union-find root)
 * by unioning terminals connected by wires.
 */
export function buildNodeMap(circuit: Circuit): Map<string, string> {
  const uf = new UnionFind()

  for (const component of circuit.components) {
    for (const terminal of component.terminals) {
      uf.add(terminal.id)
    }
  }

  for (const wire of circuit.wires) {
    uf.union(wire.fromTerminalId, wire.toTerminalId)
  }

  const nodeMap = new Map<string, string>()
  for (const component of circuit.components) {
    for (const terminal of component.terminals) {
      nodeMap.set(terminal.id, uf.find(terminal.id))
    }
  }

  return nodeMap
}

/**
 * Get unique node IDs (electrical nodes) in the circuit.
 */
export function getNodes(circuit: Circuit): string[] {
  const nodeMap = buildNodeMap(circuit)
  return [...new Set(nodeMap.values())]
}

/**
 * Check if the circuit is connected (all components reachable from any node).
 */
export function isConnected(circuit: Circuit): boolean {
  if (circuit.components.length === 0) return true
  const nodes = getNodes(circuit)
  if (nodes.length <= 1) return true

  const uf = new UnionFind()
  for (const component of circuit.components) {
    uf.add(component.id)
  }

  const terminalToComponent = new Map<string, string>()
  for (const component of circuit.components) {
    for (const terminal of component.terminals) {
      terminalToComponent.set(terminal.id, component.id)
    }
  }

  for (const wire of circuit.wires) {
    const fromComp = terminalToComponent.get(wire.fromTerminalId)
    const toComp = terminalToComponent.get(wire.toTerminalId)
    if (fromComp && toComp) {
      uf.union(fromComp, toComp)
    }
  }

  const roots = new Set(circuit.components.map((c) => uf.find(c.id)))
  return roots.size === 1
}

/**
 * Find floating nodes (nodes with only one connection - not grounded or in a loop).
 */
export function findFloatingNodes(circuit: Circuit): string[] {
  const nodeMap = buildNodeMap(circuit)
  const nodeTerminals = new Map<string, string[]>()

  for (const [termId, nodeId] of nodeMap.entries()) {
    const list = nodeTerminals.get(nodeId) ?? []
    list.push(termId)
    nodeTerminals.set(nodeId, list)
  }

  const floatingNodes: string[] = []
  for (const [nodeId, terminals] of nodeTerminals.entries()) {
    if (terminals.length < 2) {
      floatingNodes.push(nodeId)
    }
  }

  return floatingNodes
}
