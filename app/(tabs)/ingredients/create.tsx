import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';

import { Screen } from '@/src/components/Screen';
import { IngredientForm } from '@/src/ingredients/IngredientForm';
import { useCreateIngredientForm } from '@/src/ingredients/useCreateIngredientForm';

const getStringParam = (value: string | string[] | undefined) => {
    if (Array.isArray(value)) {
        return value[0] ?? '';
    }

    return value ?? '';
};

const CreateIngredient = () => {
    const params = useLocalSearchParams<{
        barcode?: string;
        name?: string;
        rowId?: string;
    }>();
    const pathname = usePathname();
    const router = useRouter();
    const form = useCreateIngredientForm({
        initialBarcode: getStringParam(params.barcode),
        initialName: getStringParam(params.name),
        rowId: getStringParam(params.rowId),
        onIngredientCreated: () => router.back(),
    });
    const rowId = getStringParam(params.rowId);

    const handleScanPress = () => {
        const scanPathname = pathname.startsWith('/recipes')
            ? '/recipes/ingredient-scan'
            : '/ingredients/scan';

        router.push({
            pathname: scanPathname,
            params: rowId.length > 0 ? { rowId } : {},
        });
    };

    return (
        <Screen edges={['top', 'bottom', 'left', 'right']}>
            <IngredientForm
                form={form}
                inputLabels={{
                    barcode: 'Čárový kód nové suroviny',
                    brand: 'Značka nové suroviny',
                    name: 'Název nové suroviny',
                }}
                isSubmitting={form.createIngredientMutation.isPending}
                scanAction={{
                    label: 'Naskenovat kód',
                    onPress: handleScanPress,
                }}
                submitLabel="Uložit surovinu"
                submittingLabel="Ukládám surovinu..."
                title="Nová surovina"
                onClose={router.back}
            />
        </Screen>
    );
};

export default CreateIngredient;
