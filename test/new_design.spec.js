/* eslint-env jest */
import { Subject } from 'rxjs'
import * as R from 'ramda'

const handler = {
  set: (target, property, value, receiver) => {
    // const oldVal = target[property]
    if (typeof value === 'object' && !value.__isInstanceOfSubX) {
      target[property] = new SubX(value, handler)
    } else {
      target[property] = value
    }
    if ('$' in target) {
      target.$.next({
        // target,
        prop: property,
        val: value
        // oldVal
      })
    }
    return true
  },
  get: (target, property, receiver) => {
    if (property === '__isInstanceOfSubX') {
      return true
    }
    if (property === 'toJSON') {
      return () => R.dissoc('$', target)
    }
    if (property === '$' && !('$' in target)) {
      target.$ = new Subject()
    }
    return target[property]
  }
}

class SubX extends Proxy {
  constructor (target) {
    R.pipe(
      R.toPairs,
      R.filter(([, val]) => typeof val === 'object' && !val.__isInstanceOfSubX),
      R.forEach(([property, val]) => { target[property] = new SubX(val) })
    )(target)
    super(target, handler)
  }
}

describe('new design', () => {
  test('prototype', () => {
    const p = new SubX({ hello: 'world' })

    p.$.subscribe(mutation => {
      console.log('1:', mutation)
    })
    p.firstName = 'Si'
    p.lastName = 'Li'

    p.$.subscribe(mutation => {
      console.log('2:', mutation)
    })
    p.firstName = 'Wu'
    p.lastName = 'Wang'

    console.log(JSON.stringify(p, null, 2))
  })

  test('array', () => {
    const a = new SubX([])
    a.$.subscribe(mutation => {
      console.log(mutation)
    })
    a.push(1)
    a.push(2)
    a[1] = 3
    a.unshift()
  })

  test('nested', () => {
    const n = new SubX({ a: { } })
    n.$.subscribe(mutation => {
      console.log(mutation)
    })
    n.a.$.subscribe(mutation => {
      console.log(mutation)
    })
    n.a.b = 'hello'
  })
})