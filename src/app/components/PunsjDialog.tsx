import React, { createContext, useCallback, useContext, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Dialog, type DialogPopupProps } from '@navikt/ds-react';

type InteractionMode = 'blocking' | 'reference';

interface PunsjDialogProviderProps {
    rootElement: HTMLElement | null;
    defaultInteractionMode?: InteractionMode;
    children: React.ReactNode;
}

interface PunsjDialogProps extends Omit<
    DialogPopupProps,
    'children' | 'closeOnOutsideClick' | 'modal' | 'rootElement' | 'withBackdrop'
> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    interactionMode?: InteractionMode;
    children: React.ReactNode;
}

const PunsjDialogContext = createContext<HTMLElement | null>(null);
const PunsjDialogDefaultInteractionModeContext = createContext<InteractionMode>('blocking');
const PunsjDialogInteractionModeContext = createContext<InteractionMode>('blocking');
const PunsjDialogReferenceOverlayContext = createContext<(() => () => void) | null>(null);

const ReferenceOverlay = ({ rootElement }: { rootElement: HTMLElement }) =>
    createPortal(<div className="journalpost-reference-overlay" aria-hidden="true" />, rootElement);

export const PunsjDialogProvider = ({
    rootElement,
    defaultInteractionMode = 'blocking',
    children,
}: PunsjDialogProviderProps) => {
    const referenceDialogIds = useRef(new Set<symbol>());
    const [referenceDialogCount, setReferenceDialogCount] = useState(0);
    const registerReferenceOverlay = useCallback(() => {
        const dialogId = Symbol();
        referenceDialogIds.current.add(dialogId);
        setReferenceDialogCount(referenceDialogIds.current.size);

        return () => {
            referenceDialogIds.current.delete(dialogId);
            setReferenceDialogCount(referenceDialogIds.current.size);
        };
    }, []);

    return (
        <PunsjDialogContext.Provider value={rootElement}>
            <PunsjDialogDefaultInteractionModeContext.Provider value={defaultInteractionMode}>
                <PunsjDialogReferenceOverlayContext.Provider value={registerReferenceOverlay}>
                    {children}
                    {referenceDialogCount > 0 && rootElement && <ReferenceOverlay rootElement={rootElement} />}
                </PunsjDialogReferenceOverlayContext.Provider>
            </PunsjDialogDefaultInteractionModeContext.Provider>
        </PunsjDialogContext.Provider>
    );
};

export const usePunsjDialogInteractionMode = () => useContext(PunsjDialogInteractionModeContext);

const PunsjDialogRoot = ({
    open,
    onOpenChange,
    interactionMode,
    className,
    children,
    ...popupProps
}: PunsjDialogProps) => {
    const rootElement = useContext(PunsjDialogContext);
    const defaultInteractionMode = useContext(PunsjDialogDefaultInteractionModeContext);
    const registerReferenceOverlay = useContext(PunsjDialogReferenceOverlayContext);
    const effectiveInteractionMode = interactionMode ?? defaultInteractionMode;
    const isReference = effectiveInteractionMode === 'reference';

    useLayoutEffect(() => {
        if (!isReference || !open || !registerReferenceOverlay) {
            return;
        }

        return registerReferenceOverlay();
    }, [isReference, open, registerReferenceOverlay]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <Dialog.Popup
                {...popupProps}
                rootElement={rootElement}
                modal={isReference ? 'trap-focus' : true}
                withBackdrop={!isReference}
                closeOnOutsideClick={!isReference}
                className={['journalpost-dialog-popup', className].filter(Boolean).join(' ')}
            >
                <PunsjDialogInteractionModeContext.Provider value={effectiveInteractionMode}>
                    {children}
                </PunsjDialogInteractionModeContext.Provider>
            </Dialog.Popup>
        </Dialog>
    );
};

export const PunsjDialog = Object.assign(PunsjDialogRoot, {
    Body: Dialog.Body,
    Footer: Dialog.Footer,
    Header: Dialog.Header,
    Title: Dialog.Title,
});
