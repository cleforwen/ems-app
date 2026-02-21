import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export type AppointmentStatus = 'SCHEDULED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type AppointmentType = 'CONSULTATION' | 'FOLLOW_UP' | 'ROUTINE_CHECK' | 'EMERGENCY' | 'LAB_REVIEW';

export interface Appointment {
    id: number;
    patientId: number;
    patientName: string;
    patientMrn: string;
    doctorId: number;
    doctorName: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;
    type: AppointmentType;
    reason?: string;
    notes?: string;
}

export interface CreateAppointmentRequest {
    patientId: number;
    doctorId: number;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    type?: AppointmentType;
    reason?: string;
    notes?: string;
}

export interface UpdateAppointmentRequest {
    patientId?: number;
    doctorId?: number;
    appointmentDate?: string;
    startTime?: string;
    endTime?: string;
    status?: AppointmentStatus;
    type?: AppointmentType;
    reason?: string;
    notes?: string;
}

interface AppointmentFilters {
    doctorId?: number;
    from?: string;
    to?: string;
    status?: string;
}

const fetchAppointments = async (filters?: AppointmentFilters): Promise<Appointment[]> => {
    const params = new URLSearchParams();
    if (filters?.doctorId) params.append('doctorId', filters.doctorId.toString());
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.status) params.append('status', filters.status);

    const query = params.toString();
    const { data } = await api.get<Appointment[]>(`/appointments${query ? `?${query}` : ''}`);
    return data;
};

const fetchAppointment = async (id: string): Promise<Appointment> => {
    const { data } = await api.get<Appointment>(`/appointments/${id}`);
    return data;
};

const createAppointment = async (data: CreateAppointmentRequest): Promise<Appointment> => {
    const { data: response } = await api.post<Appointment>('/appointments', data);
    return response;
};

const updateAppointment = async ({ id, data }: { id: number; data: UpdateAppointmentRequest }): Promise<Appointment> => {
    const { data: response } = await api.put<Appointment>(`/appointments/${id}`, data);
    return response;
};

const updateAppointmentStatus = async ({ id, status }: { id: number; status: AppointmentStatus }): Promise<Appointment> => {
    const { data: response } = await api.put<Appointment>(`/appointments/${id}/status`, { status });
    return response;
};

const deleteAppointment = async (id: number): Promise<void> => {
    await api.delete(`/appointments/${id}`);
};

export const useAppointments = (filters?: AppointmentFilters) => {
    return useQuery({
        queryKey: ['appointments', filters],
        queryFn: () => fetchAppointments(filters),
    });
};

export const useAppointment = (id: string) => {
    return useQuery({
        queryKey: ['appointment', id],
        queryFn: () => fetchAppointment(id),
        enabled: !!id,
    });
};

export const useCreateAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createAppointment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

export const useUpdateAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateAppointment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

export const useUpdateAppointmentStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateAppointmentStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

export const useDeleteAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteAppointment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};
