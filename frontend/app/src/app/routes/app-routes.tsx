import { useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { LoginView } from '@/features/login/components/login-view';
import { NewReportLayout } from '@/features/new-report/layouts/new-report-layout';
import { HomeLayout } from '@/features/home/layouts/home-layout';
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

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/home" element={<HomeLayout />} />
      <Route path="/new-report" element={<NewReportLayout />} />
      <Route path="/report/:id" element={<ReportEditorWidget />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
