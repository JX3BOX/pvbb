<!--
 * @Author: iRuxu
 * @Date: 2022-07-17 01:25:16
 * @LastEditTime: 2022-07-17 19:59:30
 * @Description:
-->
<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script>
export default {
    name: "App",
};
</script>

<style lang="less">
@import "./assets/css/app.less";
@import "~@/assets/css/miniprogram.less";
</style>
