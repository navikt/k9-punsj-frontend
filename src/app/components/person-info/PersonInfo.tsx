import React from 'react';
import { Person } from 'app/models/types';
import { BodyShort, Label, Loader } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { prettifyDateString } from 'app/utils/date-utils/src/format';

interface PersonInfoProps {
    loading: boolean;
    error: boolean;
    person?: Person;
}

const PersonInfo: React.FC<PersonInfoProps> = ({ person, loading, error }) => {
    // TODO: add person not found error message'
    if (loading) {
        return (
            <div className="ml-10 mt-10 flex justify-center items-center">
                <Loader size="large" title="Henter person data..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="ml-10 mt-10 flex justify-center items-center">
                <FormattedMessage id="personInfo.error" />
            </div>
        );
    }

    if (!person) return null;

    return (
        <div className="ml-6 mt-4">
            <BodyShort as="p">
                <Label>
                    <FormattedMessage id="personInfo.tittel" />
                </Label>
                <span className="block mt-1">
                    <FormattedMessage
                        id="personInfo.fullNavn"
                        values={{ navn: person?.fornavn, etternavn: person?.etternavn }}
                    />
                </span>

                <span className="block">
                    <FormattedMessage
                        id="personInfo.fødselsdato"
                        values={{ fødselsdato: prettifyDateString(person?.fødselsdato || '') }}
                    />
                </span>
            </BodyShort>
        </div>
    );
};

export default PersonInfo;
