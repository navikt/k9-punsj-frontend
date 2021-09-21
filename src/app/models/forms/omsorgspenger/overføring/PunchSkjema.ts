import { IntlShape } from 'react-intl';
import { useFormikContext } from 'formik';
import { JaNei } from '../../../enums';
import {
    fødselsnummervalidator,
    gyldigDato,
    gyldigFødselsdato,
    IFeltValidator,
    positivtHeltall,
    påkrevd,
    validerSkjema,
} from '../../../../rules/valideringer';

export enum Innsendingsstatus {
    IkkeSendtInn = 'IkkeSendtInn',
    SenderInn = 'SenderInn',
    SendtInn = 'SendtInn',
    Innsendingsfeil = 'Innsendingsfeil',
}
export enum Mottaker {
    Ektefelle = 'Ektefelle',
    Samboer = 'Samboer',
}

type Dato = string;

interface IBarn {
    norskIdent: string | null;
    fødselsdato: Dato | null;
}

export interface IOverføringPunchSkjema {
    norskIdent: string | null;
    arbeidssituasjon: {
        erArbeidstaker: boolean;
        erFrilanser: boolean;
        erSelvstendigNæringsdrivende: boolean;
        metaHarFeil: null;
    };
    borINorge: JaNei | null;
    aleneOmOmsorgen: JaNei | null;
    barn: IBarn[];
    omsorgenDelesMed: {
        norskIdent: string;
        mottaker: Mottaker | null;
        antallOverførteDager: number;
        samboerSiden: Dato | null;
    };
    mottaksdato: Dato | null;
}

export const tomtSkjema: IOverføringPunchSkjema = {
    norskIdent: null,
    arbeidssituasjon: {
        erArbeidstaker: false,
        erFrilanser: false,
        erSelvstendigNæringsdrivende: false,
        metaHarFeil: null,
    },
    borINorge: null,
    omsorgenDelesMed: {
        norskIdent: '',
        antallOverførteDager: 0,
        mottaker: null,
        samboerSiden: null,
    },
    aleneOmOmsorgen: null,
    barn: [
        {
            norskIdent: null,
            fødselsdato: null,
        },
    ],
    mottaksdato: null,
};

const fnrDelesMedValidator: IFeltValidator<string, IOverføringPunchSkjema> = {
    feltPath: 'omsorgenDelesMed.norskIdent',
    validatorer: [påkrevd, fødselsnummervalidator],
};

const aleneomOmsorgenValidator: IFeltValidator<JaNei, IOverføringPunchSkjema> = {
    feltPath: 'aleneOmOmsorgen',
    validatorer: [påkrevd],
};

const borINorgeValidator: IFeltValidator<JaNei, IOverføringPunchSkjema> = {
    feltPath: 'borINorge',
    validatorer: [påkrevd],
};

const barnFnr: IFeltValidator<string, IOverføringPunchSkjema> = {
    feltPath: 'barn[].norskIdent',
    validatorer: [påkrevd, fødselsnummervalidator],
    arrayInPath: true,
};

const barnFødselsdato: IFeltValidator<string, IOverføringPunchSkjema> = {
    feltPath: 'barn[].fødselsdato',
    validatorer: [påkrevd, gyldigDato, gyldigFødselsdato],
    arrayInPath: true,
};

const mottakerValidator: IFeltValidator<JaNei, IOverføringPunchSkjema> = {
    feltPath: 'omsorgenDelesMed.mottaker',
    validatorer: [påkrevd],
};

const samboerSidenValidator: IFeltValidator<Dato, IOverføringPunchSkjema> = {
    feltPath: 'omsorgenDelesMed.samboerSiden',
    validatorer: [
        (verdi, skjema) => (skjema.omsorgenDelesMed?.mottaker === Mottaker.Samboer ? påkrevd(verdi) : undefined),
        (verdi, skjema) => (skjema.omsorgenDelesMed?.mottaker === Mottaker.Samboer ? gyldigDato(verdi) : undefined),
    ],
};

const antallDelteDagerValidator: IFeltValidator<number, IOverføringPunchSkjema> = {
    feltPath: 'omsorgenDelesMed.antallOverførteDager',
    validatorer: [positivtHeltall],
};

const mottaksdatoValidator: IFeltValidator<Dato, IOverføringPunchSkjema> = {
    feltPath: 'mottaksdato',
    validatorer: [påkrevd, gyldigDato],
};

export const validatePunch = (intl: IntlShape) =>
    validerSkjema<IOverføringPunchSkjema>(
        [
            fnrDelesMedValidator,
            aleneomOmsorgenValidator,
            mottakerValidator,
            antallDelteDagerValidator,
            barnFnr,
            barnFødselsdato,
            mottaksdatoValidator,
            samboerSidenValidator,
            borINorgeValidator,
        ],
        intl
    );

export const useOverføringPunchSkjemaContext = () => useFormikContext<IOverføringPunchSkjema>();
