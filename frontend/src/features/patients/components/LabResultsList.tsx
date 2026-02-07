import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLabResults, useCreateLabResult, CreateLabResultRequest } from '../../../hooks/useMedicalRecords';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/simple-select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

export function LabResultsList({ patientId }: { patientId: string }) {
    const { data: results, isLoading } = useLabResults(patientId);
    const [open, setOpen] = useState(false);

    if (isLoading) return <div>Loading lab results...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Lab Results</h3>
                <Button size="sm" onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Lab Result
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Test Name</TableHead>
                            <TableHead>Result</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Range</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">No lab results recorded.</TableCell>
                            </TableRow>
                        ) : (
                            results?.map((res) => (
                                <TableRow key={res.id}>
                                    <TableCell className="font-medium">
                                        {res.testName}
                                        {res.testCode && <span className="text-xs text-muted-foreground ml-2">({res.testCode})</span>}
                                    </TableCell>
                                    <TableCell>{res.result}</TableCell>
                                    <TableCell>{res.unit || '-'}</TableCell>
                                    <TableCell>{res.referenceRange || '-'}</TableCell>
                                    <TableCell>{new Date(res.performedAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={res.status === 'CRITICAL' ? 'destructive' : res.status === 'ABNORMAL' ? 'secondary' : 'default'}>
                                            {res.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AddLabResultDialog open={open} onOpenChange={setOpen} patientId={patientId} />
        </div>
    );
}

function AddLabResultDialog({ open, onOpenChange, patientId }: { open: boolean; onOpenChange: (o: boolean) => void; patientId: string }) {
    const { mutate: createLabResult, isPending } = useCreateLabResult(patientId);
    const { toast } = useToast();
    const { register, handleSubmit, reset } = useForm<CreateLabResultRequest>();

    const onSubmit = (data: CreateLabResultRequest) => {
        createLabResult(data, {
            onSuccess: () => {
                toast({ title: 'Success', description: 'Lab result added' });
                reset();
                onOpenChange(false);
            },
            onError: () => {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to add lab result' });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader><DialogTitle>Add Lab Result</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Test Name</Label>
                            <Input {...register('testName', { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Test Code</Label>
                            <Input {...register('testCode')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Result</Label>
                            <Input {...register('result', { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Perfored At</Label>
                            <Input type="datetime-local" {...register('performedAt', { required: true })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Unit</Label>
                            <Input {...register('unit')} />
                        </div>
                        <div className="space-y-2">
                            <Label>Reference Range</Label>
                            <Input {...register('referenceRange')} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select {...register('status')}>
                            <option value="NORMAL">Normal</option>
                            <option value="ABNORMAL">Abnormal</option>
                            <option value="CRITICAL">Critical</option>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Input {...register('notes')} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
