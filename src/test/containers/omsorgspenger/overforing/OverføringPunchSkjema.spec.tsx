import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouterAndIntl } from '../../../testUtils';
import SkjemaContext from '../../../../app/components/skjema/SkjemaContext';
import {
  Innsendingsstatus,
  tomtSkjema,
  validatePunch,
} from '../../../../app/models/forms/omsorgspenger/overføring/PunchSkjema';
import OverføringPunchSkjema from '../../../../app/containers/omsorgspenger/overforing/OverføringPunchSkjema';

jest.mock('app/utils/envUtils');

describe('<OverføringPunchSkjema>', () => {
  test('Viser alle feltfeil hvis man sender inn skjema med feil', async () => {
    const onSubmitCallback = jest.fn;
    const gåTilForrigeSteg = jest.fn;

    renderWithRouterAndIntl(
      <SkjemaContext
        initialValues={tomtSkjema}
        onSubmitCallback={onSubmitCallback}
        validerSkjema={validatePunch}
      >
        <OverføringPunchSkjema
          gåTilForrigeSteg={gåTilForrigeSteg}
          innsendingsstatus={Innsendingsstatus.IkkeSendtInn}
        />
      </SkjemaContext>
    );

    const sendInnKnapp = screen.getByRole('button', { name: /send inn/i });

    userEvent.click(sendInnKnapp);

    const påkrevdeFelter = await screen.findAllByText(/påkrevd felt/i);
    const antallPåkrevdeFelter = 7;
    expect(påkrevdeFelter).toHaveLength(antallPåkrevdeFelter);

    const antallDagerFeil = screen.getByText(
      /Må være et heltall større enn null/i
    );

    expect(antallDagerFeil).toBeInTheDocument();
  });

  test('"Legg til barn"-knapp legger til et barn', async () => {
    const onSubmitCallback = jest.fn;
    const gåTilForrigeSteg = jest.fn;

    renderWithRouterAndIntl(
      <SkjemaContext
        initialValues={tomtSkjema}
        onSubmitCallback={onSubmitCallback}
        validerSkjema={validatePunch}
      >
        <OverføringPunchSkjema
          gåTilForrigeSteg={gåTilForrigeSteg}
          innsendingsstatus={Innsendingsstatus.IkkeSendtInn}
        />
      </SkjemaContext>
    );

    const barnISkjemaet = () =>
      screen.findAllByRole('group', { name: /barn nummer/i });

    expect(await barnISkjemaet()).toHaveLength(1);

    const leggTilBarnKnapp = screen.getByRole('button', {
      name: /legg til flere barn/i,
    });

    userEvent.click(leggTilBarnKnapp);

    expect(await barnISkjemaet()).toHaveLength(2);
  });
});
