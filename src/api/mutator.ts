import { create, type AxiosError, type AxiosRequestConfig } from 'axios';

const instance = create({
    baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
});

export const customInstance = async <T>(
    config: AxiosRequestConfig,
): Promise<T> => {
    const response = await instance<T>(config);

    return response.data;
};

export type ErrorType<Error> = AxiosError<Error>;

export type BodyType<BodyData> = BodyData;
