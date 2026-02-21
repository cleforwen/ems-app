import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useHospital, useUpdateHospital, UpdateHospitalRequest } from '../../hooks/useHospitals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function HospitalSettingsPage() {
    const { data: hospital, isLoading, error } = useHospital();
    const { mutate: updateHospital, isPending } = useUpdateHospital();
    const { toast } = useToast();

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<UpdateHospitalRequest>();

    // Watch appointmentsEnabled to bind to switch value
    const appointmentsEnabled = watch('appointmentsEnabled');

    useEffect(() => {
        if (hospital) {
            reset(hospital);
        }
    }, [hospital, reset]);

    const onSubmit = (data: UpdateHospitalRequest) => {
        updateHospital(data, {
            onSuccess: () => {
                toast({
                    title: "Success",
                    description: "Hospital settings updated successfully",
                });
            },
            onError: (error: any) => {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error.response?.data?.error || "Failed to update settings",
                });
            }
        });
    };

    if (isLoading) return <div className="p-8">Loading settings...</div>;
    if (error) return <div className="p-8">Error loading settings</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Hospital Settings</h2>
                <p className="text-muted-foreground">Manage your hospital profile and details.</p>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Organization Details</CardTitle>
                    <CardDescription>Update your hospital's public information.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Hospital Name</Label>
                            <Input id="name" {...register('name', { required: "Name is required" })} />
                            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" {...register('address')} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" {...register('city')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input id="state" {...register('state')} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="zip">ZIP Code</Label>
                                <Input id="zip" {...register('zip')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" {...register('phone')} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...register('email')} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input id="website" {...register('website')} />
                        </div>

                        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Enable Appointments</Label>
                                <p className="text-sm text-muted-foreground">
                                    Turn on the appointments and scheduling feature for the hospital.
                                </p>
                            </div>
                            <Switch
                                checked={appointmentsEnabled ?? true}
                                onCheckedChange={(val) => setValue('appointmentsEnabled', val, { shouldDirty: true })}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
