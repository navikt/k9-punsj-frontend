import React from 'react';

import { CheckboxGroup, TextField, Checkbox, BodyShort, Label, Button } from '@navikt/ds-react';
import './personvelger.less';
import { AddPerson } from '@navikt/ds-icons';
import { Personvalg } from 'app/models/types/IdentState';

interface OwnProps {
    personer: Personvalg[];
    onChange: (barn: Personvalg[]) => void;
}

const Personvelger = ({ personer = [1, 2], onChange }: OwnProps) => (
    <>
        <Label size="small">Velg hvilke barn det gjelder </Label>
        <div className="personvelger">
            {personer.map((person) => (
                <div className="personlinje">
                    <TextField label="Identifikator" value="29099000129" size="small" />
                    <div className="navn">
                        <Label size="small">Navn</Label>
                        <BodyShort size="small">Bobby Binders</BodyShort>
                    </div>
                    <Checkbox size="small">Valgt</Checkbox> 
                </div>
            ))}
            <Button
                variant="tertiary"
                size="small"
                onClick={() => {console.log('lel'); return onChange([...personer, { identifikator: '', navn: '', valgt: false }])}}
            >
                <AddPerson />
                Legg til barn
            </Button>
        </div>
    </>
);

export default Personvelger;
