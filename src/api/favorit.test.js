import assert from 'node:assert/strict'
import test from 'node:test'
import { collectBrands, flattenOffers } from './favorit.js'

test('collectBrands keeps several positions of one manufacturer', () => {
  const brands = collectBrands([
    { goodsID: '1', brand: 'FEBI', number: '01089', name: 'Левая' },
    { goodsID: '2', brand: 'FEBI', number: '01089', name: 'Правая' },
    { goodsID: '3', brand: 'OSSCA', number: '01089', name: 'Стеклоподъемник' },
  ])

  assert.deepEqual(
    brands.map((item) => item.name),
    ['Левая', 'Правая', 'Стеклоподъемник'],
  )
  assert.equal(new Set(brands.map((item) => item.id)).size, 3)
})

test('collectBrands skips an empty position and a repeated goods id', () => {
  const brands = collectBrands([
    {},
    { goodsID: '1', brand: 'FEBI', number: '01089', name: 'Левая' },
    { goodsID: '1', brand: 'FEBI', number: '01089', name: 'Дубль' },
    { brand: '   ', number: '1', name: 'Без бренда' },
  ])

  assert.deepEqual(brands, [{ id: '1', brand: 'FEBI', name: 'Левая', number: '01089' }])
})

test('flattenOffers uses the warehouse price and keeps zero stock', () => {
  const rows = flattenOffers([
    {
      goodsID: 'part',
      brand: 'MEYLE',
      number: '716',
      name: 'Рычаг',
      price: 1,
      count: 99,
      warehouses: [
        { code: 'MS2', price: 26447.1, stock: 2 },
        { code: 'MS3', price: 22509.72, stock: 0 },
      ],
      analogues: [
        {
          goodsID: 'analog',
          brand: 'ZEN',
          number: '0189',
          name: 'Аналог',
          price: 5,
          warehouses: [{ id: 'S1', price: 90, stock: 0 }],
        },
      ],
    },
  ])

  assert.deepEqual(
    rows.map((row) => [row.brand, row.price, row.stock, row.warehouse]),
    [
      ['MEYLE', 26447.1, 2, 'MS2'],
      ['MEYLE', 22509.72, 0, 'MS3'],
      ['ZEN', 90, 0, 'S1'],
    ],
  )
  assert.equal(new Set(rows.map((row) => row.id)).size, rows.length)
})

test('flattenOffers does not loop when an analogue points at itself', () => {
  const item = {
    goodsID: 'loop',
    brand: 'FEBI',
    number: '1',
    name: 'Деталь',
    count: 0,
    warehouses: [],
    analogues: [],
  }
  item.analogues.push(item)

  const rows = flattenOffers([item])
  assert.equal(rows.length, 1)
  assert.equal(rows[0].stock, 0)
  assert.equal(rows[0].price, null)
})
