import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

// --- Allergies ---
export interface Allergy {
    id: number;
    patientId: number;
    allergen: string;
    reaction?: string;
    severity?: 'MILD' | 'MODERATE' | 'SEVERE';
    notes?: string;
}

export interface CreateAllergyRequest {
    allergen: string;
    reaction?: string;
    severity?: 'MILD' | 'MODERATE' | 'SEVERE';
    notes?: string;
}

// --- Medications ---
export interface Medication {
    id: number;
    patientId: number;
    name: string;
    dosage?: string;
    frequency?: string;
    startDate: string;
    endDate?: string;
    prescribedByName?: string;
    active: boolean;
    notes?: string;
}

export interface CreateMedicationRequest {
    name: string;
    dosage?: string;
    frequency?: string;
    startDate: string;
    endDate?: string;
    notes?: string;
}

// --- Diagnoses ---
export interface Diagnosis {
    id: number;
    patientId: number;
    icdCode?: string;
    description: string;
    diagnosedAt: string;
    diagnosedByName?: string;
    status?: 'ACTIVE' | 'RESOLVED' | 'CHRONIC';
    notes?: string;
}

export interface CreateDiagnosisRequest {
    icdCode?: string;
    description: string;
    diagnosedAt: string;
    status?: 'ACTIVE' | 'RESOLVED' | 'CHRONIC';
    notes?: string;
}

// --- Lab Results ---
export interface LabResult {
    id: number;
    patientId: number;
    testName: string;
    testCode?: string;
    result: string;
    unit?: string;
    referenceRange?: string;
    status?: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
    performedAt: string;
    orderedByName?: string;
    notes?: string;
}

export interface CreateLabResultRequest {
    testName: string;
    testCode?: string;
    result: string;
    unit?: string;
    referenceRange?: string;
    status?: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
    performedAt: string;
    notes?: string;
}

// --- Vitals ---
export interface Vital {
    id: number;
    patientId: number;
    recordedAt: string;
    recordedByName?: string;
    temperature?: string;
    bloodPressureSystolic?: string;
    bloodPressureDiastolic?: string;
    heartRate?: string;
    respiratoryRate?: string;
    oxygenSaturation?: string;
    weight?: string;
    height?: string;
    notes?: string;
}

export interface CreateVitalRequest {
    temperature?: string;
    bloodPressureSystolic?: string;
    bloodPressureDiastolic?: string;
    heartRate?: string;
    respiratoryRate?: string;
    oxygenSaturation?: string;
    weight?: string;
    height?: string;
    notes?: string;
}

// --- API Functions ---

// Generic list fetcher
const listRecords = async <T>(patientId: string, resource: string): Promise<T[]> => {
    const { data } = await api.get<T[]>(`/patients/${patientId}/${resource}`);
    return data;
};

// Generic creator
const createRecord = async <T, R>(patientId: string, resource: string, payload: R): Promise<T> => {
    const { data } = await api.post<T>(`/patients/${patientId}/${resource}`, payload);
    return data;
};

// --- Hooks ---

export const useAllergies = (patientId: string) =>
    useQuery({ queryKey: ['allergies', patientId], queryFn: () => listRecords<Allergy>(patientId, 'allergies'), enabled: !!patientId });

export const useCreateAllergy = (patientId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateAllergyRequest) => createRecord<Allergy, CreateAllergyRequest>(patientId, 'allergies', data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allergies', patientId] }),
    });
};

export const useMedications = (patientId: string) =>
    useQuery({ queryKey: ['medications', patientId], queryFn: () => listRecords<Medication>(patientId, 'medications'), enabled: !!patientId });

export const useCreateMedication = (patientId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateMedicationRequest) => createRecord<Medication, CreateMedicationRequest>(patientId, 'medications', data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medications', patientId] }),
    });
};

export const useDiagnoses = (patientId: string) =>
    useQuery({ queryKey: ['diagnoses', patientId], queryFn: () => listRecords<Diagnosis>(patientId, 'diagnoses'), enabled: !!patientId });

export const useCreateDiagnosis = (patientId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateDiagnosisRequest) => createRecord<Diagnosis, CreateDiagnosisRequest>(patientId, 'diagnoses', data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['diagnoses', patientId] }),
    });
};

export const useLabResults = (patientId: string) =>
    useQuery({ queryKey: ['lab-results', patientId], queryFn: () => listRecords<LabResult>(patientId, 'lab-results'), enabled: !!patientId });

export const useCreateLabResult = (patientId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateLabResultRequest) => createRecord<LabResult, CreateLabResultRequest>(patientId, 'lab-results', data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lab-results', patientId] }),
    });
};

export const useVitals = (patientId: string) =>
    useQuery({ queryKey: ['vitals', patientId], queryFn: () => listRecords<Vital>(patientId, 'vitals'), enabled: !!patientId });

export const useCreateVital = (patientId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateVitalRequest) => createRecord<Vital, CreateVitalRequest>(patientId, 'vitals', data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vitals', patientId] }),
    });
};
