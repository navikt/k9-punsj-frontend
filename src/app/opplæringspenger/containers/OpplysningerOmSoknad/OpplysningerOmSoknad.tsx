import { RadioPanelGruppe } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';

import { Alert, Box, Fieldset } from '@navikt/ds-react';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';

import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import { JaNeiIkkeRelevant } from 'app/models/enums/JaNeiIkkeRelevant';
import { PunchFormPaneler } from 'app/models/enums/PunchFormPaneler';
import intlHelper from 'app/utils/intlUtils';

import './opplysningerOmSoknad.less';

const OpplysningerOmSoknad = () => {
    const intl = useIntl();
    const [signert, setSignert] = useState<JaNeiIkkeRelevant | undefined>(undefined);
    return (
        <Box padding="4" borderRadius="small" className="opplysningerOmSoknad">
            <h3>{intlHelper(intl, PunchFormPaneler.OPPLYSINGER_OM_SOKNAD)}</h3>
            <Alert size="small" variant="info">
                {intlHelper(intl, 'skjema.mottakelsesdato.informasjon')}
            </Alert>
            <Fieldset legend={undefined}>
                <div className="input-row">
                    <DatoInputFormikNew label={intlHelper(intl, 'skjema.mottakelsesdato')} name="mottattDato" />
                    <div>
                        <TextFieldFormik
                            label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                            name="klokkeslett"
                            className="klokkeslett"
                            type="time"
                        />
                    </div>
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
                        {intlHelper(intl, 'skjema.usignert.info')}
                    </Alert>
                )}
            </Fieldset>
        </Box>
    );
};
export default OpplysningerOmSoknad;
