import { useParams, useNavigate } from 'react-router-dom';
import { usePatient } from '../../hooks/usePatients';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/simple-tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

import { VitalsList } from './components/VitalsList';
import { AllergiesList } from './components/AllergiesList';
import { MedicationsList } from './components/MedicationsList';
import { DiagnosesList } from './components/DiagnosesList';
import { LabResultsList } from './components/LabResultsList';
import { NotesList } from './components/NotesList';

export default function PatientDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: patient, isLoading, error } = usePatient(id || '');

    if (isLoading) return <div className="p-8">Loading patient details...</div>;
    if (error || !patient) return <div className="p-8">Patient not found or error loading.</div>;

    const calculateAge = (dob: string) => {
        const diff = Date.now() - new Date(dob).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/patients')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{patient.firstName} {patient.lastName}</h2>
                    <p className="text-muted-foreground mr-4 inline-block">MRN: {patient.mrn}</p>
                    <p className="text-muted-foreground inline-block">
                        {patient.gender} • {calculateAge(patient.dateOfBirth)} yrs • DOB: {patient.dateOfBirth}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Contact Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div>
                            <span className="font-semibold block">Phone</span>
                            {patient.phone || '-'}
                        </div>
                        <div>
                            <span className="font-semibold block">Email</span>
                            {patient.email || '-'}
                        </div>
                        <div>
                            <span className="font-semibold block">Address</span>
                            {patient.address || '-'}
                        </div>
                        <div>
                            <span className="font-semibold block">Emergency Contact</span>
                            {patient.emergencyContact || '-'}
                        </div>
                        <div>
                            <span className="font-semibold block">Blood Type</span>
                            {patient.bloodType || '-'}
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-3">
                    <Tabs defaultValue="vitals">
                        <TabsList className="grid w-full grid-cols-6">
                            <TabsTrigger value="vitals">Vitals</TabsTrigger>
                            <TabsTrigger value="allergies">Allergies</TabsTrigger>
                            <TabsTrigger value="medications">Meds</TabsTrigger>
                            <TabsTrigger value="diagnoses">Dx</TabsTrigger>
                            <TabsTrigger value="labs">Labs</TabsTrigger>
                            <TabsTrigger value="notes">Notes</TabsTrigger>
                        </TabsList>

                        <div className="mt-4">
                            <TabsContent value="vitals">
                                <VitalsList patientId={id!} />
                            </TabsContent>
                            <TabsContent value="allergies">
                                <AllergiesList patientId={id!} />
                            </TabsContent>
                            <TabsContent value="medications">
                                <MedicationsList patientId={id!} />
                            </TabsContent>
                            <TabsContent value="diagnoses">
                                <DiagnosesList patientId={id!} />
                            </TabsContent>
                            <TabsContent value="labs">
                                <LabResultsList patientId={id!} />
                            </TabsContent>
                            <TabsContent value="notes">
                                <NotesList patientId={id!} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
