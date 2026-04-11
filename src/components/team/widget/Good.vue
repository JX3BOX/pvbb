<template>
    <div class="w-like-heart" @click="blast">
        <span class="w-heart" ref="likeheart"></span>
        <span class="u-text">{{ txt || "喜欢" }}</span>
        <span class="u-count" v-if="showCount">{{ total }}</span>
    </div>
</template>

<script>
import { addLike } from "@/service/team/team.js";
export default {
    name: "Good",
    props: ["mode", "txt", "showCount", "count", "team_id"],
    data: function() {
        return {
            status: false,
            clicks: 0,
            total: 0,
        };
    },
    computed: {
        id: function() {
            return this.team_id;
        },
    },
    watch: {
        count: function(val) {
            this.total = val || 0;
        },
    },
    methods: {
        doLike: function() {
            this.status = !this.status;
            this.status && this.id && addLike(this.id);
        },

        doLikes: _.throttle(function() {
            addLike(this.id);
        }, 2000),

        blast: function() {
            this.$refs.likeheart.classList.add("w-heart-animation");
            setTimeout(() => {
                this.$refs.likeheart.classList.remove("w-heart-animation");
            }, 800);

            this.total++;
            this.clicks++;
            this.doLikes();
        },
    },
    mounted: function() {},
};
</script>

<style lang="less">
@import "@/assets/css/team/widget/good.less";
</style>
