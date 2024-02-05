import fetchMock from 'fetch-mock';

import { ApiPath } from 'app/apiConfig';
import { apiUrl, convertResponseToError, get, post, put } from 'app/utils';

jest.mock('app/utils/envUtils');
jest.mock('app/utils/browserUtils');

describe('apiUrl', () => {
    it('Genererer URL med parametre', () => {
        const id = 'abc123';
        const url = apiUrl(ApiPath.PSB_SOKNAD_GET, { id });
        expect(url).toContain(id);
    });
});

describe('get', () => {
    beforeEach(() => {
        fetchMock.reset();
        jest.resetAllMocks();
    });

    it('Utfører get-spørring', async () => {
        const path = ApiPath.PSB_SOKNAD_GET;
        const id = 'abc123';
        const url = apiUrl(path, { id });

        fetchMock.get(url, { status: 200 });
        await get(path, { id });

        expect(fetchMock.called(url, { method: 'get' })).toEqual(true);
    });

    it('Videresender til innlogging dersom get-spørring responderer med status 401', async () => {
        const path = ApiPath.PSB_SOKNAD_GET;
        const id = 'abc123';
        const url = apiUrl(path, { id });
        const callback = jest.fn((r: Response) => Promise.resolve(r));

        fetchMock.get(url, { status: 401 });
        await get(path, { id }, {}, callback);

        expect(callback).not.toHaveBeenCalled();
    });

    it('Behandler respons fra get-spørring', async () => {
        const path = ApiPath.PSB_SOKNAD_GET;
        const id = 'abc123';
        const url = apiUrl(path, { id });
        const response = { status: 200 };
        const callback = jest.fn((r: Response) => Promise.resolve(r));

        fetchMock.get(url, response);
        await get(path, { id }, {}, callback);

        expect(callback).toHaveBeenCalledTimes(1);
    });
});

describe('post', () => {
    beforeEach(() => {
        fetchMock.reset();
        jest.resetAllMocks();
    });

    it('Utfører post-spørring', async () => {
        const path = ApiPath.PSB_SOKNAD_CREATE;
        const url = apiUrl(path);
        const body = { test: 'Lorem ipsum dolor sit amet.' };

        fetchMock.post(url, { status: 201 });
        await post(path, undefined, undefined, body);

        expect(fetchMock.called(url, { method: 'post', body })).toEqual(true);
    });

    it('Videresender til innlogging dersom post-spørring responderer med status 401', async () => {
        const path = ApiPath.PSB_SOKNAD_CREATE;
        const url = apiUrl(path);
        const callback = jest.fn((r: Response) => Promise.resolve(r));

        fetchMock.post(url, {
            status: 401,
            body: JSON.stringify({ message: 'Hello' }),
        });
        await post(path, undefined, undefined, undefined, callback);

        expect(callback).not.toHaveBeenCalled();
    });

    it('Behandler respons fra post-spørring', async () => {
        const path = ApiPath.PSB_SOKNAD_CREATE;
        const url = apiUrl(path);
        const response = {
            status: 201,
            body: JSON.stringify({ message: 'Hello' }),
        };
        const callback = jest.fn((r: Response) => Promise.resolve(r));

        fetchMock.post(url, response);
        await post(path, undefined, undefined, undefined, callback);

        expect(callback).toHaveBeenCalledTimes(1);
    });
});

describe('put', () => {
    beforeEach(() => {
        fetchMock.reset();
        jest.resetAllMocks();
    });

    it('Utfører put-spørring', async () => {
        const path = ApiPath.PSB_SOKNAD_UPDATE;
        const id = 'abc123';
        const url = apiUrl(path, { id });
        const body = { test: 'Lorem ipsum dolor sit amet.' };

        fetchMock.put(url, { status: 200 });
        await put(path, { id }, body);

        expect(fetchMock.called(url, { method: 'put', body })).toEqual(true);
    });

    it('Videresender til innlogging dersom put-spørring responderer med status 401', async () => {
        const path = ApiPath.PSB_SOKNAD_UPDATE;
        const id = 'abc123';
        const url = apiUrl(path, { id });
        const body = { test: 'Lorem ipsum dolor sit amet.' };
        const callback = jest.fn((r: Response) => Promise.resolve(r));

        fetchMock.put(url, { status: 401 });
        await put(path, { id }, body, callback);

        expect(callback).not.toHaveBeenCalled();
    });

    it('Behandler respons fra put-spørring', async () => {
        const path = ApiPath.PSB_SOKNAD_UPDATE;
        const id = 'abc123';
        const url = apiUrl(path, { id });
        const body = { test: 'Lorem ipsum dolor sit amet.' };
        const response = { status: 200 };
        const callback = jest.fn((r: Response) => Promise.resolve(r));

        fetchMock.put(url, response);
        await put(path, { id }, body, callback);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(expect.objectContaining(response));
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
