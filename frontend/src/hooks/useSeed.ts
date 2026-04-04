import { useMutation } from '@tanstack/react-query';
import { api } from '../api/client';

export interface SeedResult {
    staffCreated: number;
    patientsCreated: number;
    appointmentsCreated: number;
}

const generateSeedData = async (): Promise<SeedResult> => {
    const { data } = await api.post<SeedResult>('/seed/generate');
    return data;
};

export const useGenerateSeedData = () => {
    return useMutation({
        mutationFn: generateSeedData,
    });
};
