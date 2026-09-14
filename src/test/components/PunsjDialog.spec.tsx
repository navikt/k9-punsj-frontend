import React from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PunsjDialog, PunsjDialogProvider } from 'app/components/PunsjDialog';
import Datovelger from 'app/components/skjema/Datovelger/Datovelger';
import ErrorModal from 'app/fordeling/Komponenter/ErrorModal';
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

const renderReferenceDialogWithPdfControl = (
    onPdfTabClick: () => void,
    onDateChange: (value: string) => void = () => undefined,
): HTMLDivElement => {
    const rootElement = document.createElement('div');
    rootElement.className = 'punsj-dialog-test-root';
    document.body.append(rootElement);

    render(
        <>
            <PunsjDialogProvider rootElement={rootElement} defaultInteractionMode="reference">
                <PunsjDialog open onOpenChange={() => undefined} aria-label="Testdialog">
                    <PunsjDialog.Body>
                        <Datovelger
                            label="Dato"
                            value=""
                            onChange={onDateChange}
                            defaultMonth={new Date('2024-02-01T00:00:00.000Z')}
                            fromDate={new Date('2024-02-01T00:00:00.000Z')}
                            toDate={new Date('2024-02-29T00:00:00.000Z')}
                        />
                    </PunsjDialog.Body>
                </PunsjDialog>
            </PunsjDialogProvider>
            <button type="button" onClick={onPdfTabClick}>
                PDF-fane
            </button>
        </>,
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

    it('allows an explicit blocking override of the provider reference mode', () => {
        const rootElement = renderDialog('blocking', 'reference');

        expect(rootElement.querySelector('.aksel-dialog__backdrop')).toBeInTheDocument();
        expect(rootElement.querySelector('.journalpost-reference-overlay')).not.toBeInTheDocument();
    });

    it('lets ErrorModal inherit reference behavior from the provider', () => {
        const rootElement = document.createElement('div');
        rootElement.className = 'punsj-dialog-test-root';
        document.body.append(rootElement);

        renderWithIntl(
            <PunsjDialogProvider rootElement={rootElement} defaultInteractionMode="reference">
                <ErrorModal onClose={() => undefined} />
            </PunsjDialogProvider>,
        );

        expect(rootElement.querySelector('[data-test-id="errorModal"]')).toBeInTheDocument();
        expect(rootElement.querySelector('.aksel-dialog__backdrop')).not.toBeInTheDocument();
        expect(rootElement.querySelector('.journalpost-reference-overlay')).toBeInTheDocument();
    });

    it('allows PDF pointer interaction while the reference date popover is open', async () => {
        const user = userEvent.setup();
        const onPdfTabClick = jest.fn();
        renderReferenceDialogWithPdfControl(onPdfTabClick);

        const pdfTab = screen.getByRole('button', { name: 'PDF-fane', hidden: true });
        await user.click(pdfTab);
        expect(onPdfTabClick).toHaveBeenCalledTimes(1);

        const datePickerButton = document.querySelector('.aksel-date__field-button') as HTMLButtonElement;
        await user.click(datePickerButton);
        expect(document.querySelector('.aksel-popover:not(.aksel-popover--hidden)')).toBeInTheDocument();

        await user.click(pdfTab);
        expect(onPdfTabClick).toHaveBeenCalledTimes(2);
    });

    it('selects a date and closes the reference date popover', async () => {
        const user = userEvent.setup();
        const onDateChange = jest.fn();
        renderReferenceDialogWithPdfControl(jest.fn(), onDateChange);

        const datePickerButton = document.querySelector('.aksel-date__field-button') as HTMLButtonElement;
        await user.click(datePickerButton);
        await user.click(screen.getByRole('button', { name: 'torsdag 15' }));

        expect(onDateChange).toHaveBeenLastCalledWith('2024-02-15');
        expect(document.querySelector('.aksel-popover:not(.aksel-popover--hidden)')).not.toBeInTheDocument();
    });

    it('renders the left-panel overlay while keeping PDF controls interactive in reference mode', async () => {
        const user = userEvent.setup();
        const onPdfTabClick = jest.fn();
        const rootElement = renderReferenceDialogWithPdfControl(onPdfTabClick);

        const overlay = rootElement.querySelector('.journalpost-reference-overlay') as HTMLDivElement;
        expect(overlay).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'PDF-fane', hidden: true }));
        expect(onPdfTabClick).toHaveBeenCalledTimes(1);
    });
});
