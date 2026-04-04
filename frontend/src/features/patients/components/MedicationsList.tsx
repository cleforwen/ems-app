import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMedications, useCreateMedication, CreateMedicationRequest } from '../../../hooks/useMedicalRecords';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pill, Calendar, Clock, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { cn } from '@/utils';

export function MedicationsList({ patientId }: { patientId: string }) {
    const { data: medications, isLoading } = useMedications(patientId);
    const [open, setOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-foreground">Medications</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-36 bg-muted/50 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    const activeMeds = medications?.filter(m => m.active) || [];
    const inactiveMeds = medications?.filter(m => !m.active) || [];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-foreground">Medications</h3>
                <Button size="sm" onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Medication
                </Button>
            </div>

            {medications?.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="rounded-full bg-muted p-3 mb-3">
                            <Pill className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">No medications recorded</p>
                        <p className="text-sm text-muted-foreground/70">Click Add Medication to start</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {activeMeds.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Active ({activeMeds.length})</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activeMeds.map((med) => (
                                    <MedicationCard key={med.id} medication={med} />
                                ))}
                            </div>
                        </div>
                    )}
                    {inactiveMeds.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Inactive ({inactiveMeds.length})</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {inactiveMeds.map((med) => (
                                    <MedicationCard key={med.id} medication={med} inactive />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <AddMedicationDialog open={open} onOpenChange={setOpen} patientId={patientId} />
        </div>
    );
}

function MedicationCard({ medication, inactive }: { medication: { id: number; name: string; dosage?: string; frequency?: string; startDate: string; endDate?: string; prescribedByName?: string; notes?: string }; inactive?: boolean }) {
    return (
        <Card className={cn('transition-opacity', inactive && 'opacity-60')}>
            <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <Pill className="h-4 w-4" />
                        </div>
                        <div>
                            <h4 className="font-semibold">{medication.name}</h4>
                            {medication.dosage && (
                                <p className="text-sm text-muted-foreground">{medication.dosage}</p>
                            )}
                        </div>
                    </div>
                    {inactive && (
                        <span className="text-xs bg-muted px-2 py-1 rounded">Inactive</span>
                    )}
                </div>

                <div className="space-y-2 text-sm">
                    {medication.frequency && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{medication.frequency}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(new Date(medication.startDate), 'MMM d, yyyy')}</span>
                        {medication.endDate && (
                            <span> - {format(new Date(medication.endDate), 'MMM d, yyyy')}</span>
                        )}
                    </div>
                    {medication.prescribedByName && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            <span>{medication.prescribedByName}</span>
                        </div>
                    )}
                    {medication.notes && (
                        <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">{medication.notes}</p>
                    )}
                </div>
            </CardContent>
        </Card>
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
                        <Input {...register('name', { required: true })} placeholder="e.g., Metformin" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Dosage</Label>
                            <Input {...register('dosage')} placeholder="e.g., 500mg" />
                        </div>
                        <div className="space-y-2">
                            <Label>Frequency</Label>
                            <Input {...register('frequency')} placeholder="e.g., Twice daily" />
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
                        <Input {...register('notes')} placeholder="Additional instructions..." />
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
