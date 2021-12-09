import { ApiPath, URL_BACKEND } from 'app/apiConfig';
import { ArbeidsgivereResponse } from 'app/models/types/ArbeidsgivereResponse';
import BrevFormValues from 'app/models/types/brev/BrevFormValues';
import Organisasjon from 'app/models/types/Organisasjon';
import { post } from 'app/utils';
import { ErrorMessage, Field, FieldProps, Form, Formik } from 'formik';
import { EtikettFokus } from 'nav-frontend-etiketter';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { Input, Select, Textarea } from 'nav-frontend-skjema';
import { Element, Feilmelding } from 'nav-frontend-typografi';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { finnArbeidsgivere } from '../../api/api';
import VerticalSpacer from '../VerticalSpacer';
import { Brev } from './Brev';
import './brev.less';
import dokumentMalType from './dokumentMalType';
import SendIcon from './SendIcon';
import {
    validateBrevmalkode,
    validateFritekst,
    validateFritekstbrevBrødtekst,
    validateFritekstbrevOverskrift,
    validateMottaker,
} from './validationHelpers';

// const lagVisningsnavnForMottaker = (
//     mottakerId: string,
//     personopplysninger?: Personopplysninger,
//     arbeidsgiverOpplysningerPerId?: ArbeidsgiverOpplysningerPerId
// ): string => {
//     if (
//         arbeidsgiverOpplysningerPerId &&
//         arbeidsgiverOpplysningerPerId[mottakerId] &&
//         arbeidsgiverOpplysningerPerId[mottakerId].navn
//     ) {
//         return `${arbeidsgiverOpplysningerPerId[mottakerId].navn} (${mottakerId})`;
//     }

//     if (personopplysninger && personopplysninger.aktoerId === mottakerId && personopplysninger.navn) {
//         return `${personopplysninger.navn} (${personopplysninger.fnr || personopplysninger.nummer || mottakerId})`;
//     }

//     return mottakerId;
// };

