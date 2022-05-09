import { Delete } from '@navikt/ds-icons';
import { TextField, BodyShort, Label, Button } from '@navikt/ds-react';
import { Personvalg } from 'app/models/types/Personvalg';
import React from 'react';
import { WrappedComponentProps } from 'react-intl';

type onChange = (barn: Personvalg[]) => void;

interface OwnProps extends WrappedComponentProps {
    person: Personvalg;
    index: number;
    onChange: onChange;
    handleBlur: any;
    personer: Personvalg[];
    error?: string;
}

const PersonLinje = ({ person, index, onChange, personer, handleBlur, error }: OwnProps) => {
    const handleIdentitetsnummer = (event: any) => {
        const personerEndret = personer.map((personObj: Personvalg, personIndex: number) =>
            personIndex === index ? { ...personObj, norskIdent: event.target.value.replace(/\D+/, '') } : personObj
        );
        onChange(personerEndret);
    };
    return (
        <div className="personlinje">
            <TextField
                label="Identitetsnummer"
                value={person.norskIdent}
                size="small"
                onChange={(event) => handleIdentitetsnummer(event)}
                onBlur={handleBlur}
                error={error}
                disabled={person.låsIdentitetsnummer}
            />
            <div className="navn">
                <Label size="small">Navn</Label>
                <BodyShort size="small">{person.navn}</BodyShort>
            </div>

            <Button
                className="slett"
                variant="tertiary"
                size="small"
                onClick={() => onChange(personer.filter((_, i) => i !== index))}
            >
                <Delete />
                Slett
            </Button>
        </div>
    );
};

export default PersonLinje;
