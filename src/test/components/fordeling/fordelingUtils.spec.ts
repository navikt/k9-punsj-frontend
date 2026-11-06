import { DokumenttypeForkortelse } from 'app/models/enums';
import journalpostStatus from 'app/models/enums/JournalpostStatus';
import { IJournalpost } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import Fagsak, { FagsakForSelect } from 'app/types/Fagsak';
import {
    checkIfFagsakMedValgtBehandlingsår,
    isJournalførKnapperDisabled,
    isRedirectVidereDisabled,
} from 'app/fordeling/fordelingUtils';

const gyldigSøkerId = '18410162721';
const gyldigPleietrengendeId = '53488838241';
const gyldigAnnenSøkerId = '17420373147';
const gyldigFosterbarnId = '09418531220';
const gyldigAnnenPartId = '02918496664';
const ugyldigId = '123';

const gyldigIdentState: IIdentState = {
    søkerId: gyldigSøkerId,
    pleietrengendeId: gyldigPleietrengendeId,
    annenSokerIdent: null,
    annenPart: '',
    fosterbarn: [],
};

const identStateMed = (endringer: Partial<IIdentState> = {}): IIdentState => ({
    ...gyldigIdentState,
    ...endringer,
});

const journalpostUtenSak: IJournalpost = {
    journalpostId: 'journalpost-id',
    dokumenter: [],
    journalpostStatus: journalpostStatus.MOTTATT,
    kanSendeInn: true,
    erSaksbehandler: true,
};

const fagsak: Fagsak = {
    fagsakId: 'fagsak-id',
    sakstype: DokumenttypeForkortelse.PSB,
    gyldigPeriode: { fom: '2023-01-01', tom: '2023-12-31' },
};

const fagsakForSelect = (behandlingsår?: string): FagsakForSelect => ({
    fagsakId: 'fagsak-id',
    sakstype: DokumenttypeForkortelse.PSB,
    gyldigPeriode: { fom: '2023-01-01', tom: '2023-12-31' },
    behandlingsår,
});

interface JournalførKnappInput {
    journalpost?: IJournalpost;
    identState?: IIdentState;
    ingenInfoOmPleitrengende?: boolean;
    barnetHarIkkeFnr?: boolean;
    toSokereIJournalpost?: boolean;
    harFagsaker?: boolean;
    reserverSaksnummerTilNyFagsak?: boolean;
    isDokumenttypeMedPleietrengende?: boolean;
    isDokumenttypeMedBehandlingsårValg?: boolean;
    isDokumenttypeMedAnnenPart?: boolean;
    isDokumenttypeMedFosterbarn?: boolean;
    isFagsakMedValgtBehandlingsår?: boolean;
    gjelderOlp?: boolean;
    tillatPSBMBarnMedFagsakVidere?: boolean;
    fagsak?: Fagsak;
    behandlingsÅr?: string;
    barnMedFagsak?: FagsakForSelect;
}

const journalførKnapperErDeaktivert = ({
    journalpost = journalpostUtenSak,
    identState = gyldigIdentState,
    ingenInfoOmPleitrengende = false,
    barnetHarIkkeFnr = false,
    toSokereIJournalpost = false,
    harFagsaker = false,
    reserverSaksnummerTilNyFagsak = false,
    isDokumenttypeMedPleietrengende = true,
    isDokumenttypeMedBehandlingsårValg = false,
    isDokumenttypeMedAnnenPart = false,
    isDokumenttypeMedFosterbarn = false,
    isFagsakMedValgtBehandlingsår = false,
    gjelderOlp = false,
    tillatPSBMBarnMedFagsakVidere = false,
    fagsak: valgtFagsak,
    behandlingsÅr,
    barnMedFagsak,
}: JournalførKnappInput = {}) =>
    isJournalførKnapperDisabled(
        journalpost,
        identState,
        ingenInfoOmPleitrengende,
        barnetHarIkkeFnr,
        toSokereIJournalpost,
        harFagsaker,
        reserverSaksnummerTilNyFagsak,
        isDokumenttypeMedPleietrengende,
        isDokumenttypeMedBehandlingsårValg,
        isDokumenttypeMedAnnenPart,
        isDokumenttypeMedFosterbarn,
        isFagsakMedValgtBehandlingsår,
        gjelderOlp,
        tillatPSBMBarnMedFagsakVidere,
        valgtFagsak,
        behandlingsÅr,
        barnMedFagsak,
    );

