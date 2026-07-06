import type { AxiosError } from 'axios';

import {
    ResolveIngredientBarcodeResponseSource,
    type ErrorResponse,
    type ResolveIngredientBarcodeResponse,
} from '@/src/api/generated/model';

export const getIngredientBarcodeSourceLabel = (
    source: ResolveIngredientBarcodeResponse['source'],
) => {
    return source === ResolveIngredientBarcodeResponseSource.local
        ? 'Nalezena lokálně'
        : 'Importována z Open Food Facts';
};

export const getResolveIngredientBarcodeErrorStatus = (error: unknown) => {
    return (error as AxiosError<ErrorResponse>)?.response?.status ?? null;
};

export const getResolveIngredientBarcodeErrorMessage = (error: unknown) => {
    const status = getResolveIngredientBarcodeErrorStatus(error);

    if (status === 400) {
        return 'Čárový kód se nepovedlo zpracovat.';
    }

    if (status === 401) {
        return 'Nejsi přihlášený. Přihlas se a zkus to znovu.';
    }

    if (status === 404) {
        return 'Produkt nebyl nalezen v externí databázi.';
    }

    if (status === 422) {
        return 'Produkt byl nalezen, ale nemá kompletní nutriční hodnoty.';
    }

    if (status === 502) {
        return 'Externí databáze je momentálně nedostupná.';
    }

    return 'Čárový kód se nepovedlo ověřit.';
};

export const canCreateIngredientManuallyFromBarcodeError = (
    status: number | null,
) => {
    return status === 404 || status === 422;
};
