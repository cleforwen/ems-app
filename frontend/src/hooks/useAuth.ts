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
    otp: z.string().min(1, 'OTP is required'),
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

export interface VerifyOtpResponse {
    token?: string;
    isNewUser: boolean;
    email: string;
    auth?: AuthResponse;
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
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: googleLogin,
        onSuccess: (data) => {
            if (data.token && data.auth) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.auth));
                queryClient.setQueryData(['currentUser'], data.auth);
            }
        },
    });
};

export const useVerifyOtp = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: verifyOtp,
        onSuccess: (data) => {
            if (data.token && data.auth) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.auth));
                queryClient.setQueryData(['currentUser'], data.auth);
            }
        },
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
