import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNotes, useCreateNote, useUpdateNote, CreateNoteRequest } from '../../../hooks/useNotes';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, User, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

export function NotesList({ patientId }: { patientId: string }) {
    const { data: notes, isLoading } = useNotes(patientId);
    const [open, setOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<{ id: number; content: string } | null>(null);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-foreground">Clinical Notes</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-foreground">Clinical Notes</h3>
                <Button size="sm" onClick={() => setOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Note
                </Button>
            </div>

            {notes?.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="rounded-full bg-muted p-3 mb-3">
                            <Plus className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">No notes recorded yet</p>
                        <p className="text-sm text-muted-foreground/70">Click Add Note to create one</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {notes?.map((note) => (
                        <Card key={note.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <User className="h-4 w-4" />
                                        <span>{note.createdByName || 'Unknown'}</span>
                                        <span className="text-muted-foreground/50">•</span>
                                        <Clock className="h-4 w-4" />
                                        <span>{format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingNote({ id: note.id, content: note.content })}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-foreground whitespace-pre-wrap">{note.content}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <AddNoteDialog open={open} onOpenChange={setOpen} patientId={patientId} />
            {editingNote && (
                <EditNoteDialog
                    open={!!editingNote}
                    onOpenChange={(open) => !open && setEditingNote(null)}
                    note={editingNote}
                    patientId={patientId}
                />
            )}
        </div>
    );
}

function AddNoteDialog({ open, onOpenChange, patientId }: { open: boolean; onOpenChange: (o: boolean) => void; patientId: string }) {
    const { mutate: createNote, isPending } = useCreateNote(patientId);
    const { toast } = useToast();
    const { register, handleSubmit, reset } = useForm<CreateNoteRequest>();

    const onSubmit = (data: CreateNoteRequest) => {
        createNote(data, {
            onSuccess: () => {
                toast({ title: 'Success', description: 'Note added successfully' });
                reset();
                onOpenChange(false);
            },
            onError: () => {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to add note' });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add Clinical Note</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Textarea
                            {...register('content', { required: true })}
                            placeholder="Enter clinical notes here..."
                            className="min-h-[200px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Saving...' : 'Save Note'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditNoteDialog({
    open,
    onOpenChange,
    note,
    patientId
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    note: { id: number; content: string };
    patientId: string;
}) {
    const { mutate: updateNote, isPending } = useUpdateNote(patientId);
    const { toast } = useToast();
    const { register, handleSubmit } = useForm<CreateNoteRequest>();

    const onSubmit = (data: CreateNoteRequest) => {
        updateNote({ noteId: note.id, data }, {
            onSuccess: () => {
                toast({ title: 'Success', description: 'Note updated successfully' });
                onOpenChange(false);
            },
            onError: () => {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to update note' });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Note</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Textarea
                            {...register('content', { required: true })}
                            defaultValue={note.content}
                            className="min-h-[200px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Saving...' : 'Update Note'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
