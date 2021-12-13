import { ApiPath, URL_BACKEND } from 'app/apiConfig';
import BrevFormKeys from 'app/models/enums/BrevFormKeys';
import { Person } from 'app/models/types';
import { ArbeidsgivereResponse } from 'app/models/types/ArbeidsgivereResponse';
import BrevFormValues from 'app/models/types/brev/BrevFormValues';
import Organisasjon from 'app/models/types/Organisasjon';
import { get, post } from 'app/utils';
import { ErrorMessage, Field, FieldProps, Form, Formik } from 'formik';
import { EtikettFokus } from 'nav-frontend-etiketter';
import { Knapp } from 'nav-frontend-knapper';
import { Input, Select, Textarea } from 'nav-frontend-skjema';
import { Element, Feilmelding } from 'nav-frontend-typografi';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { finnArbeidsgivere } from '../../api/api';
import VerticalSpacer from '../VerticalSpacer';
import { Brev } from './Brev';
import './brev.less';
import dokumentMalType from './dokumentMalType';
import ErrorIcon from './ErrorIcon';
import SendIcon from './SendIcon';
import SuccessIcon from './SuccessIcon';
import {
    validateBrevmalkode,
    validateFritekst,
    validateFritekstbrevBrødtekst,
    validateFritekstbrevOverskrift,
    validateMottaker,
} from './validationHelpers';

const previewMessage = (journalpostId: string, values: BrevFormValues, aktørId: string) => {
    const mottaker = {
        type: values.mottaker === aktørId ? 'AKTØRID' : 'ORGNR',
        id: values.mottaker,
    };

    const brevmalErGenereltFritekstbrev = values.brevmalkode === dokumentMalType.GENERELT_FRITEKSTBREV;

    fetch(`${URL_BACKEND}/api/k9-formidling/brev/forhaandsvis`, {
        method: 'post',
        credentials: 'include',
        body: JSON.stringify({
            aktørId,
            eksternReferanse: journalpostId,
            ytelseType: {
                kode: 'OMP',
                kodeverk: 'FAGSAK_YTELSE',
            },
            saksnummer: 'GENERELL_SAK',
            avsenderApplikasjon: 'K9PUNSJ',
            overstyrtMottaker: mottaker,
            dokumentMal: values.brevmalkode,
            dokumentdata: {
                fritekst: !brevmalErGenereltFritekstbrev ? values.fritekst : undefined,
                fritekstbrev: brevmalErGenereltFritekstbrev ? values.fritekstbrev : undefined,
            },
        }),
        headers: { 'Content-Type': 'application/json' },
    })
        .then((response) => response.blob())
        .then((data) => {
            if (URL.createObjectURL) {
                window.open(URL.createObjectURL(data));
            }
        });
};

interface Brevmal {
    [key: string]: {
        navn: string;
        mottakere: string[];
    };
}

interface BrevProps {
    søkerId: string;
    journalpostId: string;
    setVisBrevIkkeSendtInfoboks: (erBrevSendt: boolean) => void;
}

