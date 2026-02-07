import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import LoginPage from './features/auth/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import { RequireAuth } from './components/layout/RequireAuth';
import DashboardPage from './features/dashboard/DashboardPage';
import PatientsPage from './features/patients/PatientsPage';
import PatientDetailsPage from './features/patients/PatientDetailsPage';
import UsersPage from './features/users/UsersPage';
import HospitalSettingsPage from './features/hospitals/HospitalSettingsPage';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    <Route path="/hospital/:hospitalId" element={
                        <RequireAuth>
                            <DashboardLayout />
                        </RequireAuth>
                    }>
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="patients" element={<PatientsPage />} />
                        <Route path="patients/:id" element={<PatientDetailsPage />} />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="settings" element={<HospitalSettingsPage />} />
                    </Route>

                    {/* Catch all redirect */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
            <Toaster />
        </QueryClientProvider>
    );
}

export default App;
