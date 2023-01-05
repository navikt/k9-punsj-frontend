import { Alert, Panel } from '@navikt/ds-react';
import ArbeidstidKalender from 'app/components/arbeidstid/ArbeidstidKalender';
import DatoInputFormik from 'app/components/formikInput/DatoInputFormik';
import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import UhaanderteFeilmeldinger from 'app/components/skjema/UhaanderteFeilmeldinger';
import { Arbeidsforhold, JaNei } from 'app/models/enums';
import { PunchFormPaneler } from 'app/models/enums/PunchFormPaneler';
import { Virksomhetstyper } from 'app/models/enums/Virksomhetstyper';
import { IArbeidstidPeriodeMedTimer, IPeriode } from 'app/models/types/Periode';
import { Arbeidstaker } from 'app/models/types/søknadTypes/Arbeidstaker';
import { FrilanserOpptjening } from 'app/models/types/søknadTypes/FrilanserOpptjening';
import intlHelper from 'app/utils/intlUtils';
import { Field, FieldProps, useFormikContext } from 'formik';
import { EkspanderbartpanelBase } from 'nav-frontend-ekspanderbartpanel';
import { CheckboksPanel } from 'nav-frontend-skjema';
import * as React from 'react';
import { Container, Row } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import { ArbeidstidInfo } from 'app/models/types/søknadTypes/ArbeidstidInfo';
import { SelvstendigNaeringsdrivendeOpptjening } from 'app/models/types';
import { SelvstendigNaerinsdrivende } from 'app/models/types/søknadTypes/SelvstendigNaerinsdrivende';
import { OLPSoknad } from '../../models/types/søknadTypes/OLPSoknad';
import { capitalize } from '../../utils/utils';
import { CountrySelect } from '../country-select/CountrySelect';
import CheckboxGroupFormik from '../formikInput/CheckboxGroupFormik';
import TextAreaFormik from '../formikInput/TextAreaFormik';
import TextFieldFormik from '../formikInput/TextFieldFormik';
import VerticalSpacer from '../VerticalSpacer';
import Arbeidstakerperioder from './Arbeidstakerperioder';

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
    const [harRegnskapsfører, setHasRegnskapsfører] = React.useState(false);
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
            <DatoInputFormik
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
            <VerticalSpacer eightPx />
            {!values.opptjeningAktivitet.frilanser?.jobberFortsattSomFrilans && (
                <DatoInputFormik
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
            <Container className="infoContainer">
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

                <div className="generelleopplysiniger">
                    <Row noGutters>
                        <TextFieldFormik
                            size="small"
                            label={intlHelper(intl, 'skjema.arbeid.sn.virksomhetsnavn')}
                            name="opptjeningAktivitet.selvstendigNaeringsdrivende.virksomhetNavn"
                        />
                    </Row>
                </div>
                <Field name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.registrertIUtlandet">
                    {({ field, form }: FieldProps<boolean>) => (
                        <RadioPanelGruppeFormik
                            legend={intlHelper(intl, 'skjema.sn.registrertINorge')}
                            checked={field.value ? 'nei' : 'ja'}
                            name={field.name}
                            options={Object.values(JaNei).map((v) => ({ value: v, label: capitalize(v) }))}
                            onChange={(e, value) => form.setFieldValue(field.name, value !== 'ja')}
                        />
                    )}
                </Field>
                {!opptjeningAktivitet.selvstendigNaeringsdrivende?.info?.registrertIUtlandet && (
                    <Row noGutters>
                        <TextFieldFormik
                            label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.orgnr')}
                            name="opptjeningAktivitet.selvstendigNaeringsdrivende?.organisasjonsnummer"
                        />
                        {/* feil={getErrorMessage(
                                'ytelse.opptjeningAktivitet.selvstendigNæringsdrivende[0].organisasjonsnummer.valid'
                            )} */}
                    </Row>
                )}
                {!!opptjeningAktivitet.selvstendigNaeringsdrivende?.info?.registrertIUtlandet && (
                    <Field name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.landkode">
                        {({ field, form }: FieldProps<boolean>) => (
                            <CountrySelect
                                selectedcountry={opptjeningAktivitet.selvstendigNaeringsdrivende?.info?.landkode || ''}
                                label={intlHelper(intl, 'skjema.sn.registrertLand')}
                                onChange={(event) => {
                                    form.setFieldValue(field.name, event.target.value);
                                }}
                            />
                        )}
                    </Field>
                )}

                <RadioPanelGruppeFormik
                    legend={intlHelper(intl, 'skjema.arbeid.sn.regnskapsfører')}
                    checked={
                        harRegnskapsfører || opptjeningAktivitet.selvstendigNaeringsdrivende?.info?.regnskapsførerNavn
                            ? 'ja'
                            : 'nei'
                    }
                    name="harRegnskapsfører"
                    options={Object.values(JaNei).map((v) => ({ value: v, label: capitalize(v) }))}
                    onChange={(e, value) => {
                        setHasRegnskapsfører(value === 'ja');
                        if (value === 'ja') {
                            setFieldValue(
                                'opptjeningAktivitet.selvstendigNaeringsdrivende.info.regnskapsførerNavn',
                                ''
                            );
                            setFieldValue('opptjeningAktivitet.selvstendigNaeringsdrivende.info.regnskapsførerTlf', '');
                        }
                    }}
                />

                {harRegnskapsfører && (
                    <div className="generelleopplysiniger">
                        <Row noGutters>
                            <TextFieldFormik
                                label={intlHelper(intl, 'skjema.arbeid.sn.regnskapsførernavn')}
                                name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.regnskapsførerNavn"
                                className="regnskapsførerNavn"
                            />
                        </Row>
                        <Row noGutters>
                            <TextFieldFormik
                                label={intlHelper(intl, 'skjema.arbeid.sn.regnskapsførertlf')}
                                name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.regnskapsførerTlf"
                                className="sn-regskasførertlf"
                                type="number"
                            />
                        </Row>
                    </div>
                )}
                <h3>{intlHelper(intl, 'skjema.arbeid.sn.når')}</h3>
                <div className="sn-startdatocontainer">
                    <DatoInputFormik
                        className="fom"
                        label={intlHelper(intl, 'skjema.arbeid.sn.startdato')}
                        name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.periode.fom"
                    />
                    {/* errorMessage={getErrorMessage(
                            'ytelse.opptjeningAktivitet.selvstendigNæringsdrivende[0].perioder'
                        )} */}
                    <DatoInputFormik
                        className="tom"
                        label={intlHelper(intl, 'skjema.arbeid.sn.sluttdato')}
                        name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.periode.tom"
                    />
                </div>
                {!!opptjeningAktivitet.selvstendigNaeringsdrivende?.info?.periode?.fom &&
                    erYngreEnn4år(opptjeningAktivitet.selvstendigNaeringsdrivende?.info?.periode?.fom) && (
                        <TextFieldFormik
                            label={intlHelper(intl, 'skjema.sn.bruttoinntekt')}
                            name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.bruttoInntekt"
                            className="bruttoinntekt"
                        />
                    )}
                {!!opptjeningAktivitet.selvstendigNaeringsdrivende?.info?.periode?.fom &&
                    erEldreEnn4år(opptjeningAktivitet.selvstendigNaeringsdrivende?.info?.periode?.fom) && (
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
                    )}
                {!!opptjeningAktivitet.selvstendigNaeringsdrivende?.info?.erVarigEndring && (
                    <>
                        <Row noGutters>
                            <DatoInputFormik
                                className="endringdato"
                                label={intlHelper(intl, 'skjema.sn.varigendringdato')}
                                name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.endringDato"
                            />
                        </Row>
                        <Row noGutters>
                            <TextFieldFormik
                                label={intlHelper(intl, 'skjema.sn.endringinntekt')}
                                name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.endringInntekt"
                                className="endringinntekt"
                                type="number"
                            />
                        </Row>
                        <TextAreaFormik
                            label={intlHelper(intl, 'skjema.sn.endringbegrunnelse')}
                            className="endringbegrunnelse"
                            name="opptjeningAktivitet.selvstendigNaeringsdrivende.info.endringBegrunnelse"
                        />
                    </>
                )}
                <VerticalSpacer eightPx />
                <div className="arbeidstidInfo">
                    <hr />
                    <h3>{intlHelper(intl, 'skjema.arbeidstid.info.overskrift')}</h3>
                    <Alert size="small" variant="info">
                        {intlHelper(intl, 'skjema.arbeidstid.info')}
                    </Alert>
                </div>
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
            </Container>
        );
    };

    return (
        <EkspanderbartpanelBase
            apen={isOpen}
            className="punchform__paneler"
            tittel={intlHelper(intl, PunchFormPaneler.ARBEID)}
            onClick={() => onPanelClick()}
        >
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
            <VerticalSpacer eightPx />
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
            <VerticalSpacer eightPx />
            {!!values.opptjeningAktivitet.frilanser && <Panel className="frilanserpanel">{frilanserperioder()}</Panel>}
            <CheckboksPanel
                label={intlHelper(intl, Arbeidsforhold.SELVSTENDIG)}
                value={Arbeidsforhold.SELVSTENDIG}
                onChange={(e) => {
                    if (e.target.checked) {
                        if (!values.opptjeningAktivitet || !values.opptjeningAktivitet.selvstendigNaeringsdrivende) {
                            setFieldValue(
                                'opptjeningAktivitet.selvstendigNaeringsdrivende',
                                initialSelvstendigNæringsdrivendeOpptjening()
                            );
                            setFieldValue(
                                'arbeidstid.selvstendigNæringsdrivendeArbeidstidInfo',
                                new ArbeidstidInfo({})
                            );
                        }
                    } else {
                        setFieldValue('opptjeningAktivitet.selvstendigNaeringsdrivende', null);
                        setFieldValue('arbeidstid.selvstendigNæringsdrivendeArbeidstidInfo', null);
                    }
                }}
                checked={!!values.opptjeningAktivitet?.selvstendigNaeringsdrivende}
            />
            {!!values.opptjeningAktivitet.selvstendigNaeringsdrivende && (
                <>
                    <Alert size="small" variant="info" className="sn-alertstripe">
                        {intlHelper(intl, 'skjema.sn.info')}
                    </Alert>
                    <Panel className="selvstendigpanel">{selvstendigperioder()}</Panel>
                </>
            )}
            {/* <UhaanderteFeilmeldinger
                getFeilmeldinger={() => (getUhaandterteFeil && getUhaandterteFeil('ytelse.arbeidstid')) || []}
            /> */}
        </EkspanderbartpanelBase>
    );
};
export default ArbeidsforholdPanel;
