import React, { createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

import { Dialog, type DialogPopupProps } from '@navikt/ds-react';

type InteractionMode = 'blocking' | 'reference';

interface PunsjDialogProviderProps {
    rootElement: HTMLElement | null;
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
const PunsjDialogInteractionModeContext = createContext<InteractionMode>('blocking');

export const PunsjDialogProvider = ({ rootElement, children }: PunsjDialogProviderProps) => (
    <PunsjDialogContext.Provider value={rootElement}>{children}</PunsjDialogContext.Provider>
);

export const usePunsjDialogInteractionMode = () => useContext(PunsjDialogInteractionModeContext);

const ReferenceOverlay = ({ rootElement }: { rootElement: HTMLElement | null }) => {
    if (!rootElement) {
        return null;
    }

    return createPortal(<div className="journalpost-reference-overlay" aria-hidden="true" />, rootElement);
};

const PunsjDialogRoot = ({
    open,
    onOpenChange,
    interactionMode = 'blocking',
    className,
    children,
    ...popupProps
}: PunsjDialogProps) => {
    const rootElement = useContext(PunsjDialogContext);
    const isReference = interactionMode === 'reference';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {isReference && open && <ReferenceOverlay rootElement={rootElement} />}
            <Dialog.Popup
                {...popupProps}
                rootElement={rootElement}
                modal={isReference ? 'trap-focus' : true}
                withBackdrop={!isReference}
                closeOnOutsideClick={!isReference}
                className={['journalpost-dialog-popup', className].filter(Boolean).join(' ')}
            >
                <PunsjDialogInteractionModeContext.Provider value={interactionMode}>
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
