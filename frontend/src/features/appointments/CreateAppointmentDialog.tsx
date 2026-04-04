import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateAppointment, CreateAppointmentRequest } from '@/hooks/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import { useUsers } from '@/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

const schema = z.object({
    patientId: z.coerce.number().min(1, 'Patient is required'),
    doctorId: z.coerce.number().min(1, 'Doctor is required'),
    appointmentDate: z.string().min(1, 'Date is required'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    type: z.enum(['CONSULTATION', 'FOLLOW_UP', 'ROUTINE_CHECK', 'EMERGENCY', 'LAB_REVIEW']).optional(),
    reason: z.string().optional(),
    notes: z.string().optional(),
});

interface CreateAppointmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateAppointmentDialog({ open, onOpenChange }: CreateAppointmentDialogProps) {
    const { mutate: createAppointment, isPending } = useCreateAppointment();
    const { data: patientsResponse } = usePatients({ size: 1000 });
    const { data: usersResponse } = useUsers({ size: 1000 });
    const { toast } = useToast();

    const patients = patientsResponse?.data || [];
    const users = usersResponse?.data || [];
    const doctors = users.filter((u: { roles: string[]; active: boolean }) => u.roles.includes('DOCTOR') && u.active);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateAppointmentRequest>({
        resolver: zodResolver(schema),
        defaultValues: {
            type: 'CONSULTATION',
        }
    });

    const onSubmit = (data: CreateAppointmentRequest) => {
        createAppointment(data, {
            onSuccess: () => {
                toast({ title: "Success", description: "Appointment scheduled successfully" });
                reset();
                onOpenChange(false);
            },
            onError: (error: any) => {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error.response?.data?.message || error.response?.data?.error || "Failed to create appointment"
                });
            }
        });
    };

    const selectClass = "col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Schedule Appointment</DialogTitle>
                    <DialogDescription>
                        Fill in the appointment details. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="patientId" className="text-right">Patient</Label>
                            <select id="patientId" className={selectClass} {...register('patientId')}>
                                <option value="">Select patient...</option>
                                {patients.filter((p: { active: boolean }) => p.active).map((p: { id: number; lastName: string; firstName: string; mrn: string }) => (
                                    <option key={p.id} value={p.id}>
                                        {p.lastName}, {p.firstName} ({p.mrn})
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.patientId && <p className="text-xs text-red-500 text-right">{errors.patientId.message}</p>}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="doctorId" className="text-right">Doctor</Label>
                            <select id="doctorId" className={selectClass} {...register('doctorId')}>
                                <option value="">Select doctor...</option>
                                {doctors.map((d: { id: number; firstName: string; lastName: string }) => (
                                    <option key={d.id} value={d.id}>
                                        Dr. {d.lastName}, {d.firstName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.doctorId && <p className="text-xs text-red-500 text-right">{errors.doctorId.message}</p>}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="appointmentDate" className="text-right">Date</Label>
                            <Input id="appointmentDate" type="date" className="col-span-3" {...register('appointmentDate')} />
                        </div>
                        {errors.appointmentDate && <p className="text-xs text-red-500 text-right">{errors.appointmentDate.message}</p>}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="startTime" className="text-right">Start Time</Label>
                            <Input id="startTime" type="time" className="col-span-3" {...register('startTime')} />
                        </div>
                        {errors.startTime && <p className="text-xs text-red-500 text-right">{errors.startTime.message}</p>}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="endTime" className="text-right">End Time</Label>
                            <Input id="endTime" type="time" className="col-span-3" {...register('endTime')} />
                        </div>
                        {errors.endTime && <p className="text-xs text-red-500 text-right">{errors.endTime.message}</p>}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">Type</Label>
                            <select id="type" className={selectClass} {...register('type')}>
                                <option value="CONSULTATION">Consultation</option>
                                <option value="FOLLOW_UP">Follow-up</option>
                                <option value="ROUTINE_CHECK">Routine Check</option>
                                <option value="EMERGENCY">Emergency</option>
                                <option value="LAB_REVIEW">Lab Review</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="reason" className="text-right">Reason</Label>
                            <Textarea id="reason" className="col-span-3" placeholder="Reason for visit..." {...register('reason')} />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="notes" className="text-right">Notes</Label>
                            <Textarea id="notes" className="col-span-3" placeholder="Additional notes..." {...register('notes')} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Scheduling...' : 'Schedule Appointment'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