const previewMessage = (journalpostId: string, values: BrevFormValues, søkerId: string) => {
    // previewCallback(
    //   overstyrtMottaker && overstyrtMottaker !== JSON.stringify(RECIPIENT)
    //     ? safeJSONParse(overstyrtMottaker)
    //     : undefined,
    //   brevmalkode,
    //   fritekst,
    //   fritekstbrev
    // );
    let mottaker;
    if (values.mottaker === søkerId) {
        mottaker = {
            type: 'AKTØRID',
            id: values.mottaker,
        };
    } else {
        mottaker = {
            type: 'ORGNR',
            id: values.mottaker,
        };
    }

    const brevmalErGenereltFritekstbrev = values.brevmalkode === dokumentMalType.GENERELT_FRITEKSTBREV;

    fetch(`${URL_BACKEND}/api/k9-formidling/brev/forhaandsvis`, {
        method: 'post',
        credentials: 'include',
        body: JSON.stringify({
            eksternReferanse: journalpostId,
            ytelseType: {
                kode: 'OMP',
                kodeverk: 'FAGSAK_YTELSE',
            },
            saksnummer: 'GENERELL_SAK',
            aktørId: '',
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
}

const BrevComponent: React.FC<BrevProps> = ({ søkerId, journalpostId }) => {
    const intl = useIntl();
    const [brevmaler, setBrevmaler] = useState<Brevmal | undefined>(undefined);
    const [hentBrevmalerError, setHentBrevmalerError] = useState(false);
    const [arbeidsgivereMedNavn, setArbeidsgivereMedNavn] = useState<Organisasjon[]>([]);
    const [brevErSendt, setBrevErSendt] = useState(false);
    const [sendBrevFeilet, setSendBrevFeilet] = useState(false);

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
                brevmalkode: '',
                mottaker: '',
                fritekst: '',
                fritekstbrev: {
                    overskrift: '',
                    brødtekst: '',
                },
            }}
            onSubmit={(values, actions) => {
                let mottaker;
                if (values.mottaker === søkerId) {
                    mottaker = {
                        type: 'AKTØRID',
                        id: values.mottaker,
                    };
                } else {
                    mottaker = {
                        type: 'ORGNR',
                        id: values.mottaker,
                    };
                }
                const brev = new Brev(values, søkerId, mottaker, 'OMP', values.brevmalkode);
                post(ApiPath.BREV_BESTILL, undefined, undefined, brev, (response) => {
                    if (response.status === 202) {
                        setBrevErSendt(true);
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
                        <Field name="brevmalkode" validate={validateBrevmalkode}>
                            {({ field, meta }: FieldProps) => (
                                <Select
                                    {...field}
                                    label={intl.formatMessage({ id: 'Messages.Template' })}
                                    placeholder={intl.formatMessage({ id: 'Messages.ChooseTemplate' })}
                                    bredde="xxl"
                                    feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                                    onChange={(brevmal) => {
                                        setFieldValue(field.name, brevmal);
                                        setBrevErSendt(false);
                                        setSendBrevFeilet(false);
                                    }}
                                >
                                    <option key="default" value="" label="">
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
                                <Field name="mottaker" validate={validateMottaker}>
                                    {({ field, meta }: FieldProps) => (
                                        <Select
                                            {...field}
                                            label={intl.formatMessage({ id: 'Messages.Recipient' })}
                                            placeholder={intl.formatMessage({ id: 'Messages.ChooseRecipient' })}
                                            bredde="xxl"
                                            feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                                        >
                                            <option disabled key="default" value="" label="">
                                                Velg
                                            </option>
                                            <option value={søkerId}>{`Søker - ${søkerId}`}</option>
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
                                <Field name="fritekst" validate={validateFritekst}>
                                    {({ field, meta }: FieldProps) => (
                                        <div className="textareaContainer">
                                            <Textarea
                                                {...field}
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
                                <Field name="fritekstbrev.overskrift" validate={validateFritekstbrevOverskrift}>
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
                                <Field name="fritekstbrev.brødtekst" validate={validateFritekstbrevBrødtekst}>
                                    {({ field, meta }: FieldProps) => (
                                        <div className="textareaContainer">
                                            <Textarea
                                                {...field}
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
                                    onClick={() => previewMessage(journalpostId, values, søkerId)}
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
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M12 0C5.383 0 0 5.384 0 12C0 18.616 5.383 24 12 24C18.616 24 24 18.616 24 12C24 5.384 18.616 0 12 0Z"
                                                fill="#006A23"
                                            />
                                            <path
                                                d="M9.6398 14.4413L16.0997 8.60215C16.4919 8.24684 17.1086 8.2655 17.4763 8.64607C17.8441 9.02681 17.823 9.62419 17.43 9.98032L10.2804 16.4434C10.0984 16.6068 9.86108 16.6955 9.61739 16.6955C9.36141 16.6955 9.11532 16.5989 8.9284 16.4197L6.54577 14.112C6.16573 13.7439 6.16573 13.1463 6.54577 12.7783C6.9258 12.4102 7.54276 12.4102 7.92279 12.7783L9.6398 14.4413Z"
                                                fill="white"
                                            />
                                        </svg>
                                        <Element className="brevSendtText">
                                            Brev sendt! Du kan nå sende nytt brev til annen mottaker.
                                        </Element>
                                    </>
                                )}
                                {sendBrevFeilet && (
                                    <>
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M11.999 0C5.39481 0 0.0125453 5.37183 2.35604e-05 11.976C-0.00623731 15.1816 1.2355 18.1972 3.49776 20.4689C5.76002 22.7395 8.7715 23.9937 11.9771 24H12C18.6032 24 23.9865 18.6271 24 12.0219C24.0125 5.40626 18.6397 0.0125217 11.999 0Z"
                                                fill="#A13A28"
                                            />
                                            <path
                                                d="M12 10.6512L15.3719 7.27934C15.7444 6.90689 16.3482 6.90689 16.7207 7.27934C17.0931 7.65179 17.0931 8.25565 16.7207 8.6281L13.3488 12L16.7207 15.3719C17.0931 15.7444 17.0931 16.3482 16.7207 16.7207C16.3482 17.0931 15.7444 17.0931 15.3719 16.7207L12 13.3488L8.6281 16.7207C8.25565 17.0931 7.65179 17.0931 7.27934 16.7207C6.90689 16.3482 6.90689 15.7444 7.27934 15.3719L10.6512 12L7.27934 8.6281C6.90689 8.25565 6.90689 7.65179 7.27934 7.27934C7.65179 6.90689 8.25565 6.90689 8.6281 7.27934L12 10.6512Z"
                                                fill="white"
                                            />
                                        </svg>
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
