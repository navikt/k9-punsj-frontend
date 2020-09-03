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
import VerticalSpacer from '../../../components/VerticalSpacer';
import { useRouteMatch } from 'react-router';
import LabelValue from '../../../components/skjema/LabelValue';
import { Undertittel } from 'nav-frontend-typografi';

const OverføringPunchSkjema: React.FunctionComponent = () => {
  const { values } = useOverføringPunchSkjemaContext();
  const { params } = useRouteMatch<{ ident?: string }>();
  const ident = params?.ident;

  return (
    <Form>
      <section>
        <LabelValue
          labelTextId="omsorgsdager.overføring.fødselsnummer"
          value={ident}
        />
        <VerticalSpacer hr={true} sixteenPx={true} />
        <Undertittel tag="h2">
          <FormattedMessage id="omsorgsdager.overføring.punch.omsøkeren" />
        </Undertittel>
        <VerticalSpacer sixteenPx={true} />
        <CheckboxInputGruppe
          feltnavn="arbeidssituasjon"
          checkboxFeltnavn={[
            'erArbeidstaker',
            'erFrilanser',
            'erSelvstendigNæringsdrivende',
          ]}
          metaHarFeilFeltnavn="metaHarFeil"
        />
        <VerticalSpacer sixteenPx={true} />
        <RadioInput
          feltnavn="aleneOmOmsorgen"
          optionValues={Object.values(JaNei)}
          retning="vertikal"
          styling="utenPanel"
        />
        <VerticalSpacer sixteenPx={true} />
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
        <VerticalSpacer dashed={true} thirtyTwoPx={true} />
        <Undertittel tag="h2">
          <FormattedMessage id="omsorgsdager.overføring.punch.omsorgendelesmed" />
        </Undertittel>
        <VerticalSpacer sixteenPx={true} />
        <TextInput feltnavn="omsorgenDelesMed.fødselsnummer" bredde="M" />
        <VerticalSpacer thirtyTwoPx={true} />
        <RadioInput
          feltnavn="omsorgenDelesMed.mottaker"
          optionValues={Object.values(Mottaker)}
          retning="vertikal"
          styling="utenPanel"
        />
        <VerticalSpacer sixteenPx={true} />
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
