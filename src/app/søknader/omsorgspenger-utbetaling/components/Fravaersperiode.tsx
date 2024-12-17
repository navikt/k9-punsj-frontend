import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { Delete } from '@navikt/ds-icons';
import { Box, Button } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';
import SelectFormik from 'app/components/formikInput/SelectFormik';
import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import intlHelper from 'app/utils/intlUtils';
import { fraværÅrsak, søknadÅrsak } from '../konstanter';

import './fravaersperiode.less';

interface Props {
    antallFravaersperioder: number;
    name: string;
    visSoknadAarsak?: boolean;

    slettPeriode: () => void;
}

const Fravaersperiode = ({ name, antallFravaersperioder, visSoknadAarsak = false, slettPeriode }: Props) => {
    const intl = useIntl();

    const minstToPerioder = antallFravaersperioder > 1;

    const fraværÅrsakOptions = [
        {
            value: '',
            label: 'Velg fraværsårsak',
        },
        {
            value: fraværÅrsak.ORDINÆRT_FRAVÆR,
            label: intlHelper(intl, 'omsorgspenger.omsorgspengeutbetaling.fraværsårsaker.ORDINÆRT_FRAVÆR'),
        },
        {
            value: fraværÅrsak.STENGT_SKOLE_ELLER_BARNEHAGE,
            label: intlHelper(intl, `omsorgspenger.omsorgspengeutbetaling.fraværsårsaker.STENGT_SKOLE_ELLER_BARNEHAGE`),
        },
        {
            value: fraværÅrsak.SMITTEVERNHENSYN,
            label: intlHelper(intl, 'omsorgspenger.omsorgspengeutbetaling.fraværsårsaker.SMITTEVERNHENSYN'),
        },
    ];

    const søknadÅrsakOptions = [
        {
            value: '',
            label: 'Velg søknadsårsak',
        },
        {
            value: søknadÅrsak.NYOPPSTARTET_HOS_ARBEIDSGIVER,
            label: intlHelper(
                intl,
                'omsorgspenger.omsorgspengeutbetaling.søknadsårsaker.NYOPPSTARTET_HOS_ARBEIDSGIVER',
            ),
        },
        {
            value: søknadÅrsak.ARBEIDSGIVER_KONKURS,
            label: intlHelper(intl, `omsorgspenger.omsorgspengeutbetaling.søknadsårsaker.ARBEIDSGIVER_KONKURS`),
        },
        {
            value: søknadÅrsak.KONFLIKT_MED_ARBEIDSGIVER,
            label: intlHelper(intl, 'omsorgspenger.omsorgspengeutbetaling.søknadsårsaker.KONFLIKT_MED_ARBEIDSGIVER'),
        },
    ];

    return (
        <Box padding="4" className="fravaersperiode-container ">
            <div className="aarsak-rad">
                <SelectFormik
                    label="Fraværsårsak"
                    size="small"
                    name={`${name}.fraværÅrsak`}
                    options={fraværÅrsakOptions}
                />

                {visSoknadAarsak && (
                    <SelectFormik
                        label="Søknadsårsak"
                        size="small"
                        name={`${name}.søknadÅrsak`}
                        options={søknadÅrsakOptions}
                    />
                )}

                {minstToPerioder && (
                    <Button variant="tertiary" size="small" className="slett" onClick={slettPeriode} icon={<Delete />}>
                        <FormattedMessage id={'omsorgspenger.utbetaling.fravaersperiode.fjern.btn'} />
                    </Button>
                )}
            </div>

            <VerticalSpacer twentyPx />

            <VerticalSpacer twentyPx />

            <div className="fom-tom-rad">
                <DatoInputFormikNew label="Fra og med" name={`${name}.periode.fom`} />

                <DatoInputFormikNew label="Til og med" name={`${name}.periode.tom`} />
            </div>

            <VerticalSpacer twentyPx />

            <div className="timer-container">
                <TextFieldFormik
                    className="timer-arbeidet"
                    label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.timernormalt')}
                    size="small"
                    name={`${name}.normalArbeidstidPrDag`}
                />

                <TextFieldFormik
                    className="timer-arbeidet"
                    label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.fraværPerDag')}
                    size="small"
                    name={`${name}.faktiskTidPrDag`}
                />
            </div>

            <VerticalSpacer twentyPx />
        </Box>
    );
};

export default Fravaersperiode;
