import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Users, Activity, Calendar, Clock, FlaskConical } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { useHospital } from "@/hooks/useHospitals";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";

const STATUS_COLORS: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800',
    CHECKED_IN: 'bg-indigo-100 text-indigo-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    NO_SHOW: 'bg-gray-100 text-gray-800',
};

const LAB_STATUS_COLORS: Record<string, string> = {
    NORMAL: 'bg-green-100 text-green-800',
    ABNORMAL: 'bg-yellow-100 text-yellow-800',
    CRITICAL: 'bg-red-100 text-red-800',
};

const TYPE_LABELS: Record<string, string> = {
    CONSULTATION: 'Consultation',
    FOLLOW_UP: 'Follow-up',
    ROUTINE_CHECK: 'Routine Check',
    EMERGENCY: 'Emergency',
    LAB_REVIEW: 'Lab Review',
};

export default function DashboardPage() {
    const { data: dashboard, isLoading, isError } = useDashboard();
    const { data: hospital, isLoading: isHospitalLoading } = useHospital();
    const navigate = useNavigate();
    const { hospitalId } = useParams();

    if (isLoading || isHospitalLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i}>
                            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Loading...</CardTitle></CardHeader>
                            <CardContent><div className="h-8 bg-muted animate-pulse rounded" /></CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Failed to load dashboard data.</p></CardContent></Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/hospital/${hospitalId}/patients`)}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboard?.totalPatients ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Active patients</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Diagnoses</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboard?.totalActiveDiagnoses ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Active &amp; chronic</p>
                    </CardContent>
                </Card>

                {hospital?.appointmentsEnabled !== false && (
                    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/hospital/${hospitalId}/appointments`)}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dashboard?.appointmentsToday ?? 0}</div>
                            <p className="text-xs text-muted-foreground">{dashboard?.appointmentsRemaining ?? 0} remaining</p>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Lab Results</CardTitle>
                        <FlaskConical className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {dashboard?.recentLabResults?.filter(l => l.status === 'ABNORMAL' || l.status === 'CRITICAL').length ?? 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Abnormal / critical</p>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Grid */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
                {/* Upcoming Appointments */}
                {hospital?.appointmentsEnabled !== false && (
                    <Card className="col-span-1 md:col-span-2 xl:col-span-4">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-4 w-4" /> Upcoming Appointments
                            </CardTitle>
                            <button
                                className="text-sm text-primary hover:underline"
                                onClick={() => navigate(`/hospital/${hospitalId}/appointments`)}
                            >
                                View all →
                            </button>
                        </CardHeader>
                        <CardContent>
                            {(!dashboard?.upcomingAppointments || dashboard.upcomingAppointments.length === 0) ? (
                                <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Patient</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {dashboard.upcomingAppointments.map(appt => (
                                            <TableRow key={appt.id}>
                                                <TableCell className="font-medium">
                                                    {format(new Date(appt.appointmentDate), 'MMM d')}
                                                </TableCell>
                                                <TableCell>{appt.startTime.substring(0, 5)}</TableCell>
                                                <TableCell>{appt.patientName}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{TYPE_LABELS[appt.type] || appt.type}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[appt.status] || ''}`}>
                                                        {appt.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* My Patients / Recent Lab Results */}
                <Card className={`col-span-1 md:col-span-2 ${hospital?.appointmentsEnabled !== false ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {dashboard?.myPatients && dashboard.myPatients.length > 0
                                ? <><Users className="h-4 w-4" /> My Patients</>
                                : <><FlaskConical className="h-4 w-4" /> Recent Lab Results</>
                            }
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dashboard?.myPatients && dashboard.myPatients.length > 0 ? (
                            <div className="space-y-3">
                                {dashboard.myPatients.slice(0, 8).map(patient => (
                                    <div
                                        key={patient.id}
                                        className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                                        onClick={() => navigate(`/hospital/${hospitalId}/patients/${patient.id}`)}
                                    >
                                        <div>
                                            <p className="text-sm font-medium">{patient.firstName} {patient.lastName}</p>
                                            <p className="text-xs text-muted-foreground">MRN: {patient.mrn}</p>
                                        </div>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${patient.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {patient.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            dashboard?.recentLabResults && dashboard.recentLabResults.length > 0 ? (
                                <div className="space-y-3">
                                    {dashboard.recentLabResults.slice(0, 6).map(lab => (
                                        <div key={lab.id} className="flex items-center justify-between p-2 rounded-md border">
                                            <div>
                                                <p className="text-sm font-medium">{lab.testName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {lab.result} {lab.unit || ''}
                                                </p>
                                            </div>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${LAB_STATUS_COLORS[lab.status] || ''}`}>
                                                {lab.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No recent lab results.</p>
                            )
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
