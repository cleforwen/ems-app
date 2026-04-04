import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useLabResults, useCreateLabResultWithImage, CreateLabResultRequest } from '../../../hooks/useMedicalRecords';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/simple-select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, FlaskConical, Calendar, User, ImageIcon, Upload, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/utils';
import { ImageViewer } from '@/components/ui/image-viewer';

const STATUS_CONFIG = {
    NORMAL: { label: 'Normal', color: 'bg-green-100 text-green-700 border-green-200' },
    ABNORMAL: { label: 'Abnormal', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    CRITICAL: { label: 'Critical', color: 'bg-red-100 text-red-700 border-red-200' },
} as const;

export function LabResultsList({ patientId }: { patientId: string }) {
    const { data: results, isLoading } = useLabResults(patientId);
    const [open, setOpen] = useState(false);
    const [viewingImage, setViewingImage] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-foreground">Lab Results</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 bg-muted/50 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    const criticalResults = results?.filter(r => r.status === 'CRITICAL') || [];
    const otherResults = results?.filter(r => r.status !== 'CRITICAL') || [];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-foreground">Lab Results</h3>
                <Button size="sm" onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Lab Result
                </Button>
            </div>

            {results?.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="rounded-full bg-muted p-3 mb-3">
                            <FlaskConical className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">No lab results recorded</p>
                        <p className="text-sm text-muted-foreground/70">Click Add Lab Result to start</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {criticalResults.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-red-600 mb-3">Critical ({criticalResults.length})</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {criticalResults.map((res) => (
                                    <LabResultCard key={res.id} result={res} onViewImage={() => res.imageUrl && setViewingImage(res.imageUrl)} />
                                ))}
                            </div>
                        </div>
                    )}
                    {otherResults.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Results ({otherResults.length})</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {otherResults.map((res) => (
                                    <LabResultCard key={res.id} result={res} onViewImage={() => res.imageUrl && setViewingImage(res.imageUrl)} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <AddLabResultDialog open={open} onOpenChange={setOpen} patientId={patientId} />
            <ImageViewer src={viewingImage} open={!!viewingImage} onOpenChange={(o) => !o && setViewingImage(null)} />
        </div>
    );
}

function LabResultCard({ result, onViewImage }: { result: { id: number; testName: string; testCode?: string; result: string; unit?: string; referenceRange?: string; status?: 'NORMAL' | 'ABNORMAL' | 'CRITICAL'; performedAt: string; orderedByName?: string; notes?: string; imageUrl?: string }; onViewImage?: () => void }) {
    const statusConfig = STATUS_CONFIG[result.status || 'NORMAL'];
    const isOutOfRange = result.referenceRange && (parseFloat(result.result) < parseFloat(result.referenceRange.split('-')[0]) || parseFloat(result.result) > parseFloat(result.referenceRange.split('-')[1]));

    return (
        <Card className={cn('transition-opacity', result.status === 'CRITICAL' && 'border-red-200 bg-red-50/50')}>
            <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className={cn('p-2 rounded-lg', result.status === 'CRITICAL' ? 'bg-red-100 text-red-600' : result.status === 'ABNORMAL' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600')}>
                            <FlaskConical className="h-4 w-4" />
                        </div>
                        <Badge variant="outline" className={cn('text-xs', statusConfig.color)}>
                            {statusConfig.label}
                        </Badge>
                    </div>
                    {result.imageUrl && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onViewImage}>
                            <ImageIcon className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>

                <h4 className="font-semibold mb-1">{result.testName}</h4>
                {result.testCode && (
                    <p className="text-sm text-muted-foreground">{result.testCode}</p>
                )}

                <div className="mt-3 flex items-baseline gap-2">
                    <span className={cn('text-2xl font-bold', isOutOfRange && 'text-amber-600')}>
                        {result.result}
                    </span>
                    {result.unit && (
                        <span className="text-sm text-muted-foreground">{result.unit}</span>
                    )}
                </div>

                {result.referenceRange && (
                    <p className="text-xs text-muted-foreground mt-1">
                        Ref: {result.referenceRange}
                    </p>
                )}

                <div className="space-y-1 text-sm text-muted-foreground mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(new Date(result.performedAt), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                    {result.orderedByName && (
                        <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5" />
                            <span>{result.orderedByName}</span>
                        </div>
                    )}
                    {result.notes && (
                        <p className="text-xs text-muted-foreground mt-2">{result.notes}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function AddLabResultDialog({ open, onOpenChange, patientId }: { open: boolean; onOpenChange: (o: boolean) => void; patientId: string }) {
    const { mutate: createLabResult, isPending } = useCreateLabResultWithImage(patientId);
    const { toast } = useToast();
    const { register, handleSubmit, reset } = useForm<CreateLabResultRequest>();
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const onSubmit = (data: CreateLabResultRequest) => {
        createLabResult({ data, image: selectedImage || undefined }, {
            onSuccess: () => {
                toast({ title: 'Success', description: 'Lab result added' });
                reset();
                clearImage();
                onOpenChange(false);
            },
            onError: () => {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to add lab result' });
            }
        });
    };

    const handleClose = (isOpen: boolean) => {
        if (!isOpen) {
            reset();
            clearImage();
        }
        onOpenChange(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader><DialogTitle>Add Lab Result</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Test Name</Label>
                            <Input {...register('testName', { required: true })} placeholder="e.g., Hemoglobin A1c" />
                        </div>
                        <div className="space-y-2">
                            <Label>Test Code</Label>
                            <Input {...register('testCode')} placeholder="e.g., 85025" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Result</Label>
                            <Input {...register('result', { required: true })} placeholder="e.g., 5.4" />
                        </div>
                        <div className="space-y-2">
                            <Label>Perfored At</Label>
                            <Input type="datetime-local" {...register('performedAt', { required: true })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Unit</Label>
                            <Input {...register('unit')} placeholder="e.g., %" />
                        </div>
                        <div className="space-y-2">
                            <Label>Reference Range</Label>
                            <Input {...register('referenceRange')} placeholder="e.g., 4.0-5.6" />
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
                        <Label>Report Image (optional)</Label>
                        <div
                            className={cn(
                                'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
                                imagePreview ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                            )}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                            {imagePreview ? (
                                <div className="relative">
                                    <img src={imagePreview} alt="Preview" className="max-h-32 mx-auto rounded" />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-6 w-6"
                                        onClick={(e) => { e.stopPropagation(); clearImage(); }}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-muted-foreground">
                                    <Upload className="h-8 w-8 mx-auto mb-2" />
                                    <p className="text-sm">Click to upload image</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Input {...register('notes')} placeholder="Additional notes..." />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleClose(false)}>Cancel</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
