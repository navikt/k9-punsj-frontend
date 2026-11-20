import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import { ApiPath } from 'app/apiConfig';
import BrevComponent from 'app/components/brev/brevComponent/BrevComponent';
import { renderWithIntl } from '../../testUtils';

const TEST_IDENT = '08438323288';
const AKTØR_ID = '81549300';
const FAGSAK_ID = '1DMU93A';
const JOURNALPOST_ID = '920001';
const TEST_TITTEL = 'Eksempel på tittel';
const TEST_INNHOLD = 'Eksempel på brevtekst';
const ORGNUMMER = '889640782';

const brevmaler = {
    GENERELT_FRITEKSTBREV: {
        kode: 'GENERELT_FRITEKSTBREV',
        navn: 'Generelt brev',
        mottakere: [],
        linker: [],
        støtterFritekst: false,
        støtterTittelOgFritekst: true,
        støtterTredjepartsmottaker: true,
    },
    INNHEN: {
        kode: 'INNHEN',
        navn: 'Innhente opplysninger',
        mottakere: [],
        linker: [],
        støtterFritekst: true,
        støtterTittelOgFritekst: false,
        støtterTredjepartsmottaker: false,
    },
    UTEN_FRITEKST: {
        kode: 'UTEN_FRITEKST',
        navn: 'Standardbrev',
        mottakere: [],
        linker: [],
        støtterFritekst: false,
        støtterTittelOgFritekst: false,
        støtterTredjepartsmottaker: false,
    },
};

const jsonResponse = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

type RecordedRequest = { url: string; init?: RequestInit; body?: Record<string, unknown> };

let requests: RecordedRequest[];
let sendReplies: Response[];
let previewReplies: Response[];
let orgReplies: Response[];
let malReply: Response;

const renderBrev = (props: Partial<React.ComponentProps<typeof BrevComponent>> = {}) =>
    renderWithIntl(
        <MemoryRouter>
            <BrevComponent søkerId={TEST_IDENT} sakstype="PSB" fagsakId={FAGSAK_ID} {...props} />
        </MemoryRouter>,
    );

const requestFor = (path: string) => requests.find((request) => request.url.startsWith(path));
const requestsFor = (path: string) => requests.filter((request) => request.url.startsWith(path));

const velgMalOgMottaker = async (user: ReturnType<typeof userEvent.setup>, mal = 'GENERELT_FRITEKSTBREV') => {
    await screen.findByRole('option', { name: `Ola Test - ${TEST_IDENT}` });
    await user.selectOptions(screen.getByRole('combobox', { name: 'Velg mal' }), mal);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Velg mottaker' }), AKTØR_ID);
};

const fyllInnFritekstbrev = async (user: ReturnType<typeof userEvent.setup>) => {
    const title = screen.getByRole('textbox', { name: 'Tittel' });
    const content = screen.getByRole('textbox', { name: 'Innhold i brev' });
    await user.click(title);
    await user.paste(TEST_TITTEL);
    await user.click(content);
    await user.paste(TEST_INNHOLD);
};

const bekreftSending = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('button', { name: 'Send brev' }));
    await user.click(await screen.findByRole('button', { name: 'Fortsett' }));
};

const stubPreviewWindow = () => {
    const createObjectURL = vi.fn(() => 'blob:brev-preview');
    vi.stubGlobal(
        'URL',
        Object.assign(function URLMock() {}, { createObjectURL }),
    );
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    return { createObjectURL, open };
};

