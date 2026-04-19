import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginApi, signup as signupApi, getProfile } from '../../services/api';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await loginApi(credentials);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Login failed');
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const res = await signupApi(userData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Signup failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getProfile();
      return res.data;
    } catch (err) {
      return rejectWithValue('Failed to fetch user');
    }
  }
);

// Load persisted auth from localStorage
const savedToken = localStorage.getItem('token');
const savedUser  = localStorage.getItem('user');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:    savedUser  ? JSON.parse(savedUser)  : null,
    token:   savedToken ? savedToken             : null,
    loading: false,
    error:   null,
  },
  reducers: {
    logout(state) {
      state.user  = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    updateProfilePic(state, action) {
      if (state.user) {
        state.user.profile_pic = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token   = action.payload.access_token;
        state.user    = {
          id:   action.payload.user_id,
          name: action.payload.name,
          role: action.payload.role
        };
        localStorage.setItem('token', action.payload.access_token);
        localStorage.setItem('user', JSON.stringify(state.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })
      // Signup
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token   = action.payload.access_token;
        state.user    = {
          id:   action.payload.user_id,
          name: action.payload.name,
          role: action.payload.role
        };
        localStorage.setItem('token', action.payload.access_token);
        localStorage.setItem('user', JSON.stringify(state.user));
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })
      // Fetch profile
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      });
  }
});

export const { logout, updateProfilePic, clearError } = authSlice.actions;

// Selectors
export const selectUser        = state => state.auth.user;
export const selectToken       = state => state.auth.token;
export const selectIsAuth      = state => !!state.auth.token;
export const selectIsOwner     = state => state.auth.user?.role === 'owner';
export const selectAuthLoading = state => state.auth.loading;
export const selectAuthError   = state => state.auth.error;

export default authSlice.reducer;