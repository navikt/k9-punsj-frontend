import React from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DokumentTypeVelgerForKopiering from 'app/fordeling/Komponenter/DokumentTypeVelgerForKopiering';
import { FordelingDokumenttype } from 'app/models/enums';
import { renderWithIntl } from '../../testUtils';

const setAppSettings = (overrides?: Record<string, string>) => {
    const globalWindow = window as Window & { appSettings?: Record<string, string> };
    globalWindow.appSettings = {
        ...(globalWindow.appSettings ?? {}),
        OLP_ENABLED: 'true',
        ...(overrides ?? {}),
    };
};

const ControlledHarness = () => {
    const [valgtDokumentType, setValgtDokumentType] = React.useState(FordelingDokumenttype.PLEIEPENGER);

    return (
        <DokumentTypeVelgerForKopiering
            valgtDokumentType={valgtDokumentType}
            handleDokumenttype={setValgtDokumentType}
        />
    );
};

describe('DokumentTypeVelgerForKopiering', () => {
    beforeEach(() => {
        setAppSettings();
    });

    it('switches checked radio correctly for top-level and omsorgspenger sub-options', async () => {
        renderWithIntl(<ControlledHarness />);

        const pleiepenger = document.querySelector('input[type="radio"][value="PLEIEPENGER"]') as HTMLInputElement;
        const omsorgspenger = document.querySelector('input[type="radio"][value="OMSORGSPENGER"]') as HTMLInputElement;

        expect(pleiepenger.checked).toBe(true);
        expect(omsorgspenger.checked).toBe(false);

        await userEvent.click(omsorgspenger);
        expect(pleiepenger.checked).toBe(false);
        expect(omsorgspenger.checked).toBe(true);

        const omsorgspengerKs = document.querySelector(
            'input[type="radio"][value="OMSORGSPENGER_KS"]',
        ) as HTMLInputElement;
        expect(omsorgspengerKs).toBeTruthy();

        await userEvent.click(omsorgspengerKs);
        expect(omsorgspenger.checked).toBe(false);
        expect(omsorgspengerKs.checked).toBe(true);
    });

    it('switches on single click when clicking label text', async () => {
        renderWithIntl(<ControlledHarness />);

        const omsorgspenger = document.querySelector('input[type="radio"][value="OMSORGSPENGER"]') as HTMLInputElement;
        expect(omsorgspenger.checked).toBe(false);

        await userEvent.click(screen.getByText('Omsorgspenger/omsorgsdager'));
        expect(omsorgspenger.checked).toBe(true);
    });

    it('hides opplæringspenger when feature toggle is off', () => {
        setAppSettings({ OLP_ENABLED: 'false' });

        renderWithIntl(
            <DokumentTypeVelgerForKopiering
                valgtDokumentType={FordelingDokumenttype.PLEIEPENGER}
                handleDokumenttype={() => undefined}
            />,
        );

        const opplaeringspengerInput = document.querySelector('input[type="radio"][value="OPPLAERINGSPENGER"]');
        expect(opplaeringspengerInput).toBeNull();
    });
});
