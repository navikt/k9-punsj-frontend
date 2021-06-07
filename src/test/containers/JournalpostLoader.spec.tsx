import {
  JournalpostLoaderImpl,
  JournapostLoaderProps,
} from '../../app/containers/JournalpostLoader';
import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import { IJournalpost } from '../../app/models/types';
import { shallow } from 'enzyme';

jest.mock('app/utils/envUtils');
jest.mock('react-intl');

const setupLoader = ({
  journalpost,
  renderOnLoadComplete = () => '',
  getJournalpost = jest.fn(),
  journalpostId = '200',
  journalpostRequestError,
  isJournalpostLoading,
    forbidden,
    notFound
}: Partial<JournapostLoaderProps>): RenderResult => {
  const loader = render(
    <JournalpostLoaderImpl
      journalpostId={journalpostId}
      renderOnLoadComplete={renderOnLoadComplete}
      getJournalpost={getJournalpost}
      journalpost={journalpost}
      journalpostRequestError={journalpostRequestError}
      isJournalpostLoading={isJournalpostLoading}
      forbidden={forbidden}
      notFound={notFound}
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

    const journalpost = {
      dokumenter: [
        {
          dokumentId: '123',
        },
      ],
      journalpostId,
    };

    const { getByTestId } = setupLoader({
      journalpost,
      renderOnLoadComplete: renderedOnLoad,
    });

    expect(getByTestId(testId)).toBeDefined();
  });

  it('Viser spinner mens journalpost lastes inn', () => {
    const journalpostId = '200';
    const testId = 'test-id';
    const renderedOnLoad = () => <div data-testid={testId} />;

    const journalpost = shallow(
      <JournalpostLoaderImpl
        isJournalpostLoading={true}
        renderOnLoadComplete={renderedOnLoad}
        journalpostId={journalpostId}
        getJournalpost={jest.fn()}
        forbidden={false}
        notFound={false}
      />
    );

    expect(journalpost.find('NavFrontendSpinner')).toHaveLength(1);
  });

 it('Viser feilmelding når journalposten ikke har tilhørende dokumenter', () => {
    const journalpostId = '200';
    const testId = 'test-id';
    const renderedOnLoad = () => <div data-testid={testId} />;

    const journalpostIngenDokumenter: IJournalpost = {
      dokumenter: [],
      journalpostId,
    };

    const journalpost = shallow(
      <JournalpostLoaderImpl
        journalpost={journalpostIngenDokumenter}
        renderOnLoadComplete={renderedOnLoad}
        journalpostId={journalpostId}
        getJournalpost={jest.fn()}
        forbidden={false}
        notFound={false}
      />
    );

    const alert = journalpost.find('AlertStripeFeil');
    expect(alert).toHaveLength(1);
    expect(alert.childAt(0).prop('id')).toEqual(
      'startPage.feil.ingendokumenter'
    );
  });
});
