import type { AxiosError } from 'axios';

import type {
    CreateIngredientBody,
    CreateIngredientBodyBaseUnit,
    ErrorResponse,
} from '@/src/api/generated/model';

export type CreateIngredientDraft = {
    name: string;
    brand: string;
    barcode: string;
    baseUnit: CreateIngredientBodyBaseUnit;
    kcalPer100: string;
    proteinPer100: string;
    carbsPer100: string;
    fatPer100: string;
};

type BuildCreateIngredientBodyResult =
    | {
          body: CreateIngredientBody;
          error: null;
      }
    | {
          body: null;
          error: string;
      };

export const parseIngredientFormNumber = (value: string) => {
    const normalizedValue = value.replace(',', '.').trim();

    if (normalizedValue.length === 0) {
        return null;
    }

    const parsedValue = Number(normalizedValue);

    return Number.isFinite(parsedValue) ? parsedValue : null;
};

export const toOptionalIngredientText = (value: string) => {
    const trimmedValue = value.trim();

    return trimmedValue.length === 0 ? null : trimmedValue;
};

export const buildCreateIngredientBody = (
    draft: CreateIngredientDraft,
): BuildCreateIngredientBodyResult => {
    const trimmedName = draft.name.trim();
    const parsedKcalPer100 = parseIngredientFormNumber(draft.kcalPer100);
    const parsedProteinPer100 = parseIngredientFormNumber(
        draft.proteinPer100,
    );
    const parsedCarbsPer100 = parseIngredientFormNumber(draft.carbsPer100);
    const parsedFatPer100 = parseIngredientFormNumber(draft.fatPer100);

    if (trimmedName.length === 0) {
        return { body: null, error: 'Vyplň název suroviny.' };
    }

    if (
        parsedKcalPer100 === null ||
        parsedProteinPer100 === null ||
        parsedCarbsPer100 === null ||
        parsedFatPer100 === null ||
        parsedKcalPer100 < 0 ||
        parsedProteinPer100 < 0 ||
        parsedCarbsPer100 < 0 ||
        parsedFatPer100 < 0
    ) {
        return { body: null, error: 'Vyplň nezáporná makra na 100 g/ml.' };
    }

    return {
        body: {
            baseUnit: draft.baseUnit,
            barcode: toOptionalIngredientText(draft.barcode),
            brand: toOptionalIngredientText(draft.brand),
            carbsPer100: parsedCarbsPer100,
            fatPer100: parsedFatPer100,
            kcalPer100: parsedKcalPer100,
            name: trimmedName,
            proteinPer100: parsedProteinPer100,
        },
        error: null,
    };
};

export const getCreateIngredientErrorMessage = (error: unknown) => {
    const fallbackMessage = 'Surovinu se nepovedlo vytvořit.';

    if (typeof error !== 'object' || error === null) {
        return fallbackMessage;
    }

    const response = (error as AxiosError<ErrorResponse>).response;
    const status = response?.status;
    const backendError = response?.data?.error?.trim();

    if (backendError) {
        return status ? `${backendError} (HTTP ${status})` : backendError;
    }

    return status
        ? `${fallbackMessage} (HTTP ${status})`
        : fallbackMessage;
};
