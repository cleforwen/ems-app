import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { PagedResponse } from '../types/pagination';

export interface Patient {
    id: number;
    mrn: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    phone: string;
    email: string;
    active: boolean;
    address?: string;
    emergencyContact?: string;
    bloodType?: string;
}

export interface CreatePatientRequest {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    phone?: string;
    email?: string;
    address?: string;
}

export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {
    active?: boolean;
}

interface PatientQueryParams {
    page?: number;
    size?: number;
    search?: string;
}

const fetchPatients = async (params?: PatientQueryParams): Promise<PagedResponse<Patient>> => {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());
    if (params?.search) searchParams.append('search', params.search);

    const query = searchParams.toString();
    const { data } = await api.get<PagedResponse<Patient>>(`/patients${query ? `?${query}` : ''}`);
    return data;
};

const fetchPatient = async (id: string): Promise<Patient> => {
    const { data } = await api.get<Patient>(`/patients/${id}`);
    return data;
};

const createPatient = async (data: CreatePatientRequest): Promise<Patient> => {
    const { data: response } = await api.post<Patient>('/patients', data);
    return response;
};

const updatePatient = async ({ id, data }: { id: number, data: UpdatePatientRequest }): Promise<Patient> => {
    const { data: response } = await api.put<Patient>(`/patients/${id}`, data);
    return response;
};

export const usePatients = (params?: PatientQueryParams) => {
    return useQuery({
        queryKey: ['patients', params],
        queryFn: () => fetchPatients(params),
    });
};

export const usePatient = (id: string) => {
    return useQuery({
        queryKey: ['patient', id],
        queryFn: () => fetchPatient(id),
        enabled: !!id,
    });
};

export const useCreatePatient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createPatient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
        },
    });
};

export const useUpdatePatient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updatePatient,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            queryClient.invalidateQueries({ queryKey: ['patient', variables.id.toString()] });
        },
    });
};