const BrevComponent: React.FC<BrevProps> = ({ søkerId, journalpostId, setVisBrevIkkeSendtInfoboks }) => {
    const intl = useIntl();
    const [brevmaler, setBrevmaler] = useState<Brevmal | undefined>(undefined);
    const [hentBrevmalerError, setHentBrevmalerError] = useState(false);
    const [arbeidsgivereMedNavn, setArbeidsgivereMedNavn] = useState<Organisasjon[]>([]);
    const [brevErSendt, setBrevErSendt] = useState(false);
    const [sendBrevFeilet, setSendBrevFeilet] = useState(false);
    const [aktørId, setAktørId] = useState('');
    const [harSendtMinstEttBrev, setHarSendtMinstEttBrev] = useState(false);
    const [person, setPerson] = useState<Person | undefined>(undefined);

    useEffect(() => {
        fetch(`${URL_BACKEND}/api/k9-formidling/brev/maler?sakstype=OMP&avsenderApplikasjon=K9PUNSJ`, {
            credentials: 'include',
        })
            .then((response) => {
                if (response.ok) {
                    return response.json().then((data) => setBrevmaler(data || []));
                }
                return setHentBrevmalerError(true);
            })
            .catch((error) => {
                console.log(error);
                setHentBrevmalerError(true);
            });
    }, []);

    useEffect(() => {
        if (søkerId) {
            finnArbeidsgivere(søkerId, (response, data: ArbeidsgivereResponse) => {
                setArbeidsgivereMedNavn(data?.organisasjoner || []);
            });
            get(ApiPath.BREV_AKTØRID, undefined, { 'X-Nav-NorskIdent': søkerId }, (response, data) => {
                if (response.status === 200) {
                    setAktørId(`${data}`);
                }
            });
            get(ApiPath.PERSON, undefined, { 'X-Nav-NorskIdent': søkerId }, (response, data: Person) => {
                if (response.status === 200) {
                    setPerson(data);
                }
            });
        }
    }, [søkerId]);

    if (hentBrevmalerError) {
        return <Feilmelding>Henting av brevmaler feilet</Feilmelding>;
    }

    if (!brevmaler) {
        return null;
    }

    const brevmalkoder = Object.keys(brevmaler);

    return (
        <Formik
            initialValues={{
                [BrevFormKeys.brevmalkode]: '',
                [BrevFormKeys.mottaker]: '',
                [BrevFormKeys.fritekst]: '',
                [BrevFormKeys.fritekstbrev]: {
                    overskrift: '',
                    brødtekst: '',
                },
            }}
            onSubmit={(values, actions) => {
                const mottaker = {
                    type: values.mottaker === aktørId ? 'AKTØRID' : 'ORGNR',
                    id: values.mottaker,
                };
                const brev = new Brev(values, søkerId, mottaker, 'OMP', values.brevmalkode, journalpostId);
                post(ApiPath.BREV_BESTILL, undefined, undefined, brev, (response) => {
                    if (response.status === 200) {
                        setBrevErSendt(true);
                        setHarSendtMinstEttBrev(true);
                        setVisBrevIkkeSendtInfoboks(false);
                    } else {
                        setSendBrevFeilet(true);
                    }
                });
                actions.setSubmitting(false);
            }}
        >
            {({ values, isSubmitting, setFieldValue }) => (
                <div className="brev">
                    <Form>
                        <Field name={BrevFormKeys.brevmalkode} validate={validateBrevmalkode}>
                            {({ field, meta }: FieldProps) => (
                                <Select
                                    {...field}
                                    label={intl.formatMessage({ id: 'Messages.Template' })}
                                    placeholder={intl.formatMessage({ id: 'Messages.ChooseTemplate' })}
                                    bredde="xxl"
                                    feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                                    onChange={(event) => {
                                        setFieldValue(field.name, event.target.value);
                                        setBrevErSendt(false);
                                        setSendBrevFeilet(false);
                                    }}
                                >
                                    <option disabled key="default" value="" label="">
                                        Velg
                                    </option>
                                    {brevmalkoder.map((brevmalkode) => (
                                        <option key={brevmalkode} value={brevmalkode}>
                                            {brevmaler[brevmalkode].navn}
                                        </option>
                                    ))}
                                </Select>
                            )}
                        </Field>
                        {arbeidsgivereMedNavn.length > 0 && (
                            <>
                                <VerticalSpacer sixteenPx />
                                <Field name={BrevFormKeys.mottaker} validate={validateMottaker}>
                                    {({ field, meta }: FieldProps) => (
                                        <Select
                                            {...field}
                                            label={intl.formatMessage({ id: 'Messages.Recipient' })}
                                            placeholder={intl.formatMessage({ id: 'Messages.ChooseRecipient' })}
                                            bredde="xxl"
                                            feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                                            onChange={(event) => {
                                                setFieldValue(field.name, event.target.value);
                                                setBrevErSendt(false);
                                                setSendBrevFeilet(false);
                                            }}
                                        >
                                            <option disabled key="default" value="" label="">
                                                Velg
                                            </option>
                                            {aktørId && person && (
                                                <option
                                                    value={aktørId}
                                                >{`${person.sammensattNavn} - ${person.identitetsnummer}`}</option>
                                            )}
                                            {arbeidsgivereMedNavn.map((arbeidsgiver) => (
                                                <option
                                                    key={arbeidsgiver.organisasjonsnummer}
                                                    value={arbeidsgiver.organisasjonsnummer}
                                                >
                                                    {`${arbeidsgiver.navn} - ${arbeidsgiver.organisasjonsnummer}`}
                                                </option>
                                            ))}
                                        </Select>
                                    )}
                                </Field>
                            </>
                        )}
                        {values.brevmalkode === dokumentMalType.INNHENT_DOK && (
                            <>
                                <VerticalSpacer sixteenPx />
                                <Field name={BrevFormKeys.fritekst} validate={validateFritekst}>
                                    {({ field, meta }: FieldProps) => (
                                        <div className="textareaContainer">
                                            <Textarea
                                                {...field}
                                                onChange={(event) => {
                                                    setFieldValue(field.name, event.target.value);
                                                    setVisBrevIkkeSendtInfoboks(!harSendtMinstEttBrev);
                                                }}
                                                label={intl.formatMessage({ id: 'Messages.Fritekst' })}
                                                maxLength={4000}
                                                feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                                            />
                                            <EtikettFokus mini className="språkEtikett">
                                                Bokmål
                                            </EtikettFokus>
                                        </div>
                                    )}
                                </Field>
                            </>
                        )}
                        {values.brevmalkode === dokumentMalType.GENERELT_FRITEKSTBREV && (
                            <>
                                <VerticalSpacer sixteenPx />
                                <Field
                                    name={`${BrevFormKeys.fritekstbrev}.overskrift`}
                                    validate={validateFritekstbrevOverskrift}
                                >
                                    {({ field, meta }: FieldProps) => (
                                        <Input
                                            {...field}
                                            label={intl.formatMessage({ id: 'Messages.FritekstTittel' })}
                                            maxLength={200}
                                            feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                                        />
                                    )}
                                </Field>

                                <VerticalSpacer sixteenPx />
                                <Field
                                    name={`${BrevFormKeys.fritekstbrev}.brødtekst`}
                                    validate={validateFritekstbrevBrødtekst}
                                >
                                    {({ field, meta }: FieldProps) => (
                                        <div className="textareaContainer">
                                            <Textarea
                                                {...field}
                                                onChange={(event) => {
                                                    setFieldValue(field.name, event.target.value);
                                                    setVisBrevIkkeSendtInfoboks(!harSendtMinstEttBrev);
                                                }}
                                                label={intl.formatMessage({ id: 'Messages.Fritekst' })}
                                                maxLength={100000}
                                                feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                                            />
                                            <EtikettFokus mini className="språkEtikett">
                                                Bokmål
                                            </EtikettFokus>
                                        </div>
                                    )}
                                </Field>
                            </>
                        )}
                        <VerticalSpacer sixteenPx />
                        <div className="buttonRow">
                            <Knapp className="sendBrevButton" mini spinner={isSubmitting} disabled={isSubmitting}>
                                <SendIcon />
                                {intl.formatMessage({ id: 'Messages.Submit' })}
                            </Knapp>
                            {values.brevmalkode && (
                                <button
                                    type="button"
                                    onClick={() => previewMessage(journalpostId, values, aktørId)}
                                    className="previewLink lenke lenke--frittstaende"
                                >
                                    {intl.formatMessage({ id: 'Messages.Preview' })}
                                </button>
                            )}
                        </div>

                        {brevErSendt || sendBrevFeilet ? (
                            <div className="brevSendtContainer">
                                {brevErSendt && (
                                    <>
                                        <SuccessIcon />
                                        <Element className="brevSendtText">
                                            Brev sendt! Du kan nå sende nytt brev til annen mottaker.
                                        </Element>
                                    </>
                                )}
                                {sendBrevFeilet && (
                                    <>
                                        <ErrorIcon />
                                        <Element className="brevSendtText">Sending av brev feilet.</Element>
                                    </>
                                )}
                            </div>
                        ) : null}
                    </Form>
                </div>
            )}
        </Formik>
    );
};

export default BrevComponent;
