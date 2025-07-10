import React from 'react';

import { RadioPanelGruppe } from 'nav-frontend-skjema';
import { FormattedMessage } from 'react-intl';
import { Alert, Box, Heading, TextField } from '@navikt/ds-react';

import NewDateInput from 'app/components/skjema/NewDateInput/NewDateInput';
import { JaNeiIkkeRelevant } from '../../../../models/enums/JaNeiIkkeRelevant';
import { PunchFormPaneler } from '../../../../models/enums/PunchFormPaneler';
import { PLSSoknad } from '../../types/PLSSoknad';

interface Props {
    signert: JaNeiIkkeRelevant | null;
    soknad: PLSSoknad;

    changeAndBlurUpdatesSoknad: (event: any) => any;
    getErrorMessage: (attribute: string, indeks?: number) => any;
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => void;
}

const OpplysningerOmPLSSoknad: React.FC<Props> = ({
    signert,
    soknad,
    changeAndBlurUpdatesSoknad,
    getErrorMessage,
    setSignaturAction,
}) => (
    <Box padding="4" borderWidth="1" borderRadius="small">
        <Heading size="small" level="3">
            <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKNAD} />
        </Heading>

        <Alert size="small" variant="info">
            <FormattedMessage id="skjema.mottakelsesdato.informasjon" />
        </Alert>

        <div className="input-row">
            <NewDateInput
                value={soknad.mottattDato}
                id="soknad-dato"
                errorMessage={getErrorMessage('mottattDato')}
                label={<FormattedMessage id="skjema.mottakelsesdato" />}
                {...changeAndBlurUpdatesSoknad((selectedDate: any) => ({
                    mottattDato: selectedDate,
                }))}
            />

            <div>
                <TextField
                    value={soknad.klokkeslett || ''}
                    type="time"
                    className="klokkeslett"
                    label={<FormattedMessage id="skjema.mottatt.klokkeslett" />}
                    {...changeAndBlurUpdatesSoknad((event: any) => ({
                        klokkeslett: event.target.value,
                    }))}
                    error={getErrorMessage('klokkeslett')}
                />
            </div>
        </div>

        <RadioPanelGruppe
            className="horizontalRadios"
            radios={Object.values(JaNeiIkkeRelevant).map((jn) => ({
                label: <FormattedMessage id={`${jn}`} />,
                value: jn,
            }))}
            name="signatur"
            legend={<FormattedMessage id="ident.signatur.etikett" />}
            checked={signert || undefined}
            onChange={(event) =>
                setSignaturAction(((event.target as HTMLInputElement).value as JaNeiIkkeRelevant) || null)
            }
        />

        {signert === JaNeiIkkeRelevant.NEI && (
            <Alert size="small" variant="warning">
                <FormattedMessage id="skjema.usignert.info" />
            </Alert>
        )}
    </Box>
);
export default OpplysningerOmPLSSoknad;
