import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { TrashIcon } from '@navikt/aksel-icons';
import { Box, Button, Heading } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import DatovelgerFormik from 'app/components/skjema/Datovelger/DatovelgerFormik';
import SelectFormik from 'app/components/formikInput/SelectFormik';
import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import intlHelper from 'app/utils/intlUtils';
import { fraværÅrsak, søknadÅrsak } from '../konstanter';

import './fravaersperiode.less';

interface Props {
    antallFravaersperioder: number;
    index: number;
    name: string;
    visSoknadAarsak?: boolean;

    slettPeriode: () => void;
}

const Fravaersperiode = ({ name, antallFravaersperioder, index, visSoknadAarsak = false, slettPeriode }: Props) => {
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
        <Box padding="4" borderWidth="1" borderRadius="small" className="fravaersperiode-container">
            {minstToPerioder && (
                <div className="flex items-center justify-between mb-4">
                    <Heading size="xsmall" level="5">
                        <FormattedMessage
                            id="omsorgspenger.utbetaling.fravaersperiode.tittel"
                            values={{ number: index + 1 }}
                        />
                    </Heading>

                    <Button
                        variant="tertiary"
                        className="slett-knapp-med-icon"
                        onClick={slettPeriode}
                        icon={<TrashIcon title="slett periode" />}
                    >
                        <FormattedMessage id="omsorgspenger.utbetaling.fravaersperiode.fjern.btn" />
                    </Button>
                </div>
            )}

            <div className="flex items-start">
                <SelectFormik
                    label="Fraværsårsak"
                    name={`${name}.fraværÅrsak`}
                    options={fraværÅrsakOptions}
                    size="small"
                />

                {visSoknadAarsak && (
                    <SelectFormik
                        label="Søknadsårsak"
                        name={`${name}.søknadÅrsak`}
                        options={søknadÅrsakOptions}
                        className="flex-none ml-4"
                        size="small"
                    />
                )}
            </div>

            <VerticalSpacer twentyPx />

            <VerticalSpacer twentyPx />

            <div className="flex items-start">
                <DatovelgerFormik label="Fra og med" name={`${name}.periode.fom`} size="small" />

                <DatovelgerFormik label="Til og med" name={`${name}.periode.tom`} className="ml-4" size="small" />
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
