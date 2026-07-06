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
