import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
    "p",
    "br",
    "div",
    "span",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "del",
    "small",
    "sub",
    "sup",
    "blockquote",
    "pre",
    "code",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "a",
    "img",
];

const LINK_REL_VALUES = new Set(["nofollow", "noopener", "noreferrer", "ugc"]);
const LINK_TARGET_VALUES = new Set(["_blank", "_self"]);

function normalizeRel(rel = "", target = "") {
    const values = String(rel)
        .toLowerCase()
        .split(/\s+/)
        .filter((value) => LINK_REL_VALUES.has(value));

    if (target === "_blank") {
        values.push("noopener", "noreferrer");
    }

    return Array.from(new Set(values)).join(" ");
}

function isEmotionImage(attribs = {}) {
    return /(?:^|\/)emotion\/output\//i.test(String(attribs.src || ""));
}

function normalizeImageClass(className = "", isEmotion = false) {
    const values = String(className)
        .split(/\s+/)
        .filter(Boolean);

    if (isEmotion) {
        values.push("u-jx3-emo");
    }

    return Array.from(new Set(values)).join(" ");
}

/**
 * 回帖和楼中楼只支持基础排版、圈人、表情、链接与图片。
 * 主楼正文仍由 Article 的富文本规则处理，不应复用这个严格白名单。
 */
export function sanitizeCommunityReplyHtml(html = "") {
    if (!html) return "";

    return sanitizeHtml(String(html), {
        allowedTags: ALLOWED_TAGS,
        disallowedTagsMode: "discard",
        allowedAttributes: {
            a: ["href", "target", "rel", "title", "class", "data-type", "data-mode", "data-id"],
            img: [
                "src",
                "alt",
                "title",
                "width",
                "height",
                "class",
                "loading",
                "decoding",
                "data-type",
                "data-id",
            ],
            ol: ["start", "reversed"],
            li: ["value"],
        },
        allowedClasses: {
            a: ["e-jx3-author", "e-jx3-emotion", "w-jx3-element"],
            img: [
                "attachment",
                "e-jx3-emotion",
                "e-jx3-emotion-img",
                "t-emotion",
                "u-jx3-emo",
                "w-jx3-element",
            ],
        },
        allowedSchemes: ["http", "https", "mailto", "tel"],
        allowedSchemesByTag: {
            img: ["http", "https"],
        },
        allowProtocolRelative: true,
        transformTags: {
            a: (tagName, attribs) => {
                const target = LINK_TARGET_VALUES.has(attribs.target) ? attribs.target : "";
                const rel = normalizeRel(attribs.rel, target);
                const output = { ...attribs };

                if (target) output.target = target;
                else delete output.target;
                if (rel) output.rel = rel;
                else delete output.rel;

                return { tagName, attribs: output };
            },
            img: (tagName, attribs) => {
                const output = {
                    ...attribs,
                    loading: "lazy",
                    decoding: "async",
                };
                const className = normalizeImageClass(attribs.class, isEmotionImage(attribs));
                if (className) output.class = className;
                else delete output.class;
                return { tagName, attribs: output };
            },
        },
    });
}

export default sanitizeCommunityReplyHtml;
