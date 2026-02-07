import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { AuthResponse } from './useAuth';

export interface Hospital {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
    website: string;
    active: boolean;
}

export interface UpdateHospitalRequest {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
    email?: string;
    website?: string;
}

const getCurrentHospitalId = (): number | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        const user = JSON.parse(userStr) as AuthResponse;
        return user.hospitalId;
    } catch {
        return null;
    }
};

const fetchHospital = async (): Promise<Hospital> => {
    const id = getCurrentHospitalId();
    if (!id) throw new Error('No hospital ID found');
    const { data } = await api.get<Hospital>(`/hospitals/${id}`);
    return data;
};

const updateHospital = async (data: UpdateHospitalRequest): Promise<Hospital> => {
    const id = getCurrentHospitalId();
    if (!id) throw new Error('No hospital ID found');
    const { data: response } = await api.put<Hospital>(`/hospitals/${id}`, data);
    return response;
};

export const useHospital = () => {
    const id = getCurrentHospitalId();
    return useQuery({
        queryKey: ['hospital', id],
        queryFn: fetchHospital,
        enabled: !!id,
    });
};

export const useUpdateHospital = () => {
    const queryClient = useQueryClient();
    const id = getCurrentHospitalId();
    return useMutation({
        mutationFn: updateHospital,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hospital', id] });
        },
    });
};
