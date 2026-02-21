import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdatePatient, Patient } from '@/hooks/usePatients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

const schema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    active: z.boolean().optional(),
});

type EditPatientFormValues = z.infer<typeof schema>;

interface EditPatientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patient: Patient | null;
}

export function EditPatientDialog({ open, onOpenChange, patient }: EditPatientDialogProps) {
    const { mutate: updatePatient, isPending } = useUpdatePatient();
    const { toast } = useToast();

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<EditPatientFormValues>({
        resolver: zodResolver(schema),
    });

    const activeWatch = watch('active');

    useEffect(() => {
        if (patient && open) {
            reset({
                firstName: patient.firstName,
                lastName: patient.lastName,
                dateOfBirth: patient.dateOfBirth,
                gender: patient.gender,
                phone: patient.phone || '',
                email: patient.email || '',
                address: patient.address || '',
                active: patient.active,
            });
        }
    }, [patient, open, reset]);

    const onSubmit = (data: EditPatientFormValues) => {
        if (!patient) return;

        const cleanedData = {
            ...data,
            phone: data.phone || undefined,
            email: data.email || undefined,
            address: data.address || undefined,
        };

        updatePatient({ id: patient.id, data: cleanedData }, {
            onSuccess: () => {
                toast({ title: "Success", description: "Patient updated successfully" });
                onOpenChange(false);
            },
            onError: (error: any) => {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error.response?.data?.error || "Failed to update patient"
                });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Patient</DialogTitle>
                    <DialogDescription>
                        Modify {patient?.firstName} {patient?.lastName}'s details here.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-firstName" className="text-right">First Name</Label>
                            <Input id="edit-firstName" className="col-span-3" {...register('firstName')} />
                        </div>
                        {errors.firstName && <p className="text-xs text-red-500 text-right">{errors.firstName.message}</p>}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-lastName" className="text-right">Last Name</Label>
                            <Input id="edit-lastName" className="col-span-3" {...register('lastName')} />
                        </div>
                        {errors.lastName && <p className="text-xs text-red-500 text-right">{errors.lastName.message}</p>}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-dob" className="text-right">DOB</Label>
                            <Input id="edit-dob" type="date" className="col-span-3" {...register('dateOfBirth')} />
                        </div>
                        {errors.dateOfBirth && <p className="text-xs text-red-500 text-right">{errors.dateOfBirth.message}</p>}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-gender" className="text-right">Gender</Label>
                            <select
                                id="edit-gender"
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...register('gender')}
                            >
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-phone" className="text-right">Phone</Label>
                            <Input id="edit-phone" className="col-span-3" {...register('phone')} />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-email" className="text-right">Email</Label>
                            <Input id="edit-email" type="email" className="col-span-3" {...register('email')} />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4 mt-2">
                            <Label htmlFor="edit-active" className="text-right">Active Status</Label>
                            <div className="col-span-3 flex items-center space-x-2">
                                <Switch
                                    id="edit-active"
                                    checked={activeWatch}
                                    onCheckedChange={(checked: boolean) => setValue('active', checked, { shouldValidate: true })}
                                />
                                <span className="text-sm text-muted-foreground">{activeWatch ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
