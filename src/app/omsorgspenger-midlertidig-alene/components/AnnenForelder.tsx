import React from 'react';
import { Heading, Select, Textarea } from '@navikt/ds-react';
import Panel from 'nav-frontend-paneler';
import { PeriodInput } from 'app/components/period-input/PeriodInput';
import VerticalSpacer from 'app/components/VerticalSpacer';
import intlHelper from 'app/utils/intlUtils';

import './annenForelder.less';

const situasjonstyper = ['INNLAGT_I_HELSEINSTITUSJON', 'UTØVER_VERNEPLIKT', 'FENGSEL', 'SYKDOM', 'ANNET'];

const AnnenForelder = ({ intl }) => (
        <Panel border>
            <Heading size="xsmall" spacing>
                Annen forelder
            </Heading>
            <Select size="small" label="Hva er situasjonen til den andre forelderen?">
                <option value="">Velg situasjon</option>
                {situasjonstyper.map((situasjonstype) => (
                    <option value={situasjonstype}>
                        {intlHelper(intl, `omsorgspenger.midlertidigAlene.situasjonstyper.${situasjonstype}`)}
                    </option>
                ))}
            </Select>
            <VerticalSpacer sixteenPx />
            <Textarea size="small" label="Beskrivelse av situasjonen" />
            <VerticalSpacer sixteenPx />
            <PeriodInput intl={intl} />
        </Panel>
    );

export default AnnenForelder;
