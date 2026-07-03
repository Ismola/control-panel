import { useEffect, useState } from 'react';
import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from '@/components/ui/toast';

export type ToastData = {
    id: string;
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
};

let toastCounter = 0;
const listeners: Array<(toast: ToastData) => void> = [];

export function toast({ title, description, variant = 'default' }: Omit<ToastData, 'id'>) {
    const id = `toast-${++toastCounter}`;
    const toastData: ToastData = { id, title, description, variant };
    listeners.forEach((listener) => listener(toastData));
}

export function Toaster() {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    useEffect(() => {
        const listener = (toast: ToastData) => {
            setToasts((prev) => [...prev, toast]);
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== toast.id));
            }, 5000);
        };

        listeners.push(listener);
        return () => {
            const index = listeners.indexOf(listener);
            if (index > -1) listeners.splice(index, 1);
        };
    }, []);

    return (
        <ToastProvider>
            {toasts.map((t) => (
                <Toast key={t.id} variant={t.variant}>
                    <div className="grid gap-1">
                        {t.title && <ToastTitle>{t.title}</ToastTitle>}
                        {t.description && <ToastDescription>{t.description}</ToastDescription>}
                    </div>
                    <ToastClose />
                </Toast>
            ))}
            <ToastViewport />
        </ToastProvider>
    );
}
