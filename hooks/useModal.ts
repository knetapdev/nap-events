'use client';

import { useState, useCallback } from 'react';

export function useModal<T = any>() {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState<T | null>(null);

    const onOpen = useCallback((modalData?: T) => {
        if (modalData !== undefined) {
            setData(modalData);
        }
        setIsOpen(true);
    }, []);

    const onClose = useCallback(() => {
        setIsOpen(false);
        setData(null);
    }, []);

    const toggle = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    return {
        isOpen,
        data,
        onOpen,
        onClose,
        toggle,
        setData,
    };
}

export type ModalStore<T> = ReturnType<typeof useModal<T>>;
