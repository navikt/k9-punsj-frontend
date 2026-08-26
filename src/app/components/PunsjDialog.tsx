import React, { createContext, useContext } from 'react';
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

interface PunsjDialogContextValue {
    rootElement: HTMLElement | null;
    defaultInteractionMode: InteractionMode;
    effectiveInteractionMode?: InteractionMode;
}

const defaultPunsjDialogContextValue: PunsjDialogContextValue = {
    rootElement: null,
    defaultInteractionMode: 'blocking',
};

const PunsjDialogContext = createContext<PunsjDialogContextValue>(defaultPunsjDialogContextValue);

const ReferenceOverlay = ({ rootElement }: { rootElement: HTMLElement }) =>
    createPortal(<div className="journalpost-reference-overlay" aria-hidden="true" />, rootElement);

export const PunsjDialogProvider = ({
    rootElement,
    defaultInteractionMode = 'blocking',
    children,
}: PunsjDialogProviderProps) => {
    return (
        <PunsjDialogContext.Provider
            value={{
                rootElement,
                defaultInteractionMode,
            }}
        >
            {children}
        </PunsjDialogContext.Provider>
    );
};

export const usePunsjDialogInteractionMode = () =>
    useContext(PunsjDialogContext).effectiveInteractionMode ?? 'blocking';

const PunsjDialogRoot = ({
    open,
    onOpenChange,
    interactionMode,
    className,
    children,
    ...popupProps
}: PunsjDialogProps) => {
    const dialogContext = useContext(PunsjDialogContext);
    const effectiveInteractionMode = interactionMode ?? dialogContext.defaultInteractionMode;
    const isReference = effectiveInteractionMode === 'reference';

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <Dialog.Popup
                    {...popupProps}
                    rootElement={dialogContext.rootElement}
                    modal={isReference ? 'trap-focus' : true}
                    withBackdrop={!isReference}
                    closeOnOutsideClick={!isReference}
                    className={['journalpost-dialog-popup', className].filter(Boolean).join(' ')}
                >
                    <PunsjDialogContext.Provider value={{ ...dialogContext, effectiveInteractionMode }}>
                        {children}
                    </PunsjDialogContext.Provider>
                </Dialog.Popup>
            </Dialog>
            {isReference && open && dialogContext.rootElement && (
                <ReferenceOverlay rootElement={dialogContext.rootElement} />
            )}
        </>
    );
};

export const PunsjDialog = Object.assign(PunsjDialogRoot, {
    Body: Dialog.Body,
    Footer: Dialog.Footer,
    Header: Dialog.Header,
    Title: Dialog.Title,
});
