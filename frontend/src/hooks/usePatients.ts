import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

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
    mrn: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    phone?: string;
    email?: string;
    address?: string;
}

const fetchPatients = async (): Promise<Patient[]> => {
    const { data } = await api.get<Patient[]>('/patients');
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

export const usePatients = () => {
    return useQuery({
        queryKey: ['patients'],
        queryFn: fetchPatients,
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
