import { describe, it, expect, beforeEach } from 'vitest'
import { useCircuitStore } from '../../../src/stores/circuitStore'

describe('circuitStore contract', () => {
  beforeEach(() => {
    useCircuitStore.getState().clearAll()
  })

  it('starts with empty circuit', () => {
    const { circuit } = useCircuitStore.getState()
    expect(circuit.components).toHaveLength(0)
    expect(circuit.wires).toHaveLength(0)
  })

  it('addComponent adds a component', () => {
    useCircuitStore.getState().addComponent('resistor', { x: 100, y: 100 })
    expect(useCircuitStore.getState().circuit.components).toHaveLength(1)
  })

  it('addComponent does not exceed 50 components', () => {
    for (let i = 0; i < 55; i++) {
      useCircuitStore.getState().addComponent('resistor', { x: i * 10, y: 0 })
    }
    expect(useCircuitStore.getState().circuit.components).toHaveLength(50)
  })

  it('addComponent updates updatedAt', () => {
    const before = useCircuitStore.getState().circuit.updatedAt
    useCircuitStore.getState().addComponent('resistor', { x: 0, y: 0 })
    const after = useCircuitStore.getState().circuit.updatedAt
    expect(after).toBeGreaterThanOrEqual(before)
  })

  it('removeComponent removes the component and connected wires', () => {
    useCircuitStore.getState().addComponent('resistor', { x: 0, y: 0 })
    const { circuit } = useCircuitStore.getState()
    const comp = circuit.components[0]
    const terminal1 = comp.terminals[0]
    useCircuitStore.getState().addComponent('resistor', { x: 100, y: 0 })
    const comp2 = useCircuitStore.getState().circuit.components[1]
    const terminal2 = comp2.terminals[0]
    useCircuitStore.getState().addWire(terminal1.id, terminal2.id)
    expect(useCircuitStore.getState().circuit.wires).toHaveLength(1)

    useCircuitStore.getState().removeComponent(comp.id)
    expect(useCircuitStore.getState().circuit.components).toHaveLength(1)
    expect(useCircuitStore.getState().circuit.wires).toHaveLength(0)
  })

  it('moveComponent updates position', () => {
    useCircuitStore.getState().addComponent('resistor', { x: 0, y: 0 })
    const comp = useCircuitStore.getState().circuit.components[0]
    useCircuitStore.getState().moveComponent(comp.id, { x: 200, y: 300 })
    const moved = useCircuitStore.getState().circuit.components[0]
    expect(moved.position).toEqual({ x: 200, y: 300 })
  })

  it('rotateComponent rotates 90 degrees', () => {
    useCircuitStore.getState().addComponent('resistor', { x: 0, y: 0 })
    const comp = useCircuitStore.getState().circuit.components[0]
    expect(comp.rotation).toBe(0)
    useCircuitStore.getState().rotateComponent(comp.id)
    expect(useCircuitStore.getState().circuit.components[0].rotation).toBe(90)
  })

  it('rotateComponent cycles 0->90->180->270->0', () => {
    useCircuitStore.getState().addComponent('resistor', { x: 0, y: 0 })
    const id = useCircuitStore.getState().circuit.components[0].id
    useCircuitStore.getState().rotateComponent(id)
    useCircuitStore.getState().rotateComponent(id)
    useCircuitStore.getState().rotateComponent(id)
    useCircuitStore.getState().rotateComponent(id)
    expect(useCircuitStore.getState().circuit.components[0].rotation).toBe(0)
  })

  it('updateComponentValue updates value', () => {
    useCircuitStore.getState().addComponent('resistor', { x: 0, y: 0 })
    const id = useCircuitStore.getState().circuit.components[0].id
    useCircuitStore.getState().updateComponentValue(id, 1000)
    expect(useCircuitStore.getState().circuit.components[0].value).toBe(1000)
  })

  it('updateComponentValue ignores zero or negative', () => {
    useCircuitStore.getState().addComponent('resistor', { x: 0, y: 0 })
    const comp = useCircuitStore.getState().circuit.components[0]
    const originalValue = comp.value
    useCircuitStore.getState().updateComponentValue(comp.id, 0)
    expect(useCircuitStore.getState().circuit.components[0].value).toBe(originalValue)
    useCircuitStore.getState().updateComponentValue(comp.id, -5)
    expect(useCircuitStore.getState().circuit.components[0].value).toBe(originalValue)
  })

  it('addWire adds a wire', () => {
    useCircuitStore.getState().addComponent('resistor', { x: 0, y: 0 })
    useCircuitStore.getState().addComponent('resistor', { x: 100, y: 0 })
    const comps = useCircuitStore.getState().circuit.components
    const t1 = comps[0].terminals[0].id
    const t2 = comps[1].terminals[0].id
    useCircuitStore.getState().addWire(t1, t2)
    expect(useCircuitStore.getState().circuit.wires).toHaveLength(1)
  })

  it('addWire prevents self-connection', () => {
    useCircuitStore.getState().addComponent('resistor', { x: 0, y: 0 })
    const t = useCircuitStore.getState().circuit.components[0].terminals[0].id
    useCircuitStore.getState().addWire(t, t)
    expect(useCircuitStore.getState().circuit.wires).toHaveLength(0)
  })

  it('addWire prevents duplicate connections', () => {
    useCircuitStore.getState().addComponent('resistor', { x: 0, y: 0 })
    useCircuitStore.getState().addComponent('resistor', { x: 100, y: 0 })
    const comps = useCircuitStore.getState().circuit.components
    const t1 = comps[0].terminals[0].id
    const t2 = comps[1].terminals[0].id
    useCircuitStore.getState().addWire(t1, t2)
    useCircuitStore.getState().addWire(t1, t2)
    expect(useCircuitStore.getState().circuit.wires).toHaveLength(1)
  })

  it('removeWire removes a wire', () => {
    useCircuitStore.getState().addComponent('resistor', { x: 0, y: 0 })
    useCircuitStore.getState().addComponent('resistor', { x: 100, y: 0 })
    const comps = useCircuitStore.getState().circuit.components
    const t1 = comps[0].terminals[0].id
    const t2 = comps[1].terminals[0].id
    useCircuitStore.getState().addWire(t1, t2)
    const wireId = useCircuitStore.getState().circuit.wires[0].id
    useCircuitStore.getState().removeWire(wireId)
    expect(useCircuitStore.getState().circuit.wires).toHaveLength(0)
  })

  it('clearAll removes all components and wires', () => {
    useCircuitStore.getState().addComponent('resistor', { x: 0, y: 0 })
    useCircuitStore.getState().clearAll()
    expect(useCircuitStore.getState().circuit.components).toHaveLength(0)
    expect(useCircuitStore.getState().circuit.wires).toHaveLength(0)
  })

  it('setSelected sets selectedIds', () => {
    useCircuitStore.getState().setSelected(['id1', 'id2'])
    expect(useCircuitStore.getState().selectedIds).toEqual(['id1', 'id2'])
  })
})
