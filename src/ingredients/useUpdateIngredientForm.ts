import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import {
    getGetIngredientQueryKey,
    getGetIngredientsQueryKey,
    useUpdateIngredient,
} from '@/src/api/generated/ingredients/ingredients';
import type { Ingredient } from '@/src/api/generated/model';
import {
    buildCreateIngredientBody,
    getUpdateIngredientErrorMessage,
} from '@/src/ingredients/createIngredientForm';

type UseUpdateIngredientFormParams = {
    ingredient: Ingredient;
    onIngredientUpdated: () => void;
};

const formatIngredientNumber = (value: number) => `${value}`;

export const useUpdateIngredientForm = ({
    ingredient,
    onIngredientUpdated,
}: UseUpdateIngredientFormParams) => {
    const queryClient = useQueryClient();
    const updateIngredientMutation = useUpdateIngredient();
    const [name, setName] = useState(ingredient.name);
    const [brand, setBrand] = useState(ingredient.brand ?? '');
    const [barcode, setBarcode] = useState(ingredient.barcode ?? '');
    const [baseUnit, setBaseUnit] = useState(ingredient.baseUnit);
    const [kcalPer100, setKcalPer100] = useState(
        formatIngredientNumber(ingredient.kcalPer100),
    );
    const [proteinPer100, setProteinPer100] = useState(
        formatIngredientNumber(ingredient.proteinPer100),
    );
    const [carbsPer100, setCarbsPer100] = useState(
        formatIngredientNumber(ingredient.carbsPer100),
    );
    const [fatPer100, setFatPer100] = useState(
        formatIngredientNumber(ingredient.fatPer100),
    );
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleSubmit = async () => {
        const bodyResult = buildCreateIngredientBody({
            barcode,
            baseUnit,
            brand,
            carbsPer100,
            fatPer100,
            kcalPer100,
            name,
            proteinPer100,
        });

        if (bodyResult.error !== null) {
            setValidationError(bodyResult.error);
            return;
        }

        setValidationError(null);

        try {
            await updateIngredientMutation.mutateAsync({
                data: bodyResult.body,
                ingredientId: ingredient.id,
            });

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: getGetIngredientsQueryKey(),
                }),
                queryClient.invalidateQueries({
                    queryKey: getGetIngredientQueryKey(ingredient.id),
                }),
            ]);
            onIngredientUpdated();
        } catch (submitError) {
            setValidationError(getUpdateIngredientErrorMessage(submitError));
        }
    };

    return {
        barcode,
        baseUnit,
        brand,
        carbsPer100,
        fatPer100,
        kcalPer100,
        name,
        proteinPer100,
        updateIngredientMutation,
        validationError,
        handleSubmit,
        setBarcode,
        setBaseUnit,
        setBrand,
        setCarbsPer100,
        setFatPer100,
        setKcalPer100,
        setName,
        setProteinPer100,
    };
};
