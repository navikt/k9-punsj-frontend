import {
    FordelingComponent,
    IFordelingDispatchProps,
    IFordelingStateProps,
} from 'app/containers/pleiepenger/Fordeling/Fordeling';
import {JaNei, Sakstype} from 'app/models/enums';
import {IFordelingState, IJournalpost} from 'app/models/types';
import intlHelper from 'app/utils/intlUtils';
import {shallow} from 'enzyme';
import * as React from 'react';
import {createIntl, IntlShape, WrappedComponentProps} from 'react-intl';
import {mocked} from 'ts-jest/utils';
import {IIdentState} from "../../../app/models/types/IdentState";
import {IGosysOppgaveState} from "../../../app/models/types/GosysOppgaveState";

jest.mock('react-intl');
jest.mock('react-router');
jest.mock('app/utils/browserUtils');
jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');
jest.mock('app/utils/pathUtils');

const journalpostid = '200';

export const setupFordeling = (
    fordelingStatePartial?: Partial<IFordelingState>,
    fordelingDispatchPropsPartial?: Partial<IFordelingDispatchProps>,
    opprettIGosysStatePartial?: Partial<IGosysOppgaveState>,
) => {
    const wrappedComponentProps: WrappedComponentProps = {
        intl: createIntl({locale: 'nb', defaultLocale: 'nb'}),
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
        hentBarn: jest.fn(),
        setErIdent1Bekreftet: jest.fn(),
        ...fordelingDispatchPropsPartial,
    };

    const journalpost: IJournalpost = {
        dokumenter: [{dokumentId: '123'}],
        journalpostId: journalpostid,
        norskIdent: '12345678901',
        kanSendeInn: true,
        erSaksbehandler: true
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
        ...fordelingStatePartial,
    };

    const identState: IIdentState = {
        ident1: '12345678901',
        ident2: '',
        annenSokerIdent: ''
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
            kopierJournalpostSuccess: true
        }
    };

    mocked(intlHelper).mockImplementation(
        (intl: IntlShape, id: string, value?: { [key: string]: string }) => id
    );

    return shallow(
        <FordelingComponent
            {...wrappedComponentProps}
            {...fordelingStateProps}
            {...fordelingDispatchProps}
            {...opprettIGosysStatePartial}
        />
    );
};

describe('Fordeling', () => {
    it('Viser radiopanel for identsjekk', () => {
        const fordeling = setupFordeling();
        expect(fordeling.find('RadioPanelGruppe')).toHaveLength(1);
    });

    it('Viser radiopanel for identsjekk når bruker velger pleiepenger', () => {
        const fordeling = setupFordeling();
        fordeling.find('RadioPanelGruppe').dive().find('RadioPanel').at(0).simulate('change', {target: {value: 'nei'}})
        expect(fordeling.find('Hovedknapp')).toHaveLength(1);

        fordeling.find('RadioPanelGruppe').dive().find('RadioPanel').at(0).simulate('change', {target: {value: 'ja'}})
        expect(fordeling.find('RadioPanelGruppe')).toHaveLength(2);

        fordeling.find('RadioPanelGruppe').at(1).dive().find('RadioPanel').at(0).simulate('change', {target: {value: 'nei'}})
        expect(fordeling.find('Input')).toHaveLength(1);
    });

    /*  it('Viser radioknapp for hver sakstype', () => {
          const fordeling = setupFordeling({skalTilK9: true});
          const radios = fordeling.find('RadioPanel');
          const radioForSakstype = (sakstype: Sakstype) =>
              radios.findWhere((radio) => radio.prop('value') === sakstype);

          expect(radios).toHaveLength(6);
          expect(radioForSakstype(Sakstype.PLEIEPENGER_SYKT_BARN)).toHaveLength(1);
          expect(radioForSakstype(Sakstype.OMSORGSPENGER)).toHaveLength(1);
          expect(radioForSakstype(Sakstype.OPPLAERINGSPENGER)).toHaveLength(1);
          expect(
              radioForSakstype(Sakstype.PLEIEPENGER_I_LIVETS_SLUTTFASE)
          ).toHaveLength(1);
          expect(radioForSakstype(Sakstype.ANNET)).toHaveLength(1);
      });

     */

    it('Kaller setSakstypeAction', () => {
        const setSakstypeAction = jest.fn();
        const fordeling = setupFordeling({skalTilK9: true}, {setSakstypeAction}, {isAwaitingGosysOppgaveRequestResponse: false, gosysOppgaveRequestError: undefined});
        const newSakstype = Sakstype.ANNET;
        fordeling.find('RadioPanel').at(1).simulate('change');
        expect(setSakstypeAction).toHaveBeenCalledTimes(1);
        expect(setSakstypeAction).toHaveBeenCalledWith(newSakstype);
    });

    it('Omfordeler', () => {
        const omfordel = jest.fn();
        const sakstype = Sakstype.ANNET;
        const fordeling = setupFordeling({sakstype, skalTilK9: true}, {omfordel});
        fordeling.find('Behandlingsknapp').dive().simulate('click');
        expect(omfordel).toHaveBeenCalledTimes(1);
        expect(omfordel).toHaveBeenCalledWith(journalpostid, "12345678901", 'Annet');
    });

    it('Viser spinner mens svar avventes', () => {
        const omfordel = jest.fn();
        const fordeling = setupFordeling(undefined, {omfordel}, {isAwaitingGosysOppgaveRequestResponse: true});
        expect(fordeling.find('NavFrontendSpinner')).toHaveLength(1);
    });

    it('Viser suksessmelding når omfordeling er utført', () => {
        const fordeling = setupFordeling(undefined, undefined, {gosysOppgaveRequestSuccess: true});
        const wrapper = fordeling.find("ModalWrapper")
        expect(wrapper.children().prop('melding')).toEqual('fordeling.opprettigosys.utfort');
    });

    it('Viser feilmelding for omfordeling', () => {
        const fordeling = setupFordeling(undefined, undefined,{gosysOppgaveRequestError: {status: 404}});
        expect(fordeling.find('AlertStripeFeil')).toHaveLength(1);
        expect(fordeling.find('AlertStripeFeil').children().text()).toEqual(
            'fordeling.omfordeling.feil'
        );
    });

    it('Viser feilmelding for omfordeling når journalpost ikke stöttes', () => {
        const setSakstypeAction = jest.fn();
        const fordeling = setupFordeling({sjekkTilK9JournalpostStottesIkke: true}, {setSakstypeAction}, {isAwaitingGosysOppgaveRequestResponse: false, gosysOppgaveRequestError: undefined});
        expect(fordeling.find('AlertStripeFeil')).toHaveLength(1);
        expect(fordeling.find('AlertStripeFeil').children().text()).toEqual('fordeling.infotrygd.journalpoststottesikke');
        expect(fordeling.find('Knapp')).toHaveLength(1);
    });
});
