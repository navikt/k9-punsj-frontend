import React from 'react';

import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import { capitalize } from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';
import { AddCircle } from '@navikt/ds-icons';
import { Box, Button, Heading, Label } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import { JaNei } from 'app/models/enums';
import { erEldreEnn4år, erYngreEnn4år } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { kunTall } from 'app/utils/patterns';
import { fravaersperiodeInitialValue } from '../initialValues';
import { aktivitetsFravær } from '../konstanter';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';
import Fravaersperiode from './Fravaersperiode';
import VarigEndring from './VarigEndring';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';

import './arbeidsforhold.less';

enum Virksomhetstyper {
    FISKE = 'Fiske',
    JORDBRUK = 'Jordbruk',
    DAGMAMMA = 'Dagmamma i eget hjem/familiebarnehage',
    ANNEN = 'Annen næringsvirksomhet',
}

const SelvstendigNaeringsdrivende: React.FC = () => {
    const intl = useIntl();

    const { values } = useFormikContext<IOMPUTSoknad>();

    const virksomhetstype = values?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.virksomhetstyper;

    const {
        opptjeningAktivitet: { selvstendigNaeringsdrivende },
    } = values;

    const yngreEnn4År = erYngreEnn4år(values.opptjeningAktivitet.selvstendigNaeringsdrivende.info.periode.fom || '');
    const eldreEnn4År = erEldreEnn4år(values.opptjeningAktivitet.selvstendigNaeringsdrivende.info.periode.fom || '');

    return (
        <div className="arbeidsforhold-container">
            <Box style={{ backgroundColor: '#eaeaea' }} className="mb-2" borderRadius="small">
                <Heading size="small" level="5">
                    <FormattedMessage id={'omsorgspenger.utbetaling.selvstendig.tittel'} />
                </Heading>

                <Box padding="4">
                    {!values.erKorrigering && (
                        <>
                            <Field name="metadata.harSoekerDekketOmsorgsdager">
                                {({ field, form }: FieldProps<boolean>) => (
                                    <RadioPanelGruppeFormik
                                        legend={intlHelper(intl, 'skjema.harSoekerDekketOmsorgsdager')}
                                        description={intlHelper(intl, 'skjema.harSoekerDekketOmsorgsdager.hjelp')}
                                        name={field.name}
                                        options={Object.values(JaNei).map((v) => ({ value: v, label: capitalize(v) }))}
                                        onChange={(e, value) => form.setFieldValue(field.name, value)}
                                    />
                                )}
                            </Field>

                            <VerticalSpacer sixteenPx />
                        </>
                    )}

                    <Field name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.virksomhetstyper">
                        {({ field, form }: FieldProps<boolean>) => (
                            <RadioPanelGruppeFormik
                                legend={intlHelper(intl, 'skjema.arbeid.sn.type')}
                                name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.virksomhetstyper"
                                options={Object.values(Virksomhetstyper).map((v) => ({
                                    value: v,
                                    label: capitalize(v),
                                }))}
                                onChange={(e, value) => {
                                    form.setFieldValue(field.name, value);
                                    if (value !== Virksomhetstyper.FISKE) {
                                        form.setFieldValue(
                                            'opptjeningAktivitet.selvstendigNaeringsdrivende.info.erFiskerPåBladB',
                                            false,
                                        );
                                    }
                                }}
                                retning="vertikal"
                            />
                        )}
                    </Field>

                    <VerticalSpacer sixteenPx />

                    {!values.erKorrigering && (
                        <>
                            {virksomhetstype === Virksomhetstyper.FISKE && (
                                <>
                                    <Field name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.erFiskerPåBladB">
                                        {({ field, form }: FieldProps<boolean>) => (
                                            <RadioPanelGruppeFormik
                                                legend={intlHelper(
                                                    intl,
                                                    'skjema.arbeid.sn.virksomhetstype.erFiskerPåBladB',
                                                )}
                                                name={field.name}
                                                options={Object.values(JaNei).map((v) => ({
                                                    value: v,
                                                    label: capitalize(v),
                                                }))}
                                                checked={field.value ? JaNei.JA : JaNei.NEI}
                                                onChange={(e, value) =>
                                                    form.setFieldValue(field.name, value === JaNei.JA)
                                                }
                                            />
                                        )}
                                    </Field>

                                    <VerticalSpacer twentyPx />
                                </>
                            )}

                            <TextFieldFormik
                                name="opptjeningAktivitet.selvstendigNaeringsdrivende.virksomhetNavn"
                                label={intlHelper(intl, 'skjema.arbeid.sn.virksomhetsnavn')}
                                size="small"
                            />

                            <VerticalSpacer twentyPx />
                        </>
                    )}

                    <Field name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.registrertIUtlandet">
                        {({ field, form }: FieldProps<boolean>) => (
                            <RadioPanelGruppeFormik
                                legend={intlHelper(intl, 'skjema.sn.registrertINorge')}
                                checked={field.value ? JaNei.NEI : JaNei.JA}
                                name={field.name}
                                options={Object.values(JaNei).map((v) => ({ value: v, label: capitalize(v) }))}
                                onChange={(e, value) => form.setFieldValue(field.name, value === JaNei.NEI)}
                            />
                        )}
                    </Field>

                    <VerticalSpacer twentyPx />

                    {selvstendigNaeringsdrivende.info.registrertIUtlandet ? (
                        <Field name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.landkode">
                            {({ field }: FieldProps<string>) => (
                                <div style={{ maxWidth: '25%' }}>
                                    <CountrySelect
                                        label
                                        selectedcountry={field.value}
                                        unselectedoption={intlHelper(
                                            intl,
                                            'omsorgspenger.utbetaling.countrySelect.unselectedoption',
                                        )}
                                        {...field}
                                    />
                                </div>
                            )}
                        </Field>
                    ) : (
                        <div className="flex flex-wrap">
                            <TextFieldFormik
                                size="small"
                                label={intlHelper(intl, 'omsorgspenger.utbetaling.selvstendig.orgnummer')}
                                filterPattern={kunTall}
                                name="opptjeningAktivitet.selvstendigNaeringsdrivende.organisasjonsnummer"
                            />
                        </div>
                    )}

                    <VerticalSpacer twentyPx />

                    {!values.erKorrigering && (
                        <>
                            <Field name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.harSøkerRegnskapsfører">
                                {({ field, form }: FieldProps<boolean>) => (
                                    <RadioPanelGruppeFormik
                                        legend={intlHelper(intl, 'skjema.arbeid.sn.regnskapsfører')}
                                        checked={field.value ? JaNei.JA : JaNei.NEI}
                                        name={field.name}
                                        options={Object.values(JaNei).map((v) => ({ value: v, label: capitalize(v) }))}
                                        onChange={(e, value) => form.setFieldValue(field.name, value === JaNei.JA)}
                                    />
                                )}
                            </Field>

                            <VerticalSpacer twentyPx />

                            {selvstendigNaeringsdrivende.info.harSøkerRegnskapsfører && (
                                <>
                                    <TextFieldFormik
                                        size="small"
                                        label={intlHelper(intl, 'skjema.arbeid.sn.regnskapsførernavn')}
                                        name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.regnskapsførerNavn"
                                    />

                                    <VerticalSpacer twentyPx />

                                    <div className="flex flex-wrap">
                                        <TextFieldFormik
                                            size="small"
                                            label={intlHelper(intl, 'skjema.arbeid.sn.regnskapsførertlf')}
                                            name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.regnskapsførerTlf"
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    <VerticalSpacer twentyPx />

                    <Label size="small">
                        <FormattedMessage id={'omsorgspenger.utbetaling.selvstendig.startDato.spm'} />
                    </Label>

                    <div className="fom-tom-rad">
                        <DatoInputFormikNew
                            name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.periode.fom"
                            label={intlHelper(intl, 'skjema.arbeid.sn.startdato')}
                        />

                        <DatoInputFormikNew
                            name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.periode.tom"
                            label={intlHelper(intl, 'skjema.arbeid.sn.sluttdato')}
                        />
                    </div>

                    <VerticalSpacer twentyPx />

                    {!values.erKorrigering && (
                        <>
                            {yngreEnn4År && (
                                <TextFieldFormik
                                    size="small"
                                    type="number"
                                    label={intlHelper(intl, 'skjema.sn.bruttoinntekt')}
                                    name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.bruttoInntekt"
                                    filterPattern={kunTall}
                                />
                            )}
                            {eldreEnn4År && <VarigEndring />}
                        </>
                    )}

                    <VerticalSpacer thirtyTwoPx />

                    <hr />

                    <VerticalSpacer twentyPx />

                    <Heading size="small">
                        <FormattedMessage id={'omsorgspenger.utbetaling.selvstendig.fraværsperioder.tittel'} />
                    </Heading>

                    <FieldArray
                        name="opptjeningAktivitet.selvstendigNaeringsdrivende.fravaersperioder"
                        render={(arrayHelpers) => (
                            <>
                                {selvstendigNaeringsdrivende.fravaersperioder?.map(
                                    (fravaersperiode, fravaersperiodeIndex) => (
                                        <Fravaersperiode
                                            key={fravaersperiodeIndex}
                                            name={`opptjeningAktivitet.selvstendigNaeringsdrivende.fravaersperioder[${fravaersperiodeIndex}]`}
                                            antallFravaersperioder={
                                                selvstendigNaeringsdrivende.fravaersperioder?.length
                                            }
                                            slettPeriode={() => arrayHelpers.remove(fravaersperiodeIndex)}
                                        />
                                    ),
                                )}

                                <Button
                                    variant="tertiary"
                                    size="small"
                                    onClick={() =>
                                        arrayHelpers.push({
                                            ...fravaersperiodeInitialValue,
                                            aktivitetsFravær: aktivitetsFravær.SELVSTENDIG_NÆRINGSDRIVENDE,
                                        })
                                    }
                                    icon={<AddCircle />}
                                >
                                    <FormattedMessage
                                        id={'omsorgspenger.utbetaling.selvstendig.fraværsperioder.leggTil.btn'}
                                    />
                                </Button>
                            </>
                        )}
                    />
                </Box>
            </Box>
        </div>
    );
};

export default SelvstendigNaeringsdrivende;
