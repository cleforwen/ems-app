import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    useSendOtp, useVerifyOtp, useRegister,
    SendOtpSchema, VerifyOtpSchema, RegisterSchema,
    SendOtpRequest, VerifyOtpRequest, RegisterRequest
} from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

type Step = 'EMAIL' | 'OTP' | 'REGISTER';

export default function LoginPage() {
    const [step, setStep] = useState<Step>('EMAIL');
    const [email, setEmail] = useState('');

    const { mutate: sendOtp, isPending: isSendingOtp } = useSendOtp();
    const { mutate: verifyOtp, isPending: isVerifyingOtp } = useVerifyOtp();
    const { mutate: register, isPending: isRegistering } = useRegister();

    const { toast } = useToast();
    const navigate = useNavigate();

    // Forms
    const emailForm = useForm<SendOtpRequest>({ resolver: zodResolver(SendOtpSchema) });
    const otpForm = useForm<VerifyOtpRequest>({ resolver: zodResolver(VerifyOtpSchema) });
    const registerForm = useForm<RegisterRequest>({ resolver: zodResolver(RegisterSchema) });

    const onSendOtp = (data: SendOtpRequest) => {
        setEmail(data.email);
        sendOtp(data, {
            onSuccess: () => {
                toast({ title: "OTP Sent", description: "Check your console (Dev Mode)" });
                setStep('OTP');
                otpForm.setValue('email', data.email);
            },
            onError: (err: any) => {
                toast({ variant: "destructive", title: "Error", description: err.response?.data?.error || "Failed to send OTP" });
            }
        });
    };

    const onVerifyOtp = (data: VerifyOtpRequest) => {
        verifyOtp(data, {
            onSuccess: (res) => {
                if (res.isNewUser) {
                    toast({ title: "New User", description: "Please complete registration" });
                    setStep('REGISTER');
                    registerForm.setValue('email', email);
                    registerForm.setValue('otp', data.otp);
                } else if (res.auth) {
                    toast({ title: "Success", description: "Logged in successfully" });
                    navigate(`/hospital/${res.auth.hospitalId}/dashboard`);
                }
            },
            onError: (err: any) => {
                toast({ variant: "destructive", title: "Verify Failed", description: err.response?.data?.error || "Invalid OTP" });
            }
        });
    };

    const onRegister = (data: RegisterRequest) => {
        register(data, {
            onSuccess: (res) => {
                toast({ title: "Welcome", description: "Hospital created successfully" });
                navigate(`/hospital/${res.hospitalId}/dashboard`);
            },
            onError: (err: any) => {
                toast({ variant: "destructive", title: "Registration Failed", description: err.response?.data?.error || "Failed to register" });
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>EMR System</CardTitle>
                    <CardDescription>
                        {step === 'EMAIL' && "Enter your email to login or sign up"}
                        {step === 'OTP' && "Enter the OTP sent to your email"}
                        {step === 'REGISTER' && "Setup your Hospital"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {step === 'EMAIL' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    placeholder="name@example.com"
                                    {...emailForm.register('email')}
                                    disabled={isSendingOtp}
                                />
                                {emailForm.formState.errors.email && (
                                    <p className="text-sm text-red-500">{emailForm.formState.errors.email.message}</p>
                                )}
                            </div>
                            <Button
                                className="w-full"
                                onClick={emailForm.handleSubmit(onSendOtp)}
                                disabled={isSendingOtp}
                            >
                                {isSendingOtp ? 'Sending...' : 'Continue with email'}
                            </Button>
                        </div>
                    )}

                    {step === 'OTP' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="otp">One-Time Password</Label>
                                <Input
                                    id="otp"
                                    placeholder="123456"
                                    maxLength={6}
                                    {...otpForm.register('otp')}
                                    disabled={isVerifyingOtp}
                                />
                                {otpForm.formState.errors.otp && (
                                    <p className="text-sm text-red-500">{otpForm.formState.errors.otp.message}</p>
                                )}
                            </div>
                            <Button
                                className="w-full"
                                onClick={otpForm.handleSubmit(onVerifyOtp)}
                                disabled={isVerifyingOtp}
                            >
                                {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                            </Button>
                            <Button variant="ghost" className="w-full" onClick={() => setStep('EMAIL')}>Back to Email</Button>
                        </div>
                    )}

                    {step === 'REGISTER' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="hospitalName">Hospital Name</Label>
                                <Input
                                    id="hospitalName"
                                    placeholder="St. Mary's Hospital"
                                    {...registerForm.register('hospitalName')}
                                    disabled={isRegistering}
                                />
                                {registerForm.formState.errors.hospitalName && (
                                    <p className="text-sm text-red-500">{registerForm.formState.errors.hospitalName.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name (Optional)</Label>
                                <Input
                                    id="firstName"
                                    placeholder="John"
                                    {...registerForm.register('firstName')}
                                    disabled={isRegistering}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name (Optional)</Label>
                                <Input
                                    id="lastName"
                                    placeholder="Doe"
                                    {...registerForm.register('lastName')}
                                    disabled={isRegistering}
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={registerForm.handleSubmit(onRegister)}
                                disabled={isRegistering}
                            >
                                {isRegistering ? 'Creating Workspace...' : 'Create & Login'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
