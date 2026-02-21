import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { Appointment } from './useAppointments';
import { Patient } from './usePatients';

export interface LabResultSummary {
    id: number;
    patientId: number;
    testName: string;
    testCode?: string;
    result: string;
    unit?: string;
    referenceRange?: string;
    status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
    performedAt: string;
    orderedById?: number;
    orderedByName?: string;
    notes?: string;
}

export interface DashboardData {
    totalPatients: number;
    totalActiveDiagnoses: number;
    appointmentsToday: number;
    appointmentsRemaining: number;
    upcomingAppointments: Appointment[];
    myPatients: Patient[];
    recentLabResults: LabResultSummary[];
}

const fetchDashboard = async (): Promise<DashboardData> => {
    const { data } = await api.get<DashboardData>('/dashboard');
    return data;
};

export const useDashboard = () => {
    return useQuery({
        queryKey: ['dashboard'],
        queryFn: fetchDashboard,
        refetchInterval: 60000, // Refresh every minute
    });
};
