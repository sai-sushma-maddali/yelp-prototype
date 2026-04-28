import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import store from './store';

test('renders navigation', () => {
  render(
    <Provider store={store}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  );
  expect(screen.getByText(/Explore/i)).toBeInTheDocument();
});
