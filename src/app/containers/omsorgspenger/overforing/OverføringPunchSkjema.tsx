import React from 'react';
import { FormattedMessage } from 'react-intl';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import { Knapp } from 'nav-frontend-knapper';
import { Form } from 'formik';
import { setHash } from '../../../utils';
import Knapper from '../../../components/knapp/Knapper';
import RadioInput from '../../../components/skjema/RadioInput';
import { JaNei } from '../../../models/enums';
import TextInput from '../../../components/skjema/TextInput';
import NumberInput from '../../../components/skjema/NumberInput';
import { Mottaker } from '../../../models/forms/omsorgspenger/overføring/PunchSkjema';
import CheckboxInputGruppe from '../../../components/skjema/CheckboxInputGruppe';
import { useOverføringPunchSkjemaContext } from './OverføringPunchContainer';
import FlexRow from '../../../components/flexgrid/FlexRow';

const OverføringPunchSkjema: React.FunctionComponent = () => {
  const { values } = useOverføringPunchSkjemaContext();
  return (
    <Form>
      <section>
        <h1>
          <FormattedMessage id="omsorgsdager.overføring.punch.overskrift" />
        </h1>
        <h2>
          <FormattedMessage id="omsorgsdager.overføring.punch.omsøkeren" />
        </h2>
        <CheckboxInputGruppe
          feltnavn="arbeidssituasjon"
          checkboxFeltnavn={[
            'erArbeidstaker',
            'erFrilanser',
            'erSelvstendigNæringsdrivende',
          ]}
          metaHarFeilFeltnavn="metaHarFeil"
        />
        <RadioInput
          feltnavn="aleneOmOmsorgen"
          optionValues={Object.values(JaNei)}
          retning="vertikal"
          styling="utenPanel"
        />
        <FlexRow childrenMargin="big">
          <RadioInput
            feltnavn="fosterbarn.harFosterbarn"
            optionValues={Object.values(JaNei)}
            retning="vertikal"
            styling="utenPanel"
          />
          {values.fosterbarn.harFosterbarn === JaNei.JA && (
            <TextInput feltnavn="fosterbarn.fødselsnummer" bredde="M" />
          )}
        </FlexRow>
        <SkjemaGruppe
          legend={
            <FormattedMessage id="omsorgsdager.overføring.punch.omsorgendelesmed" />
          }
        >
          <TextInput feltnavn="omsorgenDelesMed.fødselsnummer" bredde="M" />
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
