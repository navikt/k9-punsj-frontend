import {IInputError, IMappe, IPersonlig, Mappe, Personlig} from 'app/models/types';

jest.mock('app/utils/envUtils');

const journalpostId = '200';
const mappeId = 'abcdef';

const identSoker1 = '01015012345';
const orgSoker1 = '123456789';
const soker1: IPersonlig = {journalpostId, soeknad: {arbeid: {arbeidstaker: [{organisasjonsnummer: orgSoker1}]}}};

const identSoker2 = '01015023456';
const orgSoker2 = '987654321';
const soker2: IPersonlig = {journalpostId, soeknad: {arbeid: {arbeidstaker: [{organisasjonsnummer: orgSoker2}]}}};

const personer = {[identSoker1]: soker1, [identSoker2]: soker2};

describe('Mappe', () => {

    const setupMappe = (mappePartial?: Partial<IMappe>) => new Mappe({mappeId, personer, ...mappePartial});

    it('Skal generere et objekt med to søkere', () => {
        const mappe = setupMappe();
        expect(mappe.mappeId).toEqual(mappeId);
        expect(mappe.personer[identSoker1].journalpostId).toEqual(journalpostId);
        expect(mappe.personer[identSoker1].soeknad.arbeid.arbeidstaker[0].organisasjonsnummer).toEqual(orgSoker1);
        expect(mappe.personer[identSoker2].journalpostId).toEqual(journalpostId);
        expect(mappe.personer[identSoker2].soeknad.arbeid.arbeidstaker[0].organisasjonsnummer).toEqual(orgSoker2);
    });

    describe('Mappe.genererDobbelSoknad', () => {

        it('Skal generere dobbel søknad for én søker', () => {
            const mappe = setupMappe({personer: {[identSoker1]: soker1}});
            const fellesSoknad = mappe.genererDobbelSoknad();
            expect(fellesSoknad.soker1.arbeid.arbeidstaker[0].organisasjonsnummer).toEqual(orgSoker1);
            expect(fellesSoknad.soker2).toBeNull();
        });

        it('Skal generere dobbel søknad for to søkere', () => {
            const mappe = setupMappe();
            const dobbelSoknad = mappe.genererDobbelSoknad();
            expect(dobbelSoknad.soker1.arbeid.arbeidstaker[0].organisasjonsnummer).toEqual(orgSoker1);
            expect(dobbelSoknad.soker2!.arbeid.arbeidstaker[0].organisasjonsnummer).toEqual(orgSoker2);
        });
    });
});

describe('Personlig', () => {

    const fellesMangler: IInputError[] = [
        {attributt: 'datoMottatt'},
        {attributt: 'spraak'},
        {attributt: 'barn'},
        {attributt: 'barn.norskIdent'},
        {attributt: 'beredskap[2]'},
        {attributt: 'beredskap[2]test'},
        {attributt: 'nattevaak'},
        {attributt: 'tilsynsordning'}
    ];

    const individuelleMangler: IInputError[] = [
        {attributt: 'perioder'},
        {attributt: 'perioder[1]'},
        {attributt: 'perioder[1].fraOgMed'},
        {attributt: 'arbeid'},
        {attributt: 'arbeid.arbeidstaker[0]'},
        {attributt: 'arbeid.arbeidstaker[0].periode'}
    ];

    const mangler: IInputError[] = fellesMangler.concat(individuelleMangler);

    const setupPersonlig = (personligPartial?: Partial<IPersonlig>) => new Personlig({...soker1, ...personligPartial});

    describe('Personling.extractFellesMangler', () => {
        it('Filtrerer ut mangler som hører til felles felter', () => {
            const personlig = setupPersonlig({mangler});
            expect(personlig.extractFellesMangler()).toEqual(fellesMangler);
        });
    });

    describe('Personling.extractIndividuelleMangler', () => {
        it('Filtrerer ut mangler som hører til individuelle felter', () => {
            const personlig = setupPersonlig({mangler});
            expect(personlig.extractIndividuelleMangler()).toEqual(individuelleMangler);
        });
    });
});