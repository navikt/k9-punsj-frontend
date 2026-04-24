import { EventAttributes, faro } from '@grafana/faro-web-sdk';
import { ROUTES } from 'app/constants/routes';
import { ISoknadKvitteringArbeidstid } from 'app/models/types/KvitteringTyper';
import { IPSBSoknadKvittering } from 'app/models/types/PSBSoknadKvittering';
import { IOMPKSSoknadKvittering } from 'app/søknader/omsorgspenger-kronisk-sykt-barn/types/OMPKSSoknadKvittering';
import { IOMPAOSoknadKvittering } from 'app/søknader/omsorgspenger-alene-om-omsorgen/types/OMPAOSoknadKvittering';
import { IOMPMASoknadKvittering } from 'app/søknader/omsorgspenger-midlertidig-alene/types/OMPMASoknadKvittering';
import { aktivitetsFravær } from 'app/søknader/omsorgspenger-utbetaling/konstanter';
import { IOMPUTSoknadKvittering } from 'app/søknader/omsorgspenger-utbetaling/types/OMPUTSoknadKvittering';
import { IOLPSoknadKvittering } from 'app/søknader/opplæringspenger/OLPSoknadKvittering';
import { IPLSSoknadKvittering } from 'app/søknader/pleiepenger-livets-sluttfase/types/IPLSSoknadKvittering';

export const MANUAL_JOURNALPOST_FLOW_STARTED_EVENT = 'manual_journalpost_flow_started';
export const PUNSJ_STARTED_EVENT = 'punsj_started';
export const PUNSJ_SUBMIT_SNAPSHOT_EVENT = 'punsj_submit_snapshot';
export const PUNSJ_SUBMIT_FIELD_GROUP_EVENT = 'punsj_submit_field_group';

const OPPRETT_JOURNALPOST_SOURCE = 'opprett_journalpost';
const UNKNOWN_SOURCE = 'unknown';
const MANUAL_JOURNALPOST_SOURCE_SESSION_KEY = 'manualJournalpostSourceIds';

export const PSB_FIELD_GROUPS = {
    ARBEIDSTID: 'arbeidstid',
    TREKK_AV_PERIODE: 'trekk_av_periode',
    PERIODE: 'periode',
    TILSYN: 'tilsyn',
    BEREDSKAP: 'beredskap',
    NATTEVAAK: 'nattevaak',
    FERIE: 'ferie',
    UTENLANDSOPPHOLD: 'utenlandsopphold',
    BOSTED: 'bosted',
    UTTAK: 'uttak',
    OMSORG: 'omsorg',
    OPPTJENING: 'opptjening',
    ANNET: 'annet',
} as const;

export const PLS_FIELD_GROUPS = {
    ARBEIDSTID: 'arbeidstid',
    TREKK_AV_PERIODE: 'trekk_av_periode',
    PERIODE: 'periode',
    FERIE: 'ferie',
    UTENLANDSOPPHOLD: 'utenlandsopphold',
    BOSTED: 'bosted',
    OPPTJENING: 'opptjening',
} as const;

export const OMPKS_FIELD_GROUPS = {
    KRONISK_ELLER_FUNKSJONSHEMMING: 'kronisk_eller_funksjonshemming',
} as const;

export const OMPMA_FIELD_GROUPS = {
    BARN: 'barn',
    ANNEN_FORELDER: 'annen_forelder',
} as const;

export const OLP_FIELD_GROUPS = {
    ARBEIDSTID: 'arbeidstid',
    TREKK_AV_PERIODE: 'trekk_av_periode',
    PERIODE: 'periode',
    KURS: 'kurs',
    REISE: 'reise',
    FERIE: 'ferie',
    UTENLANDSOPPHOLD: 'utenlandsopphold',
    BOSTED: 'bosted',
    UTTAK: 'uttak',
    OMSORG: 'omsorg',
    OPPTJENING: 'opptjening',
} as const;

export const OMPUT_FIELD_GROUPS = {
    ARBEIDSTAKER: 'arbeidstaker',
    FRILANSER: 'frilanser',
    SELVSTENDIG: 'selvstendig',
} as const;

