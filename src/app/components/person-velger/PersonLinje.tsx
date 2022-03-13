import { TextField, BodyShort, Label, Checkbox } from '@navikt/ds-react';
import { erUgyldigIdent } from 'app/containers/pleiepenger/Fordeling/FordelingFeilmeldinger';
import { Personvalg } from 'app/models/types/IdentState';
import intlHelper from 'app/utils/intlUtils';
import React, { useState } from 'react';
import { WrappedComponentProps } from 'react-intl';

type onChange = (barn: Personvalg[]) => void;

interface OwnProps extends WrappedComponentProps {
    person: Personvalg;
    index: number;
    onChange: onChange;
    personer: Personvalg[];
}

const errors = (person: Personvalg, intl: any) => {
    const { identitetsnummer } = person;

    if (identitetsnummer.length !== 11) {
        return intlHelper(intl, 'ident.feil.identitetsnummer.lengde');
    }
    if (erUgyldigIdent(identitetsnummer)) {
        return intlHelper(intl, 'ident.feil.ugyldigident');
    }

    return null;
};

const PersonLinje = ({ person, index, onChange, personer, intl }: OwnProps) => {
    const [visFeil, setVisFeil] = useState(false);

    const handleIdentitetsnummer = (event: any) => {
        const personerEndret = personer.map((personObj: Personvalg, personIndex: number) =>
            personIndex === index
                ? { ...personObj, identitetsnummer: event.target.value.replace(/\D+/, '') }
                : personObj
        );
        onChange(personerEndret);
    };

    const handleCheckbox = (event: any) => {
        const personerEndret = personer.map((personObj: Personvalg, personIndex: number) =>
            personIndex === index ? { ...personObj, valgt: event.target.checked } : personObj
        );
        onChange(personerEndret);
    };

    const handleBlur = () => {
        if (person.identitetsnummer.length) {
            setVisFeil(true);
            return;
        }
        setVisFeil(false);
    };
    return (
        <div className="personlinje">
            <TextField
                label="Identitetsnummer"
                value={person.identitetsnummer}
                size="small"
                onChange={(event) => handleIdentitetsnummer(event)}
                error={visFeil && errors(person, intl)}
                onBlur={handleBlur}
                disabled={person.låsIdentitetsnummer}
            />
            <div className="navn">
                <Label size="small">Navn</Label>
                <BodyShort size="small">{person.navn}</BodyShort>
            </div>
            <Checkbox size="small" checked={person.valgt} onChange={(event) => handleCheckbox(event)}>
                Valgt
            </Checkbox>
        </div>
    );
};

export default PersonLinje;
