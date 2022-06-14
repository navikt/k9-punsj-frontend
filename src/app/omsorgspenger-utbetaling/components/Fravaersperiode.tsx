import React from 'react';
import { Delete } from '@navikt/ds-icons';
import { Button, Panel } from '@navikt/ds-react';
import DatoInputFormik from 'app/components/formikInput/DatoInputFormik';
import SelectFormik from 'app/components/formikInput/SelectFormik';
import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import VerticalSpacer from 'app/components/VerticalSpacer';
import intlHelper from 'app/utils/intlUtils';
import { useIntl } from 'react-intl';
import { fraværÅrsak, søknadÅrsak } from '../konstanter';
import './fravaersperiode.less';

interface OwnProps {
    antallFravaersperioder: number;
    name: string;
    slettPeriode: () => void;
}

const Fravaersperiode = ({ name, antallFravaersperioder, slettPeriode }: OwnProps) => {
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
                'omsorgspenger.omsorgspengeutbetaling.søknadsårsaker.NYOPPSTARTET_HOS_ARBEIDSGIVER'
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
        <Panel border>
            <div className="aarsak-rad">
                <SelectFormik label="Fraværsårsak" size="small" name={`${name}.fraværÅrsak`} options={fraværÅrsakOptions} />
                <SelectFormik label="Søknadsårsak" size="small" name={`${name}.søknadÅrsak`} options={søknadÅrsakOptions} />
                {minstToPerioder && (
                    <Button variant="tertiary" size="small" className="slett" onClick={slettPeriode}>
                        <Delete />
                        Fjern periode
                    </Button>
                )}
            </div>
            <VerticalSpacer twentyPx />
            <VerticalSpacer twentyPx />
            <div className="fom-tom-rad">
                <DatoInputFormik label="Fra og med" name={`${name}.periode.fom`} />
                <DatoInputFormik label="Til og med" name={`${name}.periode.tom`} />
                <TextFieldFormik
                    className="timer-arbeidet"
                    label="Timer arbeidet"
                    size="small"
                    name={`${name}.faktiskTidPrDag`}
                />
            </div>
            <VerticalSpacer twentyPx />
        </Panel>
    );
};

export default Fravaersperiode;
