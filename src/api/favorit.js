const API_URL = 'http://api.favorit-parts.ru/hs/hsprice/'

export async function searchParts({ apiKey, number, brand, analogues, signal }) {
  const params = new URLSearchParams()
  params.set('key', apiKey.trim())
  params.set('number', number.trim())
  if (brand) {
    params.set('brand', brand)
  }
  if (analogues) {
    params.set('analogues', 'on')
  }

  let response
  try {
    response = await fetch(`${API_URL}?${params.toString()}`, { signal })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }
    throw new Error('Нет соединения с сервисом проценки')
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error('Сервис вернул некорректный ответ')
  }

  if (data && data.error) {
    const message = Array.isArray(data.error) ? data.error.join('. ') : String(data.error)
    throw new Error(message)
  }

  const goods = Array.isArray(data?.goods) ? data.goods : []
  return goods.filter((item) => item && (item.brand || item.number || item.name))
}

export function collectBrands(goods) {
  const seen = new Set()
  const brands = []

  goods.forEach((item) => {
    const brand = String(item.brand || '').trim()
    if (!brand) {
      return
    }

    const id = String(item.goodsID || `${brand}|${item.number || ''}|${item.name || ''}`)
    if (seen.has(id)) {
      return
    }
    seen.add(id)
    brands.push({
      id,
      brand,
      name: item.name || '',
      number: item.number || '',
    })
  })

  return brands
}

function rowId(row, used) {
  const base = [row.brand, row.number, row.name, row.warehouse, row.price, row.stock].join('|')
  const count = used.get(base) || 0
  used.set(base, count + 1)
  return count === 0 ? base : `${base}|${count}`
}

export function flattenOffers(goods) {
  const rows = []
  const seenGoods = new Set()
  const usedIds = new Map()

  function addRow(row) {
    rows.push({ ...row, id: rowId(row, usedIds) })
  }

  function visit(item) {
    if (!item || typeof item !== 'object') {
      return
    }

    const goodsId = String(item.goodsID || `${item.brand}|${item.number}|${item.name}`)
    if (seenGoods.has(goodsId)) {
      return
    }
    seenGoods.add(goodsId)

    const warehouses = Array.isArray(item.warehouses) ? item.warehouses : []
    if (warehouses.length === 0) {
      if (item.brand || item.number || item.name) {
        addRow({
          name: item.name || '—',
          brand: item.brand || '—',
          number: item.number || '—',
          price: null,
          stock: item.count ?? 0,
          warehouse: '—',
        })
      }
    } else {
      warehouses.forEach((warehouse) => {
        addRow({
          name: item.name || '—',
          brand: item.brand || '—',
          number: item.number || '—',
          price: warehouse.price,
          stock: warehouse.stock ?? 0,
          warehouse: warehouse.code || warehouse.id || '—',
        })
      })
    }

    const analogues = Array.isArray(item.analogues) ? item.analogues : []
    analogues.forEach(visit)
  }

  goods.forEach(visit)
  return rows
}
