export enum PunchFormActionKeys {
    RESET = 'PUNCH_FORM_RESET',

    SOKNAD_LOAD = 'PUNCH_FORM_SOKNAD_LOAD',
    SOKNAD_REQUEST_ERROR = 'PUNCH_FORM_SOKNAD_REQUEST_ERROR',
    SOKNAD_SET = 'PUNCH_FORM_SOKNAD_SET',
    SOKNAD_RESET = 'PUNCH_FORM_SOKNAD_RESET',

    SOKNAD_UPDATE_REQUEST = 'PUNCH_FORM_SOKNAD_UPDATE_REQUEST',
    SOKNAD_UPDATE_SUCCESS = 'PUNCH_FORM_SOKNAD_UPDATE_SUCCESS',
    SOKNAD_UPDATE_ERROR = 'PUNCH_FORM_SOKNAD_UPDATE_ERROR',

    SOKNAD_SUBMIT_REQUEST = 'PUNCH_FORM_SOKNAD_SUBMIT_REQUEST',
    SOKNAD_SUBMIT_SUCCESS = 'PUNCH_FORM_SOKNAD_SUBMIT_SUCCESS',
    SOKNAD_SUBMIT_UNCOMPLETE = 'PUNCH_FORM_SOKNAD_SUBMIT_UNCOMPLETE',
    SOKNAD_SUBMIT_ERROR = 'PUNCH_FORM_SOKNAD_SUBMIT_ERROR',
    SOKNAD_SUBMIT_CONFLICT = 'PUNCH_FORM_SOKNAD_SUBMIT_CONFLICT',

    SOKNAD_VALIDER_REQUEST = 'PUNCH_FORM_SOKNAD_VALIDER_REQUEST',
    SOKNAD_VALIDER_SUCCESS = 'PUNCH_FORM_SOKNAD_VALIDER_SUCCESS',
    SOKNAD_VALIDER_ERROR = 'PUNCH_FORM_SOKNAD_VALIDER_ERROR',
    SOKNAD_VALIDER_UNCOMPLETE = 'PUNCH_FORM_SOKNAD_VALIDER_UNCOMPLETE',
    SOKNAD_VALIDER_RESET = 'PUNCH_FORM_SOKNAD_VALIDER_RESET',

    HENT_PERIODER_REQUEST = 'HENT_PERIODER_REQUEST',
    HENT_PERIODER_SUCCESS = 'HENT_PERIODER_SUCCESS',
    HENT_PERIODER_ERROR = 'HENT_PERIODER_ERROR',

    JOURNALPOST_SETT_PAA_VENT = 'JOURNALPOST_SETT_PAA_VENT',
    JOURNALPOST_JOURNALPOST_SETT_PAA_VENT_ERROR = 'JOURNALPOST_SETT_PAA_VENT_ERROR',
    JOURNALPOST_JOURNALPOST_SETT_PAA_VENT_SUCCESS = 'JOURNALPOST_SETT_PAA_VENT_SUCCESS',
    JOURNALPOST_JOURNALPOST_SETT_PAA_VENT_RESET = 'JOURNALPOST_SETT_PAA_VENT_RESET',
}

export const actionTypeFactory = (prefix: string) => ({
    RESET: `${prefix}_PUNCH_FORM_RESET`,
    SOKNAD_LOAD: `${prefix}_PUNCH_FORM_SOKNAD_LOAD`,
    SOKNAD_REQUEST_ERROR: `${prefix}_PUNCH_FORM_SOKNAD_REQUEST_ERROR`,
    SOKNAD_SET: `${prefix}_PUNCH_FORM_SOKNAD_SET`,
    SOKNAD_RESET: `${prefix}_PUNCH_FORM_SOKNAD_RESET`,
    SOKNAD_UPDATE_REQUEST: `${prefix}_PUNCH_FORM_SOKNAD_UPDATE_REQUEST`,
    SOKNAD_UPDATE_SUCCESS: `${prefix}_PUNCH_FORM_SOKNAD_UPDATE_SUCCESS`,
    SOKNAD_UPDATE_ERROR: `${prefix}_PUNCH_FORM_SOKNAD_UPDATE_ERROR`,
    SOKNAD_SUBMIT_REQUEST: `${prefix}_PUNCH_FORM_SOKNAD_SUBMIT_REQUEST`,
    SOKNAD_SUBMIT_SUCCESS: `${prefix}_PUNCH_FORM_SOKNAD_SUBMIT_SUCCESS`,
    SOKNAD_SUBMIT_UNCOMPLETE: `${prefix}_PUNCH_FORM_SOKNAD_SUBMIT_UNCOMPLETE`,
    SOKNAD_SUBMIT_ERROR: `${prefix}_PUNCH_FORM_SOKNAD_SUBMIT_ERROR`,
    SOKNAD_SUBMIT_CONFLICT: `${prefix}_PUNCH_FORM_SOKNAD_SUBMIT_CONFLICT`,
    SOKNAD_VALIDER_REQUEST: `${prefix}_PUNCH_FORM_SOKNAD_VALIDER_REQUEST`,
    SOKNAD_VALIDER_SUCCESS: `${prefix}_PUNCH_FORM_SOKNAD_VALIDER_SUCCESS`,
    SOKNAD_VALIDER_ERROR: `${prefix}_PUNCH_FORM_SOKNAD_VALIDER_ERROR`,
    SOKNAD_VALIDER_UNCOMPLETE: `${prefix}_PUNCH_FORM_SOKNAD_VALIDER_UNCOMPLETE`,
    SOKNAD_VALIDER_RESET: `${prefix}_PUNCH_FORM_SOKNAD_VALIDER_RESET`,
    HENT_PERIODER_REQUEST: `${prefix}_HENT_PERIODER_REQUEST`,
    HENT_PERIODER_SUCCESS: `${prefix}_HENT_PERIODER_SUCCESS`,
    HENT_PERIODER_ERROR: `${prefix}_HENT_PERIODER_ERROR`,
    JOURNALPOST_SETT_PAA_VENT: `${prefix}_JOURNALPOST_SETT_PAA_VENT`,
    JOURNALPOST_JOURNALPOST_SETT_PAA_VENT_ERROR: `${prefix}_JOURNALPOST_SETT_PAA_VENT_ERROR`,
    JOURNALPOST_JOURNALPOST_SETT_PAA_VENT_SUCCESS: `${prefix}_JOURNALPOST_SETT_PAA_VENT_SUCCESS`,
    JOURNALPOST_JOURNALPOST_SETT_PAA_VENT_RESET: `${prefix}_JOURNALPOST_SETT_PAA_VENT_RESET`,
});
