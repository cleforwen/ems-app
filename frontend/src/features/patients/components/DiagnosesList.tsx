import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDiagnoses, useCreateDiagnosis, CreateDiagnosisRequest } from '../../../hooks/useMedicalRecords';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/simple-select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

export function DiagnosesList({ patientId }: { patientId: string }) {
    const { data: diagnoses, isLoading } = useDiagnoses(patientId);
    const [open, setOpen] = useState(false);

    if (isLoading) return <div>Loading diagnoses...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Diagnoses</h3>
                <Button size="sm" onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Diagnosis
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ICD Code</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Diagnosed At</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Diagnosed By</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {diagnoses?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">No diagnoses recorded.</TableCell>
                            </TableRow>
                        ) : (
                            diagnoses?.map((diag) => (
                                <TableRow key={diag.id}>
                                    <TableCell>{diag.icdCode || '-'}</TableCell>
                                    <TableCell className="font-medium">{diag.description}</TableCell>
                                    <TableCell>{diag.diagnosedAt}</TableCell>
                                    <TableCell>
                                        <Badge variant={diag.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                            {diag.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{diag.diagnosedByName}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AddDiagnosisDialog open={open} onOpenChange={setOpen} patientId={patientId} />
        </div>
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
                        <Input {...register('notes')} />
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
