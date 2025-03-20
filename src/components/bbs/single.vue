<template>
    <singlebox :post="post" :stat="stat" v-loading="loading" @extendUpdate="updateExtend">
        <!-- 头部子类型 -->
        <div class="u-meta u-sub-block" slot="single-header">
            <em class="u-label">类型</em>
            <span class="u-value">
                {{ post_subtype }}
            </span>
            <!-- <span v-for="item in topics" :key="item" class="u-label u-topic">{{ item }}</span> -->
        </div>
    </singlebox>
</template>

<script>
// 依赖模块
import singlebox from "@/components/cms-single";

// 本地数据
import { getPost } from "../../service/post.js";
import { getStat, postStat, postHistory } from "@jx3box/jx3box-common/js/stat";
import User from "@jx3box/jx3box-common/js/user";
import { appKey } from "../../../setting.json";
import bbsSubtypes from "@/assets/data/bbs_subtypes.json";
export default {
    name: "single",
    props: ["id"],
    data: function() {
        return {
            loading: false,
            post: {},
            stat: {},
        };
    },
    computed: {
        post_subtype: function() {
            let subtype = this.post?.post_subtype;
            return subtype ? bbsSubtypes[subtype]?.['label'] : "-";
        },
        topics: function (){
            return (this.post?.topics || []).map(item => item.topic)
        }
    },
    methods : {
        updateExtend : function (val){
            this.$store.state.extend = val
        }
    },
    mounted: function() {
        if (this.id) {
            this.loading = true;
            getPost(this.id)
                .then((res) => {
                    this.post = this.$store.state.post = res.data.data;
                    this.$store.state.id = this.id;
                    this.$store.state.user_id = this.post?.post_author;
                    document.title = this.post.post_title;

                    User.isLogin() && postHistory({
                        source_type: appKey,
                        source_id: ~~this.id,
                        link: location.href,
                        title: this.post.post_title,
                        author: this.post.post_author,
                        banner: this.post.post_banner,
                        content_meta_id: this.post.link_content_meta_id,
                    });
                })
                .finally(() => {
                    this.loading = false;
                });

            getStat(appKey, this.id).then((res) => {
                this.stat = this.$store.state.stat = res.data;
            });
            postStat(appKey, this.id);
        }
    },
    components: {
        singlebox,
    },
};
</script>

<style lang="less">
@import "../../assets/css/bbs/single.less";
</style>
