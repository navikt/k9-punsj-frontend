import React from 'react';

import { RadioPanelGruppe } from 'nav-frontend-skjema';
import { FormattedMessage, IntlShape } from 'react-intl';
import { Alert, Box, Heading, TextField } from '@navikt/ds-react';
import { JaNeiIkkeRelevant } from '../../../models/enums/JaNeiIkkeRelevant';
import { PunchFormPaneler } from '../../../models/enums/PunchFormPaneler';
import intlHelper from '../../../utils/intlUtils';
import { OMPKSSoknad } from '../../types/OMPKSSoknad';
import { DateInputNew } from 'app/components/skjema/DateInputNew';

interface Props {
    intl: IntlShape;
    changeAndBlurUpdatesSoknad: (event: any) => any;
    getErrorMessage: (attribute: string, indeks?: number) => any;
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => void;
    signert: JaNeiIkkeRelevant | null;
    soknad: OMPKSSoknad;
}

const OpplysningerOmOMPKSSoknad: React.FC<Props> = ({
    intl,
    changeAndBlurUpdatesSoknad,
    getErrorMessage,
    setSignaturAction,
    signert,
    soknad,
}: Props) => (
    <Box padding="4" borderWidth="1" borderRadius="small">
        <Heading level="3" size="small">
            <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKNAD} />
        </Heading>

        <Alert size="small" variant="info" className="ml-0">
            <FormattedMessage id="skjema.mottakelsesdato.informasjon" />
        </Alert>

        <div className="input-row">
            <DateInputNew
                value={soknad.mottattDato}
                id="soknad-dato"
                errorMessage={getErrorMessage('mottattDato')}
                label={intlHelper(intl, 'skjema.mottakelsesdato')}
                {...changeAndBlurUpdatesSoknad((selectedDate: any) => ({
                    mottattDato: selectedDate,
                }))}
            />
            <div>
                <TextField
                    value={soknad.klokkeslett || ''}
                    type="time"
                    className="klokkeslett"
                    label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
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
                label: intlHelper(intl, jn),
                value: jn,
            }))}
            name="signatur"
            legend={intlHelper(intl, 'ident.signatur.etikett')}
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
export default OpplysningerOmOMPKSSoknad;
