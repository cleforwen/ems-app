import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePatients, Patient } from '@/hooks/usePatients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { CreatePatientDialog } from './CreatePatientDialog';
import { EditPatientDialog } from './EditPatientDialog';
import { Pagination } from '@/components/ui/pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';

export default function PatientsPage() {
    const navigate = useNavigate();
    const { hospitalId } = useParams();
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(20);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(0);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const { data: response, isLoading, isError } = usePatients({ page, size, search });
    const patients = response?.data;
    const total = response?.total ?? 0;
    const totalPages = response?.totalPages ?? 0;

    const isInitialLoading = isLoading && patients === undefined;

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    const handleEdit = (patient: Patient) => {
        setSelectedPatient(patient);
        setIsEditOpen(true);
    };

    const handleView = (patient: Patient) => {
        navigate(`/hospital/${hospitalId}/patients/${patient.id}`);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleSizeChange = (newSize: number) => {
        setSize(newSize);
        setPage(0);
    };

    if (isError) return <div>Error loading patients</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Patient
                </Button>
            </div>

            <CreatePatientDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
            <EditPatientDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                patient={selectedPatient}
            />

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search patients..."
                        className="pl-8"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>MRN</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>DOB</TableHead>
                            <TableHead>Gender</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isInitialLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    Loading patients...
                                </TableCell>
                            </TableRow>
                        ) : patients?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No patients found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            patients?.map((patient: Patient) => (
                                <TableRow key={patient.id}>
                                    <TableCell className="font-medium">{patient.mrn}</TableCell>
                                    <TableCell>{patient.lastName}, {patient.firstName}</TableCell>
                                    <TableCell>{format(new Date(patient.dateOfBirth), 'MMM d, yyyy')}</TableCell>
                                    <TableCell className="lowercase capitalize">{patient.gender}</TableCell>
                                    <TableCell>{patient.phone}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${patient.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {patient.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(patient)}>Edit</Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleView(patient)}>View</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Pagination
                page={page}
                size={size}
                total={total}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onSizeChange={handleSizeChange}
            />
        </div>
    );
}
