'use client';

import { useState, useCallback } from 'react';

/**
 * Custom hook to manage modal state across the application.
 * Handles opening, closing, and storing data associated with the modal.
 */
export function useModal<T = any>() {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState<T | null>(null);

    /**
     * Opens the modal and optionally sets its data.
     */
    const onOpen = useCallback((modalData?: T) => {
        if (modalData !== undefined) {
            setData(modalData);
        }
        setIsOpen(true);
    }, []);

    /**
     * Closes the modal and resets its data.
     */
    const onClose = useCallback(() => {
        setIsOpen(false);
        setData(null);
    }, []);

    /**
   * Toggles the modal state.
   */
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
