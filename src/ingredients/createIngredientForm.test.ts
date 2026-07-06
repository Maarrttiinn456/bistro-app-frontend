import { describe, expect, it } from '@jest/globals';

import { CreateIngredientBodyBaseUnit } from '@/src/api/generated/model';
import {
    buildCreateIngredientBody,
    getCreateIngredientErrorMessage,
    parseIngredientFormNumber,
    toOptionalIngredientText,
    type CreateIngredientDraft,
} from '@/src/ingredients/createIngredientForm';

const validDraft: CreateIngredientDraft = {
    barcode: '',
    baseUnit: CreateIngredientBodyBaseUnit.g,
    brand: '',
    carbsPer100: '12',
    fatPer100: '3',
    kcalPer100: '80',
    name: 'Tempeh',
    proteinPer100: '15',
};

describe('createIngredientForm', () => {
    it('parses ingredient numbers with trimmed decimal commas', () => {
        expect(parseIngredientFormNumber(' 12,5 ')).toBe(12.5);
        expect(parseIngredientFormNumber('')).toBeNull();
        expect(parseIngredientFormNumber('abc')).toBeNull();
    });

    it('normalizes optional ingredient text', () => {
        expect(toOptionalIngredientText('  Bio farm  ')).toBe('Bio farm');
        expect(toOptionalIngredientText('   ')).toBeNull();
    });

    it('builds a trimmed create ingredient body', () => {
        const result = buildCreateIngredientBody({
            ...validDraft,
            barcode: ' 3017620422003 ',
            baseUnit: CreateIngredientBodyBaseUnit.ml,
            brand: ' Soy Co ',
            carbsPer100: '12,5',
            name: ' Tempeh ',
        });

        expect(result).toEqual({
            body: {
                baseUnit: CreateIngredientBodyBaseUnit.ml,
                barcode: '3017620422003',
                brand: 'Soy Co',
                carbsPer100: 12.5,
                fatPer100: 3,
                kcalPer100: 80,
                name: 'Tempeh',
                proteinPer100: 15,
            },
            error: null,
        });
    });

    it('validates the required ingredient name', () => {
        expect(
            buildCreateIngredientBody({
                ...validDraft,
                name: '  ',
            }),
        ).toEqual({
            body: null,
            error: 'Vyplň název suroviny.',
        });
    });

    it('validates required non-negative macros', () => {
        expect(
            buildCreateIngredientBody({
                ...validDraft,
                kcalPer100: '-1',
            }),
        ).toEqual({
            body: null,
            error: 'Vyplň nezáporná makra na 100 g/ml.',
        });

        expect(
            buildCreateIngredientBody({
                ...validDraft,
                proteinPer100: '',
            }),
        ).toEqual({
            body: null,
            error: 'Vyplň nezáporná makra na 100 g/ml.',
        });
    });

    it('maps create ingredient backend errors', () => {
        expect(
            getCreateIngredientErrorMessage({
                response: {
                    data: { error: 'Unauthorized' },
                    status: 401,
                },
            }),
        ).toBe('Unauthorized (HTTP 401)');

        expect(
            getCreateIngredientErrorMessage({
                response: {
                    data: { error: '   ' },
                    status: 500,
                },
            }),
        ).toBe('Surovinu se nepovedlo vytvořit. (HTTP 500)');

        expect(getCreateIngredientErrorMessage('network failed')).toBe(
            'Surovinu se nepovedlo vytvořit.',
        );
    });
});
