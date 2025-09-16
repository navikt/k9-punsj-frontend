import React from 'react';

import { Field, FieldProps, useFormikContext } from 'formik';
import { CheckboksPanel } from 'nav-frontend-skjema';
import { FormattedMessage, useIntl } from 'react-intl';
import { Accordion, Alert, Box } from '@navikt/ds-react';
import ArbeidstidKalender from 'app/components/arbeidstid/ArbeidstidKalender';
import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import { Arbeidsforhold, JaNei } from 'app/models/enums';
import { PunchFormPaneler } from 'app/models/enums/PunchFormPaneler';
import { Virksomhetstyper } from 'app/models/enums/Virksomhetstyper';
import { SelvstendigNaeringsdrivendeOpptjening } from 'app/models/types';
import { Arbeidstaker } from 'app/models/types/Arbeidstaker';
import { ArbeidstidInfo } from 'app/models/types/ArbeidstidInfo';
import { FrilanserOpptjening } from 'app/models/types/FrilanserOpptjening';
import { IArbeidstidPeriodeMedTimer, IPeriode } from 'app/models/types/Periode';
import { SelvstendigNaerinsdrivende } from 'app/models/types/SelvstendigNaerinsdrivende';
import intlHelper from 'app/utils/intlUtils';

import { OLPSoknad } from '../../models/types/OLPSoknad';
import { capitalize } from '../../utils/utils';
import VerticalSpacer from '../VerticalSpacer';
import { CountrySelect } from '../country-select/CountrySelect';
import CheckboxGroupFormik from '../formikInput/CheckboxGroupFormik';
import TextAreaFormik from '../formikInput/TextAreaFormik';
import TextFieldFormik from '../formikInput/TextFieldFormik';
import Arbeidstakerperioder from './Arbeidstakerperioder';
import DatoInputFormikNew from '../formikInput/DatoInputFormikNew';

const erYngreEnn4år = (dato: string) => {
    const fireAarSiden = new Date();
    fireAarSiden.setFullYear(fireAarSiden.getFullYear() - 4);
    return new Date(dato) > fireAarSiden;
};

const erEldreEnn4år = (dato: string) => {
    const fireAarSiden = new Date();
    fireAarSiden.setFullYear(fireAarSiden.getFullYear() - 4);
    return new Date(dato) < fireAarSiden;
};

const initialPeriode: IPeriode = { fom: '', tom: '' };

interface ArbeidsforholdPanelProps {
    isOpen: boolean;
    onPanelClick: () => void;
    eksisterendePerioder: IPeriode[];
}

