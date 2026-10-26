import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const PAGE_SIZE = 50

const priceFormat = new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatPrice(price) {
  if (price === null || price === undefined || price === '') {
    return '—'
  }
  return priceFormat.format(price)
}

export default function OffersTable() {
  const offers = useSelector((state) => state.parts.offers)
  const offersStatus = useSelector((state) => state.parts.offersStatus)
  const selectedBrand = useSelector((state) => state.parts.selectedBrand)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [offers])

  if (offersStatus !== 'succeeded') {
    return null
  }

  const pageCount = Math.max(1, Math.ceil(offers.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * PAGE_SIZE
  const visible = offers.slice(start, start + PAGE_SIZE)

  return (
    <section>
      <div className="d-flex flex-wrap justify-content-between align-items-baseline gap-2 mb-3">
        <h2 className="h5 mb-0">Аналоги и предложения: {selectedBrand}</h2>
        {offers.length > 0 && (
          <p className="text-secondary mb-0">
            {start + 1}–{start + visible.length} из {offers.length}
          </p>
        )}
      </div>
      {offers.length === 0 ? (
        <div className="alert alert-warning mb-0">По этому производителю ничего не найдено</div>
      ) : (
        <>
          <div className="table-responsive card shadow-sm">
            <table className="table table-striped table-hover mb-0">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Производитель</th>
                  <th>Артикул</th>
                  <th>Склад</th>
                  <th className="text-end">Цена</th>
                  <th className="text-end">Остаток</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{row.brand}</td>
                    <td>{row.number}</td>
                    <td>{row.warehouse}</td>
                    <td className="text-end">{formatPrice(row.price)}</td>
                    <td className="text-end">{row.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pageCount > 1 && (
            <nav className="mt-3" aria-label="Страницы предложений">
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => setPage(currentPage - 1)}
                  >
                    Назад
                  </button>
                </li>
                <li className="page-item disabled">
                  <span className="page-link">
                    {currentPage} / {pageCount}
                  </span>
                </li>
                <li className={`page-item ${currentPage === pageCount ? 'disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => setPage(currentPage + 1)}
                  >
                    Дальше
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </section>
  )
}
