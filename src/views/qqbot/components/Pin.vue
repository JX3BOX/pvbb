<template>
    <div class="m-join">
        <div class="join-content">
            <div class="text">注意搜索【机器人】类别</div>
            <div class="qq" @click="copyQQ">QQ:3889&nbsp;010&nbsp;020</div>
        </div>
        <div class="triangle"></div>
        <img class="join-img" :src="url + 'girlbot.png'" alt="" />
    </div>
</template>

<script>
import { __cdn } from "@/utils/config";
export default {
    name: "Join",
    data() {
        return {
            url: __cdn + "design/pve/team/",
        };
    },
    methods: {
        async copyQQ() {
            try {
                await this.$copyText("3889010020");
                this.$message.success("复制成功");
            } catch (error) {
                console.error("复制失败:", error);
                this.$message.error("复制失败");
            }
        },
    },
};
</script>

<style lang="less">
.m-join {
    width: 233px;
    height: 352px;
    position: fixed;
    .rb(0);
    .join-content {
        width: 209px;
        height: 107px;
        border-radius: 24px;
        background: rgba(255, 255, 255, 1);
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        .text {
            font-size: 14px;
            font-weight: 400;
            letter-spacing: 0px;
            color: rgba(56, 56, 56, 1);
            padding: 12px 0;
        }
        .qq {
            cursor: pointer;
            width: 185px;
            height: 50px;
            background: rgba(64, 128, 255, 1);
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 0px;
            line-height: 50px;
            color: rgba(255, 255, 255, 1);
            text-align: center;
            border-radius: 16px;
        }
    }
    .triangle {
        width: 0;
        height: 0;
        border-left: 11px solid transparent;
        border-right: 11px solid transparent;
        border-top: 13px solid rgba(255, 255, 255, 1);
        margin: 0 auto;
    }
    .join-img {
        width: 224px;
        height: 224px;
    }
}
</style>
