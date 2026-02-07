import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

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

const fetchUsers = async (): Promise<User[]> => {
    const { data } = await api.get<User[]>('/users');
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

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
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