describe('checkIfFagsakMedValgtBehandlingsår', () => {
    it.each([
        ['reservert fagsak med valgt år', [fagsakForSelect('2023')], true, true, '2023', true],
        ['fagsak for et annet år', [fagsakForSelect('2022')], true, true, '2023', false],
        ['valg av behandlingsår er ikke relevant', [fagsakForSelect('2023')], false, true, '2023', false],
        ['det reserveres ikke saksnummer', [fagsakForSelect('2023')], true, false, '2023', false],
        ['ingen fagsaker', [], true, true, '2023', false],
        ['valgt år mangler', [fagsakForSelect('2023')], true, true, undefined, false],
    ])('%s', (_navn, fagsaker, valgAvBehandlingsår, reserverSaksnummer, behandlingsår, forventet) => {
        expect(
            checkIfFagsakMedValgtBehandlingsår(
                fagsaker,
                valgAvBehandlingsår,
                reserverSaksnummer,
                behandlingsår,
            ),
        ).toBe(forventet);
    });
});

describe('isJournalførKnapperDisabled', () => {
    it('deaktiverer journalføring for ferdigstilt journalpost med reservert saksnummer', () => {
        expect(
            journalførKnapperErDeaktivert({
                journalpost: {
                    ...journalpostUtenSak,
                    erFerdigstilt: true,
                    sak: { ...fagsak, reservertSaksnummer: true },
                },
            }),
        ).toBeTruthy();
    });

    it('lar valgt fagsak være journalførbar når saker ikke reserveres', () => {
        expect(
            journalførKnapperErDeaktivert({
                harFagsaker: true,
                fagsak,
            }),
        ).toBeFalsy();
    });

    it('deaktiverer journalføring når en eksisterende fagsak ikke er valgt', () => {
        expect(journalførKnapperErDeaktivert({ harFagsaker: true })).toBeTruthy();
    });

    it('lar ny fagsak reserveres uten å velge en eksisterende fagsak', () => {
        expect(journalførKnapperErDeaktivert({ harFagsaker: true, reserverSaksnummerTilNyFagsak: true })).toBeFalsy();
    });

    it.each([
        ['barnets eksisterende fagsak', { barnMedFagsak: fagsakForSelect() }, true],
        ['OLP-unntaket', { barnMedFagsak: fagsakForSelect(), gjelderOlp: true }, false],
        [
            'frontend-toggle for barn med fagsak',
            { barnMedFagsak: fagsakForSelect(), tillatPSBMBarnMedFagsakVidere: true },
            false,
        ],
    ])('%s', (_navn, input, forventet) => {
        expect(journalførKnapperErDeaktivert(input)).toBe(!!forventet);
    });

    it.each([
        ['søker og pleietrengende er samme person', { pleietrengendeId: gyldigSøkerId }],
        ['søker og annen søker er samme person', { annenSokerIdent: gyldigSøkerId }],
        ['pleietrengende og annen søker er samme person', { annenSokerIdent: gyldigPleietrengendeId }],
    ])('deaktiverer ved identkollisjon: %s', (_navn, identState) => {
        expect(journalførKnapperErDeaktivert({ identState: identStateMed(identState) })).toBeTruthy();
    });

    it('krever gyldige identiteter for begge søkere når journalposten kan kopieres', () => {
        expect(
            journalførKnapperErDeaktivert({
                journalpost: { ...journalpostUtenSak, kanKopieres: true },
                toSokereIJournalpost: true,
            }),
        ).toBeTruthy();
        expect(
            journalførKnapperErDeaktivert({
                journalpost: { ...journalpostUtenSak, kanKopieres: true },
                toSokereIJournalpost: true,
                identState: identStateMed({ annenSokerIdent: ugyldigId }),
            }),
        ).toBeTruthy();
        expect(
            journalførKnapperErDeaktivert({
                journalpost: { ...journalpostUtenSak, kanKopieres: true },
                toSokereIJournalpost: true,
                identState: identStateMed({ annenSokerIdent: gyldigAnnenSøkerId }),
            }),
        ).toBeFalsy();
        expect(
            journalførKnapperErDeaktivert({
                journalpost: { ...journalpostUtenSak, kanKopieres: false },
                toSokereIJournalpost: true,
                identState: identStateMed({ annenSokerIdent: gyldigAnnenSøkerId }),
            }),
        ).toBeFalsy();
    });

    it('deaktiverer kopiering når pleietrengende-ident mangler selv om barnet ikke har fødselsnummer', () => {
        expect(
            journalførKnapperErDeaktivert({
                journalpost: { ...journalpostUtenSak, kanKopieres: true },
                toSokereIJournalpost: true,
                barnetHarIkkeFnr: true,
                identState: identStateMed({
                    pleietrengendeId: '',
                    annenSokerIdent: gyldigAnnenSøkerId,
                }),
            }),
        ).toBeTruthy();
    });

    it.each([
        ['vanlig dokumenttype', { identState: identStateMed({ pleietrengendeId: '' }) }, true],
        [
            'ingen opplysninger om pleietrengende',
            { identState: identStateMed({ pleietrengendeId: '' }), ingenInfoOmPleitrengende: true },
            false,
        ],
        [
            'pleietrengende har ikke fødselsnummer',
            { identState: identStateMed({ pleietrengendeId: '' }), barnetHarIkkeFnr: true },
            false,
        ],
    ])('%s', (_navn, input, forventet) => {
        expect(journalførKnapperErDeaktivert(input)).toBe(!!forventet);
    });

    it('krever behandlingsår når dokumenttypen bruker år, og stopper ved fagsak med samme år', () => {
        expect(
            journalførKnapperErDeaktivert({
                isDokumenttypeMedBehandlingsårValg: true,
                isDokumenttypeMedPleietrengende: false,
            }),
        ).toBeTruthy();
        expect(
            journalførKnapperErDeaktivert({
                isDokumenttypeMedBehandlingsårValg: true,
                isDokumenttypeMedPleietrengende: false,
                behandlingsÅr: '2023',
            }),
        ).toBeFalsy();
        expect(
            journalførKnapperErDeaktivert({
                isFagsakMedValgtBehandlingsår: true,
                isDokumenttypeMedPleietrengende: false,
                behandlingsÅr: '2023',
            }),
        ).toBeTruthy();
    });

    it('deaktiverer for ugyldig søkerident', () => {
        expect(journalførKnapperErDeaktivert({ identState: identStateMed({ søkerId: ugyldigId }) })).toBeTruthy();
    });

    it.each([
        ['annen part mangler', '', true],
        ['annen part er ugyldig', ugyldigId, true],
        ['annen part er søker', gyldigSøkerId, true],
        ['annen part er gyldig og forskjellig fra søker', gyldigAnnenPartId, false],
    ])('validerer annen part: %s', (_navn, annenPart, forventet) => {
        expect(
            journalførKnapperErDeaktivert({
                isDokumenttypeMedPleietrengende: false,
                isDokumenttypeMedAnnenPart: true,
                identState: identStateMed({ annenPart }),
            }),
        ).toBe(!!forventet);
    });

    it.each([
        ['fosterbarn har ugyldig ident', { fosterbarn: [ugyldigId] }, false, false, true],
        ['fosterbarn er søker', { fosterbarn: [gyldigSøkerId] }, false, false, true],
        [
            'fosterbarn er den andre søkeren',
            { fosterbarn: [gyldigAnnenSøkerId], annenSokerIdent: gyldigAnnenSøkerId },
            true,
            false,
            true,
        ],
        [
            'fosterbarn er annen part',
            { fosterbarn: [gyldigAnnenPartId], annenPart: gyldigAnnenPartId },
            false,
            true,
            true,
        ],
        ['fosterbarn har gyldig, egen ident', { fosterbarn: [gyldigFosterbarnId] }, false, false, false],
    ])('%s', (_navn, identState, toSokereIJournalpost, isDokumenttypeMedAnnenPart, forventet) => {
        expect(
            journalførKnapperErDeaktivert({
                identState: identStateMed(identState),
                isDokumenttypeMedPleietrengende: false,
                isDokumenttypeMedFosterbarn: true,
                toSokereIJournalpost,
                isDokumenttypeMedAnnenPart,
            }),
        ).toBe(!!forventet);
    });
});

