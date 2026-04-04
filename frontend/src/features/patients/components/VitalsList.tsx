import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useVitals, useCreateVital, CreateVitalRequest } from '../../../hooks/useMedicalRecords';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Activity, Heart, Thermometer, Wind, Scale, Ruler } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { cn } from '@/utils';

interface VitalCardProps {
    icon: React.ElementType;
    label: string;
    value: string | undefined;
    unit: string;
    color: string;
}

function VitalCard({ icon: Icon, label, value, unit, color }: VitalCardProps) {
    if (!value) return null;
    
    return (
        <Card className="flex-1 min-w-[140px]">
            <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className={cn("p-2 rounded-lg", color)}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm text-muted-foreground">{label}</span>
                </div>
                <div className="text-2xl font-bold">
                    {value} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
                </div>
            </CardContent>
        </Card>
    );
}

export function VitalsList({ patientId }: { patientId: string }) {
    const { data: vitals, isLoading } = useVitals(patientId);
    const [open, setOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-foreground">Vital Signs</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    const latestVitals = vitals?.[0];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-foreground">Vital Signs</h3>
                <Button size="sm" onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Record Vitals
                </Button>
            </div>

            {latestVitals ? (
                <>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Last recorded: {format(new Date(latestVitals.recordedAt), 'MMM d, yyyy h:mm a')}</span>
                        {latestVitals.recordedByName && (
                            <>
                                <span>•</span>
                                <span>by {latestVitals.recordedByName}</span>
                            </>
                        )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <VitalCard
                            icon={Activity}
                            label="Blood Pressure"
                            value={latestVitals.bloodPressureSystolic && latestVitals.bloodPressureDiastolic
                                ? `${latestVitals.bloodPressureSystolic}/${latestVitals.bloodPressureDiastolic}`
                                : undefined}
                            unit="mmHg"
                            color="bg-red-100 text-red-600"
                        />
                        <VitalCard
                            icon={Heart}
                            label="Heart Rate"
                            value={latestVitals.heartRate}
                            unit="bpm"
                            color="bg-pink-100 text-pink-600"
                        />
                        <VitalCard
                            icon={Thermometer}
                            label="Temperature"
                            value={latestVitals.temperature}
                            unit="°C"
                            color="bg-orange-100 text-orange-600"
                        />
                        <VitalCard
                            icon={Wind}
                            label="SpO2"
                            value={latestVitals.oxygenSaturation}
                            unit="%"
                            color="bg-blue-100 text-blue-600"
                        />
                        <VitalCard
                            icon={Scale}
                            label="Weight"
                            value={latestVitals.weight}
                            unit="kg"
                            color="bg-green-100 text-green-600"
                        />
                        <VitalCard
                            icon={Ruler}
                            label="Height"
                            value={latestVitals.height}
                            unit="cm"
                            color="bg-purple-100 text-purple-600"
                        />
                    </div>
                </>
            ) : (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="rounded-full bg-muted p-3 mb-3">
                            <Activity className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">No vitals recorded yet</p>
                        <p className="text-sm text-muted-foreground/70">Click Record Vitals to add vitals</p>
                    </CardContent>
                </Card>
            )}

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
                toast({ title: 'Success', description: 'Vitals recorded successfully' });
                reset();
                onOpenChange(false);
            },
            onError: () => {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to record vitals' });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Record Vital Signs</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Systolic BP</Label>
                            <Input {...register('bloodPressureSystolic')} placeholder="120" type="number" />
                        </div>
                        <div className="space-y-2">
                            <Label>Diastolic BP</Label>
                            <Input {...register('bloodPressureDiastolic')} placeholder="80" type="number" />
                        </div>
                        <div className="space-y-2">
                            <Label>Heart Rate</Label>
                            <Input {...register('heartRate')} placeholder="72" type="number" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Temperature (°C)</Label>
                            <Input {...register('temperature')} placeholder="37.0" type="number" step="0.1" />
                        </div>
                        <div className="space-y-2">
                            <Label>SpO2 (%)</Label>
                            <Input {...register('oxygenSaturation')} placeholder="98" type="number" />
                        </div>
                        <div className="space-y-2">
                            <Label>Respiratory Rate</Label>
                            <Input {...register('respiratoryRate')} placeholder="16" type="number" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Weight (kg)</Label>
                            <Input {...register('weight')} type="number" step="0.1" />
                        </div>
                        <div className="space-y-2">
                            <Label>Height (cm)</Label>
                            <Input {...register('height')} type="number" step="0.1" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Input {...register('notes')} placeholder="Any observations..." />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save Vitals'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