export const OMPAO_FIELD_GROUPS = {
    BARN: 'barn',
    PERIODE: 'periode',
} as const;

type PunsjSource = typeof OPPRETT_JOURNALPOST_SOURCE | typeof UNKNOWN_SOURCE;
type PsbFieldGroup = (typeof PSB_FIELD_GROUPS)[keyof typeof PSB_FIELD_GROUPS];
type PlsFieldGroup = (typeof PLS_FIELD_GROUPS)[keyof typeof PLS_FIELD_GROUPS];
type OmpksFieldGroup = (typeof OMPKS_FIELD_GROUPS)[keyof typeof OMPKS_FIELD_GROUPS];
type OmpmaFieldGroup = (typeof OMPMA_FIELD_GROUPS)[keyof typeof OMPMA_FIELD_GROUPS];
type OlpFieldGroup = (typeof OLP_FIELD_GROUPS)[keyof typeof OLP_FIELD_GROUPS];
type OmputFieldGroup = (typeof OMPUT_FIELD_GROUPS)[keyof typeof OMPUT_FIELD_GROUPS];
type OmpaoFieldGroup = (typeof OMPAO_FIELD_GROUPS)[keyof typeof OMPAO_FIELD_GROUPS];
type PunsjFieldGroup =
    | PsbFieldGroup
    | PlsFieldGroup
    | OmpksFieldGroup
    | OmpmaFieldGroup
    | OlpFieldGroup
    | OmputFieldGroup
    | OmpaoFieldGroup;
type FaroEventOptions = {
    skipDedupe?: boolean;
};

type KvitteringWithArbeidstid = {
    ytelse: {
        arbeidstid: ISoknadKvitteringArbeidstid;
    };
};

type KvitteringWithOpptjeningAktivitet = {
    ytelse: {
        opptjeningAktivitet: {
            selvstendigNæringsdrivende?: unknown[];
            frilanser?: unknown;
        };
    };
};

type KvitteringWithOmsorg = {
    ytelse: {
        omsorg: {
            relasjonTilBarnet?: null | string;
            beskrivelseAvOmsorgsrollen?: null | string;
        };
    };
};

const PSB_FIELD_GROUP_ORDER: PsbFieldGroup[] = [
    PSB_FIELD_GROUPS.ARBEIDSTID,
    PSB_FIELD_GROUPS.TREKK_AV_PERIODE,
    PSB_FIELD_GROUPS.PERIODE,
    PSB_FIELD_GROUPS.TILSYN,
    PSB_FIELD_GROUPS.BEREDSKAP,
    PSB_FIELD_GROUPS.NATTEVAAK,
    PSB_FIELD_GROUPS.FERIE,
    PSB_FIELD_GROUPS.UTENLANDSOPPHOLD,
    PSB_FIELD_GROUPS.BOSTED,
    PSB_FIELD_GROUPS.UTTAK,
    PSB_FIELD_GROUPS.OMSORG,
    PSB_FIELD_GROUPS.OPPTJENING,
    PSB_FIELD_GROUPS.ANNET,
];

const PLS_FIELD_GROUP_ORDER: PlsFieldGroup[] = [
    PLS_FIELD_GROUPS.ARBEIDSTID,
    PLS_FIELD_GROUPS.TREKK_AV_PERIODE,
    PLS_FIELD_GROUPS.PERIODE,
    PLS_FIELD_GROUPS.FERIE,
    PLS_FIELD_GROUPS.UTENLANDSOPPHOLD,
    PLS_FIELD_GROUPS.BOSTED,
    PLS_FIELD_GROUPS.OPPTJENING,
];

const OMPKS_FIELD_GROUP_ORDER: OmpksFieldGroup[] = [OMPKS_FIELD_GROUPS.KRONISK_ELLER_FUNKSJONSHEMMING];

const OMPMA_FIELD_GROUP_ORDER: OmpmaFieldGroup[] = [
    OMPMA_FIELD_GROUPS.BARN,
    OMPMA_FIELD_GROUPS.ANNEN_FORELDER,
];

