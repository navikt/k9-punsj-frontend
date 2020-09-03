import React from 'react';
import { JaNei } from '../../../models/enums';
import { FormattedMessage } from 'react-intl';
import TextInput from '../../../components/skjema/TextInput';
import { setHash } from '../../../utils';
import { Knapp } from 'nav-frontend-knapper';
import Knapper from '../../../components/knapp/Knapper';
import { Form } from 'formik';
import RadioInput from '../../../components/skjema/RadioInput';
import VerticalSpacer from '../../../components/VerticalSpacer';

const OmsorgspengerOverføringIdentSjekk: React.FunctionComponent = () => {
  return (
    <Form>
      <RadioInput
        feltnavn="signert"
        optionValues={Object.values(JaNei)}
        retning="horisontal"
        styling="medPanel"
      />
      <VerticalSpacer thirtyTwoPx={true} />
      {/* TODO: Sjekk fnr opp mot norskIdent */}
      <TextInput
        feltnavn="fødselsnummer"
        bredde="M"
        label={<FormattedMessage id="skjema.felt.ident.fødselsnummer.label" />}
      />
      <Knapper>
        <Knapp htmlType="button" onClick={() => setHash('/')}>
          <FormattedMessage id="ident.knapp.forrigesteg" />
        </Knapp>
        <Knapp htmlType="submit" type="hoved">
          <FormattedMessage id="ident.knapp.nestesteg" />
        </Knapp>
      </Knapper>
    </Form>
  );
};

export default OmsorgspengerOverføringIdentSjekk;
