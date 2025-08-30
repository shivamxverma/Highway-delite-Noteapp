import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import SignUpForm from './pages/Signup';
import LoginForm from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import RedirectIfAuth from './auth/RedirectIfAuth';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={
            <RedirectIfAuth>
              <SignUpForm />
            </RedirectIfAuth>
          } />
          <Route path="/login" element={
            <RedirectIfAuth>
              <LoginForm />
            </RedirectIfAuth>
          } />

          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}