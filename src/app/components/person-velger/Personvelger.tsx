import React from 'react';

import { Label, Button } from '@navikt/ds-react';
import { AddPerson } from '@navikt/ds-icons';
import { Personvalg } from 'app/models/types/IdentState';
import './personvelger.less';
import { WrappedComponentProps } from 'react-intl';
import PersonLinje from './PersonLinje';

interface OwnProps extends WrappedComponentProps {
    personer: Personvalg[];
    onChange: (barn: Personvalg[]) => void;
}

const Personvelger = ({ personer, onChange, intl }: OwnProps) => (
    <>
        <Label size="small">Velg hvilke barn det gjelder </Label>
        <div className="personvelger">
            {personer.map((person, index) => (
                <PersonLinje
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    person={person}
                    index={index}
                    onChange={onChange}
                    personer={personer}
                    intl={intl}
                />
            ))}
            <Button
                variant="tertiary"
                size="small"
                onClick={() => onChange([...personer, { identitetsnummer: '', navn: '', valgt: false }])}
            >
                <AddPerson />
                Legg til barn
            </Button>
        </div>
    </>
);

export default Personvelger;
