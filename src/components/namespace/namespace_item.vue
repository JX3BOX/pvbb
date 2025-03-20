<template>
    <div class="m-namespace-item" @click="goNamespace(namespace.link)">
        <h5 class="u-title">
            <a :href="namespace.link" target="_blank" @click.stop
                ><i class="u-icon el-icon-postcard"></i
                >{{ namespace.key || "未知" }} <span class="u-preview">剑网3.com/{{namespace.key}}</span>
            </a>
            <i class="u-my" v-if="isMyNamespace(namespace.uid)">由我创建的</i>
        </h5>
        <p class="u-desc">{{ namespace.desc || namespace.key || "未知" }}</p>
        <div class="u-misc">
            <span class="u-author">
                <i class="el-icon-user"></i
                ><a :href="namespace.uid | authorLink" target="_blank" @click.stop>
                    {{ namespace.creator && namespace.creator.display_name || "匿名" }}</a
                >
            </span>
            <time class="u-time"
                ><i class="el-icon-date"></i>
                {{ namespace.created | dataFormat }}</time
            >
        </div>
    </div>
</template>

<script>
import { authorLink } from "@jx3box/jx3box-common/js/utils";
import { showDate } from "@jx3box/jx3box-common/js/moment";
import User from "@jx3box/jx3box-common/js/user";
export default {
    name: "namespaceItem",
    props: ["data"],
    data: function() {
        return {
            uid: User.getInfo().uid,
        };
    },
    computed: {
        namespace: function() {
            return this.data;
        },
    },
    filters: {
        authorLink,
        dataFormat: function(val) {
            return (val && showDate(~~val * 1000)) || "-";
        },
    },
    methods: {
        isMyNamespace: function(val) {
            return this.uid && val == this.uid;
        },
        goNamespace(link) {
            window.open(link,'_blank')
        }
    },
    mounted: function() {},
};
</script>
