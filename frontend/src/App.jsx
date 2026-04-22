import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar    from './components/Navbar';
import Home      from './pages/Home';
import Jobs      from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './pages/Dashboard';

import './App.css';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <div id="app">
        <Navbar />
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/jobs"      element={<Jobs />} />
          <Route path="/jobs/:id"  element={<JobDetail />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/register"  element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          theme="dark"
          toastStyle={{ background:'#111622', border:'1px solid #2a3352', color:'#e8ecf5' }}
        />
      </div>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
