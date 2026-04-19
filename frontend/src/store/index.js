import { configureStore } from '@reduxjs/toolkit';
import authReducer       from './slices/authSlice';
import restaurantReducer from './slices/restaurantSlice';
import reviewReducer     from './slices/reviewSlice';
import favoriteReducer   from './slices/favoriteSlice';

const store = configureStore({
  reducer: {
    auth:        authReducer,
    restaurants: restaurantReducer,
    reviews:     reviewReducer,
    favorites:   favoriteReducer,
  }
});

export default store;