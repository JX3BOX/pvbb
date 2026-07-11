export const DEFAULT_RANDOM_COVER_MAX = 49;

export function normalizeRandomCoverMax(value) {
    const parsed = Number(String(value ?? "").trim());
    return Number.isSafeInteger(parsed) ? Math.max(parsed, DEFAULT_RANDOM_COVER_MAX) : DEFAULT_RANDOM_COVER_MAX;
}

function normalizeRandomValue(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    return Math.min(Math.max(parsed, 0), 0.9999999999999999);
}

function createShuffledCoverPool(max, random) {
    const pool = Array.from({ length: max }, (_, index) => index + 1);
    for (let index = pool.length - 1; index > 0; index -= 1) {
        const target = Math.floor(normalizeRandomValue(random()) * (index + 1));
        [pool[index], pool[target]] = [pool[target], pool[index]];
    }
    return pool;
}

export function assignUniqueRandomCovers(list, max, random = Math.random) {
    const items = Array.isArray(list) ? list : [];
    const coverPool = createShuffledCoverPool(normalizeRandomCoverMax(max), random);
    let coverOffset = 0;

    return items.map((item) => {
        if (item?.banner_img) return item;

        const randomCoverIndex = coverPool[coverOffset % coverPool.length];
        coverOffset += 1;
        return {
            ...item,
            _random_cover_index: randomCoverIndex,
        };
    });
}

export function getStableRandomCoverIndex(value, max = DEFAULT_RANDOM_COVER_MAX) {
    const coverMax = normalizeRandomCoverMax(max);
    const source = String(value || "community");
    let hash = 0;
    for (let index = 0; index < source.length; index += 1) {
        hash = (hash * 31 + source.charCodeAt(index)) % coverMax;
    }
    return hash + 1;
}

export function getRandomCoverIndex(item) {
    const assigned = Number(item?._random_cover_index);
    if (Number.isSafeInteger(assigned) && assigned >= 1) return assigned;
    return getStableRandomCoverIndex(item?.id);
}
