import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { collectBrands, flattenOffers, searchParts } from '../api/favorit.js'

export const fetchBrands = createAsyncThunk(
  'parts/fetchBrands',
  async ({ apiKey, number }, { signal, rejectWithValue }) => {
    try {
      const goods = await searchParts({ apiKey, number, signal })
      return {
        apiKey: apiKey.trim(),
        number: number.trim(),
        brands: collectBrands(goods),
      }
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw error
      }
      return rejectWithValue(error.message)
    }
  },
)

export const fetchOffers = createAsyncThunk(
  'parts/fetchOffers',
  async ({ brand, selectionId }, { getState, signal, rejectWithValue }) => {
    const { apiKey, number } = getState().parts
    try {
      const goods = await searchParts({
        apiKey,
        number,
        brand,
        analogues: true,
        signal,
      })
      return {
        brand,
        selectionId,
        rows: flattenOffers(goods),
      }
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw error
      }
      return rejectWithValue(error.message)
    }
  },
)

const requests = {
  brands: null,
  offers: null,
}

export function submitSearch(args) {
  return (dispatch) => {
    requests.brands?.abort()
    requests.offers?.abort()
    requests.brands = dispatch(fetchBrands(args))
  }
}

export function chooseBrand(item) {
  return (dispatch) => {
    requests.offers?.abort()
    requests.offers = dispatch(fetchOffers({ brand: item.brand, selectionId: item.id }))
  }
}

const partsSlice = createSlice({
  name: 'parts',
  initialState: {
    apiKey: '',
    number: '',
    brandsRequestId: '',
    brandsStatus: 'idle',
    brandsError: '',
    brands: [],
    selectionId: '',
    selectedBrand: '',
    offersRequestId: '',
    offersStatus: 'idle',
    offersError: '',
    offers: [],
  },
  reducers: {
    clearFeedback(state) {
      state.brandsError = ''
      state.offersError = ''
      if (state.brandsStatus === 'failed') {
        state.brandsStatus = 'idle'
      }
      if (state.offersStatus === 'failed') {
        state.offersStatus = 'idle'
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state, action) => {
        state.brandsRequestId = action.meta.requestId
        state.brandsStatus = 'loading'
        state.brandsError = ''
        state.brands = []
        state.selectionId = ''
        state.selectedBrand = ''
        state.offersRequestId = ''
        state.offersStatus = 'idle'
        state.offersError = ''
        state.offers = []
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        if (state.brandsRequestId !== action.meta.requestId) {
          return
        }
        state.brandsStatus = 'succeeded'
        state.apiKey = action.payload.apiKey
        state.number = action.payload.number
        state.brands = action.payload.brands
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        if (state.brandsRequestId !== action.meta.requestId || action.meta.aborted) {
          return
        }
        state.brandsStatus = 'failed'
        state.brandsError = action.payload || 'Не удалось получить производителей'
      })
      .addCase(fetchOffers.pending, (state, action) => {
        state.offersRequestId = action.meta.requestId
        state.selectionId = action.meta.arg.selectionId
        state.selectedBrand = action.meta.arg.brand
        state.offersStatus = 'loading'
        state.offersError = ''
        state.offers = []
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        if (state.offersRequestId !== action.meta.requestId) {
          return
        }
        state.offersStatus = 'succeeded'
        state.selectionId = action.payload.selectionId
        state.selectedBrand = action.payload.brand
        state.offers = action.payload.rows
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        if (state.offersRequestId !== action.meta.requestId || action.meta.aborted) {
          return
        }
        state.offersStatus = 'failed'
        state.offersError = action.payload || 'Не удалось получить аналоги'
      })
  },
})

export const { clearFeedback } = partsSlice.actions
export default partsSlice.reducer
