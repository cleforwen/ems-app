import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAllergies, useCreateAllergy, CreateAllergyRequest } from '../../../hooks/useMedicalRecords';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select } from '@/components/ui/simple-select';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function AllergiesList({ patientId }: { patientId: string }) {
    const { data: allergies, isLoading } = useAllergies(patientId);
    const [open, setOpen] = useState(false);

    if (isLoading) return <div>Loading allergies...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Allergies</h3>
                <Button size="sm" onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Allergy
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Allergen</TableHead>
                            <TableHead>Reaction</TableHead>
                            <TableHead>Severity</TableHead>
                            <TableHead>Notes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allergies?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">No allergies recorded.</TableCell>
                            </TableRow>
                        ) : (
                            allergies?.map((allergy) => (
                                <TableRow key={allergy.id}>
                                    <TableCell className="font-medium">{allergy.allergen}</TableCell>
                                    <TableCell>{allergy.reaction}</TableCell>
                                    <TableCell>
                                        <Badge variant={allergy.severity === 'SEVERE' ? 'destructive' : 'secondary'}>
                                            {allergy.severity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{allergy.notes}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AddAllergyDialog open={open} onOpenChange={setOpen} patientId={patientId} />
        </div>
    );
}

function AddAllergyDialog({ open, onOpenChange, patientId }: { open: boolean; onOpenChange: (o: boolean) => void; patientId: string }) {
    const { mutate: createAllergy, isPending } = useCreateAllergy(patientId);
    const { toast } = useToast();
    const { register, handleSubmit, reset } = useForm<CreateAllergyRequest>();

    const onSubmit = (data: CreateAllergyRequest) => {
        createAllergy(data, {
            onSuccess: () => {
                toast({ title: 'Success', description: 'Allergy added' });
                reset();
                onOpenChange(false);
            },
            onError: () => {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to add allergy' });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader><DialogTitle>Add Allergy</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Allergen</Label>
                        <Input {...register('allergen', { required: true })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Reaction</Label>
                        <Input {...register('reaction')} />
                    </div>
                    <div className="space-y-2">
                        <Label>Severity</Label>
                        <Select {...register('severity')}>
                            <option value="MILD">Mild</option>
                            <option value="MODERATE">Moderate</option>
                            <option value="SEVERE">Severe</option>
                        </Select>
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
