import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import {
    getGetIngredientsQueryKey,
    useCreateIngredient,
} from '@/src/api/generated/ingredients/ingredients';
import { CreateIngredientBodyBaseUnit } from '@/src/api/generated/model';
import { setCreatedIngredientHandoff } from '@/src/ingredients/createIngredientHandoff';
import {
    buildCreateIngredientBody,
    getCreateIngredientErrorMessage,
} from '@/src/ingredients/createIngredientForm';

type UseCreateIngredientFormParams = {
    initialBarcode?: string;
    initialName?: string;
    rowId?: string;
    onIngredientCreated: () => void;
};

export const useCreateIngredientForm = ({
    initialBarcode = '',
    initialName = '',
    rowId = '',
    onIngredientCreated,
}: UseCreateIngredientFormParams) => {
    const queryClient = useQueryClient();
    const createIngredientMutation = useCreateIngredient();
    const [name, setName] = useState(initialName);
    const [brand, setBrand] = useState('');
    const [barcode, setBarcode] = useState(initialBarcode);
    const [baseUnit, setBaseUnit] = useState<CreateIngredientBodyBaseUnit>(
        CreateIngredientBodyBaseUnit.g,
    );
    const [kcalPer100, setKcalPer100] = useState('');
    const [proteinPer100, setProteinPer100] = useState('');
    const [carbsPer100, setCarbsPer100] = useState('');
    const [fatPer100, setFatPer100] = useState('');
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
            const response = await createIngredientMutation.mutateAsync({
                data: bodyResult.body,
            });

            if (rowId.length > 0) {
                setCreatedIngredientHandoff(queryClient, {
                    ingredient: response.ingredient,
                    rowId,
                });
            }

            await queryClient.invalidateQueries({
                queryKey: getGetIngredientsQueryKey(),
            });
            onIngredientCreated();
        } catch (submitError) {
            setValidationError(getCreateIngredientErrorMessage(submitError));
        }
    };

    return {
        barcode,
        baseUnit,
        brand,
        carbsPer100,
        createIngredientMutation,
        fatPer100,
        kcalPer100,
        name,
        proteinPer100,
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
