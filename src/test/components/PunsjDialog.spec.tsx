import React from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PunsjDialog, PunsjDialogProvider } from 'app/components/PunsjDialog';
import Datovelger from 'app/components/skjema/Datovelger/Datovelger';

const renderDialog = (interactionMode?: 'blocking' | 'reference') => {
    const rootElement = document.createElement('div');
    rootElement.className = 'punsj-dialog-test-root';
    document.body.append(rootElement);

    render(
        <PunsjDialogProvider rootElement={rootElement}>
            <PunsjDialog open onOpenChange={() => undefined} interactionMode={interactionMode} aria-label="Testdialog">
                <PunsjDialog.Body>Dialoginnhold</PunsjDialog.Body>
            </PunsjDialog>
        </PunsjDialogProvider>,
    );

    return rootElement;
};

const renderReferenceDialogWithPdfTab = (onPdfTabClick: () => void) => {
    const rootElement = document.createElement('div');
    rootElement.className = 'punsj-dialog-test-root';
    document.body.append(rootElement);

    render(
        <>
            <PunsjDialogProvider rootElement={rootElement}>
                <PunsjDialog open onOpenChange={() => undefined} interactionMode="reference" aria-label="Testdialog">
                    <PunsjDialog.Body>
                        <Datovelger label="Dato" value="" onChange={() => undefined} />
                    </PunsjDialog.Body>
                </PunsjDialog>
            </PunsjDialogProvider>
            <button type="button" onClick={onPdfTabClick}>
                PDF-fane
            </button>
        </>,
    );
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

    it('allows PDF pointer interaction while the reference date popover is open', async () => {
        const user = userEvent.setup();
        const onPdfTabClick = jest.fn();
        renderReferenceDialogWithPdfTab(onPdfTabClick);

        const pdfTab = screen.getByRole('button', { name: 'PDF-fane' });
        await user.click(pdfTab);
        expect(onPdfTabClick).toHaveBeenCalledTimes(1);

        const datePickerButton = document.querySelector('.aksel-date__field-button') as HTMLButtonElement;
        await user.click(datePickerButton);
        expect(document.querySelector('.aksel-popover:not(.aksel-popover--hidden)')).toBeInTheDocument();

        await user.click(pdfTab);
        expect(onPdfTabClick).toHaveBeenCalledTimes(2);
    });
});
