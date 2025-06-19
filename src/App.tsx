import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { EmergencyRequestForm } from './pages/EmergencyRequestForm';
import RequestStatus from './pages/RequestStatus';
import { AdminPanel } from './pages/AdminPanel';
import { Messages } from './pages/Messages';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import { ChatBot } from './components/ChatBot';
import { Status } from './pages/Status';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg-cream font-inter flex flex-col">
        <Header />
        <Toaster position="top-center" />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/request" element={
              <ProtectedRoute>
                <EmergencyRequestForm />
              </ProtectedRoute>
            } />
            <Route path="/status/:id" element={
              <ProtectedRoute>
                <RequestStatus />
              </ProtectedRoute>
            } />
            <Route path="/adminpanel" element={
              <ProtectedRoute requireAdmin>
                <AdminPanel />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute requireAdmin>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
          </Routes>
        </div>
        <ChatBot />
      </div>
    </Router>
  );
}

export default App;