import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { customInstance } from '@/src/api/mutator';

const mockGetAccessToken = jest.fn<() => Promise<string | null>>();

jest.mock('axios', () => {
    const axiosRequest = jest.fn();

    return {
        __esModule: true,
        __mockAxiosRequest: axiosRequest,
        create: jest.fn(() => axiosRequest),
    };
});

jest.mock('@/src/auth/authStorage', () => ({
    getAccessToken: () => mockGetAccessToken(),
}));

const mockedAxios = jest.requireMock('axios') as {
    __mockAxiosRequest: jest.MockedFunction<
        (config: unknown) => Promise<{ data: { ok: boolean } }>
    >;
    create: jest.Mock;
};
const mockAxiosRequest = mockedAxios.__mockAxiosRequest;

describe('customInstance', () => {
    beforeEach(() => {
        mockAxiosRequest.mockReset();
        mockedAxios.create.mockClear();
        mockGetAccessToken.mockReset();
    });

    it('adds the bearer token when an access token exists', async () => {
        mockGetAccessToken.mockResolvedValue('access-token');
        mockAxiosRequest.mockResolvedValue({ data: { ok: true } });

        const result = await customInstance<{ ok: boolean }>({
            headers: { Accept: 'application/json' },
            method: 'GET',
            url: '/v1/test',
        });

        expect(mockAxiosRequest).toHaveBeenCalledWith({
            headers: {
                Accept: 'application/json',
                Authorization: 'Bearer access-token',
            },
            method: 'GET',
            url: '/v1/test',
        });
        expect(result).toEqual({ ok: true });
    });

    it('does not add an authorization header without an access token', async () => {
        mockGetAccessToken.mockResolvedValue(null);
        mockAxiosRequest.mockResolvedValue({ data: { ok: true } });

        await customInstance({ method: 'GET', url: '/v1/test' });

        expect(mockAxiosRequest).toHaveBeenCalledWith({
            headers: {},
            method: 'GET',
            url: '/v1/test',
        });
    });
});