describe('isRedirectVidereDisabled', () => {
    const redirectVidereErDeaktivert = (
        identState: IIdentState = gyldigIdentState,
        isDokumenttypeMedPleietrengende = true,
        gjelderOlp = false,
        tillatPSBMBarnMedFagsakVidere = false,
        barnMedFagsak?: FagsakForSelect,
    ) =>
        isRedirectVidereDisabled(
            identState,
            isDokumenttypeMedPleietrengende,
            gjelderOlp,
            tillatPSBMBarnMedFagsakVidere,
            barnMedFagsak,
        );

    it.each([
        ['søkerident er ugyldig', identStateMed({ søkerId: ugyldigId }), true],
        ['pleietrengendeident er ugyldig', identStateMed({ pleietrengendeId: ugyldigId }), true],
        ['søker og pleietrengende er samme person', identStateMed({ pleietrengendeId: gyldigSøkerId }), true],
        ['søker og pleietrengende er gyldige og ulike', gyldigIdentState, false],
    ])('%s', (_navn, identState, forventet) => {
        expect(redirectVidereErDeaktivert(identState)).toBe(forventet);
    });

    it.each([
        ['barnet har eksisterende fagsak', false, false, true],
        ['OLP-unntaket', true, false, false],
        ['frontend-toggle for barn med fagsak', false, true, false],
    ])('%s', (_navn, gjelderOlp, tillatPSBMBarnMedFagsakVidere, forventet) => {
        expect(
            redirectVidereErDeaktivert(
                gyldigIdentState,
                true,
                gjelderOlp,
                tillatPSBMBarnMedFagsakVidere,
                fagsakForSelect(),
            ),
        ).toBe(forventet);
    });

    it('krever ikke pleietrengende for dokumenttype uten pleietrengende', () => {
        expect(
            redirectVidereErDeaktivert(identStateMed({ pleietrengendeId: '' }), false, false, false, fagsakForSelect()),
        ).toBeFalsy();
    });
});
