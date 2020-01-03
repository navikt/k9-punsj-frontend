import {
    FordelingComponent,
    IFordelingComponentProps,
    IFordelingDispatchProps,
    IFordelingStateProps
}                                                     from 'app/containers/punch-page/Fordeling';
import {Sakstype}                                     from 'app/models/enums';
import {IFordelingState, IJournalpost, IPunchState}   from 'app/models/types';
import intlHelper                                     from 'app/utils/intlUtils';
import {configure, shallow}                           from 'enzyme';
import Adapter                                        from 'enzyme-adapter-react-16';
import * as React                                     from 'react';
import {createIntl, IntlShape, WrappedComponentProps} from 'react-intl';
import {mocked}                                       from 'ts-jest/utils';

jest.mock('react-intl');
jest.mock('react-router');
jest.mock('app/utils/browserUtils');
jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');
jest.mock('app/utils/pathUtils');

configure({adapter: new Adapter()});

const setupFordeling = () => {

    const journalpostid = '200';
    const ident = '678';

    const wrappedComponentProps: WrappedComponentProps = {
        intl: createIntl({locale: 'nb', defaultLocale: 'nb'})
    };

    const fordelingDispatchProps: IFordelingDispatchProps = {
        setStepAction: jest.fn(),
        omfordel: jest.fn(),
        setSakstypeAction: jest.fn()
    };

    const journalpost: IJournalpost = {
        dokumenter: [{dokument_id: '123'}],
        journalpost_id: journalpostid,
        norsk_ident: '12345678901'
    };

    const punchState: IPunchState = {
        journalpost,
        ident,
        step: 2,
        isJournalpostLoading: false
    };

    const fordelingState: IFordelingState = {
        omfordelingDone: false,
        isAwaitingOmfordelingResponse: false,
        sakstype: Sakstype.PLEIEPENGER_SYKT_BARN
    };

    const fordelingStateProps: IFordelingStateProps = {
        punchState,
        fordelingState
    };

    const fordelingComponentProps: IFordelingComponentProps = {
        getPunchPath: jest.fn()
    };

    mocked(intlHelper).mockImplementation((intl: IntlShape, id: string, value?: {[key: string]: string}) => id);

    return shallow(
        <FordelingComponent
            {...fordelingComponentProps}
            {...wrappedComponentProps}
            {...fordelingStateProps}
            {...fordelingDispatchProps}
        />
    );
};

describe('Fordeling', () => {
    it('Viser radioknapper', () => {
        const fordeling = setupFordeling();
        expect(fordeling.find('RadioPanelGruppe')).toHaveLength(1);
    });
});