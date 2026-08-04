<template>
    <img :src="showAvatar(mount, body_type)" @error="showSchoolAvatar" />
</template>

<script>
import { __cdn } from "@/utils/config";
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
export default {
    name: "roleAvatar",
    props: ["mount", "body_type"],
    components: {},
    data: function () {
        return {};
    },
    computed: {},
    methods: {
        showAvatar: function (mount, body_type) {
            const url = __cdn + "design/avatar/xisai/" + mount + "-" + body_type + ".png";
            return getThumbnail(url, 128);
        },
        showSchoolAvatar: function (event) {
            event.currentTarget.onerror = null;
            event.currentTarget.src = __cdn + "image/school/" + this.mount + ".png";
        },
    },
    filters: {},
    created: function () {},
    mounted: function () {},
};
</script>
