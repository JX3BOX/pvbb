<template>
    <div class="m-index-emotion">
        <ul class="u-list" v-if="list && list.length">
            <li class="u-item" v-for="(item, i) in list" :key="i">
                <router-link
                    :to="{ name: 'emotion', params: { id: item.id } }"
                    class="u-item-pic"
                >
                    <img
                        class="u-item-img"
                        :src="showEmotionPic(item.url)"
                        :alt="item.desc"
                    />
                </router-link>
            </li>
        </ul>
    </div>
</template>

<script>
import { getThumbnail, resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import { getEmotions } from "@/service/emotion";
export default {
    name: "IndexEmotion",
    props: [],
    components: {},
    data: function () {
        return {
            list: [],
        };
    },
    computed: {
        params: function () {
            return {
                per: 8,
            };
        },
    },
    watch: {},
    methods: {
        loadData: function () {
            getEmotions(this.params).then((res) => {
                this.list = res?.data?.data?.list || [];
            });
        },
        checkIsGif: function (url) {
            return url?.split(".").pop().toLowerCase() == "gif";
        },
        showEmotionPic: function (url) {
            if (this.checkIsGif(url)) {
                return resolveImagePath(url);
            } else {
                return getThumbnail(url, "emotion_thumbnail");
            }
        },
    },
    filters: {},
    created: function () {},
    mounted: function () {
        this.loadData();
    },
};
</script>