import React, { useState } from 'react';

import { RadioPanelGruppe } from 'nav-frontend-skjema';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, Heading } from '@navikt/ds-react';

import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';
import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import { JaNeiIkkeRelevant } from 'app/models/enums/JaNeiIkkeRelevant';
import { PunchFormPaneler } from 'app/models/enums/PunchFormPaneler';
import intlHelper from 'app/utils/intlUtils';

const OpplysningerOmSoknad: React.FC = () => {
    const intl = useIntl();

    const [signert, setSignert] = useState<JaNeiIkkeRelevant | undefined>(undefined);

    return (
        <Box padding="4" borderWidth="1" borderRadius="small">
            <Heading size="small" level="3">
                <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKNAD} />
            </Heading>

            <Alert size="small" variant="info">
                <FormattedMessage id="skjema.mottakelsesdato.informasjon" />
            </Alert>

            <div className="input-row">
                <DatoInputFormikNew label={intlHelper(intl, 'skjema.mottakelsesdato')} name="mottattDato" />

                <TextFieldFormik
                    label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                    name="klokkeslett"
                    className="klokkeslett"
                    size="small"
                    type="time"
                />
            </div>

            <RadioPanelGruppe
                className="horizontalRadios"
                radios={Object.values(JaNeiIkkeRelevant).map((jn) => ({
                    label: intlHelper(intl, jn),
                    value: jn,
                }))}
                name="signatur"
                legend={intlHelper(intl, 'ident.signatur.etikett')}
                checked={signert || undefined}
                onChange={(event) =>
                    setSignert(((event.target as HTMLInputElement).value as JaNeiIkkeRelevant) || undefined)
                }
            />

            {signert === JaNeiIkkeRelevant.NEI && (
                <Alert size="small" variant="warning">
                    <FormattedMessage id="skjema.usignert.info" />
                </Alert>
            )}
        </Box>
    );
};
export default OpplysningerOmSoknad;
