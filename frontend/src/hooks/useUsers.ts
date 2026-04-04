import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { PagedResponse } from '../types/pagination';

export type UserRole = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'STAFF';

export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    roles: UserRole[];
    active: boolean;
}

export interface CreateUserRequest {
    email: string;
    firstName: string;
    lastName: string;
    roles: UserRole[];
    password?: string;
}

export interface UpdateUserRequest {
    email?: string;
    firstName?: string;
    lastName?: string;
    roles?: UserRole[];
    password?: string;
}

interface UserQueryParams {
    page?: number;
    size?: number;
    search?: string;
}

const fetchUsers = async (params?: UserQueryParams): Promise<PagedResponse<User>> => {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());
    if (params?.search) searchParams.append('search', params.search);

    const query = searchParams.toString();
    const { data } = await api.get<PagedResponse<User>>(`/users${query ? `?${query}` : ''}`);
    return data;
};

const fetchUser = async (id: string): Promise<User> => {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
};

const createUser = async (data: CreateUserRequest): Promise<User> => {
    const { data: response } = await api.post<User>('/users', data);
    return response;
};

const updateUser = async ({ id, data }: { id: number; data: UpdateUserRequest }): Promise<User> => {
    const { data: response } = await api.put<User>(`/users/${id}`, data);
    return response;
};

const deleteUser = async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
};

export const useUsers = (params?: UserQueryParams) => {
    return useQuery({
        queryKey: ['users', params],
        queryFn: () => fetchUsers(params),
    });
};

export const useUser = (id: string) => {
    return useQuery({
        queryKey: ['user', id],
        queryFn: () => fetchUser(id),
        enabled: !!id,
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};
