import { useDispatch, useSelector } from 'react-redux'
import { chooseBrand } from '../store/partsSlice'

export default function BrandList() {
  const dispatch = useDispatch()
  const brands = useSelector((state) => state.parts.brands)
  const selectionId = useSelector((state) => state.parts.selectionId)
  const brandsStatus = useSelector((state) => state.parts.brandsStatus)
  const offersStatus = useSelector((state) => state.parts.offersStatus)

  if (brandsStatus !== 'succeeded' || brands.length === 0) {
    return null
  }

  return (
    <section className="mb-4">
      <h2 className="h5 mb-3">2. Производитель</h2>
      <div className="list-group">
        {brands.map((item) => {
          const active = item.id === selectionId
          return (
            <button
              key={item.id}
              type="button"
              className={`list-group-item list-group-item-action ${active ? 'active' : ''}`}
              disabled={offersStatus === 'loading'}
              onClick={() => dispatch(chooseBrand(item))}
            >
              <span className="fw-semibold">{item.brand}</span>
              {item.name && <span className="ms-2">{item.name}</span>}
              {item.number && <span className="ms-2 opacity-75">{item.number}</span>}
            </button>
          )
        })}
      </div>
    </section>
  )
}
