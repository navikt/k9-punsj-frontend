import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box } from '@navikt/ds-react';
import { JaNeiIkkeRelevant } from 'app/models/enums/JaNeiIkkeRelevant';
import intlHelper from 'app/utils/intlUtils';
import { useFormContext } from 'react-hook-form';
import { getTypedFormComponents } from 'app/components/form/getTypedFormComponents';
import { useOMPAOValidationRules } from '../../validation/useOMPAOValidationRules';

import { IOMPAOSoknad } from '../../types/OMPAOSoknad';

import './opplysningerOmOMPAOSoknad.less';

const { TypedFormDatePicker, TypedFormTextField, TypedFormRadioGroup } = getTypedFormComponents<IOMPAOSoknad>();

const OpplysningerOmOMPAOSoknadV2: React.FunctionComponent = () => {
    const intl = useIntl();
    const { watch } = useFormContext<IOMPAOSoknad>();
    const validationRules = useOMPAOValidationRules<IOMPAOSoknad>();

    const signatur = watch('metadata.signatur');

    return (
        <div className="mt-4">
            <Box padding="4" borderWidth="1" borderRadius="small">
                <Alert variant="info" className="alert">
                    <FormattedMessage id={'skjema.mottakelsesdato.informasjon'} />
                </Alert>

                <div className="input-row">
                    <TypedFormDatePicker
                        name="mottattDato"
                        label={intlHelper(intl, 'skjema.mottakelsesdato')}
                        validate={validationRules.getDateRule()}
                    />
                    <TypedFormTextField
                        name="klokkeslett"
                        label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                        type="time"
                        className="klokkeslett"
                        validate={validationRules.getTimeRule()}
                    />
                </div>

                <TypedFormRadioGroup
                    legend={intlHelper(intl, 'ident.signatur.etikett')}
                    name="metadata.signatur"
                    layout="horizontal"
                    horizontalSpacing={16}
                    options={Object.values(JaNeiIkkeRelevant).map((jn) => ({
                        label: intlHelper(intl, jn),
                        value: jn,
                    }))}
                    validate={validationRules.getSignatureRule()}
                />

                {signatur === JaNeiIkkeRelevant.NEI && (
                    <Alert size="small" variant="warning">
                        <FormattedMessage id={'skjema.usignert.info'} />
                    </Alert>
                )}
            </Box>
        </div>
    );
};
export default OpplysningerOmOMPAOSoknadV2;
