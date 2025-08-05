import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { DokumenttypeForkortelse } from 'app/models/enums/FordelingDokumenttype';
import { useRegistreringsValg } from './useRegistreringsValg';
import * as api from './api';

// Mock API functions
jest.mock('./api', () => ({
    fetchEksisterendeSoknader: jest.fn(),
    createSoknad: jest.fn(),
}));

const mockFetchEksisterendeSoknader = jest.mocked(api.fetchEksisterendeSoknader);

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(
            QueryClientProvider,
            { client: queryClient },
            React.createElement(MemoryRouter, null, children),
        );
};

describe('useRegistreringsValg', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch eksisterende søknader when søkerId is provided', async () => {
        const mockData = { søknader: [] };
        mockFetchEksisterendeSoknader.mockResolvedValue(mockData);

        renderHook(
            () =>
                useRegistreringsValg(DokumenttypeForkortelse.OMP_UT, {
                    journalpostid: 'test-jp',
                    søkerId: 'test-søker',
                }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => {
            expect(mockFetchEksisterendeSoknader).toHaveBeenCalled();
        });
    });

    it('should return correct loading states initially', () => {
        mockFetchEksisterendeSoknader.mockResolvedValue({ søknader: [] });

        const { result } = renderHook(
            () =>
                useRegistreringsValg(DokumenttypeForkortelse.OMP_UT, {
                    journalpostid: 'test-jp',
                    søkerId: 'test-søker',
                }),
            { wrapper: createWrapper() },
        );

        // Initially loading should be true, creating should be false
        expect(result.current.isEksisterendeSoknaderLoading).toBe(true);
        expect(result.current.isCreatingSoknad).toBe(false);
    });

    it('should provide all required functions and values', () => {
        mockFetchEksisterendeSoknader.mockResolvedValue({ søknader: [] });

        const { result } = renderHook(
            () =>
                useRegistreringsValg(DokumenttypeForkortelse.PPN, {
                    journalpostid: 'test-jp',
                    søkerId: 'test-søker',
                    pleietrengendeId: 'test-pleietrengende',
                }),
            { wrapper: createWrapper() },
        );

        expect(typeof result.current.createSoknad).toBe('function');
        expect(typeof result.current.kanStarteNyRegistrering).toBe('boolean');
        expect(typeof result.current.handleTilbake).toBe('function');
    });

    it('should return correct parameters', () => {
        mockFetchEksisterendeSoknader.mockResolvedValue({ søknader: [] });

        const { result } = renderHook(
            () =>
                useRegistreringsValg(DokumenttypeForkortelse.PPN, {
                    journalpostid: 'test-jp',
                    søkerId: 'test-søker',
                    pleietrengendeId: 'test-pleietrengende',
                    k9saksnummer: 'test-sak',
                }),
            { wrapper: createWrapper() },
        );

        expect(result.current.journalpostid).toBe('test-jp');
        expect(result.current.søkerId).toBe('test-søker');
        expect(result.current.pleietrengendeId).toBe('test-pleietrengende');
        expect(result.current.k9saksnummer).toBe('test-sak');
    });

    it('should return correct kanStarteNyRegistrering logic', async () => {
        // Test case 1: No søknader - should allow new registration
        mockFetchEksisterendeSoknader.mockResolvedValue({ søknader: [] });

        const { result: result1 } = renderHook(
            () =>
                useRegistreringsValg(DokumenttypeForkortelse.PPN, {
                    journalpostid: 'test-jp',
                    søkerId: 'test-søker',
                }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => {
            expect(result1.current.kanStarteNyRegistrering).toBe(true);
        });

        // Test case 2: Søknader exist but none match journalpostid - should allow new registration
        mockFetchEksisterendeSoknader.mockResolvedValue({
            søknader: [
                {
                    journalposter: ['other-jp'],
                },
            ],
        });

        const { result: result2 } = renderHook(
            () =>
                useRegistreringsValg(DokumenttypeForkortelse.PPN, {
                    journalpostid: 'test-jp',
                    søkerId: 'test-søker',
                }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => {
            expect(result2.current.kanStarteNyRegistrering).toBe(true);
        });

        // Test case 3: Søknad exists with matching journalpostid - should not allow new registration
        mockFetchEksisterendeSoknader.mockResolvedValue({
            søknader: [
                {
                    journalposter: ['test-jp'],
                },
            ],
        });

        const { result: result3 } = renderHook(
            () =>
                useRegistreringsValg(DokumenttypeForkortelse.PPN, {
                    journalpostid: 'test-jp',
                    søkerId: 'test-søker',
                }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => {
            expect(result3.current.kanStarteNyRegistrering).toBe(false);
        });
    });
});
