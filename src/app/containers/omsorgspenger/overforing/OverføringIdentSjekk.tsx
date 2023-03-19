import { Form, useFormikContext } from 'formik';
import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { Back, Next } from '@navikt/ds-icons';
import { Button } from '@navikt/ds-react';

import VerticalSpacer from '../../../components/VerticalSpacer';
import Knapper from '../../../components/knapp/Knapper';
import RadioInput from '../../../components/skjema/RadioInput';
import TextInput from '../../../components/skjema/TextInput';
import { JaNei } from '../../../models/enums';
import { ISignaturSkjema } from '../../../models/forms/omsorgspenger/overføring/SignaturSkjema';
import { setHash } from '../../../utils';

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
            <VerticalSpacer twentyPx />
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
                    <VerticalSpacer twentyPx />
                    <TextInput
                        feltnavn="identitetsnummer"
                        bredde="M"
                        label={<FormattedMessage id="skjema.felt.ident.identitetsnummer.label" />}
                    />
                </>
            )}
            <VerticalSpacer thirtyTwoPx />
            <Knapper>
                <Button variant="tertiary" icon={<Back aria-hidden />} type="button" onClick={() => setHash('/')}>
                    <FormattedMessage id="ident.knapp.forrigesteg" />
                </Button>
                {erSignert && (
                    <Button variant="tertiary" icon={<Next aria-hidden />} type="submit" iconPosition="right">
                        <FormattedMessage id="ident.knapp.nestesteg" />
                    </Button>
                )}
                {signert === JaNei.NEI && (
                    <Button type="button" variant="secondary" onClick={() => undefined}>
                        <FormattedMessage id="ident.knapp.usignert" />
                    </Button>
                )}
            </Knapper>
        </Form>
    );
};

export default OverføringIdentSjekk;
