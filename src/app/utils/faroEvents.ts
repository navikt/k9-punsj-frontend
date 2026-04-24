import { EventAttributes, faro } from '@grafana/faro-web-sdk';
import { ROUTES } from 'app/constants/routes';
import { IPSBSoknadKvittering } from 'app/models/types/PSBSoknadKvittering';

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

type PunsjSource = typeof OPPRETT_JOURNALPOST_SOURCE | typeof UNKNOWN_SOURCE;
type PsbFieldGroup = (typeof PSB_FIELD_GROUPS)[keyof typeof PSB_FIELD_GROUPS];
type FaroEventOptions = {
    skipDedupe?: boolean;
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

const hasArbeidstidPerioder = (innsentSoknad: IPSBSoknadKvittering): boolean => {
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

const hasOmsorgsinformasjon = (innsentSoknad: IPSBSoknadKvittering): boolean => {
    const { omsorg } = innsentSoknad.ytelse;

    return [omsorg.relasjonTilBarnet, omsorg.beskrivelseAvOmsorgsrollen].some((value) =>
        typeof value === 'string' ? value.trim().length > 0 : false,
    );
};

const hasOpptjeningAktivitet = (innsentSoknad: IPSBSoknadKvittering): boolean => {
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

export const trackPsbStartedFromJournalpost = (journalpostId: string): boolean => {
    const source = getPunsjSourceForJournalpost(journalpostId);

    if (source === UNKNOWN_SOURCE) {
        return false;
    }

    return pushFaroEvent(PUNSJ_STARTED_EVENT, {
        source,
        sakstype: 'PSB',
    }, { skipDedupe: true });
};

export const trackPsbSubmitFromJournalpost = (
    journalpostId: string,
    innsentSoknad: IPSBSoknadKvittering,
): PsbFieldGroup[] => {
    const source = getPunsjSourceForJournalpost(journalpostId);

    if (source === UNKNOWN_SOURCE) {
        return [];
    }

    const fieldGroups = getPsbSubmittedFieldGroups(innsentSoknad);
    const sharedAttributes = {
        source,
        sakstype: 'PSB',
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