const OLP_FIELD_GROUP_ORDER: OlpFieldGroup[] = [
    OLP_FIELD_GROUPS.ARBEIDSTID,
    OLP_FIELD_GROUPS.TREKK_AV_PERIODE,
    OLP_FIELD_GROUPS.PERIODE,
    OLP_FIELD_GROUPS.KURS,
    OLP_FIELD_GROUPS.REISE,
    OLP_FIELD_GROUPS.FERIE,
    OLP_FIELD_GROUPS.UTENLANDSOPPHOLD,
    OLP_FIELD_GROUPS.BOSTED,
    OLP_FIELD_GROUPS.UTTAK,
    OLP_FIELD_GROUPS.OMSORG,
    OLP_FIELD_GROUPS.OPPTJENING,
];

const OMPUT_FIELD_GROUP_ORDER: OmputFieldGroup[] = [
    OMPUT_FIELD_GROUPS.ARBEIDSTAKER,
    OMPUT_FIELD_GROUPS.FRILANSER,
    OMPUT_FIELD_GROUPS.SELVSTENDIG,
];

const OMPAO_FIELD_GROUP_ORDER: OmpaoFieldGroup[] = [
    OMPAO_FIELD_GROUPS.BARN,
    OMPAO_FIELD_GROUPS.PERIODE,
];

const getSessionStorage = (): Storage | undefined => {
    if (typeof window === 'undefined') {
        return undefined;
    }

    try {
        return window.sessionStorage;
    } catch {
        return undefined;
    }
};

const normalizeJournalpostId = (journalpostId: string): string => journalpostId.trim();

const readManualJournalpostSourceIds = (): string[] => {
    const storage = getSessionStorage();

    if (!storage) {
        return [];
    }

    try {
        const rawValue = storage.getItem(MANUAL_JOURNALPOST_SOURCE_SESSION_KEY);

        if (!rawValue) {
            return [];
        }

        const parsedValue = JSON.parse(rawValue);

        if (!Array.isArray(parsedValue)) {
            return [];
        }

        return parsedValue.reduce<string[]>((journalpostIds, value) => {
            if (typeof value !== 'string') {
                return journalpostIds;
            }

            const normalizedValue = normalizeJournalpostId(value);

            if (normalizedValue.length > 0) {
                journalpostIds.push(normalizedValue);
            }

            return journalpostIds;
        }, []);
    } catch {
        return [];
    }
};

const writeManualJournalpostSourceIds = (journalpostIds: string[]): boolean => {
    const storage = getSessionStorage();

    if (!storage) {
        return false;
    }

    try {
        if (journalpostIds.length === 0) {
            storage.removeItem(MANUAL_JOURNALPOST_SOURCE_SESSION_KEY);
        } else {
            storage.setItem(MANUAL_JOURNALPOST_SOURCE_SESSION_KEY, JSON.stringify(journalpostIds));
        }

        return true;
    } catch {
        return false;
    }
};

const hasRecordEntries = (value?: Record<string, unknown> | null): boolean => !!value && Object.keys(value).length > 0;

const hasArbeidstidPerioder = (innsentSoknad: KvitteringWithArbeidstid): boolean => {
    const { arbeidstid } = innsentSoknad.ytelse;

    const arbeidstakerHarArbeidstid = arbeidstid.arbeidstakerList.some((arbeidstaker) =>
        hasRecordEntries(arbeidstaker.arbeidstidInfo?.perioder),
    );

    return (
        arbeidstakerHarArbeidstid ||
        hasRecordEntries(arbeidstid.frilanserArbeidstidInfo?.perioder) ||
        hasRecordEntries(arbeidstid.selvstendigNæringsdrivendeArbeidstidInfo?.perioder)
    );
};

const hasOmsorgsinformasjon = (innsentSoknad: KvitteringWithOmsorg): boolean => {
    const { omsorg } = innsentSoknad.ytelse;

    return [omsorg.relasjonTilBarnet, omsorg.beskrivelseAvOmsorgsrollen].some((value) =>
        typeof value === 'string' ? value.trim().length > 0 : false,
    );
};

const hasOpptjeningAktivitet = (innsentSoknad: KvitteringWithOpptjeningAktivitet): boolean => {
    const { opptjeningAktivitet } = innsentSoknad.ytelse;

    return !!opptjeningAktivitet.frilanser || (opptjeningAktivitet.selvstendigNæringsdrivende?.length || 0) > 0;
};

