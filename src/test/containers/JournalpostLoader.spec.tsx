import React from 'react';
import { expect } from '@jest/globals';
import { RenderResult, render } from '@testing-library/react';
import { shallow } from 'enzyme';

import { JournalpostLoaderImpl, JournapostLoaderProps } from '../../app/containers/journalpostLoader/JournalpostLoader';
import { IJournalpost } from '../../app/models/types/Journalpost/Journalpost';

// Mock useParams
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({
        journalpostid: '1234',
    }),
}));
jest.mock('app/utils/envUtils');
jest.mock('react-intl');

const setupLoader = ({
    journalpost,
    renderOnLoadComplete = () => '',
    getJournalpost = jest.fn(),
    journalpostRequestError,
    isJournalpostLoading,
    forbidden,
    notFound,
}: Partial<JournapostLoaderProps>): RenderResult => {
    const loader = render(
        <JournalpostLoaderImpl
            renderOnLoadComplete={renderOnLoadComplete}
            getJournalpost={getJournalpost}
            journalpost={journalpost}
            journalpostRequestError={journalpostRequestError}
            isJournalpostLoading={isJournalpostLoading}
            forbidden={forbidden}
            conflict={false}
            notFound={notFound}
            lukkOppgaveReset={jest.fn()}
            lukkOppgaveDone={undefined}
        />,
    );

    expect(getJournalpost).toHaveBeenCalledTimes(1);

    return loader;
};

describe('JournalpostLoader', () => {
    it('Henter journalpost og viser innhold', () => {
        const journalpostId = '200';

        const testId = 'test-id';
        const renderedOnLoad = () => <div data-testid={testId} />;

        const journalpost = {
            dokumenter: [
                {
                    dokumentId: '123',
                },
            ],
            journalpostId,
            kanSendeInn: true,
            erSaksbehandler: true,
        };

        const { getByTestId } = setupLoader({
            journalpost,
            renderOnLoadComplete: renderedOnLoad,
        });

        expect(getByTestId(testId)).toBeDefined();
    });

    it('Viser spinner mens journalpost lastes inn', () => {
        const testId = 'test-id';
        const renderedOnLoad = () => <div data-testid={testId} />;

        const journalpost = shallow(
            <JournalpostLoaderImpl
                isJournalpostLoading
                renderOnLoadComplete={renderedOnLoad}
                getJournalpost={jest.fn()}
                forbidden={false}
                conflict={false}
                notFound={false}
                lukkOppgaveReset={jest.fn()}
                lukkOppgaveDone={undefined}
            />,
        );

        expect(journalpost.findWhere((n) => n.name() === 'ForwardRef' && n.prop('size') === 'large')).toHaveLength(1);
    });

    it('Viser feilmelding når journalposten ikke har tilhørende dokumenter', () => {
        const journalpostId = '200';
        const testId = 'test-id';
        const renderedOnLoad = () => <div data-testid={testId} />;

        const journalpostIngenDokumenter: IJournalpost = {
            dokumenter: [],
            journalpostId,
            kanSendeInn: true,
            erSaksbehandler: true,
            journalpostStatus: undefined,
        };

        const journalpost = shallow(
            <JournalpostLoaderImpl
                journalpost={journalpostIngenDokumenter}
                renderOnLoadComplete={renderedOnLoad}
                getJournalpost={jest.fn()}
                forbidden={false}
                conflict={false}
                notFound={false}
                lukkOppgaveReset={jest.fn()}
                lukkOppgaveDone={undefined}
            />,
        );

        const alert = journalpost.findWhere((n) => n.name() === 'ForwardRef' && n.prop('variant') === 'error');
        expect(alert).toHaveLength(1);
        expect(alert.childAt(0).prop('id')).toEqual('startPage.feil.ingendokumenter');
    });

    it('Viser feilmelding når journalposten ikke støttes', () => {
        const testId = 'test-id';
        const renderedOnLoad = () => <div data-testid={testId} />;

        const journalpost = shallow(
            <JournalpostLoaderImpl
                renderOnLoadComplete={renderedOnLoad}
                getJournalpost={jest.fn()}
                forbidden={false}
                conflict
                journalpostConflictError={{ type: 'punsj://ikke-støttet-journalpost' }}
                notFound={false}
                lukkOppgaveReset={jest.fn()}
                lukkOppgaveDone={undefined}
            />,
        );

        const felmelding = journalpost.find('ConflictErrorComponent');
        expect(felmelding).toHaveLength(1);
        expect(felmelding.prop('lukkDebuggJpStatus')).toEqual(undefined);
    });

    it('Viser feilmelding når SB ikke har tillgang att se journalposten', () => {
        const testId = 'test-id';
        const renderedOnLoad = () => <div data-testid={testId} />;

        const journalpost = shallow(
            <JournalpostLoaderImpl
                renderOnLoadComplete={renderedOnLoad}
                getJournalpost={jest.fn()}
                forbidden
                conflict={false}
                notFound={false}
                lukkOppgaveReset={jest.fn()}
                lukkOppgaveDone={undefined}
            />,
        );

        const felmelding = journalpost.find('FeilmeldingPanel');
        expect(felmelding).toHaveLength(1);
        expect(felmelding.prop('messageId')).toEqual('startPage.feil.ikketilgang');
    });

    it('Viser LOS lukk oppgave modal etter att oppgaven har blivit lukket', () => {
        const testId = 'test-id';
        const renderedOnLoad = () => <div data-testid={testId} />;

        const journalpost = shallow(
            <JournalpostLoaderImpl
                renderOnLoadComplete={renderedOnLoad}
                getJournalpost={jest.fn()}
                forbidden={false}
                conflict={false}
                notFound={false}
                lukkOppgaveReset={jest.fn()}
                lukkOppgaveDone
            />,
        );

        const Modal = journalpost.findWhere(
            (n) => n.name() === 'ForwardRef' && n.prop('aria-label') === 'settpaaventokmodal',
        );
        expect(Modal).toHaveLength(1);
    });
});
