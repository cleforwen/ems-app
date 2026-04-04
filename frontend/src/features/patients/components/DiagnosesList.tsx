import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDiagnoses, useCreateDiagnosis, CreateDiagnosisRequest } from '../../../hooks/useMedicalRecords';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/simple-select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Stethoscope, Calendar, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/utils';

const STATUS_CONFIG = {
    ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-700 border-green-200' },
    CHRONIC: { label: 'Chronic', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    RESOLVED: { label: 'Resolved', color: 'bg-gray-100 text-gray-600 border-gray-200' },
} as const;

export function DiagnosesList({ patientId }: { patientId: string }) {
    const { data: diagnoses, isLoading } = useDiagnoses(patientId);
    const [open, setOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-foreground">Diagnoses</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    const activeDiagnoses = diagnoses?.filter(d => d.status !== 'RESOLVED') || [];
    const resolvedDiagnoses = diagnoses?.filter(d => d.status === 'RESOLVED') || [];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-foreground">Diagnoses</h3>
                <Button size="sm" onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Diagnosis
                </Button>
            </div>

            {diagnoses?.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="rounded-full bg-muted p-3 mb-3">
                            <Stethoscope className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">No diagnoses recorded</p>
                        <p className="text-sm text-muted-foreground/70">Click Add Diagnosis to start</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {activeDiagnoses.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Active Diagnoses ({activeDiagnoses.length})</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activeDiagnoses.map((diag) => (
                                    <DiagnosisCard key={diag.id} diagnosis={diag} />
                                ))}
                            </div>
                        </div>
                    )}
                    {resolvedDiagnoses.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Resolved ({resolvedDiagnoses.length})</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {resolvedDiagnoses.map((diag) => (
                                    <DiagnosisCard key={diag.id} diagnosis={diag} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <AddDiagnosisDialog open={open} onOpenChange={setOpen} patientId={patientId} />
        </div>
    );
}

function DiagnosisCard({ diagnosis }: { diagnosis: { id: number; icdCode?: string; description: string; diagnosedAt: string; diagnosedByName?: string; status?: 'ACTIVE' | 'RESOLVED' | 'CHRONIC'; notes?: string } }) {
    const statusConfig = STATUS_CONFIG[diagnosis.status || 'ACTIVE'];

    return (
        <Card className="transition-opacity">
            <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                            <Stethoscope className="h-4 w-4" />
                        </div>
                        <Badge variant="outline" className={cn('text-xs', statusConfig.color)}>
                            {statusConfig.label}
                        </Badge>
                    </div>
                </div>

                <h4 className="font-semibold mb-1">{diagnosis.description}</h4>
                {diagnosis.icdCode && (
                    <p className="text-sm text-muted-foreground mb-3">ICD-10: {diagnosis.icdCode}</p>
                )}

                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Diagnosed {format(new Date(diagnosis.diagnosedAt), 'MMM d, yyyy')}</span>
                    </div>
                    {diagnosis.diagnosedByName && (
                        <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5" />
                            <span>{diagnosis.diagnosedByName}</span>
                        </div>
                    )}
                    {diagnosis.notes && (
                        <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">{diagnosis.notes}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function AddDiagnosisDialog({ open, onOpenChange, patientId }: { open: boolean; onOpenChange: (o: boolean) => void; patientId: string }) {
    const { mutate: createDiagnosis, isPending } = useCreateDiagnosis(patientId);
    const { toast } = useToast();
    const { register, handleSubmit, reset } = useForm<CreateDiagnosisRequest>();

    const onSubmit = (data: CreateDiagnosisRequest) => {
        createDiagnosis(data, {
            onSuccess: () => {
                toast({ title: 'Success', description: 'Diagnosis added' });
                reset();
                onOpenChange(false);
            },
            onError: () => {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to add diagnosis' });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader><DialogTitle>Add Diagnosis</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label>ICD Code</Label>
                        <Input {...register('icdCode')} placeholder="e.g. E11.9" />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input {...register('description', { required: true })} placeholder="Type 2 diabetes mellitus" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Diagnosed At</Label>
                            <Input type="date" {...register('diagnosedAt', { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select {...register('status')}>
                                <option value="ACTIVE">Active</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="CHRONIC">Chronic</option>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Input {...register('notes')} placeholder="Additional notes..." />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