export const pushFaroEvent = (name: string, attributes?: EventAttributes, options?: FaroEventOptions): boolean => {
    if (typeof window === 'undefined' || !window.nais?.telemetryCollectorURL) {
        return false;
    }

    try {
        faro.api.pushEvent(name, attributes, undefined, options);
        return true;
    } catch {
        return false;
    }
};

export const trackManualJournalpostFlowStarted = (): boolean =>
    pushFaroEvent(MANUAL_JOURNALPOST_FLOW_STARTED_EVENT, {
        source: OPPRETT_JOURNALPOST_SOURCE,
        route: ROUTES.OPPRETT_JOURNALPOST,
        phase: 'page_opened',
    }, { skipDedupe: true });

export const setManualJournalpostFlowSource = (journalpostId: string): boolean => {
    const normalizedJournalpostId = normalizeJournalpostId(journalpostId);

    if (!normalizedJournalpostId) {
        return false;
    }

    const journalpostIds = new Set(readManualJournalpostSourceIds());
    journalpostIds.add(normalizedJournalpostId);

    return writeManualJournalpostSourceIds(Array.from(journalpostIds));
};

export const getPunsjSourceForJournalpost = (journalpostId: string): PunsjSource => {
    const normalizedJournalpostId = normalizeJournalpostId(journalpostId);

    if (!normalizedJournalpostId) {
        return UNKNOWN_SOURCE;
    }

    return readManualJournalpostSourceIds().includes(normalizedJournalpostId)
        ? OPPRETT_JOURNALPOST_SOURCE
        : UNKNOWN_SOURCE;
};

export const clearManualJournalpostFlowSource = (journalpostId: string): boolean => {
    const normalizedJournalpostId = normalizeJournalpostId(journalpostId);

    if (!normalizedJournalpostId) {
        return false;
    }

    return writeManualJournalpostSourceIds(
        readManualJournalpostSourceIds().filter((storedJournalpostId) => storedJournalpostId !== normalizedJournalpostId),
    );
};

export const getPsbSubmittedFieldGroups = (innsentSoknad: IPSBSoknadKvittering): PsbFieldGroup[] => {
    const fieldGroups = new Set<PsbFieldGroup>();
    const { ytelse } = innsentSoknad;

    if (hasArbeidstidPerioder(innsentSoknad)) {
        fieldGroups.add(PSB_FIELD_GROUPS.ARBEIDSTID);
    }

    if (ytelse.trekkKravPerioder.length > 0) {
        fieldGroups.add(PSB_FIELD_GROUPS.TREKK_AV_PERIODE);
    }

    if (ytelse.søknadsperiode.length > 0) {
        fieldGroups.add(PSB_FIELD_GROUPS.PERIODE);
    }

    if (hasRecordEntries(ytelse.tilsynsordning.perioder)) {
        fieldGroups.add(PSB_FIELD_GROUPS.TILSYN);
    }

    if (hasRecordEntries(ytelse.beredskap.perioder)) {
        fieldGroups.add(PSB_FIELD_GROUPS.BEREDSKAP);
    }

    if (hasRecordEntries(ytelse.nattevåk.perioder)) {
        fieldGroups.add(PSB_FIELD_GROUPS.NATTEVAAK);
    }

    if (hasRecordEntries(ytelse.lovbestemtFerie.perioder)) {
        fieldGroups.add(PSB_FIELD_GROUPS.FERIE);
    }

    if (hasRecordEntries(ytelse.utenlandsopphold.perioder)) {
        fieldGroups.add(PSB_FIELD_GROUPS.UTENLANDSOPPHOLD);
    }

    if (hasRecordEntries(ytelse.bosteder.perioder)) {
        fieldGroups.add(PSB_FIELD_GROUPS.BOSTED);
    }

    if (hasRecordEntries(ytelse.uttak.perioder)) {
        fieldGroups.add(PSB_FIELD_GROUPS.UTTAK);
    }

    if (hasOmsorgsinformasjon(innsentSoknad)) {
        fieldGroups.add(PSB_FIELD_GROUPS.OMSORG);
    }

    if (hasOpptjeningAktivitet(innsentSoknad)) {
        fieldGroups.add(PSB_FIELD_GROUPS.OPPTJENING);
    }

    return PSB_FIELD_GROUP_ORDER.filter((fieldGroup) => fieldGroups.has(fieldGroup));
};

