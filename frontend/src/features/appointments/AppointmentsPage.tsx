import { useState, useMemo } from 'react';
import { useAppointments, Appointment, AppointmentStatus, useUpdateAppointmentStatus, useDeleteAppointment } from '@/hooks/useAppointments';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, CalendarDays, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { CreateAppointmentDialog } from './CreateAppointmentDialog';
import { useToast } from '@/components/ui/use-toast';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    isToday,
} from 'date-fns';

const STATUS_COLORS: Record<AppointmentStatus, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800',
    CHECKED_IN: 'bg-indigo-100 text-indigo-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    NO_SHOW: 'bg-gray-100 text-gray-800',
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
    SCHEDULED: 'Scheduled',
    CHECKED_IN: 'Checked In',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    NO_SHOW: 'No Show',
};

const TYPE_LABELS: Record<string, string> = {
    CONSULTATION: 'Consultation',
    FOLLOW_UP: 'Follow-up',
    ROUTINE_CHECK: 'Routine Check',
    EMERGENCY: 'Emergency',
    LAB_REVIEW: 'Lab Review',
};

const NEXT_STATUSES: Record<AppointmentStatus, AppointmentStatus | null> = {
    SCHEDULED: 'CHECKED_IN',
    CHECKED_IN: 'IN_PROGRESS',
    IN_PROGRESS: 'COMPLETED',
    COMPLETED: null,
    CANCELLED: null,
    NO_SHOW: null,
};

export default function AppointmentsPage() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [view, setView] = useState<'calendar' | 'list'>('list');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('');

    const { data: appointments, isLoading, isError } = useAppointments();
    const { mutate: updateStatus } = useUpdateAppointmentStatus();
    const { mutate: deleteAppointment } = useDeleteAppointment();
    const { toast } = useToast();

    const filteredAppointments = useMemo(() => {
        let list = appointments || [];
        if (statusFilter) {
            list = list.filter(a => a.status === statusFilter);
        }
        if (selectedDate) {
            list = list.filter(a => isSameDay(new Date(a.appointmentDate), selectedDate));
        }
        return list.sort((a, b) => {
            const dateCompare = a.appointmentDate.localeCompare(b.appointmentDate);
            if (dateCompare !== 0) return dateCompare;
            return a.startTime.localeCompare(b.startTime);
        });
    }, [appointments, statusFilter, selectedDate]);

    // Calendar logic
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const appointmentsByDate = useMemo(() => {
        const map = new Map<string, Appointment[]>();
        (appointments || []).forEach(a => {
            const key = a.appointmentDate;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(a);
        });
        return map;
    }, [appointments]);

    const handleStatusAdvance = (appointment: Appointment) => {
        const next = NEXT_STATUSES[appointment.status];
        if (!next) return;
        updateStatus({ id: appointment.id, status: next }, {
            onSuccess: () => {
                toast({ title: "Status Updated", description: `Appointment marked as ${STATUS_LABELS[next]}` });
            },
            onError: () => {
                toast({ variant: "destructive", title: "Error", description: "Failed to update status" });
            }
        });
    };

    const handleCancel = (id: number) => {
        deleteAppointment(id, {
            onSuccess: () => {
                toast({ title: "Cancelled", description: "Appointment has been cancelled" });
            },
            onError: () => {
                toast({ variant: "destructive", title: "Error", description: "Failed to cancel appointment" });
            }
        });
    };

    const selectClass = "flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

    if (isLoading) return <div className="p-6">Loading appointments...</div>;
    if (isError) return <div className="p-6 text-red-500">Error loading appointments</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Schedule Appointment
                </Button>
            </div>

            <CreateAppointmentDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

            {/* Controls */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex rounded-md border">
                    <Button
                        variant={view === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => { setView('list'); setSelectedDate(null); }}
                        className="rounded-r-none"
                    >
                        <List className="mr-1 h-4 w-4" /> List
                    </Button>
                    <Button
                        variant={view === 'calendar' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setView('calendar')}
                        className="rounded-l-none"
                    >
                        <CalendarDays className="mr-1 h-4 w-4" /> Calendar
                    </Button>
                </div>

                <select
                    className={selectClass}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    {Object.entries(STATUS_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                    ))}
                </select>

                {selectedDate && (
                    <Button variant="outline" size="sm" onClick={() => setSelectedDate(null)}>
                        Clear date filter: {format(selectedDate, 'MMM d, yyyy')}
                    </Button>
                )}
            </div>

            {/* Calendar View */}
            {view === 'calendar' && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="bg-background p-2 text-center text-xs font-medium text-muted-foreground">
                                    {day}
                                </div>
                            ))}
                            {calendarDays.map(day => {
                                const dateKey = format(day, 'yyyy-MM-dd');
                                const dayAppts = appointmentsByDate.get(dateKey) || [];
                                const isCurrentMonth = isSameMonth(day, currentMonth);
                                const isSelected = selectedDate && isSameDay(day, selectedDate);

                                return (
                                    <div
                                        key={dateKey}
                                        className={`bg-background min-h-[80px] p-1.5 cursor-pointer transition-colors hover:bg-accent/50 ${!isCurrentMonth ? 'opacity-40' : ''} ${isSelected ? 'ring-2 ring-primary ring-inset' : ''} ${isToday(day) ? 'bg-primary/5' : ''}`}
                                        onClick={() => setSelectedDate(isSameDay(day, selectedDate || new Date(0)) ? null : day)}
                                    >
                                        <div className={`text-xs font-medium mb-1 ${isToday(day) ? 'text-primary font-bold' : ''}`}>
                                            {format(day, 'd')}
                                        </div>
                                        {dayAppts.length > 0 && (
                                            <div className="space-y-0.5">
                                                {dayAppts.slice(0, 3).map(a => (
                                                    <div
                                                        key={a.id}
                                                        className={`text-[10px] px-1 py-0.5 rounded truncate ${STATUS_COLORS[a.status]}`}
                                                    >
                                                        {a.startTime.substring(0, 5)} {a.patientName.split(' ')[0]}
                                                    </div>
                                                ))}
                                                {dayAppts.length > 3 && (
                                                    <div className="text-[10px] text-muted-foreground px-1">
                                                        +{dayAppts.length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* List View / Filtered Results */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Patient</TableHead>
                            <TableHead>Doctor</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAppointments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                    No appointments found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAppointments.map((appt) => (
                                <TableRow key={appt.id}>
                                    <TableCell className="font-medium">
                                        {format(new Date(appt.appointmentDate), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        {appt.startTime.substring(0, 5)} – {appt.endTime.substring(0, 5)}
                                    </TableCell>
                                    <TableCell>{appt.patientName}</TableCell>
                                    <TableCell>Dr. {appt.doctorName}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{TYPE_LABELS[appt.type] || appt.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[appt.status]}`}>
                                            {STATUS_LABELS[appt.status]}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {appt.reason || '—'}
                                    </TableCell>
                                    <TableCell className="text-right space-x-1">
                                        {NEXT_STATUSES[appt.status] && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleStatusAdvance(appt)}
                                            >
                                                → {STATUS_LABELS[NEXT_STATUSES[appt.status]!]}
                                            </Button>
                                        )}
                                        {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700"
                                                onClick={() => handleCancel(appt.id)}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
