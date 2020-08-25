import React from 'react';
import { FormattedMessage } from 'react-intl';
import { CheckboxGruppe, SkjemaGruppe } from 'nav-frontend-skjema';
import CheckboxInput from '../../../components/skjema/CheckboxInput';
import { Knapp } from 'nav-frontend-knapper';
import { setHash } from '../../../utils';
import Knapper from '../../../components/knapp/Knapper';
import RadioInput from '../../../components/skjema/RadioInput';
import { JaNei } from '../../../models/enums';
import TextInput from '../../../components/skjema/TextInput';
import { useOverføringPunchSkjemaContext } from './OverføringPunchContainer';
import NumberInput from '../../../components/skjema/NumberInput';
import { Mottaker } from '../../../models/forms/omsorgspenger/overføring/PunchSkjema';
import { Form } from 'formik';

const OverføringPunchSkjema: React.FunctionComponent = () => {
  const { errors } = useOverføringPunchSkjemaContext();

  return (
    <Form>
      <section>
        <h1>
          <FormattedMessage id="omsorgsdager.overføring.punch.overskrift" />
        </h1>
        <h2>
          <FormattedMessage id="omsorgsdager.overføring.punch.omsøkeren" />
        </h2>
        <CheckboxGruppe
          legend={<FormattedMessage id="skjema.felt.arbeidssituasjon.label" />}
          feil={errors.arbeidssituasjon?.metaHarFeil}
        >
          <CheckboxInput feltnavn="arbeidssituasjon.erArbeidstaker" />
          <CheckboxInput feltnavn="arbeidssituasjon.erFrilanser" />
          <CheckboxInput feltnavn="arbeidssituasjon.erSelvstendigNæringsdrivende" />
        </CheckboxGruppe>
        <RadioInput
          feltnavn="aleneOmOmsorgen"
          optionValues={Object.values(JaNei)}
          retning="vertikal"
          styling="utenPanel"
        />
        <RadioInput
          feltnavn="fosterbarn.harFosterbarn"
          optionValues={Object.values(JaNei)}
          retning="vertikal"
          styling="utenPanel"
        />
        <SkjemaGruppe
          legend={
            <FormattedMessage id="omsorgsdager.overføring.punch.omsorgendelesmed" />
          }
        >
          <TextInput feltnavn="omsorgenDelesMed.fødselsnummer" />
          <RadioInput
            feltnavn="omsorgenDelesMed.mottaker"
            optionValues={Object.values(Mottaker)}
            retning="vertikal"
            styling="utenPanel"
          />
        </SkjemaGruppe>
        <NumberInput feltnavn="omsorgenDelesMed.antallOverførteDager" />
        <Knapper>
          <Knapp htmlType="button" onClick={() => setHash('/')}>
            <FormattedMessage id="ident.knapp.forrigesteg" />
          </Knapp>
          <Knapp htmlType="submit" type="hoved">
            <FormattedMessage id="ident.knapp.nestesteg" />
          </Knapp>
        </Knapper>
      </section>
    </Form>
  );
};

export default OverføringPunchSkjema;
