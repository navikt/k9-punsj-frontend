import { ApiPath } from '../../app/apiConfig';
import { apiUrl, convertResponseToError, get, post, put } from '../../app/utils/apiUtils';

jest.mock('app/utils/envUtils');
jest.mock('app/utils/browserUtils');

global.fetch = jest.fn();

describe('apiUrl', () => {
    it('Generates a URL with parameters', () => {
        const id = 'abc123';
        const url = apiUrl(ApiPath.PSB_SOKNAD_GET, { id });
        expect(url).toContain(id);
    });
});

describe('get', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('Performs a GET request', async () => {
        const path = ApiPath.PSB_SOKNAD_GET;
        const id = 'abc123';
        const url = apiUrl(path, { id });

        // Mock the fetch implementation
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({}),
        });

        await get(path, { id });

        expect(global.fetch).toHaveBeenCalledWith(url, {
            credentials: 'include', // Matches the implementation
            headers: expect.any(Headers), // Expect a Headers instance
        });
    });

    it('Handles the GET response', async () => {
        const path = ApiPath.PSB_SOKNAD_GET;
        const id = 'abc123';
        const callback = jest.fn();

        const mockResponseData = JSON.stringify({ key: 'value' });

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            text: jest.fn().mockResolvedValue(mockResponseData), // Mock response.text()
        });

        await get(path, { id }, {}, callback);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
            expect.any(Object), // The response object
            { key: 'value' }, // Parsed JSON data
        );
    });
});

describe('post', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('Performs a POST request', async () => {
        const path = ApiPath.PSB_SOKNAD_CREATE;
        const body = { test: 'Lorem ipsum dolor sit amet.' };
        const url = apiUrl(path);

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            text: jest.fn().mockResolvedValue(JSON.stringify({ message: 'Hello' })),
        });

        await post(path, undefined, undefined, body);

        expect(global.fetch).toHaveBeenCalledWith(
            url,
            expect.objectContaining({
                method: 'post',
                body: JSON.stringify(body),
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                }),
                credentials: 'include', // Match credentials if they are added
            }),
        );
    });

    it('Handles the POST response', async () => {
        const path = ApiPath.PSB_SOKNAD_CREATE;
        const body = { test: 'Lorem ipsum dolor sit amet.' };
        const callback = jest.fn();

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            text: jest.fn().mockResolvedValue(JSON.stringify({ message: 'Hello' })),
        });

        await post(path, undefined, undefined, body, callback);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(
            expect.any(Object), // Response object
            { message: 'Hello' }, // Parsed JSON data
        );
    });
});

describe('put', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('Performs a PUT request', async () => {
        const path = ApiPath.PSB_SOKNAD_UPDATE;
        const id = 'abc123';
        const url = apiUrl(path, { id });
        const body = { test: 'Lorem ipsum dolor sit amet.' };

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
        });

        await put(path, { id }, body);

        expect(global.fetch).toHaveBeenCalledWith(
            url,
            expect.objectContaining({
                method: 'put',
                headers: expect.any(Object),
                body: JSON.stringify(body),
            }),
        );
    });

    it('Handles the PUT response', async () => {
        const path = ApiPath.PSB_SOKNAD_UPDATE;
        const id = 'abc123';

        const body = { test: 'Lorem ipsum dolor sit amet.' };
        const callback = jest.fn();

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
        });

        await put(path, { id }, body, callback);

        expect(callback).toHaveBeenCalledTimes(1);
    });
});

describe('convertResponseToError', () => {
    it('Henter feilinformasjon fra respons', () => {
        const url = 'http://testurl.test/';
        const status = 404;
        const statusText = 'Not found';
        const respons: Response = {
            url,
            status,
            statusText,
            ok: false,
            type: 'cors',
            redirected: false,
            headers: new Headers(),
            body: null,
            bodyUsed: false,
            clone: jest.fn(),
            arrayBuffer: jest.fn(),
            blob: jest.fn(),
            formData: jest.fn(),
            json: jest.fn(),
            text: jest.fn(),
        };
        expect(convertResponseToError(respons)).toEqual({
            url,
            status,
            statusText,
        });
    });
});
