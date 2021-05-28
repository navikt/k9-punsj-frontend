import {
  IPunchPageComponentProps,
  IPunchPageDispatchProps,
  IPunchPageStateProps,
  PunchPageComponent,
} from 'app/containers/pleiepenger/PunchPage';
import { IJournalpost, IPleiepengerPunchState } from 'app/models/types';
import intlHelper from 'app/utils/intlUtils';
import { shallow } from 'enzyme';
import { createMemoryHistory } from 'history';
import * as React from 'react';
import { createIntl, IntlShape, WrappedComponentProps } from 'react-intl';
import { mocked } from 'ts-jest/utils';
import {IIdentState} from "../../../app/models/types/IdentState";

jest.mock('react-intl');
jest.mock('react-router');
jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');
jest.mock('app/utils/pathUtils');
jest.mock('app/containers/pleiepenger/Fordeling', () => ({
  Fordeling: () => <></>,
}));
jest.mock('app/containers/pleiepenger/EksisterendeSoknader', () => ({
  EksisterendeSoknader: () => <></>,
}));
jest.mock('app/containers/pleiepenger/RegistreringsValg', () => ({
  RegistreringsValg: () => <></>,
}));
jest.mock('app/containers/pleiepenger/PunchForm', () => ({
  PunchForm: () => <></>,
}));

const setupPunchPage = (
  journalpostinfo: string | IJournalpost,
  hash: string,
  punchStatePartial?: Partial<IPleiepengerPunchState>,
  mappeid?: string,
  punchPageDispatchPropsPartial?: Partial<IPunchPageDispatchProps>
) => {
  const journalpostid =
    typeof journalpostinfo === 'string'
      ? journalpostinfo
      : journalpostinfo.journalpostId;

  const routeComponentProps = {
    match: { params: { id: mappeid } },
    history: createMemoryHistory({}),
    location: { pathname: `/${journalpostid}`, hash, search: '', state: '' },
  };

  const wrappedComponentProps: WrappedComponentProps = {
    intl: createIntl({ locale: 'nb', defaultLocale: 'nb' }),
  };

  const punchPageDispatchProps: IPunchPageDispatchProps = {
    setIdentAction: jest.fn(),
    setStepAction: jest.fn(),
    ...punchPageDispatchPropsPartial,
  };

  const journalpost: IJournalpost =
    typeof journalpostinfo === 'string'
      ? {
          dokumenter: [{ dokumentId: '123' }],
          journalpostId: journalpostid,
          norskIdent: '12123400036',
        }
      : journalpostinfo;

  const punchState: IPleiepengerPunchState = {
    step: 0,
    ident1: '',
    ident2: null,
    ...punchStatePartial,
  };

  const identState: IIdentState = {
    ident1: '',
    ident2: null,
  };

  const punchPageStateProps: IPunchPageStateProps = {
    punchState,
    journalpost,
    identState
  };

  const punchPageComponentProps: IPunchPageComponentProps = {
    step: punchState.step,
    journalpostid,
    paths: [],
  };

  mocked(intlHelper).mockImplementation(
    (intl: IntlShape, id: string, value?: { [key: string]: string }) => id
  );

  return shallow(
    <PunchPageComponent
      {...punchPageComponentProps}
      {...wrappedComponentProps}
      {...routeComponentProps}
      {...punchPageStateProps}
      {...punchPageDispatchProps}
    />
  );
};

describe('PunchPage', () => {

  it('Laster inn oversikt over ufullstendige søknader', () => {
    const journalpostid = '200';
    const ident1 = '12345678901';
    const punchPage = setupPunchPage(journalpostid, `#/hentsoknad/${ident1}`, {
      step: 0,
      ident1,
    });
    expect(punchPage.find('RegistreringsValg')).toHaveLength(1);
    expect(punchPage.find('RegistreringsValg').prop('journalpostid')).toEqual(
      journalpostid
    );
  });

  it('Laster inn søknadsskjema', () => {
    const journalpostid = '200';
    const ident1 = '12345678901';
    const mappeid = 'abc';
    const punchPage = setupPunchPage(
      journalpostid,
      `#/hentsoknad/${mappeid}`,
      { step: 1, ident1 },
      mappeid
    );
    expect(punchPage.find('PunchForm')).toHaveLength(1);
    expect(punchPage.find('PunchForm').prop('journalpostid')).toEqual(
      journalpostid
    );
    expect(punchPage.find('PunchForm').prop('id')).toEqual(mappeid);
  });

  it('Viser fullførtmelding', () => {
    const journalpostid = '200';
    const punchPage = setupPunchPage(journalpostid, `#/fullfort`, {
      step: 2,
      ident1: '',
    });
    expect(punchPage.find('AlertStripeSuksess')).toHaveLength(1);
  });
});
