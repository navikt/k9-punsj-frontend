import {
    IdentComponent,
    IIdentComponentProps,
    IIdentDispatchProps,
    IIdentStateProps
}                                                     from 'app/containers/punch-page/Ident';
import {JaNei}                                        from 'app/models/enums';
import {IJournalpost, IPunchState, ISignaturState}    from 'app/models/types';
import intlHelper                                     from 'app/utils/intlUtils';
import {shallow}                                      from 'enzyme';
import {Input}                                        from 'nav-frontend-skjema';
import * as React                                     from 'react';
import {createIntl, IntlShape, WrappedComponentProps} from 'react-intl';
import {mocked}                                       from 'ts-jest/utils';

jest.mock('react-intl');
jest.mock('react-router');
jest.mock('app/utils/browserUtils');
jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');
jest.mock('app/utils/pathUtils');

const journalpostid = '200';
const fnr = '01015012345';

const setupIdent = (
    signaturStatePartial?: Partial<ISignaturState>,
    identDispatchPropsPartial?: Partial<IIdentDispatchProps>,
    identComponentPropsPartial?: Partial<IIdentComponentProps>
) => {

    const wrappedComponentProps: WrappedComponentProps = {
        intl: createIntl({locale: 'nb', defaultLocale: 'nb'})
    };

    const identDispatchProps: IIdentDispatchProps = {
        setSignaturAction: jest.fn(),
        setStepAction: jest.fn(),
        usignert: jest.fn(),
        usignertResetAction: jest.fn(),
        ...identDispatchPropsPartial
    };

    const signaturState: ISignaturState = {
        signert: null,
        isAwaitingUsignertRequestResponse: false,
        ...signaturStatePartial
    };

    const journalpost: IJournalpost = {
        dokumenter: [{dokumentId: '123'}],
        journalpostId: journalpostid,
        norskIdent: '12345678901'
    };

    const punchState: IPunchState = {
        journalpost,
        ident1: fnr,
        ident2: null,
        step: 1,
        isJournalpostLoading: false
    };

    const identStateProps: IIdentStateProps = {
        punchState,
        signaturState
    };

    const identComponentProps: IIdentComponentProps = {
        identInput: (disabled: boolean) => <Input value={fnr} {...{disabled}} label=""/>,
        identInputValues: {ident1: fnr, ident2: ''},
        findSoknader: jest.fn(),
        getPunchPath: jest.fn(),
        ...identComponentPropsPartial
    };

    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string, value?: {[key: string]: string}) => id);

    return shallow(
        <IdentComponent
            {...identComponentProps}
            {...wrappedComponentProps}
            {...identStateProps}
            {...identDispatchProps}
        />
    );
};

describe('Fordeling', () => {

    it('Viser radioknapper for signatur', () => {
        const ident = setupIdent();
        expect(ident.find('RadioPanelGruppe')).toHaveLength(1);
        expect(ident.find('RadioPanelGruppe').prop('radios')).toHaveLength(2);
        expect(ident.find('RadioPanelGruppe').prop('legend')).toEqual('ident.signatur.etikett');
    });

    it('Krysser ikke av radioknapp automatisk', () => {
        const ident = setupIdent();
        expect(ident.find('RadioPanelGruppe').prop('checked')).toBeFalsy();
    });

    it('Viser inputfelt for identifikasjonsnummer', () => {
        const ident = setupIdent();
        expect(ident.find('Input')).toHaveLength(1);
        expect(ident.find('Input').prop('value')).toEqual(fnr);
    });

    it('Deaktiverer inputfelt for identifikasjonsnummer og skjuler knapp for behandling av usignert søknad som standard', () => {
        const ident = setupIdent();
        expect(ident.find('.knapp-usignert')).toHaveLength(0);
        expect(ident.find('Input').prop('disabled')).toBeTruthy();
    });

    it('Aktiverer inputfelt for identifikasjonsnummer og skjuler knapp for behandling av usignert søknad når "ja" er valgt', () => {
        const ident = setupIdent({signert: JaNei.JA});
        expect(ident.find('RadioPanelGruppe').prop('checked')).toEqual(JaNei.JA);
        expect(ident.find('.knapp-usignert')).toHaveLength(0);
        expect(ident.find('Input').prop('disabled')).toBeFalsy();
    });

    it('Deaktiverer inputfelt for identifikasjonsnummer og viser knapp for behandling av usignert søknad når "nei" er valgt', () => {
        const ident = setupIdent({signert: JaNei.NEI});
        expect(ident.find('RadioPanelGruppe').prop('checked')).toEqual(JaNei.NEI);
        expect(ident.find('.knapp-usignert')).toHaveLength(1);
        expect(ident.find('Input').prop('disabled')).toBeTruthy();
    });

    it('Sender usignert søknad videre', () => {
        const usignert = jest.fn();
        const ident = setupIdent({signert: JaNei.NEI}, {usignert});
        ident.find('.knapp-usignert').simulate('click');
        expect(usignert).toHaveBeenCalledTimes(1);
        expect(usignert).toHaveBeenCalledWith(journalpostid);
    });

    it('Viser suksessmelding når usignert søknad er sendt videre', () => {
        const usignert = jest.fn();
        const ident = setupIdent({signert: JaNei.NEI, usignertRequestSuccess: true});
        expect(ident.find('AlertStripeSuksess')).toHaveLength(1);
        expect(ident.find('AlertStripeSuksess').children().text()).toEqual('ident.usignert.sendt');
    });

    it('Viser feilmelding når det har oppstått en feil i videresending av usignert søknad', () => {
        const usignert = jest.fn();
        const ident = setupIdent({signert: JaNei.NEI, usignertRequestSuccess: false, usignertRequestError: {status: 404}});
        expect(ident.find('AlertStripeFeil')).toHaveLength(1);
        expect(ident.find('AlertStripeFeil').children().text()).toEqual('ident.usignert.feil.melding');
    });

    it('Viser spinner mens svar fra videresending av usignert søknad avventes', () => {
        const usignert = jest.fn();
        const ident = setupIdent({signert: JaNei.NEI, isAwaitingUsignertRequestResponse: true});
        expect(ident.find('NavFrontendSpinner')).toHaveLength(1);
    });
});
