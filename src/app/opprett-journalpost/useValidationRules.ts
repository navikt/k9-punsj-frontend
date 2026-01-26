import { IdentRules } from 'app/validation/IdentRules';
import { RegisterOptions } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { IOpprettJournalpostForm } from './types';
import { hasValidText } from 'app/utils/validationHelpers';

export const useValidationRules = () => {
    const intl = useIntl();

    const søkerIdentitetsnummerValidator: RegisterOptions<IOpprettJournalpostForm> = {
        required: intl.formatMessage({ id: 'validation.opprettJournalpost.textField.søkerIdentitetsnummer.required' }),
        minLength: {
            value: 11,
            message: intl.formatMessage(
                { id: 'validation.opprettJournalpost.textField.søkerIdentitetsnummer.length' },
                { length: 11 },
            ),
        },
        maxLength: {
            value: 11,
            message: intl.formatMessage(
                { id: 'validation.opprettJournalpost.textField.søkerIdentitetsnummer.length' },
                { length: 11 },
            ),
        },
        pattern: {
            value: /^\d+$/,
            message: intl.formatMessage({
                id: 'validation.opprettJournalpost.textField.søkerIdentitetsnummer.digitsOnly',
            }),
        },
        validate: (value: string) =>
            IdentRules.erUgyldigIdent(value) === false ||
            intl.formatMessage({ id: 'validation.opprettJournalpost.textField.søkerIdentitetsnummer.invalidIdent' }),
    };

    const fagsakIdValidator: RegisterOptions<IOpprettJournalpostForm> = {
        required: intl.formatMessage({ id: 'validation.opprettJournalpost.select.fagsakId.required' }),
    };

    const tittelValidator: RegisterOptions<IOpprettJournalpostForm> = {
        validate: (value: string) => {
            if (!value) {
                return intl.formatMessage({ id: 'validation.opprettJournalpost.textField.tittel.required' });
            }
            if (value.length < 3) {
                return intl.formatMessage(
                    { id: 'validation.opprettJournalpost.textField.tittel.minLength' },
                    { min: 3 },
                );
            }
            if (value.length > 100) {
                return intl.formatMessage(
                    { id: 'validation.opprettJournalpost.textField.tittel.maxLength' },
                    { max: 100 },
                );
            }
            return hasValidText(value);
        },
    };

    const notatValidator: RegisterOptions<IOpprettJournalpostForm> = {
        validate: (value: string) => {
            if (!value) {
                return intl.formatMessage({ id: 'validation.opprettJournalpost.textarea.notat.required' });
            }
            if (value.length < 3) {
                return intl.formatMessage({ id: 'validation.opprettJournalpost.textarea.notat.minLength' }, { min: 3 });
            }
            if (value.length > 10000) {
                return intl.formatMessage(
                    { id: 'validation.opprettJournalpost.textarea.notat.maxLength' },
                    { max: 10000 },
                );
            }

            return hasValidText(value);
        },
    };
    return {
        søkerIdentitetsnummerValidator,
        fagsakIdValidator,
        tittelValidator,
        notatValidator,
    };
};