const trackPunsjStartedFromJournalpost = (journalpostId: string, sakstype: string): boolean => {
    const source = getPunsjSourceForJournalpost(journalpostId);

    if (source === UNKNOWN_SOURCE) {
        return false;
    }

    return pushFaroEvent(PUNSJ_STARTED_EVENT, {
        source,
        sakstype,
    }, { skipDedupe: true });
};

const trackPunsjSubmitFromJournalpost = <FieldGroup extends PunsjFieldGroup>(
    journalpostId: string,
    sakstype: string,
    fieldGroups: FieldGroup[],
): FieldGroup[] => {
    const source = getPunsjSourceForJournalpost(journalpostId);

    if (source === UNKNOWN_SOURCE) {
        return [];
    }

    const sharedAttributes = {
        source,
        sakstype,
    };

    pushFaroEvent(PUNSJ_SUBMIT_SNAPSHOT_EVENT, {
        ...sharedAttributes,
        used_field_groups: fieldGroups.join(',') || 'none',
        used_field_group_count: String(fieldGroups.length),
    }, { skipDedupe: true });

    fieldGroups.forEach((fieldGroup) => {
        pushFaroEvent(PUNSJ_SUBMIT_FIELD_GROUP_EVENT, {
            ...sharedAttributes,
            field_group: fieldGroup,
        }, { skipDedupe: true });
    });

    clearManualJournalpostFlowSource(journalpostId);

    return fieldGroups;
};

export const trackPsbStartedFromJournalpost = (journalpostId: string): boolean =>
    trackPunsjStartedFromJournalpost(journalpostId, 'PSB');

export const getPlsSubmittedFieldGroups = (innsentSoknad: IPLSSoknadKvittering): PlsFieldGroup[] => {
    const fieldGroups = new Set<PlsFieldGroup>();
    const { ytelse } = innsentSoknad;

    if (hasArbeidstidPerioder(innsentSoknad)) {
        fieldGroups.add(PLS_FIELD_GROUPS.ARBEIDSTID);
    }

    if (ytelse.trekkKravPerioder.length > 0) {
        fieldGroups.add(PLS_FIELD_GROUPS.TREKK_AV_PERIODE);
    }

    if (ytelse.søknadsperiode.length > 0) {
        fieldGroups.add(PLS_FIELD_GROUPS.PERIODE);
    }

    if (hasRecordEntries(ytelse.lovbestemtFerie.perioder)) {
        fieldGroups.add(PLS_FIELD_GROUPS.FERIE);
    }

    if (hasRecordEntries(ytelse.utenlandsopphold.perioder)) {
        fieldGroups.add(PLS_FIELD_GROUPS.UTENLANDSOPPHOLD);
    }

    if (hasRecordEntries(ytelse.bosteder.perioder)) {
        fieldGroups.add(PLS_FIELD_GROUPS.BOSTED);
    }

    if (hasOpptjeningAktivitet(innsentSoknad)) {
        fieldGroups.add(PLS_FIELD_GROUPS.OPPTJENING);
    }

    return PLS_FIELD_GROUP_ORDER.filter((fieldGroup) => fieldGroups.has(fieldGroup));
};

export const trackPlsStartedFromJournalpost = (journalpostId: string): boolean => {
    return trackPunsjStartedFromJournalpost(journalpostId, 'PLS');
};

export const trackPlsSubmitFromJournalpost = (
    journalpostId: string,
    innsentSoknad: IPLSSoknadKvittering,
): PlsFieldGroup[] => {
    const fieldGroups = getPlsSubmittedFieldGroups(innsentSoknad);

    return trackPunsjSubmitFromJournalpost(journalpostId, 'PLS', fieldGroups);
};