const ArbeidsforholdPanel = ({ isOpen, onPanelClick, eksisterendePerioder }: ArbeidsforholdPanelProps): JSX.Element => {
    const intl = useIntl();

    const { values, setFieldValue } = useFormikContext<OLPSoknad>();

    const getSoknadsperiode = () => {
        if (values?.soeknadsperiode && values.soeknadsperiode.length > 0) {
            return values.soeknadsperiode;
        }
        return [initialPeriode];
    };

    const initialArbeidstaker = () =>
        new Arbeidstaker({
            arbeidstidInfo: {
                perioder: [],
            },
            organisasjonsnummer: '',
            norskIdent: null,
        });

    const initialFrilanser = () =>
        new FrilanserOpptjening({
            jobberFortsattSomFrilans: undefined,
            startdato: undefined,
        });

    const initialSelvstedigNæringsdrivende = () =>
        new SelvstendigNaerinsdrivende({
            periode: getSoknadsperiode()[0],
            virksomhetstyper: [],
            registrertIUtlandet: false,
            landkode: '',
        });

    const initialSelvstendigNæringsdrivendeOpptjening = () =>
        new SelvstendigNaeringsdrivendeOpptjening({
            virksomhetNavn: '',
            organisasjonsnummer: '',
            info: initialSelvstedigNæringsdrivende(),
        });

    const frilanserperioder = () => (
        <>
            <DatoInputFormikNew
                className="frilanser-startdato"
                name="opptjeningAktivitet.frilanser.startdato"
                label={intlHelper(intl, 'skjema.frilanserdato')}
            />

            <Field name="opptjeningAktivitet.frilanser.jobberFortsattSomFrilans">
                {({ field, form }: FieldProps<boolean>) => (
                    <RadioPanelGruppeFormik
                        legend={intlHelper(intl, 'skjema.fortsattfrilanser')}
                        checked={field.value ? 'ja' : 'nei'}
                        name={field.name}
                        options={Object.values(JaNei).map((v) => ({ value: v, label: capitalize(v) }))}
                        onChange={(e, value) => form.setFieldValue(field.name, value === 'ja')}
                    />
                )}
            </Field>

            <VerticalSpacer sixteenPx />

            {!values.opptjeningAktivitet.frilanser?.jobberFortsattSomFrilans && (
                <DatoInputFormikNew
                    className="frilanser-sluttdato"
                    name="opptjeningAktivitet.frilanser.sluttdato"
                    label={intlHelper(intl, 'skjema.frilanserdato.slutt')}
                />
            )}

            {values.opptjeningAktivitet.frilanser?.jobberFortsattSomFrilans && (
                <>
                    <div className="arbeidstidInfo">
                        <hr />
                        <h3>{intlHelper(intl, 'skjema.arbeidstid.info.overskrift')}</h3>
                        <Alert size="small" variant="info">
                            {intlHelper(intl, 'skjema.arbeidstid.info')}
                        </Alert>
                    </div>

                    <Field name="arbeidstid.frilanserArbeidstidInfo.perioder">
                        {({ field, form }: FieldProps<IArbeidstidPeriodeMedTimer[]>) => (
                            <ArbeidstidKalender
                                nyeSoknadsperioder={values.soeknadsperiode}
                                eksisterendeSoknadsperioder={eksisterendePerioder}
                                updateSoknad={(perioder) => {
                                    form.setFieldValue(field.name, [...perioder]);
                                }}
                                arbeidstidInfo={values.arbeidstid?.frilanserArbeidstidInfo}
                            />
                        )}
                    </Field>
                </>
            )}
        </>
    );

    const selvstendigperioder = () => {
        const { opptjeningAktivitet } = values;
        return (
            <div className="infoContainer">
                <CheckboxGroupFormik
                    name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.virksomhetstyper"
                    legend={intlHelper(intl, 'skjema.arbeid.sn.type')}
                    checkboxes={Object.values(Virksomhetstyper).map((v) => ({
                        label: v,
                        value: v,
                    }))}
                />

                {/* feil={getErrorMessage(
                        `ytelse.opptjeningAktivitet.selvstendigNæringsdrivende[0].perioder[${periodeSpenn(
                            opptjening?.selvstendigNaeringsdrivende?.info?.periode
                        )}].virksomhetstyper`
                    )} */}

                <VerticalSpacer sixteenPx />

                <div className="generelleopplysiniger">
                    <div className="flex flex-wrap">
                        <TextFieldFormik
                            size="small"
                            label={intlHelper(intl, 'skjema.arbeid.sn.virksomhetsnavn')}
                            name="opptjeningAktivitet.selvstendigNaeringsdrivende.virksomhetNavn"
                        />
                    </div>
                </div>

                <VerticalSpacer sixteenPx />

                <Field name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.registrertIUtlandet">
                    {({ field, form }: FieldProps<boolean>) => (
                        <RadioPanelGruppeFormik
                            legend={intlHelper(intl, 'skjema.sn.registrertINorge')}
                            checked={field.value ? JaNei.NEI : JaNei.JA}
                            name={field.name}
                            options={Object.values(JaNei).map((v) => ({ value: v, label: capitalize(v) }))}
                            onChange={(e, value) => form.setFieldValue(field.name, value === JaNei.JA ? false : true)}
                        />
                    )}
                </Field>

                <VerticalSpacer sixteenPx />

                {!opptjeningAktivitet.selvstendigNaeringsdrivende?.info?.registrertIUtlandet && (
                    <div className="flex flex-wrap">
                        <TextFieldFormik
                            label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.orgnr')}
                            name="opptjeningAktivitet.selvstendigNaeringsdrivende.organisasjonsnummer"
                        />
                        {/* feil={getErrorMessage(
                                'ytelse.opptjeningAktivitet.selvstendigNæringsdrivende[0].organisasjonsnummer.valid'
                            )} */}
                    </div>
                )}

                {!!opptjeningAktivitet.selvstendigNaeringsdrivende?.info?.registrertIUtlandet && (
                    <Field name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.landkode">
                        {({ field, form, meta }: FieldProps<string>) => (
                            <CountrySelect
                                selectedcountry={opptjeningAktivitet.selvstendigNaeringsdrivende?.info?.landkode || ''}
                                label={intlHelper(intl, 'skjema.sn.registrertLand')}
                                onChange={(event) => {
                                    form.setFieldValue(field.name, event.target.value);
                                    form.setFieldTouched(field.name, true);
                                }}
                                error={meta.touched && meta.error}
                            />
                        )}
                    </Field>
                )}

                <VerticalSpacer sixteenPx />

                <RadioPanelGruppeFormik
                    legend={intlHelper(intl, 'skjema.arbeid.sn.regnskapsfører')}
                    checked={values.metadata.harSøkerRegnskapsfører === JaNei.JA ? JaNei.JA : JaNei.NEI}
                    name="metadata.harSøkerRegnskapsfører"
                    options={Object.values(JaNei).map((v) => ({ value: v, label: capitalize(v) }))}
                    onChange={(e, value) => {
                        setFieldValue('metadata.harSøkerRegnskapsfører', value);
                        setFieldValue('opptjeningAktivitet.selvstendigNaeringsdrivende.info.regnskapsførerNavn', '');
                        setFieldValue('opptjeningAktivitet.selvstendigNaeringsdrivende.info.regnskapsførerTlf', '');
                    }}
                />

                {values.metadata.harSøkerRegnskapsfører === JaNei.JA && (
                    <>
                        <VerticalSpacer sixteenPx />
                        <div className="generelleopplysiniger">
                            <div className="flex flex-wrap">
                                <TextFieldFormik
                                    label={intlHelper(intl, 'skjema.arbeid.sn.regnskapsførernavn')}
                                    name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.regnskapsførerNavn"
                                    className="regnskapsførerNavn"
                                />
                            </div>

                            <VerticalSpacer sixteenPx />

                            <div className="flex flex-wrap">
                                <TextFieldFormik
                                    label={intlHelper(intl, 'skjema.arbeid.sn.regnskapsførertlf')}
                                    name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.regnskapsførerTlf"
                                    className="sn-regskasførertlf"
                                    type="number"
                                />
                            </div>
                        </div>
                    </>
                )}

                <VerticalSpacer sixteenPx />

                <h3>{intlHelper(intl, 'skjema.arbeid.sn.når')}</h3>

                <VerticalSpacer sixteenPx />

                <div className="sn-startdatocontainer">
                    <DatoInputFormikNew
                        className="fom"
                        label={intlHelper(intl, 'skjema.arbeid.sn.startdato')}
                        name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.periode.fom"
                    />

                    {/* errorMessage={getErrorMessage(
                            'ytelse.opptjeningAktivitet.selvstendigNæringsdrivende[0].perioder'
                        )} */}

                    <DatoInputFormikNew
                        className="tom"
                        label={intlHelper(intl, 'skjema.arbeid.sn.sluttdato')}
                        name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.periode.tom"
                    />
                </div>

                <VerticalSpacer sixteenPx />

                {!!opptjeningAktivitet.selvstendigNaeringsdrivende?.info?.periode?.fom &&
                    erYngreEnn4år(opptjeningAktivitet.selvstendigNaeringsdrivende?.info?.periode?.fom) && (
                        <>
                            <TextFieldFormik
                                label={intlHelper(intl, 'skjema.sn.bruttoinntekt')}
                                name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.bruttoInntekt"
                                className="bruttoinntekt"
                            />
                            <VerticalSpacer sixteenPx />
                        </>
                    )}

                {!!opptjeningAktivitet.selvstendigNaeringsdrivende?.info?.periode?.fom &&
                    erEldreEnn4år(opptjeningAktivitet.selvstendigNaeringsdrivende?.info?.periode?.fom) && (
                        <>
                            <Field name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.erVarigEndring">
                                {({ field, form }: FieldProps<boolean>) => (
                                    <RadioPanelGruppeFormik
                                        legend={intlHelper(intl, 'skjema.sn.varigendring')}
                                        checked={field.value ? 'ja' : 'nei'}
                                        name={field.name}
                                        options={Object.values(JaNei).map((v) => ({ value: v, label: capitalize(v) }))}
                                        onChange={(e, value) => form.setFieldValue(field.name, value === 'ja')}
                                    />
                                )}
                            </Field>
                            <VerticalSpacer sixteenPx />
                        </>
                    )}

                {!!opptjeningAktivitet.selvstendigNaeringsdrivende?.info?.erVarigEndring && (
                    <>
                        <div className="flex flex-wrap">
                            <DatoInputFormikNew
                                className="endringdato"
                                label={intlHelper(intl, 'skjema.sn.varigendringdato')}
                                name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.endringDato"
                            />
                        </div>
                        <VerticalSpacer sixteenPx />
                        <div className="flex flex-wrap">
                            <TextFieldFormik
                                label={intlHelper(intl, 'skjema.sn.endringinntekt')}
                                name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.endringInntekt"
                                className="endringinntekt"
                                type="number"
                            />
                        </div>
                        <VerticalSpacer sixteenPx />
                        <TextAreaFormik
                            label={intlHelper(intl, 'skjema.sn.endringbegrunnelse')}
                            className="endringbegrunnelse"
                            name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.endringBegrunnelse"
                        />
                        <VerticalSpacer sixteenPx />
                    </>
                )}

                <div className="arbeidstidInfo">
                    <hr />
                    <h3>{intlHelper(intl, 'skjema.arbeidstid.info.overskrift')}</h3>

                    <Alert size="small" variant="info">
                        {intlHelper(intl, 'skjema.arbeidstid.info')}
                    </Alert>
                </div>

                <VerticalSpacer sixteenPx />

                <Field name="arbeidstid.selvstendigNæringsdrivendeArbeidstidInfo.perioder">
                    {({ field, form }: FieldProps<IArbeidstidPeriodeMedTimer[]>) => (
                        <ArbeidstidKalender
                            nyeSoknadsperioder={values.soeknadsperiode}
                            eksisterendeSoknadsperioder={eksisterendePerioder}
                            updateSoknad={(perioder) => {
                                form.setFieldValue(field.name, [...perioder]);
                            }}
                            arbeidstidInfo={values.arbeidstid?.selvstendigNæringsdrivendeArbeidstidInfo}
                        />
                    )}
                </Field>

                {/* <UhaanderteFeilmeldinger
                    getFeilmeldinger={() =>
                        getUhaandterteFeil('ytelse.opptjeningAktivitet.selvstendigNæringsdrivende[0]') || []
                    }
                /> */}
            </div>
        );
    };

    return (
        <Accordion.Item
            open={isOpen}
            defaultOpen={isOpen}
            onOpenChange={() => onPanelClick()}
            data-test-id="accordionItem-arbeidsforholdPanel"
        >
            <Accordion.Header>
                <FormattedMessage id={PunchFormPaneler.ARBEID} />
            </Accordion.Header>

            <Accordion.Content>
                <CheckboksPanel
                    label={intlHelper(intl, Arbeidsforhold.ARBEIDSTAKER)}
                    value={Arbeidsforhold.ARBEIDSTAKER}
                    onChange={(e) => {
                        if (e.target.checked) {
                            if (!values.arbeidstid || !values.arbeidstid.arbeidstakerList?.length) {
                                setFieldValue('arbeidstid.arbeidstakerList', [initialArbeidstaker()]);
                            }
                        } else {
                            setFieldValue('arbeidstid.arbeidstakerList', []);
                        }
                    }}
                    checked={values.arbeidstid?.arbeidstakerList?.length > 0}
                />

                <VerticalSpacer sixteenPx />

                {!!values.arbeidstid?.arbeidstakerList?.length && (
                    <Arbeidstakerperioder
                        eksisterendePerioder={eksisterendePerioder}
                        initialArbeidstaker={initialArbeidstaker()}
                    />
                )}

                <CheckboksPanel
                    label={intlHelper(intl, Arbeidsforhold.FRILANSER)}
                    value={Arbeidsforhold.FRILANSER}
                    onChange={(e) => {
                        if (e.target.checked) {
                            if (!values.arbeidstid || !values.arbeidstid.frilanserArbeidstidInfo) {
                                setFieldValue('arbeidstid.frilanserArbeidstidInfo', new ArbeidstidInfo({}));
                                setFieldValue('opptjeningAktivitet.frilanser', initialFrilanser());
                            }
                        } else {
                            setFieldValue('arbeidstid.frilanserArbeidstidInfo', null);
                            setFieldValue('opptjeningAktivitet.frilanser', null);
                        }
                    }}
                    checked={!!values.opptjeningAktivitet?.frilanser}
                />

                <VerticalSpacer sixteenPx />

                {!!values.opptjeningAktivitet.frilanser && (
                    <Box padding="4" borderWidth="1" borderRadius="small" className="frilanserpanel">
                        {frilanserperioder()}
                    </Box>
                )}

                <CheckboksPanel
                    label={intlHelper(intl, Arbeidsforhold.SELVSTENDIG)}
                    value={Arbeidsforhold.SELVSTENDIG}
                    onChange={(e) => {
                        if (e.target.checked) {
                            if (
                                !values.opptjeningAktivitet ||
                                !values.opptjeningAktivitet.selvstendigNaeringsdrivende
                            ) {
                                setFieldValue(
                                    'opptjeningAktivitet.selvstendigNaeringsdrivende',
                                    initialSelvstendigNæringsdrivendeOpptjening(),
                                );
                                setFieldValue(
                                    'arbeidstid.selvstendigNæringsdrivendeArbeidstidInfo',
                                    new ArbeidstidInfo({}),
                                );
                                setFieldValue('metadata.harSøkerRegnskapsfører', JaNei.NEI);
                            }
                        } else {
                            setFieldValue('opptjeningAktivitet.selvstendigNaeringsdrivende', null);
                            setFieldValue('arbeidstid.selvstendigNæringsdrivendeArbeidstidInfo', null);
                            setFieldValue('metadata.harSøkerRegnskapsfører', JaNei.NEI);
                        }
                    }}
                    checked={!!values.opptjeningAktivitet?.selvstendigNaeringsdrivende}
                />

                {!!values.opptjeningAktivitet.selvstendigNaeringsdrivende && (
                    <>
                        <Alert size="small" variant="info" className="sn-alertstripe">
                            {intlHelper(intl, 'skjema.sn.info')}
                        </Alert>
                        <Box padding="4" borderWidth="1" borderRadius="small" className="selvstendigpanel">
                            {selvstendigperioder()}
                        </Box>
                    </>
                )}

                {/* <UhaanderteFeilmeldinger
                getFeilmeldinger={() => (getUhaandterteFeil && getUhaandterteFeil('ytelse.arbeidstid')) || []}
            /> */}
            </Accordion.Content>
        </Accordion.Item>
    );
};
export default ArbeidsforholdPanel;
