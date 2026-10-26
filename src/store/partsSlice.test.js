import assert from 'node:assert/strict'
import test from 'node:test'
import { configureStore } from '@reduxjs/toolkit'
import partsReducer, { clearFeedback, submitSearch } from './partsSlice.js'

function jsonResponse(body) {
  return { json: async () => body }
}

test('a slower search does not replace a newer result', async () => {
  let releaseSlow
  const slowGate = new Promise((resolve) => {
    releaseSlow = resolve
  })
  let calls = 0

  global.fetch = (url) => {
    calls += 1
    const number = new URL(url).searchParams.get('number')
    const body = {
      goods: [{ goodsID: number, brand: number, number, name: number }],
    }
    if (calls === 1) {
      return slowGate.then(() => jsonResponse(body))
    }
    return Promise.resolve(jsonResponse(body))
  }

  const store = configureStore({ reducer: { parts: partsReducer } })
  store.dispatch(submitSearch({ apiKey: 'key', number: 'SLOW' }))
  store.dispatch(submitSearch({ apiKey: 'key', number: 'FAST' }))
  await new Promise((resolve) => setTimeout(resolve, 0))

  assert.equal(store.getState().parts.number, 'FAST')
  assert.equal(store.getState().parts.brands[0].brand, 'FAST')

  releaseSlow()
  await new Promise((resolve) => setTimeout(resolve, 0))

  assert.equal(store.getState().parts.number, 'FAST')
  assert.equal(store.getState().parts.brands[0].brand, 'FAST')
  assert.equal(store.getState().parts.brandsStatus, 'succeeded')
})

test('clearFeedback removes an API error left on screen', async () => {
  global.fetch = async () => jsonResponse({ error: 'Invalid access key' })
  const store = configureStore({ reducer: { parts: partsReducer } })

  store.dispatch(submitSearch({ apiKey: 'bad', number: '01089' }))
  await new Promise((resolve) => setTimeout(resolve, 0))

  assert.equal(store.getState().parts.brandsError, 'Invalid access key')
  store.dispatch(clearFeedback())
  assert.equal(store.getState().parts.brandsError, '')
  assert.equal(store.getState().parts.brandsStatus, 'idle')
})
