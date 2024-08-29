import React from 'react';
import { Alert, Box, Heading, TextField } from '@navikt/ds-react';
import { RadioPanelGruppe } from 'nav-frontend-skjema';
import { FormattedMessage, IntlShape } from 'react-intl';
import { DateInputNew } from 'app/components/skjema/DateInputNew';
import { JaNeiIkkeRelevant } from '../../../models/enums/JaNeiIkkeRelevant';
import { PunchFormPaneler } from '../../../models/enums/PunchFormPaneler';
import intlHelper from '../../../utils/intlUtils';
import { PLSSoknad } from '../../types/PLSSoknad';

import './opplysningerOmPLSSoknad.less';

interface Props {
    intl: IntlShape;
    changeAndBlurUpdatesSoknad: (event: any) => any;
    getErrorMessage: (attribute: string, indeks?: number) => any;
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => void;
    signert: JaNeiIkkeRelevant | null;
    soknad: PLSSoknad;
}

const OpplysningerOmPLSSoknad: React.FC<Props> = ({
    intl,
    changeAndBlurUpdatesSoknad,
    getErrorMessage,
    setSignaturAction,
    signert,
    soknad,
}) => (
    <Box padding="4" borderWidth="1" borderRadius="medium">
        <Heading size="small" level="3">
            <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKNAD} />
        </Heading>

        <Alert size="small" variant="info">
            <FormattedMessage id={'skjema.mottakelsesdato.informasjon'} />
        </Alert>

        <div className="input-row ">
            <DateInputNew
                value={soknad.mottattDato}
                id="soknad-dato"
                label={intlHelper(intl, 'skjema.mottakelsesdato')}
                {...changeAndBlurUpdatesSoknad((selectedDate: any) => ({
                    mottattDato: selectedDate,
                }))}
                errorMessage={getErrorMessage('mottattDato')}
                className="inline-block w-max"
            />

            <div>
                <TextField
                    value={soknad.klokkeslett || ''}
                    type="time"
                    label={intlHelper(intl, 'skjema.mottatt.klokkeslett')}
                    {...changeAndBlurUpdatesSoknad((event: any) => ({
                        klokkeslett: event.target.value,
                    }))}
                    error={getErrorMessage('klokkeslett')}
                    className="klokkeslett"
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
                <FormattedMessage id={'skjema.usignert.info'} />
            </Alert>
        )}
    </Box>
);
export default OpplysningerOmPLSSoknad;
