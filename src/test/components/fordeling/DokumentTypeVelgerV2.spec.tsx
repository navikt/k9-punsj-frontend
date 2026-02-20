import React from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DokumentTypeVelgerV2 from 'app/fordeling/Komponenter/DokumentTypeVelgerV2';
import { FordelingDokumenttype } from 'app/models/enums';
import { renderWithIntl } from '../../testUtils';

const setAllFeatureToggles = () => {
    const globalWindow = window as Window & { appSettings?: Record<string, string> };
    globalWindow.appSettings = {
        ...(globalWindow.appSettings ?? {}),
        OMP_KS_ENABLED: 'true',
        OMP_AO_ENABLED: 'true',
        OMP_MA_FEATURE_TOGGLE: 'true',
        PLS_ENABLED: 'true',
        OMP_UT_FEATURE_TOGGLE: 'true',
        OLP_ENABLED: 'true',
    };
};

const ControlledHarness = () => {
    const [valgtDokumentType, setValgtDokumentType] = React.useState(FordelingDokumenttype.PLEIEPENGER);

    return (
        <DokumentTypeVelgerV2
            valgtDokumentType={valgtDokumentType}
            handleDokumenttype={setValgtDokumentType}
            disableRadios={false}
        />
    );
};

describe('DokumentTypeVelgerV2', () => {
    beforeEach(() => {
        setAllFeatureToggles();
    });

    it('switches checked radio correctly for top-level and omsorgspenger sub-options', async () => {
        renderWithIntl(<ControlledHarness />);

        const pleiepenger = document.querySelector(
            '[data-test-id="dokumenttypeRadioPanelPleiepenger"]',
        ) as HTMLInputElement;
        const omsorgspenger = document.querySelector(
            '[data-test-id="dokumenttypeRadioPanelOmsorgspenger"]',
        ) as HTMLInputElement;
        const annet = document.querySelector('[data-test-id="dokumenttypeRadioPanelAnnet"]') as HTMLInputElement;

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

        await userEvent.click(annet);
        expect(omsorgspengerKs.checked).toBe(false);
        expect(annet.checked).toBe(true);
    });

    it('switches on single click when clicking label text', async () => {
        renderWithIntl(<ControlledHarness />);

        const omsorgspenger = document.querySelector(
            '[data-test-id="dokumenttypeRadioPanelOmsorgspenger"]',
        ) as HTMLInputElement;

        expect(omsorgspenger.checked).toBe(false);

        await userEvent.click(screen.getByText('Omsorgspenger/omsorgsdager'));
        expect(omsorgspenger.checked).toBe(true);
    });

    it('hides opplæringspenger when feature toggle is off', () => {
        const globalWindow = window as Window & { appSettings?: Record<string, string> };
        globalWindow.appSettings = {
            ...(globalWindow.appSettings ?? {}),
            OLP_ENABLED: 'false',
        };

        renderWithIntl(
            <DokumentTypeVelgerV2
                valgtDokumentType={FordelingDokumenttype.PLEIEPENGER}
                handleDokumenttype={() => undefined}
                disableRadios={false}
            />,
        );

        const opplaeringspengerInput = document.querySelector('[data-test-id="dokumenttypeRadioPanelOpplæringspenger"]');
        expect(opplaeringspengerInput).toBeNull();
    });
});
