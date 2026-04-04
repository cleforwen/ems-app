import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAllergies, useCreateAllergy, CreateAllergyRequest } from '../../../hooks/useMedicalRecords';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select } from '@/components/ui/simple-select';
import { Badge } from '@/components/ui/badge';
import { Plus, AlertTriangle, AlertCircle, AlertOctagon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/utils';

const SEVERITY_CONFIG = {
    MILD: {
        icon: AlertTriangle,
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        iconColor: 'text-yellow-600',
        label: 'Mild',
    },
    MODERATE: {
        icon: AlertCircle,
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        iconColor: 'text-orange-600',
        label: 'Moderate',
    },
    SEVERE: {
        icon: AlertOctagon,
        color: 'bg-red-100 text-red-700 border-red-200',
        iconColor: 'text-red-600',
        label: 'Severe',
    },
};

export function AllergiesList({ patientId }: { patientId: string }) {
    const { data: allergies, isLoading } = useAllergies(patientId);
    const [open, setOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-foreground">Allergies</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-foreground">Allergies</h3>
                <Button size="sm" onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Allergy
                </Button>
            </div>

            {allergies?.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="rounded-full bg-muted p-3 mb-3">
                            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">No allergies recorded</p>
                        <p className="text-sm text-muted-foreground/70">Click Add Allergy to record one</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {allergies?.map((allergy) => {
                        const config = SEVERITY_CONFIG[allergy.severity || 'MILD'];
                        const Icon = config.icon;
                        return (
                            <Card
                                key={allergy.id}
                                className={cn(
                                    'border-l-4 hover:shadow-md transition-shadow',
                                    config.color
                                )}
                            >
                                <CardContent className="py-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <Icon className={cn('h-5 w-5 mt-0.5', config.iconColor)} />
                                            <div>
                                                <div className="font-semibold">{allergy.allergen}</div>
                                                {allergy.reaction && (
                                                    <div className="text-sm opacity-80">{allergy.reaction}</div>
                                                )}
                                                {allergy.notes && (
                                                    <div className="text-sm opacity-60 mt-1">{allergy.notes}</div>
                                                )}
                                            </div>
                                        </div>
                                        <Badge
                                            variant={allergy.severity === 'SEVERE' ? 'destructive' : 'secondary'}
                                            className="ml-2"
                                        >
                                            {config.label}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

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
                <DialogHeader>
                    <DialogTitle>Add Allergy</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Allergen</Label>
                        <Input {...register('allergen', { required: true })} placeholder="e.g., Penicillin, Peanuts" />
                    </div>
                    <div className="space-y-2">
                        <Label>Reaction</Label>
                        <Input {...register('reaction')} placeholder="e.g., Rash, Hives, Anaphylaxis" />
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
