import React from 'react';
import { Person } from 'app/models/types';
import { BodyShort, Label, Loader } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { prettifyDateString } from 'app/utils/date-utils/src/format';

interface Props {
    loading: boolean;
    error: boolean;
    person?: Person;
}

const PersonInfo: React.FC<Props> = ({ person, loading, error }) => {
    // TODO: add person not found error message
    if (loading) {
        return (
            <div className="ml-10 flex justify-center items-center">
                <Loader size="large" />
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
        <div className="ml-5 flex justify-center items-center">
            <BodyShort as="p">
                <span className="block">
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
