import { JournalpostLoaderImpl } from '../../app/containers/JournalpostLoader';
import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import { IPleiepengerPunchState } from '../../app/models/types';
import { shallow } from 'enzyme';

jest.mock('app/utils/envUtils');
jest.mock('react-intl');

const setupLoader = (
  punchState: IPleiepengerPunchState,
  renderedOnLoad: () => React.ReactNode
): RenderResult => {
  const getJournalpost = jest.fn();
  const journalpostId = '200';

  const loader = render(
    <JournalpostLoaderImpl
      journalpostId={journalpostId}
      renderOnLoadComplete={renderedOnLoad}
      getJournalpost={getJournalpost}
      punchState={punchState}
    />
  );

  expect(getJournalpost).toHaveBeenCalledTimes(1);

  return loader;
};

describe('JournalpostLoader', () => {
  it('Henter journalpost og viser innhold', () => {
    const journalpostId = '200';

    const testId = 'test-id';
    const renderedOnLoad = () => <div data-testid={testId} />;

    const punchStateMedDokumenter: IPleiepengerPunchState = {
      step: 0,
      ident1: '',
      ident2: null,
      journalpost: {
        dokumenter: [
          {
            dokumentId: '123',
          },
        ],
        journalpostId,
      },
    };

    const { getByTestId } = setupLoader(
      punchStateMedDokumenter,
      renderedOnLoad
    );

    expect(getByTestId(testId)).toBeDefined();
  });

  it('Viser feilmelding hvis journalpost ikke finnes', () => {
    const testId = 'test-id';
    const renderedOnLoad = () => <div data-testid={testId} />;

    const punchStateMedError: IPleiepengerPunchState = {
      step: 0,
      ident1: '',
      ident2: null,
      journalpostRequestError: { status: 404 },
    };
    const { queryByTestId } = setupLoader(punchStateMedError, renderedOnLoad);

    expect(queryByTestId(testId)).toBeNull();
  });

  it('Viser spinner mens journalpost lastes inn', () => {
    const journalpostId = '200';
    const testId = 'test-id';
    const renderedOnLoad = () => <div data-testid={testId} />;
    const punchStateLoading: IPleiepengerPunchState = {
      step: 0,
      ident1: '',
      ident2: null,
      isJournalpostLoading: true,
      journalpost: {
        dokumenter: [],
        journalpostId,
      },
    };

    const journalpost = shallow(
      <JournalpostLoaderImpl
        punchState={punchStateLoading}
        renderOnLoadComplete={renderedOnLoad}
        journalpostId={journalpostId}
        getJournalpost={jest.fn()}
      />
    );

    expect(journalpost.find('NavFrontendSpinner')).toHaveLength(1);
  });

  it('Viser feilmelding når journalposten ikke har tilhørende dokumenter', () => {
    const journalpostId = '200';
    const testId = 'test-id';
    const renderedOnLoad = () => <div data-testid={testId} />;

    const punchStateIngenDokumenter: IPleiepengerPunchState = {
      step: 0,
      ident1: '',
      ident2: null,
      journalpost: {
        dokumenter: [],
        journalpostId,
      },
    };

    const journalpost = shallow(
      <JournalpostLoaderImpl
        punchState={punchStateIngenDokumenter}
        renderOnLoadComplete={renderedOnLoad}
        journalpostId={journalpostId}
        getJournalpost={jest.fn()}
      />
    );

    expect(journalpost.find('AlertStripeFeil')).toHaveLength(1);
    expect(journalpost.find('FormattedMessage').prop('id')).toEqual(
      'startPage.feil.ingendokumenter'
    );
  });
});
