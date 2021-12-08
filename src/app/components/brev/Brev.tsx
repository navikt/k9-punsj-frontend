import { URL_BACKEND } from 'app/apiConfig';
import { ArbeidsgivereResponse } from 'app/models/types/ArbeidsgivereResponse';
import Organisasjon from 'app/models/types/Organisasjon';
import { ErrorMessage, Field, FieldProps, Form, Formik } from 'formik';
import { EtikettFokus } from 'nav-frontend-etiketter';
import { Hovedknapp } from 'nav-frontend-knapper';
import { Input, Select, Textarea } from 'nav-frontend-skjema';
import { Feilmelding } from 'nav-frontend-typografi';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';
import { finnArbeidsgivere } from '../../api/api';
import VerticalSpacer from '../VerticalSpacer';
import './brev.less';
import dokumentMalType from './dokumentMalType';
import { hasValidText } from './validationHelpers';

Yup.addMethod(Yup.string, 'hasValidText', function (message) {
    return this.test('hasValidText', message, function (value) {
        const validatedText = hasValidText(value);
        if (validatedText !== true) {
            return this.createError({ message: validatedText });
        }
        return true;
    });
});

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

const previewMessage = (e) => {
    e.preventDefault();

    // previewCallback(
    //   overstyrtMottaker && overstyrtMottaker !== JSON.stringify(RECIPIENT)
    //     ? safeJSONParse(overstyrtMottaker)
    //     : undefined,
    //   brevmalkode,
    //   fritekst,
    //   fritekstbrev
    // );
};

const BrevSchema = Yup.object().shape({
    brevmalkode: Yup.string().required('Required'),
    mottaker: Yup.string().required('Required'),
    fritekst: Yup.string()
        .min(3, 'Du må skrive minst 3 tegn')
        .max(4000, 'Feltet må være mindre eller lik 4000 tegn')
        .hasValidText()
        .required('Required'),
    fritekstbrev: Yup.object().shape({
        overskrift: Yup.string()
            .min(3, 'Du må skrive minst 3 tegn')
            .max(200, 'Feltet må være mindre eller lik 200 tegn')
            .hasValidText()
            .required('Required'),
        brødtekst: Yup.string()
            .min(3, 'Du må skrive minst 3 tegn')
            .max(100000, 'Feltet må være mindre eller lik 100000 tegn')
            .hasValidText()
            .required('Required'),
    }),
});

interface Brevmal {
    [key: string]: {
        navn: string;
        mottakere: string[];
    };
}

interface BrevProps {
    søkerId: string;
}

const Brev: React.FC<BrevProps> = ({ søkerId }) => {
    const intl = useIntl();
    const [brevmaler, setBrevmaler] = useState<Brevmal | undefined>(undefined);
    const [hentBrevmalerError, setHentBrevmalerError] = useState(false);
    const [arbeidsgivereMedNavn, setArbeidsgivereMedNavn] = useState<Organisasjon[]>([]);

    useEffect(() => {
        fetch(`${URL_BACKEND}/api/k9-formidling/brev/maler?sakstype=OMP&avsenderApplikasjon=K9PUNSJ`, {
            credentials: 'include',
        })
            .then((response) => {
                if (response.ok) {
                    return response.json().then((data) => setBrevmaler(data));
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
            onSubmit={(values, action) => {
                console.log(values);
            }}
            validationSchema={BrevSchema}
        >
            {({ values, isSubmitting }) => (
                <div className="brevContainer">
                    <Form>
                        <Field name="brevmalkode">
                            {({ field, meta }: FieldProps) => (
                                <Select
                                    {...field}
                                    label={intl.formatMessage({ id: 'Messages.Template' })}
                                    placeholder={intl.formatMessage({ id: 'Messages.ChooseTemplate' })}
                                    bredde="xxl"
                                    feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
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
                                <Field name="mottaker">
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
                                <Field name="fritekst">
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
                                <Field name="fritekstbrev.overskrift">
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
                                <Field name="fritekstbrev.brødtekst">
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
                            <Hovedknapp mini spinner={isSubmitting} disabled={isSubmitting}>
                                {intl.formatMessage({ id: 'Messages.Submit' })}
                            </Hovedknapp>
                            {values.brevmalkode && (
                                <button
                                    type="button"
                                    onClick={previewMessage}
                                    onKeyDown={(e) => (e.keyCode === 13 ? previewMessage(e) : null)}
                                    className="previewLink lenke lenke--frittstaende"
                                >
                                    {intl.formatMessage({ id: 'Messages.Preview' })}
                                </button>
                            )}
                        </div>
                    </Form>
                </div>
            )}
        </Formik>
    );
};

export default Brev;
