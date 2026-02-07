import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMedications, useCreateMedication, CreateMedicationRequest } from '../../../hooks/useMedicalRecords';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function MedicationsList({ patientId }: { patientId: string }) {
    const { data: medications, isLoading } = useMedications(patientId);
    const [open, setOpen] = useState(false);

    if (isLoading) return <div>Loading medications...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Medications</h3>
                <Button size="sm" onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Medication
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Dosage</TableHead>
                            <TableHead>Frequency</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Prescribed By</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {medications?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">No medications recorded.</TableCell>
                            </TableRow>
                        ) : (
                            medications?.map((med) => (
                                <TableRow key={med.id}>
                                    <TableCell className="font-medium">{med.name}</TableCell>
                                    <TableCell>{med.dosage}</TableCell>
                                    <TableCell>{med.frequency}</TableCell>
                                    <TableCell>{med.startDate}</TableCell>
                                    <TableCell>{med.endDate || '-'}</TableCell>
                                    <TableCell>{med.prescribedByName}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AddMedicationDialog open={open} onOpenChange={setOpen} patientId={patientId} />
        </div>
    );
}

function AddMedicationDialog({ open, onOpenChange, patientId }: { open: boolean; onOpenChange: (o: boolean) => void; patientId: string }) {
    const { mutate: createMedication, isPending } = useCreateMedication(patientId);
    const { toast } = useToast();
    const { register, handleSubmit, reset } = useForm<CreateMedicationRequest>();

    const onSubmit = (data: CreateMedicationRequest) => {
        createMedication(data, {
            onSuccess: () => {
                toast({ title: 'Success', description: 'Medication added' });
                reset();
                onOpenChange(false);
            },
            onError: () => {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to add medication' });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader><DialogTitle>Add Medication</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Medication Name</Label>
                        <Input {...register('name', { required: true })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Dosage</Label>
                            <Input {...register('dosage')} />
                        </div>
                        <div className="space-y-2">
                            <Label>Frequency</Label>
                            <Input {...register('frequency')} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input type="date" {...register('startDate', { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input type="date" {...register('endDate')} />
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
