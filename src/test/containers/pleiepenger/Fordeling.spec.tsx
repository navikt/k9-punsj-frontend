import {
    FordelingComponent,
    IFordelingDispatchProps,
    IFordelingStateProps,
} from 'app/containers/pleiepenger/Fordeling/Fordeling';
import { Sakstype } from 'app/models/enums';
import { IFordelingState, IJournalpost } from 'app/models/types';
import FordelingFerdigstillJournalpostState from 'app/models/types/FordelingFerdigstillJournalpostState';
import FordelingSettPaaVentState from 'app/models/types/FordelingSettPaaVentState';
import intlHelper from 'app/utils/intlUtils';
import { shallow } from 'enzyme';
import * as React from 'react';
import { createIntl, IntlShape, WrappedComponentProps } from 'react-intl';
import { mocked } from 'ts-jest/utils';
import { IGosysOppgaveState } from '../../../app/models/types/GosysOppgaveState';
import { IIdentState } from '../../../app/models/types/IdentState';

jest.mock('react-intl');
jest.mock('react-router');
jest.mock('app/utils/browserUtils');
jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');
jest.mock('app/utils/pathUtils');

const journalpostid = '200';

// eslint-disable-next-line import/prefer-default-export
export const setupFordeling = (
    fordelingStatePartial?: Partial<IFordelingState>,
    fordelingDispatchPropsPartial?: Partial<IFordelingDispatchProps>,
    opprettIGosysStatePartial?: Partial<IGosysOppgaveState>,
    journalpostPartial?: Partial<IJournalpost>
) => {
    const wrappedComponentProps: WrappedComponentProps = {
        intl: createIntl({ locale: 'nb', defaultLocale: 'nb' }),
    };

    const fordelingDispatchProps: IFordelingDispatchProps = {
        omfordel: jest.fn(),
        setSakstypeAction: jest.fn(),
        setIdentAction: jest.fn(),
        sjekkOmSkalTilK9: jest.fn(),
        kopierJournalpost: jest.fn(),
        lukkJournalpostOppgave: jest.fn(),
        resetOmfordelAction: jest.fn(),
        lukkOppgaveReset: jest.fn(),
        setErIdent1Bekreftet: jest.fn(),
        ...fordelingDispatchPropsPartial,
    };

    const journalpost: IJournalpost = {
        dokumenter: [{ dokumentId: '123' }],
        journalpostId: journalpostid,
        norskIdent: '12345678901',
        kanSendeInn: true,
        erSaksbehandler: true,
        kanOpprettesJournalføringsoppgave: true,
        ...journalpostPartial
    };

    const opprettIGosys: IGosysOppgaveState = {
        isAwaitingGosysOppgaveRequestResponse: false,
        gosysOppgaveRequestSuccess: false,
        gosysOppgaveRequestError: undefined,
        ...opprettIGosysStatePartial,
    };

    const fordelingState: IFordelingState = {
        omfordelingDone: false,
        lukkOppgaveDone: false,
        isAwaitingOmfordelingResponse: false,
        isAwaitingSjekkTilK9Response: false,
        isAwaitingLukkOppgaveResponse: false,
        sakstype: Sakstype.PLEIEPENGER_SYKT_BARN,
        erIdent1Bekreftet: false,
        valgtGosysKategori: 'Annet',
        ...fordelingStatePartial,
    };

    const identState: IIdentState = {
        ident1: '12345678901',
        ident2: '',
        annenSokerIdent: '',
    };

    const fordelingSettPåVentState: FordelingSettPaaVentState = {
        settPaaVentError: undefined,
        settPaaVentSuccess: false,
    };

    const fordelingFerdigstillState: FordelingFerdigstillJournalpostState = {
        ferdigstillJournalpostError: undefined,
        ferdigstillJournalpostSuccess: false,
    };

    const fordelingStateProps: IFordelingStateProps = {
        journalpost,
        fordelingState,
        journalpostId: journalpostid,
        identState,
        opprettIGosysState: opprettIGosys,
        dedupkey: '',
        fellesState: {
            dedupKey: '',
            kopierJournalpostSuccess: true,
        },
        fordelingSettPåVentState,
        fordelingFerdigstillState,
    };

    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string, value?: { [key: string]: string }) => id);

    return shallow(
        /* eslint-disable react/jsx-props-no-spreading */
        <FordelingComponent
            {...wrappedComponentProps}
            {...fordelingStateProps}
            {...fordelingDispatchProps}
            {...opprettIGosysStatePartial}
        />
        /* eslint-enable react/jsx-props-no-spreading */
    );
};

