import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { PagedResponse } from '../types/pagination';

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

export interface AppointmentFilters {
    doctorId?: number;
    from?: string;
    to?: string;
    status?: string;
}

interface AppointmentQueryParams {
    filters?: AppointmentFilters;
    page?: number;
    size?: number;
}

const fetchAppointments = async (params?: AppointmentQueryParams): Promise<PagedResponse<Appointment>> => {
    const searchParams = new URLSearchParams();
    if (params?.filters?.doctorId) searchParams.append('doctorId', params.filters.doctorId.toString());
    if (params?.filters?.from) searchParams.append('from', params.filters.from);
    if (params?.filters?.to) searchParams.append('to', params.filters.to);
    if (params?.filters?.status) searchParams.append('status', params.filters.status);
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());

    const query = searchParams.toString();
    const { data } = await api.get<PagedResponse<Appointment>>(`/appointments${query ? `?${query}` : ''}`);
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

export const useAppointments = (params?: AppointmentQueryParams) => {
    return useQuery({
        queryKey: ['appointments', params],
        queryFn: () => fetchAppointments(params),
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
