import { useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { LandingView } from '@/features/landing/components/landing-view';
import { LoginView } from '@/features/login/components/login-view';
import { HomeWidget } from '@/features/home';
import { NewReportWidget } from '@/features/new-report';
import { ReportEditorWidget } from '@/features/report-editor';

const LoginRoute = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo.user@example.com');

  return (
    <LoginView
      email={email}
      onEmailChange={setEmail}
      onLogin={() => {
        navigate('/home');
      }}
    />
  );
};

const LandingRoute = () => {
  const navigate = useNavigate();

  return (
    <LandingView
      onStart={() => {
        navigate('/login');
      }}
    />
  );
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingRoute />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/home" element={<HomeWidget />} />
      <Route path="/new-report/:id" element={<NewReportWidget />} />
      <Route path="/report/:id" element={<ReportEditorWidget />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
