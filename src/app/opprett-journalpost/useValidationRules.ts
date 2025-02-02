import { IdentRules } from 'app/rules/IdentRules';
import { RegisterOptions } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { IOpprettJournalpostForm } from './types';
import { hasValidText } from 'app/utils/validationHelpers';

export const useValidationRules = () => {
    const intl = useIntl();

    const søkerIdentitetsnummerValidationRules: RegisterOptions<IOpprettJournalpostForm> = {
        required: intl.formatMessage({ id: 'validation.opprettJournalpost.søkerIdentitetsnummer.required' }),
        minLength: {
            value: 11,
            message: intl.formatMessage(
                { id: 'validation.opprettJournalpost.søkerIdentitetsnummer.length' },
                { length: 11 },
            ),
        },
        maxLength: {
            value: 11,
            message: intl.formatMessage(
                { id: 'validation.opprettJournalpost.søkerIdentitetsnummer.length' },
                { length: 11 },
            ),
        },
        pattern: {
            value: /^\d+$/,
            message: intl.formatMessage({ id: 'validation.opprettJournalpost.søkerIdentitetsnummer.digitsOnly' }),
        },
        validate: (value: string) =>
            IdentRules.erUgyldigIdent(value) === false ||
            intl.formatMessage({ id: 'validation.opprettJournalpost.søkerIdentitetsnummer.invalidIdent' }),
    };

    const fagsakIdValidationRules: RegisterOptions<IOpprettJournalpostForm> = {
        required: intl.formatMessage({ id: 'validation.opprettJournalpost.fagsakId.required' }),
    };

    const tittelValidationRules: RegisterOptions<IOpprettJournalpostForm> = {
        validate: (value: string) => {
            if (!value) {
                return intl.formatMessage({ id: 'validation.opprettJournalpost.notatTittel.required' });
            }
            if (value.length < 3) {
                return intl.formatMessage({ id: 'validation.opprettJournalpost.notatTittel.minLength' }, { min: 3 });
            }
            if (value.length > 100) {
                return intl.formatMessage({ id: 'validation.opprettJournalpost.notatTittel.maxLength' }, { max: 100 });
            }
            return hasValidText(value);
        },
    };

    const notatValidationRules: RegisterOptions<IOpprettJournalpostForm> = {
        validate: (value: string) => {
            if (!value) {
                return intl.formatMessage({ id: 'validation.opprettJournalpost.notatTekst.required' });
            }
            if (value.length < 3) {
                return intl.formatMessage({ id: 'validation.opprettJournalpost.notatTekst.minLength' }, { min: 3 });
            }
            if (value.length > 10000) {
                return intl.formatMessage({ id: 'validation.opprettJournalpost.notatTekst.maxLength' }, { max: 10000 });
            }
            if (!hasValidText(value)) {
                return intl.formatMessage({ id: 'validation.opprettJournalpost.notatTekst.invalid' });
            }
            return hasValidText(value);
        },
    };
    return {
        søkerIdentitetsnummerValidationRules,
        fagsakIdValidationRules,
        tittelValidationRules,
        notatValidationRules,
    };
};
