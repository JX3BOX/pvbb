<template>
    <div class="m-medal">
        <template v-for="item in medals" :key="item.id">
            <a
                v-if="interactive"
                :href="medalLink(item)"
                target="_blank"
                rel="noopener noreferrer"
                class="u-medal"
                :title="item.medal_desc"
            >
                <img class="u-medal-img" :src="showIcon(item.medal)" :alt="item.medal_desc || '勋章'" />
            </a>
            <span v-else class="u-medal is-static" :title="item.medal_desc">
                <img class="u-medal-img" :src="showIcon(item.medal)" :alt="item.medal_desc || '勋章'" />
            </span>
        </template>
    </div>
</template>

<script>
import { getMedalLink } from "@jx3box/jx3box-common/js/utils";
import { __Root } from "@/utils/config";
export default {
    name: "author_medal",
    props: {
        medals: {
            type: Array,
            default: () => [],
        },
        showIcon: {
            type: Function,
            default: () => true,
        },
        interactive: {
            type: Boolean,
            default: true,
        },
    },
    methods: {
        medalLink(medal) {
            if (medal.medal_url) return `${__Root}${medal.medal_url}`;
            return medal.rank_id ? getMedalLink(medal.rank_id, medal.medal_type || "rank") : "";
        },
    },
};
</script>

<style lang="less">
.m-medal {
    display: flex;
    .u-medal {
        cursor: pointer;

        &.is-static {
            cursor: default;
        }

        .u-medal-img {
            width: 20px;
            height: 20px;
        }
    }
}
</style>
