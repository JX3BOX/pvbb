export function isJokeListHistoryEntry(value) {
    if (typeof value !== "string") return false;
    return /^\/joke\/?(?:\?|#|$)/.test(value);
}

export function buildJokeDocumentTitle(content, suffix, maxLength = 60) {
    const plainText = String(content || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (!plainText) return String(suffix || "").trim();

    const safeLength = Number.isInteger(maxLength) && maxLength > 0 ? maxLength : 60;
    const title = plainText.length > safeLength ? `${plainText.slice(0, safeLength)}…` : plainText;
    return [title, suffix].filter(Boolean).join(" ").trim();
}
