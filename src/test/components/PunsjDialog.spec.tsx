import React from 'react';
import { createPortal } from 'react-dom';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ErDuSikkerModal from 'app/components/ErDuSikkerModal';
import { PunsjDialog, PunsjDialogProvider } from 'app/components/PunsjDialog';
import Datovelger from 'app/components/skjema/Datovelger/Datovelger';
import { renderWithIntl } from '../testUtils';

const renderDialog = (
    interactionMode?: 'blocking' | 'reference',
    defaultInteractionMode?: 'blocking' | 'reference',
): HTMLDivElement => {
    const rootElement = document.createElement('div');
    rootElement.className = 'punsj-dialog-test-root';
    document.body.append(rootElement);

    render(
        <PunsjDialogProvider rootElement={rootElement} defaultInteractionMode={defaultInteractionMode}>
            <PunsjDialog open onOpenChange={() => undefined} interactionMode={interactionMode} aria-label="Testdialog">
                <PunsjDialog.Body>Dialoginnhold</PunsjDialog.Body>
            </PunsjDialog>
        </PunsjDialogProvider>,
    );

    return rootElement;
};

const renderReferenceDialogWithPanelControls = (
    onLeftControlClick: () => void,
    onPdfTabClick: () => void,
): HTMLDivElement => {
    const rootElement = document.createElement('div');
    rootElement.className = 'punsj-dialog-test-root';
    document.body.append(rootElement);

    render(
        <>
            <PunsjDialogProvider rootElement={rootElement} defaultInteractionMode="reference">
                <PunsjDialog open onOpenChange={() => undefined} aria-label="Testdialog">
                    <PunsjDialog.Body>
                        <Datovelger label="Dato" value="" onChange={() => undefined} />
                    </PunsjDialog.Body>
                </PunsjDialog>
            </PunsjDialogProvider>
            {createPortal(
                <button type="button" onClick={onLeftControlClick}>
                    Venstre kontroll
                </button>,
                rootElement,
            )}
            <button type="button" onClick={onPdfTabClick}>
                PDF-fane
            </button>
        </>,
    );

    return rootElement;
};

const renderErDuSikkerModal = (defaultInteractionMode?: 'blocking' | 'reference'): HTMLDivElement => {
    const rootElement = document.createElement('div');
    rootElement.className = 'punsj-dialog-test-root';
    document.body.append(rootElement);

    renderWithIntl(
        <PunsjDialogProvider rootElement={rootElement} defaultInteractionMode={defaultInteractionMode}>
            <ErDuSikkerModal
                melding="skjema.knapp.avbryt"
                modalKey="bekreftelse"
                open
                onSubmit={() => undefined}
                onClose={() => undefined}
                submitKnappText="skjema.knapp.avbryt"
            />
        </PunsjDialogProvider>,
    );

    return rootElement;
};

afterEach(() => {
    cleanup();
    document.querySelectorAll('.punsj-dialog-test-root').forEach((element) => element.remove());
});

