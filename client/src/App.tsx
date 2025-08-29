import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import SignUpForm from './pages/Signup';
import LoginForm from './pages/Login';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './auth/AuthContext';


export default function App() {
  return (
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
  );
}