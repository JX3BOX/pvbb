<template>
    <div class="p-qqrobot__pve" :class="`p-pve__${type}`">
        <template v-if="type === 'baizhan'">
            <Baizhan :id="id"></Baizhan>
            <BaizhanRobotBottom :type="type"></BaizhanRobotBottom>
        </template>
    </div>
</template>

<script>
import Baizhan from "@/views/qqbot/components/Baizhan.vue";
import BaizhanRobotBottom from "@/views/qqbot/components/Bottom.vue";
export default {
    name: "QqbotPve",
    components: {
        Baizhan,
        BaizhanRobotBottom,
    },
    data() {
        return {};
    },
    computed: {
        type() {
            return this.$route.query.type || "";
        },
        id() {
            return this.$route.query.id || "";
        },
    },
};
</script>

<style lang="less">
.p-pve__baizhan {
    width: 1152px;
    opacity: 1;
    border-radius: 24px;
    background: linear-gradient(180deg, rgba(64, 64, 64, 1) 0%, rgba(87, 87, 87, 1) 100%);

    border: 1px solid;
    box-sizing: border-box;
    border-image: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%) 0.5;

    padding: 20px;
    box-sizing: border-box;
}
</style>
