import { describe, expect, it } from '@jest/globals';

import { ResolveIngredientBarcodeResponseSource } from '@/src/api/generated/model';

import {
    canCreateIngredientManuallyFromBarcodeError,
    getIngredientBarcodeSourceLabel,
    getResolveIngredientBarcodeErrorMessage,
    getResolveIngredientBarcodeErrorStatus,
} from './ingredientBarcodeScan';

const errorWithStatus = (status: number) => ({
    response: { status },
});

describe('ingredientBarcodeScan', () => {
    it('formats barcode ingredient source labels', () => {
        expect(
            getIngredientBarcodeSourceLabel(
                ResolveIngredientBarcodeResponseSource.local,
            ),
        ).toBe('Nalezena lokálně');
        expect(
            getIngredientBarcodeSourceLabel(
                ResolveIngredientBarcodeResponseSource.open_food_facts,
            ),
        ).toBe('Importována z Open Food Facts');
    });

    it('extracts resolve error status from API errors', () => {
        expect(getResolveIngredientBarcodeErrorStatus(errorWithStatus(404))).toBe(
            404,
        );
        expect(getResolveIngredientBarcodeErrorStatus('network failed')).toBeNull();
    });

    it('maps resolve barcode errors to user messages', () => {
        expect(
            getResolveIngredientBarcodeErrorMessage(errorWithStatus(400)),
        ).toBe('Čárový kód se nepovedlo zpracovat.');
        expect(
            getResolveIngredientBarcodeErrorMessage(errorWithStatus(401)),
        ).toBe('Nejsi přihlášený. Přihlas se a zkus to znovu.');
        expect(
            getResolveIngredientBarcodeErrorMessage(errorWithStatus(404)),
        ).toBe('Produkt nebyl nalezen v externí databázi.');
        expect(
            getResolveIngredientBarcodeErrorMessage(errorWithStatus(422)),
        ).toBe('Produkt byl nalezen, ale nemá kompletní nutriční hodnoty.');
        expect(
            getResolveIngredientBarcodeErrorMessage(errorWithStatus(502)),
        ).toBe('Externí databáze je momentálně nedostupná.');
        expect(
            getResolveIngredientBarcodeErrorMessage(errorWithStatus(500)),
        ).toBe('Čárový kód se nepovedlo ověřit.');
    });

    it('allows manual ingredient creation only for missing or incomplete products', () => {
        expect(canCreateIngredientManuallyFromBarcodeError(404)).toBe(true);
        expect(canCreateIngredientManuallyFromBarcodeError(422)).toBe(true);
        expect(canCreateIngredientManuallyFromBarcodeError(502)).toBe(false);
        expect(canCreateIngredientManuallyFromBarcodeError(null)).toBe(false);
    });
});
