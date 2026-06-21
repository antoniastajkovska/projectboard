export function buildFieldErrors(message, fields) {
    const fieldErrors = {};

    if (!message) {
        return fieldErrors;
    }

    const parts = String(message)
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

    for (const part of parts) {
        const [field, ...rest] = part.split(" ");
        if (fields.includes(field)) {
            fieldErrors[field] = [field, ...rest].join(" ");
        }
    }

    return fieldErrors;
}

export function getGeneralErrorMessage(message, fieldErrors) {
    if (!message) {
        return "";
    }

    const hasFieldSpecificError = Object.keys(fieldErrors || {}).length > 0;
    return hasFieldSpecificError ? "" : message;
}
