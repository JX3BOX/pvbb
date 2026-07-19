export function resolveCommunitySkin(decorationSkin) {
    if (!decorationSkin?.name) return null;

    let content = decorationSkin.content;
    if (typeof content === "string") {
        try {
            content = JSON.parse(content);
        } catch (e) {
            return null;
        }
    }

    if (!content || typeof content !== "object" || Array.isArray(content)) return null;

    return {
        ...content,
        name: decorationSkin.name,
    };
}
