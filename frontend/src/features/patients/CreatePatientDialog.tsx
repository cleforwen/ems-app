import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePatient, CreatePatientRequest } from '@/hooks/usePatients';
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

const schema = z.object({
    mrn: z.string().min(1, 'MRN is required'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
});

interface CreatePatientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreatePatientDialog({ open, onOpenChange }: CreatePatientDialogProps) {
    const { mutate: createPatient, isPending } = useCreatePatient();
    const { toast } = useToast();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreatePatientRequest>({
        resolver: zodResolver(schema),
        defaultValues: {
            gender: 'MALE'
        }
    });

    const onSubmit = (data: CreatePatientRequest) => {
        createPatient(data, {
            onSuccess: () => {
                toast({ title: "Success", description: "Patient created successfully" });
                reset();
                onOpenChange(false);
            },
            onError: (error: any) => {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error.response?.data?.error || "Failed to create patient"
                });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Patient</DialogTitle>
                    <DialogDescription>
                        Enter the patient's details here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="mrn" className="text-right">MRN</Label>
                            <Input id="mrn" className="col-span-3" {...register('mrn')} />
                        </div>
                        {errors.mrn && <p className="text-xs text-red-500 text-right">{errors.mrn.message}</p>}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="firstName" className="text-right">First Name</Label>
                            <Input id="firstName" className="col-span-3" {...register('firstName')} />
                        </div>
                        {errors.firstName && <p className="text-xs text-red-500 text-right">{errors.firstName.message}</p>}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lastName" className="text-right">Last Name</Label>
                            <Input id="lastName" className="col-span-3" {...register('lastName')} />
                        </div>
                        {errors.lastName && <p className="text-xs text-red-500 text-right">{errors.lastName.message}</p>}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dob" className="text-right">DOB</Label>
                            <Input id="dob" type="date" className="col-span-3" {...register('dateOfBirth')} />
                        </div>
                        {errors.dateOfBirth && <p className="text-xs text-red-500 text-right">{errors.dateOfBirth.message}</p>}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="gender" className="text-right">Gender</Label>
                            <select
                                id="gender"
                                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...register('gender')}
                            >
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">Phone</Label>
                            <Input id="phone" className="col-span-3" {...register('phone')} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Saving...' : 'Save Patient'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
