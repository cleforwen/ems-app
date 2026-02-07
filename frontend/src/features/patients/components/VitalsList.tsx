import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useVitals, useCreateVital, CreateVitalRequest } from '../../../hooks/useMedicalRecords';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function VitalsList({ patientId }: { patientId: string }) {
    const { data: vitals, isLoading } = useVitals(patientId);
    const [open, setOpen] = useState(false);

    if (isLoading) return <div>Loading vitals...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Vitals</h3>
                <Button size="sm" onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Vitals
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>BP (mmHg)</TableHead>
                            <TableHead>HR (bpm)</TableHead>
                            <TableHead>Resp (bpm)</TableHead>
                            <TableHead>Temp (°C)</TableHead>
                            <TableHead>SpO2 (%)</TableHead>
                            <TableHead>Weight (kg)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vitals?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">No vitals recorded.</TableCell>
                            </TableRow>
                        ) : (
                            vitals?.map((vital) => (
                                <TableRow key={vital.id}>
                                    <TableCell>{new Date(vital.recordedAt).toLocaleString()}</TableCell>
                                    <TableCell>{vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}</TableCell>
                                    <TableCell>{vital.heartRate}</TableCell>
                                    <TableCell>{vital.respiratoryRate}</TableCell>
                                    <TableCell>{vital.temperature}</TableCell>
                                    <TableCell>{vital.oxygenSaturation}</TableCell>
                                    <TableCell>{vital.weight}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AddVitalDialog open={open} onOpenChange={setOpen} patientId={patientId} />
        </div>
    );
}

function AddVitalDialog({ open, onOpenChange, patientId }: { open: boolean; onOpenChange: (o: boolean) => void; patientId: string }) {
    const { mutate: createVital, isPending } = useCreateVital(patientId);
    const { toast } = useToast();
    const { register, handleSubmit, reset } = useForm<CreateVitalRequest>();

    const onSubmit = (data: CreateVitalRequest) => {
        createVital(data, {
            onSuccess: () => {
                toast({ title: 'Success', description: 'Vitals added' });
                reset();
                onOpenChange(false);
            },
            onError: () => {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to add vitals' });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader><DialogTitle>Add Vitals</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Sys BP</Label>
                            <Input {...register('bloodPressureSystolic')} placeholder="120" />
                        </div>
                        <div className="space-y-2">
                            <Label>Dia BP</Label>
                            <Input {...register('bloodPressureDiastolic')} placeholder="80" />
                        </div>
                        <div className="space-y-2">
                            <Label>Heart Rate</Label>
                            <Input {...register('heartRate')} placeholder="72" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Resp Rate</Label>
                            <Input {...register('respiratoryRate')} placeholder="16" />
                        </div>
                        <div className="space-y-2">
                            <Label>Temperature</Label>
                            <Input {...register('temperature')} placeholder="37.0" />
                        </div>
                        <div className="space-y-2">
                            <Label>SpO2</Label>
                            <Input {...register('oxygenSaturation')} placeholder="98" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Weight (kg)</Label>
                            <Input {...register('weight')} />
                        </div>
                        <div className="space-y-2">
                            <Label>Height (cm)</Label>
                            <Input {...register('height')} />
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
