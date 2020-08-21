import React from 'react';
import { JaNei } from '../../../models/enums';
import { FormattedMessage } from 'react-intl';
import TextInput from '../../../components/skjema/TextInput';
import { setHash } from '../../../utils';
import { Knapp } from 'nav-frontend-knapper';
import Knapper from '../../../components/knapp/Knapper';
import { Form } from 'formik';
import RadioInput from '../../../components/skjema/RadioInput';

const OmsorgspengerOverføringIdentSjekk: React.FunctionComponent = () => {
  return (
    <Form>
      <h2>
        <FormattedMessage id="ident.signatur.overskrift" />
      </h2>
      <RadioInput
        feltnavn="signert"
        optionValues={Object.values(JaNei)}
        retning="horisontal"
      />
      <h2>
        <FormattedMessage id="ident.identifikasjon.overskrift" />
      </h2>
      {/* TODO: Sjekk fnr opp mot norskIdent */}
      <TextInput feltnavn="fødselsnummer" />
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
