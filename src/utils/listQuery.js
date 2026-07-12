export function normalizePositiveInteger(value, fallback) {
    const rawValue = Array.isArray(value) ? value[0] : value;
    const number = parseInt(rawValue, 10);
    return number > 0 ? number : fallback;
}

export function getPaginationFromQuery(query = {}, fallbackPer) {
    return {
        page: normalizePositiveInteger(query.page, 1),
        per: normalizePositiveInteger(query.per, fallbackPer),
    };
}

export function shouldReplacePaginationQuery(query = {}, page, per) {
    const hasPage = Object.prototype.hasOwnProperty.call(query, "page");
    const hasPer = Object.prototype.hasOwnProperty.call(query, "per");
    return (hasPage && String(query.page) !== String(page)) || (hasPer && String(query.per) !== String(per));
}

export function isSameRouteQuery(currentQuery = {}, nextQuery = {}) {
    const currentKeys = Object.keys(currentQuery);
    const nextKeys = Object.keys(nextQuery);

    return (
        currentKeys.length === nextKeys.length &&
        nextKeys.every((key) => String(currentQuery[key]) === String(nextQuery[key]))
    );
}
