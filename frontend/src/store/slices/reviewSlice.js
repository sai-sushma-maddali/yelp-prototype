import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getReviews, createReview,
  updateReview, deleteReview
} from '../../services/api';

export const fetchReviews = createAsyncThunk(
  'reviews/fetchAll',
  async (restaurantId, { rejectWithValue }) => {
    try {
      const res = await getReviews(restaurantId);
      return res.data;
    } catch {
      return rejectWithValue('Failed to load reviews');
    }
  }
);

export const addReview = createAsyncThunk(
  'reviews/add',
  async ({ restaurantId, data }, { rejectWithValue }) => {
    try {
      const res = await createReview(restaurantId, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to submit review');
    }
  }
);

export const editReview = createAsyncThunk(
  'reviews/edit',
  async ({ restaurantId, reviewId, data }, { rejectWithValue }) => {
    try {
      const res = await updateReview(restaurantId, reviewId, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to update review');
    }
  }
);

export const removeReview = createAsyncThunk(
  'reviews/remove',
  async ({ restaurantId, reviewId }, { rejectWithValue }) => {
    try {
      await deleteReview(restaurantId, reviewId);
      return reviewId;
    } catch {
      return rejectWithValue('Failed to delete review');
    }
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    list:    [],
    loading: false,
    error:   null,
  },
  reducers: {
    clearReviews(state) {
      state.list  = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.list    = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(addReview.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(editReview.fulfilled, (state, action) => {
        const idx = state.list.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(removeReview.fulfilled, (state, action) => {
        state.list = state.list.filter(r => r.id !== action.payload);
      });
  }
});

export const { clearReviews } = reviewSlice.actions;

// Selectors
export const selectReviews        = state => state.reviews.list;
export const selectReviewsLoading = state => state.reviews.loading;
export const selectReviewsError   = state => state.reviews.error;

export default reviewSlice.reducer;