/* eslint-env jest */
import SubX from '../src/index'

describe('Symbol', () => {
  test('default', () => {
    const p = SubX.create({}, true)
    p.x = {
      a: [{ f: 0, b: 'sdf' }, { g: 9, gh: ['dfg'] }]
    }
    const events = []
    p.$.subscribe(e => events.push(e))
    p.x = {
      a: [{ f: 0, j: 9, b: 'sdf' }, { g: 9, gh: ['dfg'] }]
    }
    console.log(events)
    expect(p.x.a[0].j).toBe(9)
  })

  test('symbol and string mixed in path', () => {
    // todo
  })
})
