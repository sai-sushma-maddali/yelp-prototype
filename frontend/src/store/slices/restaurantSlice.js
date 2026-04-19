import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getRestaurants, getRestaurant } from '../../services/api';

export const fetchRestaurants = createAsyncThunk(
  'restaurants/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const res = await getRestaurants(params);
      return res.data;
    } catch (err) {
      return rejectWithValue('Failed to load restaurants');
    }
  }
);

export const fetchRestaurantById = createAsyncThunk(
  'restaurants/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await getRestaurant(id);
      return res.data;
    } catch (err) {
      return rejectWithValue('Restaurant not found');
    }
  }
);

const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState: {
    list:     [],
    total:    0,
    selected: null,
    loading:  false,
    error:    null,
    filters: {
      name:         '',
      cuisine_type: '',
      price_tier:   '',
      city:         '',
      page:         0,
    }
  },
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = {
        name: '', cuisine_type: '', price_tier: '',
        city: '', page: 0
      };
    },
    clearSelected(state) {
      state.selected = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurants.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.list    = action.payload.restaurants;
        state.total   = action.payload.total;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })
      .addCase(fetchRestaurantById.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchRestaurantById.fulfilled, (state, action) => {
        state.loading  = false;
        state.selected = action.payload;
      })
      .addCase(fetchRestaurantById.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });
  }
});

export const { setFilters, clearFilters, clearSelected } = restaurantSlice.actions;

// Selectors
export const selectRestaurants        = state => state.restaurants.list;
export const selectRestaurantTotal    = state => state.restaurants.total;
export const selectSelectedRestaurant = state => state.restaurants.selected;
export const selectRestaurantLoading  = state => state.restaurants.loading;
export const selectRestaurantError    = state => state.restaurants.error;
export const selectFilters            = state => state.restaurants.filters;

export default restaurantSlice.reducer;