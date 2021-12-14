import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouterAndIntl } from '../../../testUtils';
import SkjemaContext from '../../../../app/components/skjema/SkjemaContext';
import {
    Innsendingsstatus,
    IOverføringPunchSkjema,
    Mottaker,
    tomtSkjema,
    validatePunch,
} from '../../../../app/models/forms/omsorgspenger/overføring/PunchSkjema';
import OverføringPunchSkjema from '../../../../app/containers/omsorgspenger/overforing/OverføringPunchSkjema';
import { JaNei } from '../../../../app/models/enums';

jest.mock('app/utils/envUtils');
jest.mock('app/components/journalpost-panel/JournalpostPanel', () => ({
    JournalpostPanel: () => null,
}));

describe('<OverføringPunchSkjema>', () => {
    test('Viser alle feltfeil hvis man sender inn skjema med feil', async () => {
        let numberOfTimesSubmitted = 0;
        const onSubmitCallback = () => {
            numberOfTimesSubmitted += 1;
        };
        const gåTilForrigeSteg = jest.fn;

        renderWithRouterAndIntl(
            <SkjemaContext initialValues={tomtSkjema} onSubmitCallback={onSubmitCallback} validerSkjema={validatePunch}>
                <OverføringPunchSkjema
                    gåTilForrigeSteg={gåTilForrigeSteg}
                    innsendingsstatus={Innsendingsstatus.IkkeSendtInn}
                    journalpostId="2"
                />
            </SkjemaContext>
        );

        const sendInnKnapp = screen.getByRole('button', { name: /send inn/i });

        userEvent.click(sendInnKnapp);

        const påkrevdeFelter = await screen.findAllByText(/påkrevd felt/i);
        const antallPåkrevdeFelter = 7;
        expect(påkrevdeFelter).toHaveLength(antallPåkrevdeFelter);

        const antallDagerFeil = screen.getByText(/Må være et heltall større enn null/i);

        expect(antallDagerFeil).toBeInTheDocument();

        expect(numberOfTimesSubmitted).toEqual(0);
    });

    test('Kan sende inn når alle påkrevde felter er OK', async () => {
        let numberOfTimesSubmitted = 0;
        const onSubmitCallback = () => {
            numberOfTimesSubmitted += 1;
        };
        const gåTilForrigeSteg = jest.fn;

        const skjema: IOverføringPunchSkjema = {
            borINorge: JaNei.JA,
            norskIdent: '01010101010',
            mottaksdato: '2020-01-01',
            arbeidssituasjon: {
                erSelvstendigNæringsdrivende: true,
                erFrilanser: false,
                erArbeidstaker: false,
                metaHarFeil: null,
            },
            aleneOmOmsorgen: JaNei.JA,
            omsorgenDelesMed: {
                samboerSiden: '2018-02-02',
                mottaker: Mottaker.Samboer,
                antallOverførteDager: 4,
                norskIdent: '02020202020',
            },
            barn: [
                {
                    fødselsdato: '2017-03-03',
                    norskIdent: '03031702022',
                },
            ],
        };

        renderWithRouterAndIntl(
            <SkjemaContext initialValues={skjema} onSubmitCallback={onSubmitCallback} validerSkjema={validatePunch}>
                <OverføringPunchSkjema
                    gåTilForrigeSteg={gåTilForrigeSteg}
                    innsendingsstatus={Innsendingsstatus.IkkeSendtInn}
                    journalpostId="2"
                />
            </SkjemaContext>
        );

        const sendInnKnapp = screen.getByRole('button', { name: /send inn/i });

        userEvent.click(sendInnKnapp);

        await screen.findAllByRole('button'); // wait for hook callbacks

        expect(numberOfTimesSubmitted).toEqual(1);
    });

    test('"Legg til barn"-knapp legger til et barn', async () => {
        const onSubmitCallback = jest.fn;
        const gåTilForrigeSteg = jest.fn;

        renderWithRouterAndIntl(
            <SkjemaContext initialValues={tomtSkjema} onSubmitCallback={onSubmitCallback} validerSkjema={validatePunch}>
                <OverføringPunchSkjema
                    gåTilForrigeSteg={gåTilForrigeSteg}
                    innsendingsstatus={Innsendingsstatus.IkkeSendtInn}
                    journalpostId="2"
                />
            </SkjemaContext>
        );

        const barnISkjemaet = () => screen.findAllByRole('group', { name: /barn nummer/i });

        expect(await barnISkjemaet()).toHaveLength(1);

        const leggTilBarnKnapp = screen.getByRole('button', {
            name: /legg til flere barn/i,
        });

        userEvent.click(leggTilBarnKnapp);

        expect(await barnISkjemaet()).toHaveLength(2);
    });
});
