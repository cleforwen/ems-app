import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export interface PatientNote {
    id: number;
    patientId: number;
    content: string;
    createdById?: number;
    createdByName?: string;
    createdAt: string;
    modifiedAt?: string;
}

export interface CreateNoteRequest {
    content: string;
}

export interface UpdateNoteRequest {
    content: string;
}

const listNotes = async (patientId: string): Promise<PatientNote[]> => {
    const { data } = await api.get<PatientNote[]>(`/patients/${patientId}/notes`);
    return data;
};

const createNote = async (patientId: string, payload: CreateNoteRequest): Promise<PatientNote> => {
    const { data } = await api.post<PatientNote>(`/patients/${patientId}/notes`, payload);
    return data;
};

const updateNote = async (patientId: string, noteId: number, payload: UpdateNoteRequest): Promise<PatientNote> => {
    const { data } = await api.put<PatientNote>(`/patients/${patientId}/notes/${noteId}`, payload);
    return data;
};

export const useNotes = (patientId: string) =>
    useQuery({
        queryKey: ['notes', patientId],
        queryFn: () => listNotes(patientId),
        enabled: !!patientId
    });

export const useCreateNote = (patientId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateNoteRequest) => createNote(patientId, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes', patientId] }),
    });
};

export const useUpdateNote = (patientId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ noteId, data }: { noteId: number; data: UpdateNoteRequest }) => updateNote(patientId, noteId, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes', patientId] }),
    });
};
