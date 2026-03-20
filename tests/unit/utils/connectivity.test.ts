import { describe, it, expect } from 'vitest'
import { UnionFind, buildNodeMap, getNodes, isConnected } from '../../../src/utils/connectivity'
import type { Circuit } from '../../../src/types/circuit'

describe('UnionFind', () => {
  it('initially each element is its own root', () => {
    const uf = new UnionFind()
    uf.add('a')
    uf.add('b')
    expect(uf.find('a')).toBe('a')
    expect(uf.find('b')).toBe('b')
    expect(uf.connected('a', 'b')).toBe(false)
  })

  it('union connects two elements', () => {
    const uf = new UnionFind()
    uf.add('a')
    uf.add('b')
    uf.union('a', 'b')
    expect(uf.connected('a', 'b')).toBe(true)
  })

  it('union is transitive', () => {
    const uf = new UnionFind()
    uf.add('a')
    uf.add('b')
    uf.add('c')
    uf.union('a', 'b')
    uf.union('b', 'c')
    expect(uf.connected('a', 'c')).toBe(true)
  })
})

function makeCircuit(overrides: Partial<Circuit> = {}): Circuit {
  return {
    id: 'c1',
    name: 'Test',
    components: [],
    wires: [],
    scope: 'workspace',
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  }
}

describe('buildNodeMap', () => {
  it('returns empty map for empty circuit', () => {
    const circuit = makeCircuit()
    expect(buildNodeMap(circuit).size).toBe(0)
  })

  it('each terminal is its own node with no wires', () => {
    const circuit = makeCircuit({
      components: [
        {
          id: 'r1',
          type: 'resistor',
          value: 100,
          unit: 'Ω',
          position: { x: 0, y: 0 },
          rotation: 0,
          terminals: [
            { id: 'r1-p', name: 'positive', offset: { x: -20, y: 0 } },
            { id: 'r1-n', name: 'negative', offset: { x: 20, y: 0 } },
          ],
        },
      ],
    })
    const nodeMap = buildNodeMap(circuit)
    expect(nodeMap.get('r1-p')).toBe('r1-p')
    expect(nodeMap.get('r1-n')).toBe('r1-n')
  })

  it('connected terminals share a node', () => {
    const circuit = makeCircuit({
      components: [
        {
          id: 'r1',
          type: 'resistor',
          value: 100,
          unit: 'Ω',
          position: { x: 0, y: 0 },
          rotation: 0,
          terminals: [
            { id: 'r1-p', name: 'positive', offset: { x: -20, y: 0 } },
            { id: 'r1-n', name: 'negative', offset: { x: 20, y: 0 } },
          ],
        },
        {
          id: 'r2',
          type: 'resistor',
          value: 200,
          unit: 'Ω',
          position: { x: 100, y: 0 },
          rotation: 0,
          terminals: [
            { id: 'r2-p', name: 'positive', offset: { x: -20, y: 0 } },
            { id: 'r2-n', name: 'negative', offset: { x: 20, y: 0 } },
          ],
        },
      ],
      wires: [{ id: 'w1', fromTerminalId: 'r1-n', toTerminalId: 'r2-p' }],
    })
    const nodeMap = buildNodeMap(circuit)
    expect(nodeMap.get('r1-n')).toBe(nodeMap.get('r2-p'))
  })
})

describe('getNodes', () => {
  it('returns empty array for empty circuit', () => {
    expect(getNodes(makeCircuit())).toHaveLength(0)
  })
})

describe('isConnected', () => {
  it('empty circuit is connected', () => {
    expect(isConnected(makeCircuit())).toBe(true)
  })
})
