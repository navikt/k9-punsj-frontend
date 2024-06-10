import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import { capitalize, get } from 'lodash';
import React from 'react';
import { useIntl } from 'react-intl';

import { AddCircle } from '@navikt/ds-icons';
import { Button, Heading, Label, Panel } from '@navikt/ds-react';

import VerticalSpacer from 'app/components/vertical-spacer/VerticalSpacer';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import DatoInputFormik from 'app/components/formikInput/DatoInputFormik';
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
import './arbeidsforhold.less';

const SelvstendigNaeringsdrivende = () => {
    const { values } = useFormikContext<IOMPUTSoknad>();
    const virksomhetstype = values?.opptjeningAktivitet?.selvstendigNaeringsdrivende?.info?.virksomhetstyper;
    const intl = useIntl();
    const {
        opptjeningAktivitet: { selvstendigNaeringsdrivende },
    } = values;
    const virksomhetstyper = ['Fiske', 'Jordbruk', 'Dagmamma i eget hjem/familiebarnehage', 'Annen næringsvirksomhet'];

    const yngreEnn4År = erYngreEnn4år(get(values, 'opptjeningAktivitet.selvstendigNaeringsdrivende.info.periode.fom'));
    const eldreEnn4År = erEldreEnn4år(get(values, 'opptjeningAktivitet.selvstendigNaeringsdrivende.info.periode.fom'));
    return (
        <div className="arbeidsforhold-container">
            <Panel>
                <Heading size="small" level="5">
                    Selvstendig næringsdrivende
                </Heading>
                <VerticalSpacer twentyPx />
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
                            options={virksomhetstyper.map((v) => ({ value: v, label: capitalize(v) }))}
                            onChange={(e, value) => {
                                form.setFieldValue(field.name, value);
                                if (value !== 'Fiske') {
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
                        {virksomhetstype === 'Fiske' && (
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
                                            checked={field.value ? 'ja' : 'nei'}
                                            onChange={(e, value) => form.setFieldValue(field.name, value === 'ja')}
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
                            checked={field.value ? 'nei' : 'ja'}
                            name={field.name}
                            options={Object.values(JaNei).map((v) => ({ value: v, label: capitalize(v) }))}
                            onChange={(e, value) => form.setFieldValue(field.name, value === 'nei')}
                        />
                    )}
                </Field>
                <VerticalSpacer twentyPx />

                {selvstendigNaeringsdrivende.info.registrertIUtlandet ? (
                    <Field name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.landkode">
                        {({ field, meta }: FieldProps<string>) => (
                            <div style={{ maxWidth: '25%' }}>
                                <CountrySelect
                                    selectedcountry={field.value}
                                    feil={meta.touched && meta.error}
                                    unselectedoption="Velg land"
                                    {...field}
                                />
                            </div>
                        )}
                    </Field>
                ) : (
                    <TextFieldFormik
                        size="small"
                        label="Organisasjonsnummer"
                        filterPattern={kunTall}
                        name="opptjeningAktivitet.selvstendigNaeringsdrivende.organisasjonsnummer"
                    />
                )}
                <VerticalSpacer twentyPx />
                {!values.erKorrigering && (
                    <>
                        <Field name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.harSøkerRegnskapsfører">
                            {({ field, form }: FieldProps<boolean>) => (
                                <RadioPanelGruppeFormik
                                    legend={intlHelper(intl, 'skjema.arbeid.sn.regnskapsfører')}
                                    checked={field.value ? 'ja' : 'nei'}
                                    name={field.name}
                                    options={Object.values(JaNei).map((v) => ({ value: v, label: capitalize(v) }))}
                                    onChange={(e, value) => form.setFieldValue(field.name, value === 'ja')}
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

                                <TextFieldFormik
                                    size="small"
                                    label={intlHelper(intl, 'skjema.arbeid.sn.regnskapsførertlf')}
                                    name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.regnskapsførerTlf"
                                />
                            </>
                        )}
                    </>
                )}
                <VerticalSpacer twentyPx />

                <Label size="small">Når startet virksomheten?</Label>
                <div className="fom-tom-rad">
                    <DatoInputFormik
                        name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.periode.fom"
                        label={intlHelper(intl, 'skjema.arbeid.sn.startdato')}
                    />
                    <DatoInputFormik
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
                <VerticalSpacer fourtyPx />
                <hr />
                <Heading size="small">Informasjon om fraværsperioder</Heading>
                <FieldArray
                    name="opptjeningAktivitet.selvstendigNaeringsdrivende.fravaersperioder"
                    render={(arrayHelpers) => (
                        <>
                            {selvstendigNaeringsdrivende.fravaersperioder?.map(
                                (fravaersperiode, fravaersperiodeIndex) => (
                                    <Fravaersperiode
                                        // eslint-disable-next-line react/no-array-index-key
                                        key={fravaersperiodeIndex}
                                        name={`opptjeningAktivitet.selvstendigNaeringsdrivende.fravaersperioder[${fravaersperiodeIndex}]`}
                                        antallFravaersperioder={selvstendigNaeringsdrivende.fravaersperioder?.length}
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
                                Legg til periode
                            </Button>
                        </>
                    )}
                />
            </Panel>
        </div>
    );
};

export default SelvstendigNaeringsdrivende;
