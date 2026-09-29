<template>
    <div @click="previewImage" v-html="content"></div>
</template>

<script>
import { markRaw } from "vue";
import Viewer from "viewerjs";
import "viewerjs/dist/viewer.css";

function canPreview(image) {
    return Boolean(image.getAttribute("src")) &&
        !image.closest('.e-jx3-emotion, .e-jx3-emotion-img, .t-emotion, .u-jx3-emo, [data-type="emotion"]') &&
        !/(?:^|\/)emotion\/output\//i.test(image.getAttribute("src"));
}

export default {
    name: "ReplyContent",
    props: { content: { type: String, default: "" } },
    data() {
        return { viewer: null };
    },
    watch: {
        content() {
            this.closePreview();
        },
        "$route.fullPath"() {
            this.closePreview();
        },
    },
    beforeUnmount() {
        this.closePreview();
    },
    methods: {
        closePreview() {
            const viewer = this.viewer;
            this.viewer = null;
            if (viewer) {
                viewer.hide(true);
                viewer.destroy();
            }
        },
        previewImage(event) {
            const image = event.target;
            if (image.tagName !== "IMG" || !canPreview(image)) return;
            event.preventDefault();
            this.closePreview();
            // 与主楼 Article 的图片预览使用相同组件和配置。
            this.viewer = markRaw(new Viewer(image, {
                toolbar: false,
                navbar: false,
                hidden: () => this.closePreview(),
            }));
            this.viewer.show();
        },
    },
};
</script>
