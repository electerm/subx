/* eslint-env jest */
import SubX from '../src/index'
import { debounceTime, map, filter } from 'rxjs/operators'
import delay from 'timeout-as-promise'
import * as R from 'ramda'

describe('computed properties', () => {
  test('this + normal function', () => {
    const Person = new SubX({
      firstName: 'San',
      lastName: 'Zhang',
      fullName () {
        return `${this.firstName} ${this.lastName}`
      }
    })
    const person = new Person()
    expect(person.fullName()).toBe('San Zhang')

    person.firstName = 'Si'
    person.lastName = 'Li'
    expect(person.fullName()).toBe('Si Li')

    person.lastName = 'Wang'
    person.firstName = 'Wu'
    expect(person.fullName()).toBe('Wu Wang')
  })

  test('debounce expensive computation', async () => {
    let count = 0
    let fullName
    const Person = new SubX({
      firstName: 'San',
      lastName: 'Zhang',
      fullName () {
        count += 1
        console.log('expensive computation')
        return `${this.firstName} ${this.lastName}`
      }
    })
    const person = new Person()

    person.$.pipe(
      filter(event => R.contains(event.prop, ['firstName', 'lastName'])),
      debounceTime(100),
      map(event => person.fullName())
    ).subscribe(val => {
      fullName = val
    })

    person.firstName = 'Si'
    person.lastName = 'Li'

    person.lastName = 'Wang'
    person.firstName = 'Wu'

    await delay(150)

    expect(count).toBe(1) // no more than 1 time of expensive computation
    expect(fullName).toBe('Wu Wang')
  })

  test('computed property with arguments', () => {
    const Person = new SubX({
      firstName: 'San',
      lastName: 'Zhang',
      fullName () {
        return `${this.firstName} ${this.lastName}`
      },
      greeting (phrase) {
        return `${phrase} ${this.fullName()}`
      }
    })
    const person = new Person()
    expect(person.fullName()).toBe('San Zhang')
    expect(person.greeting('Hi')).toBe('Hi San Zhang')

    person.firstName = 'Si'
    person.lastName = 'Li'
    expect(person.fullName()).toBe('Si Li')
    expect(person.greeting('Hello')).toBe('Hello Si Li')

    person.lastName = 'Wang'
    person.firstName = 'Wu'
    expect(person.fullName()).toBe('Wu Wang')
    expect(person.greeting('Good morning')).toBe('Good morning Wu Wang')
  })
})
