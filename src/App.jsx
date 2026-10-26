import { useSelector } from 'react-redux'
import BrandList from './components/BrandList'
import Loader from './components/Loader'
import OffersTable from './components/OffersTable'
import SearchForm from './components/SearchForm'

export default function App() {
  const brandsStatus = useSelector((state) => state.parts.brandsStatus)
  const brandsError = useSelector((state) => state.parts.brandsError)
  const brands = useSelector((state) => state.parts.brands)
  const offersStatus = useSelector((state) => state.parts.offersStatus)
  const offersError = useSelector((state) => state.parts.offersError)

  return (
    <main className="container py-4">
      <header className="mb-4">
        <h1 className="h3 mb-1">Подбор автозапчастей</h1>
        <p className="text-secondary mb-0">Поиск производителей, аналогов и складских предложений</p>
      </header>

      <SearchForm />

      {brandsStatus === 'loading' && <Loader text="Ищем производителей…" />}
      {brandsStatus === 'failed' && <div className="alert alert-danger">{brandsError}</div>}
      {brandsStatus === 'succeeded' && brands.length === 0 && (
        <div className="alert alert-warning">По этому артикулу производители не найдены</div>
      )}

      <BrandList />

      {offersStatus === 'loading' && <Loader text="Загружаем аналоги и предложения…" />}
      {offersStatus === 'failed' && <div className="alert alert-danger">{offersError}</div>}
      <OffersTable />
    </main>
  )
}
