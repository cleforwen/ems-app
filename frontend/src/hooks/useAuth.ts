import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { z } from 'zod';

// Types
export interface AuthConfig {
    googleEnabled: boolean;
    googleClientId: string;
}

export const SendOtpSchema = z.object({
    email: z.string().email('Invalid email address'),
});

export const VerifyOtpSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().min(1, 'OTP is required'),
});

export const RegisterSchema = z.object({
    email: z.string().email('Invalid email address'),
    globalToken: z.string().min(1, 'Token is required'),
    hospitalName: z.string().min(3, 'Hospital name must be at least 3 characters'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
});

export type SendOtpRequest = z.infer<typeof SendOtpSchema>;
export type VerifyOtpRequest = z.infer<typeof VerifyOtpSchema>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;

export interface AuthResponse {
    token: string;
    userId: number;
    firstName: string;
    lastName: string;
    hospitalId: number;
    hospitalName: string;
    roles: string[];
}

export interface HospitalInfo {
    id: number;
    name: string;
    roles: string[];
}

export interface VerifyOtpResponse {
    globalToken?: string;
    isNewUser: boolean;
    email: string;
    hospitals?: HospitalInfo[];
}

export interface ExchangeTokenRequest {
    hospitalId: number;
}

// API Functions
const sendOtp = async (data: SendOtpRequest): Promise<void> => {
    await api.post('/auth/otp/request', data);
};

const verifyOtp = async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const response = await api.post<VerifyOtpResponse>('/auth/otp/verify', data);
    return response.data;
};

const registerHospital = async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
};

const selectHospital = async (data: ExchangeTokenRequest, token: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/select-hospital', data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const getMyHospitals = async (): Promise<HospitalInfo[]> => {
    const response = await api.get<HospitalInfo[]>('/auth/me/hospitals');
    return response.data;
};

const googleLogin = async (idToken: string): Promise<VerifyOtpResponse> => {
    const response = await api.post<VerifyOtpResponse>('/auth/google', { idToken });
    return response.data;
};

const getAuthConfig = async (): Promise<AuthConfig> => {
    const response = await api.get<AuthConfig>('/auth/config');
    return response.data;
};

// Hooks
export const useAuthConfig = () => {
    return useQuery({
        queryKey: ['authConfig'],
        queryFn: getAuthConfig,
        staleTime: Infinity, // Config doesn't change during session
    });
};

export const useSendOtp = () => {
    return useMutation({
        mutationFn: sendOtp,
    });
};

export const useGoogleLogin = () => {
    return useMutation({
        mutationFn: googleLogin,
    });
};

export const useVerifyOtp = () => {
    return useMutation({
        mutationFn: verifyOtp,
    });
};

export const useSelectHospital = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ data, token }: { data: ExchangeTokenRequest, token: string }) => selectHospital(data, token),
        onSuccess: (data) => {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            queryClient.setQueryData(['currentUser'], data);
        },
    });
};

export const useMyHospitals = () => {
    return useQuery({
        queryKey: ['myHospitals'],
        queryFn: getMyHospitals,
    });
};

export const useRegister = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: registerHospital,
        onSuccess: (data) => {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            queryClient.setQueryData(['currentUser'], data);
        },
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();

    return () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        queryClient.clear();
        window.location.href = '/login';
    };
};
