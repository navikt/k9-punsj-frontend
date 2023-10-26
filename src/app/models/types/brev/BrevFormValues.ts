import BrevFormKeys from 'app/models/enums/BrevFormKeys';

interface BrevFormValues {
    [BrevFormKeys.brevmalkode]: string;
    [BrevFormKeys.mottaker]: string;
    [BrevFormKeys.velgAnnetMottaker]: boolean;
    [BrevFormKeys.orgNummer]: string;
    [BrevFormKeys.fritekst]: string;
    [BrevFormKeys.fritekstbrev]: {
        overskrift: string;
        brødtekst: string;
    };
}

export default BrevFormValues;