export const getOmpksSubmittedFieldGroups = (innsentSoknad: IOMPKSSoknadKvittering): OmpksFieldGroup[] => {
    const fieldGroups = new Set<OmpksFieldGroup>();

    if (typeof innsentSoknad.ytelse.kroniskEllerFunksjonshemming === 'boolean') {
        fieldGroups.add(OMPKS_FIELD_GROUPS.KRONISK_ELLER_FUNKSJONSHEMMING);
    }

    return OMPKS_FIELD_GROUP_ORDER.filter((fieldGroup) => fieldGroups.has(fieldGroup));
};

export const trackOmpksStartedFromJournalpost = (journalpostId: string): boolean =>
    trackPunsjStartedFromJournalpost(journalpostId, 'OMPKS');

export const trackOmpksSubmitFromJournalpost = (
    journalpostId: string,
    innsentSoknad: IOMPKSSoknadKvittering,
): OmpksFieldGroup[] => {
    const fieldGroups = getOmpksSubmittedFieldGroups(innsentSoknad);

    return trackPunsjSubmitFromJournalpost(journalpostId, 'OMPKS', fieldGroups);
};

export const getOmpmaSubmittedFieldGroups = (innsentSoknad: IOMPMASoknadKvittering): OmpmaFieldGroup[] => {
    const fieldGroups = new Set<OmpmaFieldGroup>();
    const { ytelse } = innsentSoknad;

    if (ytelse.barn.length > 0) {
        fieldGroups.add(OMPMA_FIELD_GROUPS.BARN);
    }

    if (ytelse.annenForelder) {
        fieldGroups.add(OMPMA_FIELD_GROUPS.ANNEN_FORELDER);
    }

    return OMPMA_FIELD_GROUP_ORDER.filter((fieldGroup) => fieldGroups.has(fieldGroup));
};

export const trackOmpmaStartedFromJournalpost = (journalpostId: string): boolean =>
    trackPunsjStartedFromJournalpost(journalpostId, 'OMPMA');

export const trackOmpmaSubmitFromJournalpost = (
    journalpostId: string,
    innsentSoknad: IOMPMASoknadKvittering,
): OmpmaFieldGroup[] => {
    const fieldGroups = getOmpmaSubmittedFieldGroups(innsentSoknad);

    return trackPunsjSubmitFromJournalpost(journalpostId, 'OMPMA', fieldGroups);
};

export const getOlpSubmittedFieldGroups = (innsentSoknad: IOLPSoknadKvittering): OlpFieldGroup[] => {
    const fieldGroups = new Set<OlpFieldGroup>();
    const { ytelse } = innsentSoknad;

    if (hasArbeidstidPerioder(innsentSoknad)) {
        fieldGroups.add(OLP_FIELD_GROUPS.ARBEIDSTID);
    }

    if (ytelse.trekkKravPerioder.length > 0) {
        fieldGroups.add(OLP_FIELD_GROUPS.TREKK_AV_PERIODE);
    }

    if (ytelse.søknadsperiode.length > 0) {
        fieldGroups.add(OLP_FIELD_GROUPS.PERIODE);
    }

    if (ytelse.kurs?.kursperioder.length > 0 || !!ytelse.kurs?.kursholder?.institusjonsidentifikator) {
        fieldGroups.add(OLP_FIELD_GROUPS.KURS);
    }

    if (ytelse.kurs?.reise?.reisedager.length > 0) {
        fieldGroups.add(OLP_FIELD_GROUPS.REISE);
    }

    if (hasRecordEntries(ytelse.lovbestemtFerie.perioder)) {
        fieldGroups.add(OLP_FIELD_GROUPS.FERIE);
    }

    if (hasRecordEntries(ytelse.utenlandsopphold.perioder)) {
        fieldGroups.add(OLP_FIELD_GROUPS.UTENLANDSOPPHOLD);
    }

    if (hasRecordEntries(ytelse.bosteder.perioder)) {
        fieldGroups.add(OLP_FIELD_GROUPS.BOSTED);
    }

    if (hasRecordEntries(ytelse.uttak.perioder)) {
        fieldGroups.add(OLP_FIELD_GROUPS.UTTAK);
    }

    if (hasOmsorgsinformasjon(innsentSoknad)) {
        fieldGroups.add(OLP_FIELD_GROUPS.OMSORG);
    }

    if (hasOpptjeningAktivitet(innsentSoknad)) {
        fieldGroups.add(OLP_FIELD_GROUPS.OPPTJENING);
    }

    return OLP_FIELD_GROUP_ORDER.filter((fieldGroup) => fieldGroups.has(fieldGroup));
};

