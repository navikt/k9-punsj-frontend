import { IdentRules } from 'app/rules';
import { useIntl } from 'react-intl';
import * as yup from 'yup';

export const getOpprettJournalpostSchema = () => {
    const intl = useIntl();

    return yup.object().shape({
        søkerIdentitetsnummer: yup
            .string()
            .required(intl.formatMessage({ id: 'validation.opprettJournalpost.søkerIdentitetsnummer.required' }))
            .length(
                11,
                intl.formatMessage(
                    { id: 'validation.opprettJournalpost.søkerIdentitetsnummer.length' },
                    { length: 11 },
                ),
            )
            .matches(
                /^\d+$/,
                intl.formatMessage({ id: 'validation.opprettJournalpost.søkerIdentitetsnummer.digitsOnly' }),
            )
            .test(
                'is-valid-ident',
                intl.formatMessage({ id: 'validation.opprettJournalpost.søkerIdentitetsnummer.invalidIdent' }),
                (value) => IdentRules.erUgyldigIdent(value) === false,
            ),
        fagsakId: yup.string().required(intl.formatMessage({ id: 'validation.opprettJournalpost.fagsakId.required' })),
        tittel: yup
            .string()
            .required(intl.formatMessage({ id: 'validation.opprettJournalpost.notatTittel.required' }))
            .min(3, intl.formatMessage({ id: 'validation.opprettJournalpost.notatTittel.minLength' }, { min: 3 }))
            .max(100, intl.formatMessage({ id: 'validation.opprettJournalpost.notatTittel.maxLength' }, { max: 100 })),
        notat: yup
            .string()
            .required(intl.formatMessage({ id: 'validation.opprettJournalpost.notatTekst.required' }))
            .min(3, intl.formatMessage({ id: 'validation.opprettJournalpost.notatTekst.minLength' }, { min: 3 }))
            .max(
                10000,
                intl.formatMessage({ id: 'validation.opprettJournalpost.notatTekst.maxLength' }, { max: 10000 }),
            ),
    });
};
