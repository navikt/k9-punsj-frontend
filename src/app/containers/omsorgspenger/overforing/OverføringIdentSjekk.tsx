import React, { useEffect } from 'react';
import { JaNei } from '../../../models/enums';
import { FormattedMessage } from 'react-intl';
import TextInput from '../../../components/skjema/TextInput';
import { setHash } from '../../../utils';
import { Knapp } from 'nav-frontend-knapper';
import Knapper from '../../../components/knapp/Knapper';
import { Form, useFormikContext } from 'formik';
import RadioInput from '../../../components/skjema/RadioInput';
import VerticalSpacer from '../../../components/VerticalSpacer';
import { ISignaturSkjema } from '../../../models/forms/omsorgspenger/overføring/SignaturSkjema';
import { Nesteknapp, Tilbakeknapp } from 'nav-frontend-ikonknapper';

interface IOverføringIdentSjekk {
    journalpostensRegistrertePersonident?: string;
}

const OverføringIdentSjekk: React.FunctionComponent<IOverføringIdentSjekk> = ({
    journalpostensRegistrertePersonident,
}) => {
    const { values, setFieldValue } = useFormikContext<ISignaturSkjema>();

    const { signert, sammeIdentSomRegistrert } = values;

    useEffect(() => {
        if (sammeIdentSomRegistrert === JaNei.JA) {
            setFieldValue('identitetsnummer', journalpostensRegistrertePersonident);
        } else if (sammeIdentSomRegistrert === JaNei.NEI) {
            setFieldValue('identitetsnummer', null);
        }
    }, [sammeIdentSomRegistrert]);

    const erSignert = signert === JaNei.JA;

    const skalViseSammeSomRegistrertRadios = erSignert && !!journalpostensRegistrertePersonident;

    const skalViseIdentInput =
        erSignert && (!journalpostensRegistrertePersonident || sammeIdentSomRegistrert === JaNei.NEI);

    return (
        <Form>
            <RadioInput
                feltnavn="signert"
                optionValues={Object.values(JaNei)}
                retning="horisontal"
                styling="medPanel"
            />
            <VerticalSpacer twentyPx={true} />
            {skalViseSammeSomRegistrertRadios && (
                <RadioInput
                    feltnavn="sammeIdentSomRegistrert"
                    optionValues={Object.values(JaNei)}
                    styling="medPanel"
                    retning="horisontal"
                    label={
                        <FormattedMessage
                            id="skjema.felt.ident.sammeIdentSomRegistrert.label"
                            values={{ ident: journalpostensRegistrertePersonident }}
                        />
                    }
                />
            )}
            {skalViseIdentInput && (
                <>
                    <VerticalSpacer twentyPx={true} />
                    <TextInput
                        feltnavn="identitetsnummer"
                        bredde="M"
                        label={<FormattedMessage id="skjema.felt.ident.identitetsnummer.label" />}
                    />
                </>
            )}
            <VerticalSpacer thirtyTwoPx={true} />
            <Knapper>
                <Tilbakeknapp htmlType="button" onClick={() => setHash('/')}>
                    <FormattedMessage id="ident.knapp.forrigesteg" />
                </Tilbakeknapp>
                {erSignert && (
                    <Nesteknapp htmlType="submit" type="hoved">
                        <FormattedMessage id="ident.knapp.nestesteg" />
                    </Nesteknapp>
                )}
                {signert === JaNei.NEI && (
                    <Knapp htmlType="button" type="hoved" onClick={() => undefined}>
                        <FormattedMessage id="ident.knapp.usignert" />
                    </Knapp>
                )}
            </Knapper>
        </Form>
    );
};

export default OverføringIdentSjekk;
