<template>
    <div class="m-info">
        <div class="m-info-router">
            <router-link to="/community"><i class="el-icon-receiving"></i></router-link>
            <!-- <router-link to="/bbs"><i class="el-icon-collection"></i></router-link> -->
            <router-link to="/joke"><i class="el-icon-cold-drink"></i></router-link>
            <router-link to="/emotion"><i class="el-icon-sugar"></i></router-link>
            <router-link to="/collection"><i class="el-icon-paperclip"></i></router-link>
            <router-link to="/namespace"><i class="el-icon-postcard"></i></router-link>
        </div>
    </div>
</template>

<script>
import router from '@/router';
export default {
    name: "Info",
    props: [],
    data: function () {
        return {};
    },
    computed: {},
};
</script>

<style lang="less">
@import "~@/assets/css/info.less";
</style>
