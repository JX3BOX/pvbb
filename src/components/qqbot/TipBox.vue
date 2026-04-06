<template>
    <div class="m-login-box">
        <el-empty :description="desc">
            <el-button type="primary" @click="clickFunction">{{ clickText }}</el-button>
        </el-empty>
    </div>
</template>

<script>
export default {
    name: "TipBox",
    props: {
        desc: {
            type: String,
            default: "该功能需要登录才能使用",
        },
        clickText: {
            type: String,
            default: "前往登录",
        },
        clickFunction: {
            type: Function,
            default: () => {},
        },
    },
    methods: {
    },
};
</script>


<style lang="less">
.m-login-box {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(56, 56, 56, 1) 0%, rgba(0, 0, 0, 1) 100%);
    border: 0.5px solid rgba(255, 255, 255, 1);
    box-shadow: 0px 20px 20px rgba(0, 0, 0, 0.25);
    padding: 48px;
    margin-top: 24px;
    color: #fff;

    .el-empty {
        .x;
    }
}
</style>
