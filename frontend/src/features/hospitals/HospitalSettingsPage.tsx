import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useHospital, useUpdateHospital, UpdateHospitalRequest } from '../../hooks/useHospitals';
import { useGenerateSeedData } from '../../hooks/useSeed';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { FlaskConical, Loader2 } from 'lucide-react';

export default function HospitalSettingsPage() {
    const { data: hospital, isLoading, error } = useHospital();
    const { mutate: updateHospital, isPending } = useUpdateHospital();
    const { mutate: generateSeedData, isPending: isSeedPending } = useGenerateSeedData();
    const { toast } = useToast();

    const handleGenerateSeedData = () => {
        generateSeedData(undefined, {
            onSuccess: (result) => {
                toast({
                    title: '✅ Mock Data Generated',
                    description: `Created ${result.staffCreated} staff, ${result.patientsCreated} patients, and ${result.appointmentsCreated} appointments.`,
                });
            },
            onError: (error: any) => {
                toast({
                    variant: 'destructive',
                    title: 'Seed Failed',
                    description: error.response?.data?.error || 'Failed to generate mock data.',
                });
            },
        });
    };

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

            {/* ⚠️ TEMPORARY: Developer Tools — remove before production */}
            <Card className="max-w-2xl border-dashed border-orange-400/60 bg-orange-50/30 dark:bg-orange-950/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                        <FlaskConical className="h-5 w-5" />
                        Developer Tools
                        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600 dark:bg-orange-900/40 dark:text-orange-400">
                            TEMPORARY
                        </span>
                    </CardTitle>
                    <CardDescription>
                        Generate mock data for development and testing purposes. This will create
                        <strong> 5,000 patients</strong>, <strong>1,000 appointments</strong>, and
                        <strong> 200 staff members</strong> for your workspace.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row items-center justify-between rounded-lg border border-orange-200 bg-white p-4 dark:border-orange-800/40 dark:bg-transparent">
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium">Generate Mock Data</p>
                            <p className="text-xs text-muted-foreground">
                                This action may take 30–60 seconds to complete.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="border-orange-400 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                            onClick={handleGenerateSeedData}
                            disabled={isSeedPending}
                        >
                            {isSeedPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <FlaskConical className="mr-2 h-4 w-4" />
                                    Generate Mock Data
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
