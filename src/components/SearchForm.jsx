import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearFeedback, submitSearch } from '../store/partsSlice'

export default function SearchForm() {
  const dispatch = useDispatch()
  const brandsStatus = useSelector((state) => state.parts.brandsStatus)
  const [apiKey, setApiKey] = useState('')
  const [number, setNumber] = useState('')
  const [formError, setFormError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (!apiKey.trim() || !number.trim()) {
      setFormError('Укажите ключ покупателя и артикул')
      dispatch(clearFeedback())
      return
    }
    setFormError('')
    dispatch(submitSearch({ apiKey, number }))
  }

  return (
    <form onSubmit={handleSubmit} className="card shadow-sm mb-4">
      <div className="card-body">
        <h2 className="h5 mb-3">1. Артикул</h2>
        <div className="row g-3">
          <div className="col-md-5">
            <label htmlFor="apiKey" className="form-label">
              Ключ покупателя
            </label>
            <input
              id="apiKey"
              className="form-control"
              value={apiKey}
              autoComplete="off"
              onChange={(event) => setApiKey(event.target.value)}
            />
          </div>
          <div className="col-md-5">
            <label htmlFor="number" className="form-label">
              Артикул
            </label>
            <input
              id="number"
              className="form-control"
              value={number}
              autoComplete="off"
              onChange={(event) => setNumber(event.target.value)}
            />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={brandsStatus === 'loading'}
            >
              Найти
            </button>
          </div>
        </div>
        {formError && <div className="alert alert-warning mt-3 mb-0">{formError}</div>}
      </div>
    </form>
  )
}
