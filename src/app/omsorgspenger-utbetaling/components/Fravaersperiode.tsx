import { Panel } from '@navikt/ds-react';
import DatoInput from 'app/components/formikInput/DatoInput';
import Select from 'app/components/formikInput/Select';
import TextField from 'app/components/formikInput/TextField';
import intlHelper from 'app/utils/intlUtils';
import React from 'react';
import { useIntl } from 'react-intl';
import { fraværÅrsak, søknadÅrsak } from '../konstanter';

const Fravaersperiode = ({ name }: { name: string }) => {
    const intl = useIntl();
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
            <Select label="Fraværsårsak" size="small" name={`${name}.fraværÅrsak`} options={fraværÅrsakOptions} />
            <Select label="Søknadsårsak" size="small" name={`${name}.søknadÅrsak`} options={søknadÅrsakOptions} />
            <DatoInput label="Fra og med" name={`${name}.periode.fom`} />
            <DatoInput label="Til og med" name={`${name}.periode.tom`} />
            <TextField label="Timer arbeidet" size="small" name={`${name}.faktiskTidPrDag`} />
        </Panel>
    );
};

export default Fravaersperiode;