export const trackOlpStartedFromJournalpost = (journalpostId: string): boolean =>
    trackPunsjStartedFromJournalpost(journalpostId, 'OLP');

export const trackOlpSubmitFromJournalpost = (
    journalpostId: string,
    innsentSoknad: IOLPSoknadKvittering,
): OlpFieldGroup[] => {
    const fieldGroups = getOlpSubmittedFieldGroups(innsentSoknad);

    return trackPunsjSubmitFromJournalpost(journalpostId, 'OLP', fieldGroups);
};

export const getOmputSubmittedFieldGroups = (innsentSoknad: IOMPUTSoknadKvittering): OmputFieldGroup[] => {
    const fieldGroups = new Set<OmputFieldGroup>();

    innsentSoknad.ytelse.fraværsperioder.forEach((periode) => {
        if (periode.aktivitetFravær.includes(aktivitetsFravær.ARBEIDSTAKER)) {
            fieldGroups.add(OMPUT_FIELD_GROUPS.ARBEIDSTAKER);
        }

        if (periode.aktivitetFravær.includes(aktivitetsFravær.FRILANSER)) {
            fieldGroups.add(OMPUT_FIELD_GROUPS.FRILANSER);
        }

        if (periode.aktivitetFravær.includes(aktivitetsFravær.SELVSTENDIG_NÆRINGSDRIVENDE)) {
            fieldGroups.add(OMPUT_FIELD_GROUPS.SELVSTENDIG);
        }
    });

    return OMPUT_FIELD_GROUP_ORDER.filter((fieldGroup) => fieldGroups.has(fieldGroup));
};

export const trackOmputStartedFromJournalpost = (journalpostId: string): boolean =>
    trackPunsjStartedFromJournalpost(journalpostId, 'OMPUT');

export const trackOmputSubmitFromJournalpost = (
    journalpostId: string,
    innsentSoknad: IOMPUTSoknadKvittering,
): OmputFieldGroup[] => {
    const fieldGroups = getOmputSubmittedFieldGroups(innsentSoknad);

    return trackPunsjSubmitFromJournalpost(journalpostId, 'OMPUT', fieldGroups);
};

export const getOmpaoSubmittedFieldGroups = (innsentSoknad: IOMPAOSoknadKvittering): OmpaoFieldGroup[] => {
    const fieldGroups = new Set<OmpaoFieldGroup>();
    const { ytelse } = innsentSoknad;

    if (ytelse.barn) {
        fieldGroups.add(OMPAO_FIELD_GROUPS.BARN);
    }

    if (ytelse.periode) {
        fieldGroups.add(OMPAO_FIELD_GROUPS.PERIODE);
    }

    return OMPAO_FIELD_GROUP_ORDER.filter((fieldGroup) => fieldGroups.has(fieldGroup));
};

export const trackOmpaoStartedFromJournalpost = (journalpostId: string): boolean =>
    trackPunsjStartedFromJournalpost(journalpostId, 'OMPAO');

export const trackOmpaoSubmitFromJournalpost = (
    journalpostId: string,
    innsentSoknad: IOMPAOSoknadKvittering,
): OmpaoFieldGroup[] => {
    const fieldGroups = getOmpaoSubmittedFieldGroups(innsentSoknad);

    return trackPunsjSubmitFromJournalpost(journalpostId, 'OMPAO', fieldGroups);
};

export const trackPsbSubmitFromJournalpost = (
    journalpostId: string,
    innsentSoknad: IPSBSoknadKvittering,
): PsbFieldGroup[] => {
    const fieldGroups = getPsbSubmittedFieldGroups(innsentSoknad);

    return trackPunsjSubmitFromJournalpost(journalpostId, 'PSB', fieldGroups);
};
