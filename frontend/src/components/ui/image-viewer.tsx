import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/utils';

interface ImageViewerProps {
    src: string | null;
    alt?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ImageViewer({ src, alt = 'Lab Result Image', open, onOpenChange }: ImageViewerProps) {
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);

    const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
    const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
    const handleRotate = () => setRotation((r) => (r + 90) % 360);
    const handleReset = () => {
        setScale(1);
        setRotation(0);
    };

    if (!src) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between pb-4 border-b">
                    <DialogTitle className="text-lg font-semibold">{alt}</DialogTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={handleZoomOut} className="h-8 w-8">
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(scale * 100)}%</span>
                        <Button variant="outline" size="icon" onClick={handleZoomIn} className="h-8 w-8">
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleRotate} className="h-8 w-8">
                            <RotateCw className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleReset} className="h-8 w-8 text-xs">
                            Reset
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto flex items-center justify-center bg-muted/50 rounded-lg min-h-[300px]">
                    <img
                        src={src}
                        alt={alt}
                        className={cn(
                            'max-w-full max-h-[70vh] object-contain transition-transform duration-200',
                            'shadow-lg rounded'
                        )}
                        style={{
                            transform: `scale(${scale}) rotate(${rotation}deg)`,
                        }}
                        onClick={handleZoomIn}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
