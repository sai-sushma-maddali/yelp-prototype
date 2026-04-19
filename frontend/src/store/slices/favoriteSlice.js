import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getMyFavorites, addFavorite, removeFavorite
} from '../../services/api';

export const fetchFavorites = createAsyncThunk(
  'favorites/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getMyFavorites();
      return res.data;
    } catch {
      return rejectWithValue('Failed to load favorites');
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'favorites/toggle',
  async ({ restaurantId, isFavorite }, { rejectWithValue }) => {
    try {
      if (isFavorite) {
        await removeFavorite(restaurantId);
      } else {
        await addFavorite(restaurantId);
      }
      return { restaurantId, isFavorite };
    } catch {
      return rejectWithValue('Failed to update favorite');
    }
  }
);

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState: {
    list:        [],
    favoriteIds: [],
    loading:     false,
    error:       null,
  },
  reducers: {
    clearFavorites(state) {
      state.list        = [];
      state.favoriteIds = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading     = false;
        state.list        = action.payload;
        state.favoriteIds = action.payload.map(f => f.restaurant_id);
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { restaurantId, isFavorite } = action.payload;
        if (isFavorite) {
          state.favoriteIds = state.favoriteIds.filter(id => id !== restaurantId);
          state.list        = state.list.filter(f => f.restaurant_id !== restaurantId);
        } else {
          state.favoriteIds.push(restaurantId);
        }
      });
  }
});

export const { clearFavorites } = favoriteSlice.actions;

// Selectors
export const selectFavorites        = state => state.favorites.list;
export const selectFavoriteIds      = state => state.favorites.favoriteIds;
export const selectFavoritesLoading = state => state.favorites.loading;

export default favoriteSlice.reducer;