describe('PunsjDialog', () => {
    it('blocks interaction outside the dialog by default', () => {
        const rootElement = renderDialog();

        expect(screen.getByRole('dialog', { name: 'Testdialog' })).toHaveClass('journalpost-dialog-popup');
        expect(rootElement.querySelector('.aksel-dialog__backdrop')).toBeInTheDocument();
    });

    it('removes the backdrop only in reference mode', () => {
        const rootElement = renderDialog('reference');

        expect(screen.getByRole('dialog', { name: 'Testdialog' })).toHaveClass('journalpost-dialog-popup');
        expect(rootElement.querySelector('.aksel-dialog__backdrop')).not.toBeInTheDocument();
    });

    it('uses the provider reference mode as the default', () => {
        const rootElement = renderDialog(undefined, 'reference');

        expect(rootElement.querySelector('.aksel-dialog__backdrop')).not.toBeInTheDocument();
        expect(rootElement.querySelector('.journalpost-reference-overlay')).toBeInTheDocument();
    });

    it('keeps one reference overlay until the final reference dialog closes', () => {
        const rootElement = document.createElement('div');
        rootElement.className = 'punsj-dialog-test-root';
        document.body.append(rootElement);

        const renderDialogs = (firstOpen: boolean, secondOpen: boolean) => (
            <PunsjDialogProvider rootElement={rootElement} defaultInteractionMode="reference">
                <PunsjDialog open={firstOpen} onOpenChange={() => undefined} aria-label="Første dialog">
                    <PunsjDialog.Body>Første dialoginnhold</PunsjDialog.Body>
                </PunsjDialog>
                <PunsjDialog open={secondOpen} onOpenChange={() => undefined} aria-label="Andre dialog">
                    <PunsjDialog.Body>Andre dialoginnhold</PunsjDialog.Body>
                </PunsjDialog>
            </PunsjDialogProvider>
        );

        const { rerender } = render(renderDialogs(true, true));

        expect(rootElement.querySelectorAll('.journalpost-reference-overlay')).toHaveLength(1);

        rerender(renderDialogs(false, true));
        expect(rootElement.querySelectorAll('.journalpost-reference-overlay')).toHaveLength(1);

        rerender(renderDialogs(false, false));
        expect(rootElement.querySelectorAll('.journalpost-reference-overlay')).toHaveLength(0);
    });

    it('allows an explicit blocking override of the provider reference mode', () => {
        const rootElement = renderDialog('blocking', 'reference');

        expect(rootElement.querySelector('.aksel-dialog__backdrop')).toBeInTheDocument();
        expect(rootElement.querySelector('.journalpost-reference-overlay')).not.toBeInTheDocument();
    });

    it('lets ErDuSikkerModal inherit reference behavior from the provider', () => {
        const rootElement = renderErDuSikkerModal('reference');

        expect(screen.getByTestId('erdusikkermodal')).toBeInTheDocument();
        expect(rootElement.querySelector('.aksel-dialog__backdrop')).not.toBeInTheDocument();
        expect(rootElement.querySelector('.journalpost-reference-overlay')).toBeInTheDocument();
    });

    it('keeps ErDuSikkerModal blocking outside a reference provider', () => {
        const rootElement = renderErDuSikkerModal();

        expect(rootElement.querySelector('.aksel-dialog__backdrop')).toBeInTheDocument();
        expect(rootElement.querySelector('.journalpost-reference-overlay')).not.toBeInTheDocument();
    });

    it('allows PDF pointer interaction while the reference date popover is open', async () => {
        const user = userEvent.setup();
        const onPdfTabClick = jest.fn();
        renderReferenceDialogWithPanelControls(jest.fn(), onPdfTabClick);

        const pdfTab = screen.getByRole('button', { name: 'PDF-fane', hidden: true });
        await user.click(pdfTab);
        expect(onPdfTabClick).toHaveBeenCalledTimes(1);

        const datePickerButton = document.querySelector('.aksel-date__field-button') as HTMLButtonElement;
        await user.click(datePickerButton);
        expect(document.querySelector('.aksel-popover:not(.aksel-popover--hidden)')).toBeInTheDocument();

        await user.click(pdfTab);
        expect(onPdfTabClick).toHaveBeenCalledTimes(2);
    });

    it('blocks the left panel while keeping PDF controls interactive in reference mode', async () => {
        const user = userEvent.setup();
        const onLeftControlClick = jest.fn();
        const onPdfTabClick = jest.fn();
        const rootElement = renderReferenceDialogWithPanelControls(onLeftControlClick, onPdfTabClick);

        const overlay = rootElement.querySelector('.journalpost-reference-overlay') as HTMLDivElement;
        await user.click(overlay);

        expect(onLeftControlClick).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'PDF-fane', hidden: true }));
        expect(onPdfTabClick).toHaveBeenCalledTimes(1);
    });
});