describe('Fordeling', () => {
    it('Viser radiopanel for identsjekk', () => {
        const fordeling = setupFordeling();
        expect(fordeling.find('RadioPanelGruppe')).toHaveLength(1);
    });

    it.skip('Viser radiopanel for identsjekk når bruker velger pleiepenger', () => {
        const fordeling = setupFordeling();
        fordeling
            .find('RadioPanelGruppe')
            .dive()
            .find('RadioPanel')
            .at(0)
            .simulate('change', { target: { value: 'ANNET' } });
        expect(fordeling.find('Hovedknapp')).toHaveLength(1);

        fordeling
            .find('RadioPanelGruppe')
            .dive()
            .find('RadioPanel')
            .at(0)
            .simulate('change', { target: { value: 'PLEIEPENGER' } });
        expect(fordeling.find('RadioPanelGruppe')).toHaveLength(2);

        fordeling
            .find('RadioPanelGruppe')
            .at(1)
            .dive()
            .find('RadioPanel')
            .at(0)
            .simulate('change', { target: { value: 'nei' } });
        expect(fordeling.find('Input')).toHaveLength(1);
    });

    // it('Kaller setSakstypeAction', () => {
    //     const setSakstypeAction = jest.fn();
    //     const fordeling = setupFordeling(
    //         { skalTilK9: true },
    //         { setSakstypeAction },
    //         {
    //             isAwaitingGosysOppgaveRequestResponse: false,
    //             gosysOppgaveRequestError: undefined,
    //         }
    //     );
    //     const newSakstype = Sakstype.ANNET;
    //     fordeling.find('RadioPanel').at(1).simulate('change');
    //     expect(setSakstypeAction).toHaveBeenCalledTimes(1);
    //     expect(setSakstypeAction).toHaveBeenCalledWith(newSakstype);
    // });

    // it('Omfordeler', () => {
    //     const omfordel = jest.fn();
    //     const sakstype = Sakstype.ANNET;
    //     const fordeling = setupFordeling({ sakstype, skalTilK9: true }, { omfordel });
    //     fordeling.find('Behandlingsknapp').dive().simulate('click');
    //     expect(omfordel).toHaveBeenCalledTimes(1);
    //     expect(omfordel).toHaveBeenCalledWith(journalpostid, '12345678901', 'Annet');
    // });

    it('Viser spinner mens svar avventes', () => {
        const omfordel = jest.fn();
        const fordeling = setupFordeling(undefined, { omfordel }, { isAwaitingGosysOppgaveRequestResponse: true });
        expect(fordeling.find('NavFrontendSpinner')).toHaveLength(1);
    });

    it('Viser suksessmelding når omfordeling er utført', () => {
        const fordeling = setupFordeling({ lukkOppgaveDone: true }, undefined, {
            gosysOppgaveRequestSuccess: true,
        });
        const wrapper = fordeling.find('ModalWrapper');
        expect(wrapper.children().prop('melding')).toEqual('fordeling.opprettigosys.utfort');
    });

    it('Viser feilmelding for omfordeling', () => {
        const fordeling = setupFordeling(undefined, undefined, {
            gosysOppgaveRequestError: { status: 404 },
        });
        expect(fordeling.find('AlertStripeFeil')).toHaveLength(1);
        expect(fordeling.find('AlertStripeFeil').children().text()).toEqual('fordeling.omfordeling.feil');
    });

    it('Viser feilmelding for omfordeling når journalpost ikke stöttes', () => {
        const setSakstypeAction = jest.fn();
        const fordeling = setupFordeling(
            { sjekkTilK9JournalpostStottesIkke: true },
            { setSakstypeAction },
            {
                isAwaitingGosysOppgaveRequestResponse: false,
                gosysOppgaveRequestError: undefined,
            }
        );
        expect(fordeling.find('AlertStripeFeil')).toHaveLength(1);
        expect(fordeling.find('AlertStripeFeil').children().text()).toEqual(
            'fordeling.infotrygd.journalpoststottesikke'
        );
        expect(fordeling.find('Knapp')).toHaveLength(1);
    });

    it.skip('Viser feilmelding når journalforingsoppgave i gosys ikke kan opprettes', () => {
        const fordeling = setupFordeling({}, {}, {}, { kanOpprettesJournalføringsoppgave: false });
        fordeling
            .find('RadioPanelGruppe')
            .dive()
            .find('RadioPanel')
            .at(0)
            .simulate('change', { target: { value: 'ANNET' } });
        expect(fordeling.find('AlertStripeInfo')).toHaveLength(1);
        expect(fordeling.find('AlertStripeInfo').find('Memo(FormattedMessage)').prop('id')).toEqual(
            'fordeling.kanIkkeOppretteJPIGosys.info'
        );

        expect(fordeling.find('Knapp')).toHaveLength(1);
    });
});