beforeEach(() => {
    requests = [];
    sendReplies = [new Response(null, { status: 200 })];
    previewReplies = [new Response('mock pdf', { status: 200, headers: { 'Content-Type': 'application/pdf' } })];
    orgReplies = [jsonResponse({ navn: 'Test Navn' })];
    malReply = jsonResponse(brevmaler);

    vi.stubGlobal(
        'fetch',
        vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
            const url = String(input);
            const body =
                typeof init?.body === 'string' ? (JSON.parse(init.body) as Record<string, unknown>) : undefined;
            requests.push({ url, init, body });

            if (url.startsWith(ApiPath.BREV_MALER)) return malReply.clone();
            if (url === ApiPath.FINN_ARBEIDSGIVERE) {
                return jsonResponse({
                    organisasjoner: [{ navn: 'Test Arbeidsgiver', organisasjonsnummer: '979312059' }],
                });
            }
            if (url === ApiPath.BREV_AKTØRID) return jsonResponse(AKTØR_ID);
            if (url === ApiPath.PERSON) {
                return jsonResponse({ identitetsnummer: TEST_IDENT, sammensattNavn: 'Ola Test' });
            }
            if (url.startsWith(ApiPath.SØK_ORGNUMMER)) {
                return orgReplies.shift() ?? jsonResponse({ navn: 'Test Navn' });
            }
            if (url === ApiPath.BREV_BESTILL) {
                return sendReplies.shift() ?? new Response(null, { status: 200 });
            }
            if (url === ApiPath.BREV_FORHAANDSVIS) {
                return previewReplies.shift() ?? new Response('mock pdf', { status: 200 });
            }

            throw new Error(`Uventet API-kall: ${url}`);
        }),
    );
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('BrevComponent', () => {
    it('krever mal, mottaker og gyldig tittel og innhold, og fjerner feil etter retting', async () => {
        const user = userEvent.setup();
        renderBrev();

        await screen.findByRole('combobox', { name: 'Velg mal' });
        await user.click(screen.getByRole('button', { name: 'Send brev' }));
        expect(await screen.findByText('Du må velge mal.')).toBeVisible();

        await user.selectOptions(screen.getByRole('combobox', { name: 'Velg mal' }), 'GENERELT_FRITEKSTBREV');
        expect(screen.queryByText('Du må velge mal.')).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Send brev' }));
        expect(await screen.findByText('Du må velge mottaker.')).toBeVisible();

        await user.selectOptions(screen.getByRole('combobox', { name: 'Velg mottaker' }), AKTØR_ID);
        expect(screen.queryByText('Du må velge mottaker.')).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Send brev' }));
        expect(await screen.findByText('Du må skrive inn tittel.')).toBeVisible();
        expect(screen.getByText('Du må skrive inn innhold.')).toBeVisible();

        const title = screen.getByRole('textbox', { name: 'Tittel' });
        const content = screen.getByRole('textbox', { name: 'Innhold i brev' });
        await user.click(title);
        await user.paste('AB');
        await user.click(content);
        await user.paste('X');
        await user.click(screen.getByRole('button', { name: 'Send brev' }));
        expect(await screen.findByText('Tittel må være minst 3 tegn.')).toBeVisible();
        expect(screen.getByText('Innhold må være minst 3 tegn.')).toBeVisible();

        await user.clear(title);
        await user.click(title);
        await user.paste('© ugyldig');
        await user.clear(content);
        await user.click(content);
        await user.paste('© ugyldig');
        await user.click(screen.getByRole('button', { name: 'Send brev' }));
        expect(await screen.findAllByText('Feltet inneholder ugyldige tegn: ©')).toHaveLength(2);

        await user.clear(title);
        await user.click(title);
        await user.paste(TEST_TITTEL);
        await user.clear(content);
        await user.click(content);
        await user.paste(TEST_INNHOLD);
        expect(screen.queryByText(/må være minst|ugyldige tegn/)).not.toBeInTheDocument();
        expect(title).toHaveAttribute('maxlength', '200');

        await user.clear(content);
        await user.paste('A'.repeat(10001));
        await user.click(screen.getByRole('button', { name: 'Send brev' }));
        expect(await screen.findByText('Innhold kan ikke være lengre enn 10000 tegn.')).toBeVisible();
    });

    it.each([
        ['GENERELT_FRITEKSTBREV', true, true, { fritekstbrev: { overskrift: TEST_TITTEL, brødtekst: TEST_INNHOLD } }],
        ['INNHEN', false, true, { fritekst: TEST_INNHOLD }],
        ['UTEN_FRITEKST', false, false, {}],
    ])('viser feltene og sender dokumentdata for malen %s', async (mal, harTittel, harInnhold, dokumentdata) => {
        const user = userEvent.setup();
        renderBrev({ sendBrevUtenModal: true });

        await velgMalOgMottaker(user, mal);
        if (harTittel) {
            await user.click(screen.getByRole('textbox', { name: 'Tittel' }));
            await user.paste(TEST_TITTEL);
        }
        if (harInnhold) {
            await user.click(screen.getByRole('textbox', { name: 'Innhold i brev' }));
            await user.paste(TEST_INNHOLD);
        }
        expect(screen.queryByRole('textbox', { name: 'Tittel' }) !== null).toBe(harTittel);
        expect(screen.queryByRole('textbox', { name: 'Innhold i brev' }) !== null).toBe(harInnhold);

        await user.click(screen.getByRole('button', { name: 'Send brev' }));
        await screen.findByText(
            'Brevet er sendt. Du kan nå sende nytt brev til annen mottaker eller gå tilbake til LOS.',
        );
        expect(requestFor(ApiPath.BREV_BESTILL)?.body).toEqual({
            soekerId: TEST_IDENT,
            mottaker: { type: 'AKTØRID', id: AKTØR_ID },
            fagsakYtelseType: 'PSB',
            dokumentMal: mal,
            dokumentdata,
            saksnummer: FAGSAK_ID,
        });
    });

    it('sender arbeidsgiver som ORGNR-mottaker', async () => {
        const user = userEvent.setup();
        renderBrev({ sendBrevUtenModal: true });

        await velgMalOgMottaker(user);
        await user.selectOptions(screen.getByRole('combobox', { name: 'Velg mottaker' }), '979312059');
        await fyllInnFritekstbrev(user);
        await user.click(screen.getByRole('button', { name: 'Send brev' }));

        await waitFor(() => expect(requestsFor(ApiPath.BREV_BESTILL)).toHaveLength(1));
        expect(requestFor(ApiPath.BREV_BESTILL)?.body).toEqual({
            soekerId: TEST_IDENT,
            mottaker: { type: 'ORGNR', id: '979312059' },
            fagsakYtelseType: 'PSB',
            dokumentMal: 'GENERELT_FRITEKSTBREV',
            dokumentdata: { fritekstbrev: { overskrift: TEST_TITTEL, brødtekst: TEST_INNHOLD } },
            saksnummer: FAGSAK_ID,
        });
    });

    it('krever gyldig tredjepartsorganisasjonsnummer og fjerner mellomrom i bestillingen', async () => {
        const user = userEvent.setup();
        renderBrev({ sendBrevUtenModal: true });

        await velgMalOgMottaker(user);
        await user.click(screen.getByRole('checkbox', { name: 'Send til tredjepart' }));
        const orgField = screen.getByRole('textbox', { name: 'Organisasjonsnummer' });
        await user.click(screen.getByRole('button', { name: 'Send brev' }));
        expect(await screen.findByText('Du må skrive inn organisasjonsnummer.')).toBeVisible();
        expect(requestsFor(ApiPath.BREV_BESTILL)).toHaveLength(0);

        await user.type(orgField, '1');
        await user.click(screen.getByRole('button', { name: 'Send brev' }));
        expect(await screen.findByText('Organisasjonsnummeret er ugyldig.')).toBeVisible();
        expect(requestsFor(ApiPath.BREV_BESTILL)).toHaveLength(0);

        await user.clear(orgField);
        await user.type(orgField, '111111111');
        expect(await screen.findByText('Organisasjonsnummeret er ugyldig.')).toBeVisible();
        expect(requests.filter(({ url }) => url.startsWith(`${ApiPath.SØK_ORGNUMMER}?`))).toHaveLength(0);

        await user.clear(orgField);
        await user.type(orgField, ORGNUMMER);
        expect(await screen.findByText('Test Navn')).toBeVisible();
        await fyllInnFritekstbrev(user);
        await user.click(screen.getByRole('button', { name: 'Send brev' }));

        await waitFor(() => expect(requestsFor(ApiPath.BREV_BESTILL)).toHaveLength(1));
        expect(requestFor(ApiPath.BREV_BESTILL)?.body).toEqual({
            soekerId: TEST_IDENT,
            mottaker: { type: 'ORGNR', id: ORGNUMMER },
            fagsakYtelseType: 'PSB',
            dokumentMal: 'GENERELT_FRITEKSTBREV',
            dokumentdata: { fritekstbrev: { overskrift: TEST_TITTEL, brødtekst: TEST_INNHOLD } },
            saksnummer: FAGSAK_ID,
        });
    });

    it('formaterer organisasjonsnummer, viser oppslag, håndterer feil og slår opp korrigert nummer', async () => {
        const user = userEvent.setup();
        orgReplies = [jsonResponse({}, 404), jsonResponse({ navn: 'Test Navn' })];
        renderBrev({ sendBrevUtenModal: true });

        await velgMalOgMottaker(user);
        await user.click(screen.getByRole('checkbox', { name: 'Send til tredjepart' }));
        const orgField = screen.getByRole('textbox', { name: 'Organisasjonsnummer' });
        await user.type(orgField, '111111111');
        expect(requests.filter(({ url }) => url.startsWith(`${ApiPath.SØK_ORGNUMMER}?`))).toHaveLength(0);
        await user.clear(orgField);
        await user.type(orgField, ORGNUMMER);

        expect(await screen.findByText(/Noe gikk galt\. Error: .*Status: 404/)).toBeVisible();
        expect(orgField).toHaveValue('889 640 782');
        const orgRequest = requests.find(({ url }) => url.startsWith(`${ApiPath.SØK_ORGNUMMER}?`));
        expect(orgRequest?.url).toContain(`organisasjonsnummer=${ORGNUMMER}`);
        expect(new Headers(orgRequest?.init?.headers).get('X-Nav-NorskIdent')).toBe(AKTØR_ID);

        await user.clear(orgField);
        await user.type(orgField, '979312059');
        expect(await screen.findByText('Test Navn')).toBeVisible();
        expect(requests.filter(({ url }) => url.startsWith(`${ApiPath.SØK_ORGNUMMER}?`))).toHaveLength(2);
    });

    it('viser ventestatus mens organisasjonsoppslaget pågår og lar ikke sende før svaret kommer', async () => {
        let resolveOrg: (response: Response) => void = () => {
            throw new Error('Organisasjonsoppslaget er ikke startet');
        };
        const pending = new Promise<Response>((resolve) => {
            resolveOrg = resolve;
        });
        const fetchMock = vi.mocked(fetch);
        fetchMock.mockImplementation(async (input, init) => {
            const url = String(input);
            const body = typeof init?.body === 'string' ? JSON.parse(init.body) : undefined;
            requests.push({ url, init, body });
            if (url.startsWith(ApiPath.BREV_MALER)) return malReply.clone();
            if (url === ApiPath.FINN_ARBEIDSGIVERE) return jsonResponse({ organisasjoner: [] });
            if (url === ApiPath.BREV_AKTØRID) return jsonResponse(AKTØR_ID);
            if (url === ApiPath.PERSON)
                return jsonResponse({ identitetsnummer: TEST_IDENT, sammensattNavn: 'Ola Test' });
            if (url.startsWith(ApiPath.SØK_ORGNUMMER)) return pending;
            if (url === ApiPath.BREV_BESTILL) return new Response(null, { status: 200 });
            throw new Error(`Uventet API-kall: ${url}`);
        });
        const user = userEvent.setup();
        renderBrev({ sendBrevUtenModal: true });

        await velgMalOgMottaker(user);
        await user.click(screen.getByRole('checkbox', { name: 'Send til tredjepart' }));
        await user.type(screen.getByRole('textbox', { name: 'Organisasjonsnummer' }), ORGNUMMER);
        expect(await screen.findByTitle('venter...')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Organisasjonsnummer' })).toHaveAttribute('readonly');
        expect(requestsFor(ApiPath.BREV_BESTILL)).toHaveLength(0);
        resolveOrg(jsonResponse({ navn: 'Test Navn' }));
        expect(await screen.findByText('Test Navn')).toBeVisible();
    });

    it.each([400, 500])('beholder brevverdier etter HTTP %s og sender på nytt ved 200', async (status) => {
        const user = userEvent.setup();
        sendReplies = [new Response(null, { status }), new Response(null, { status: 200 })];
        const callback = vi.fn();
        const setInfo = vi.fn();
        renderBrev({ brevSendtCallback: callback, setVisBrevIkkeSendtInfoboks: setInfo });

        await velgMalOgMottaker(user);
        await fyllInnFritekstbrev(user);
        await bekreftSending(user);

        expect(await screen.findByText('Sending av brev feilet.')).toBeVisible();
        expect(screen.getByRole('textbox', { name: 'Tittel' })).toHaveValue(TEST_TITTEL);
        expect(screen.getByRole('textbox', { name: 'Innhold i brev' })).toHaveValue(TEST_INNHOLD);
        expect(callback).not.toHaveBeenCalled();
        expect(setInfo).toHaveBeenLastCalledWith(true);

        await bekreftSending(user);
        expect(await screen.findByText('Brev sendt! Du kan nå sende nytt brev til annen mottaker.')).toBeVisible();
        expect(callback).toHaveBeenCalledTimes(1);
        expect(setInfo).toHaveBeenLastCalledWith(false);
        expect(requestsFor(ApiPath.BREV_BESTILL)).toHaveLength(2);
    });

    it('avbryter bekreftelse uten bestilling, og blokkerer identisk brev først etter suksess', async () => {
        const user = userEvent.setup();
        const callback = vi.fn();
        renderBrev({ brevSendtCallback: callback });

        await velgMalOgMottaker(user);
        await fyllInnFritekstbrev(user);
        await user.click(screen.getByRole('button', { name: 'Send brev' }));
        await user.click(await screen.findByRole('button', { name: 'Avbryt' }));
        expect(requestsFor(ApiPath.BREV_BESTILL)).toHaveLength(0);

        await bekreftSending(user);
        expect(callback).toHaveBeenCalledTimes(1);
        await user.click(screen.getByRole('button', { name: 'Send brev' }));
        await user.click(await screen.findByRole('button', { name: 'Fortsett' }));
        expect(await screen.findByText(/Brevet er sendt\. Du må endre mottaker eller innhold/)).toBeVisible();
        expect(requestsFor(ApiPath.BREV_BESTILL)).toHaveLength(1);

        await user.clear(screen.getByRole('textbox', { name: 'Innhold i brev' }));
        const content = screen.getByRole('textbox', { name: 'Innhold i brev' });
        await user.click(content);
        await user.paste(`${TEST_INNHOLD} endret`);
        await bekreftSending(user);
        expect(requestsFor(ApiPath.BREV_BESTILL)).toHaveLength(2);
    });

    it('sender uten bekreftelsesdialog og viser riktig modalvariant etter suksess', async () => {
        const user = userEvent.setup();
        const callback = vi.fn();
        renderBrev({ sendBrevUtenModal: true, brevFraModal: true, brevSendtCallback: callback });
        await velgMalOgMottaker(user, 'UTEN_FRITEKST');

        await user.click(screen.getByRole('button', { name: 'Send brev' }));
        expect(await screen.findByText('Brev sendt! Du kan nå sende nytt brev til annen mottaker.')).toBeVisible();
        expect(screen.queryByText('Er du sikker på at du vil sende brevet?')).not.toBeInTheDocument();
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('viser malhentingsfeil uten å vise skjema', async () => {
        malReply = jsonResponse({}, 500);
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        renderBrev();

        expect(await screen.findByText('Henting av brevmaler feilet.')).toBeVisible();
        expect(screen.queryByRole('combobox', { name: 'Velg mal' })).not.toBeInTheDocument();
        expect(errorSpy).toHaveBeenCalled();
    });

    it('sender korrekt preview-payload og åpner Blob uten bestilling eller suksesscallback', async () => {
        const user = userEvent.setup();
        const callback = vi.fn();
        const { createObjectURL, open } = stubPreviewWindow();
        renderBrev({ brevSendtCallback: callback, journalpostId: JOURNALPOST_ID });

        await velgMalOgMottaker(user);
        await fyllInnFritekstbrev(user);
        await user.click(screen.getByRole('button', { name: 'Forhåndsvis brev' }));

        await waitFor(() => expect(open).toHaveBeenCalledWith('blob:brev-preview'));
        expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
        expect(requestFor(ApiPath.BREV_FORHAANDSVIS)?.body).toEqual({
            aktørId: AKTØR_ID,
            eksternReferanse: JOURNALPOST_ID,
            ytelseType: { kode: 'PSB', kodeverk: 'FAGSAK_YTELSE' },
            saksnummer: FAGSAK_ID,
            avsenderApplikasjon: 'K9PUNSJ',
            overstyrtMottaker: { type: 'AKTØRID', id: AKTØR_ID },
            dokumentMal: 'GENERELT_FRITEKSTBREV',
            dokumentdata: { fritekstbrev: { overskrift: TEST_TITTEL, brødtekst: TEST_INNHOLD } },
        });
        expect(requestsFor(ApiPath.BREV_BESTILL)).toHaveLength(0);
        expect(callback).not.toHaveBeenCalled();
    });

    it('viser preview-feil fra serveren og åpner forhåndsvisning etter nytt forsøk', async () => {
        const user = userEvent.setup();
        previewReplies = [
            jsonResponse({ feilmelding: 'Feil ved generering. Årsak: Prøv igjen.' }, 500),
            new Response('mock pdf', { status: 200, headers: { 'Content-Type': 'application/pdf' } }),
        ];
        const { createObjectURL, open } = stubPreviewWindow();
        renderBrev();
        await velgMalOgMottaker(user);
        await fyllInnFritekstbrev(user);

        await user.click(screen.getByRole('button', { name: 'Forhåndsvis brev' }));
        expect(await screen.findByText('Prøv igjen.')).toBeVisible();
        expect(screen.getByRole('textbox', { name: 'Tittel' })).toHaveValue(TEST_TITTEL);

        await user.click(screen.getByRole('button', { name: 'Forhåndsvis brev' }));
        await waitFor(() => expect(createObjectURL).toHaveBeenCalledTimes(1));
        expect(open).toHaveBeenCalledWith('blob:brev-preview');
        expect(requestsFor(ApiPath.BREV_FORHAANDSVIS)).toHaveLength(2);
    });

    it.each([
        { name: 'uten statusText', statusText: '', message: 'Forhåndsvisning av brev feilet.' },
        { name: 'med statusText', statusText: 'Not Found', message: 'Not Found' },
    ])('viser preview-feil for 404 $name uten å åpne forhåndsvisning', async ({ statusText, message }) => {
        const user = userEvent.setup();
        previewReplies = [new Response(null, { status: 404, statusText })];
        const { open } = stubPreviewWindow();
        renderBrev();
        await velgMalOgMottaker(user);
        await fyllInnFritekstbrev(user);

        await user.click(screen.getByRole('button', { name: 'Forhåndsvis brev' }));

        expect(await screen.findByText(message, { exact: true })).toBeVisible();
        expect(open).not.toHaveBeenCalled();
        expect(screen.getByRole('textbox', { name: 'Tittel' })).toHaveValue(TEST_TITTEL);
    });

    it('bruker journalpost som ekstern referanse og GENERELL_SAK når fagsak mangler', async () => {
        const user = userEvent.setup();
        const { open } = stubPreviewWindow();
        renderBrev({ fagsakId: undefined, journalpostId: JOURNALPOST_ID });

        await velgMalOgMottaker(user);
        await fyllInnFritekstbrev(user);
        await user.click(screen.getByRole('button', { name: 'Forhåndsvis brev' }));
        await waitFor(() => expect(requestsFor(ApiPath.BREV_FORHAANDSVIS)).toHaveLength(1));
        await waitFor(() => expect(open).toHaveBeenCalledWith('blob:brev-preview'));

        expect(requestFor(ApiPath.BREV_FORHAANDSVIS)?.body).toMatchObject({
            eksternReferanse: JOURNALPOST_ID,
            saksnummer: 'GENERELL_SAK',
        });
    });
});
