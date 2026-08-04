<template>
    <div class="m-login-box">
        <div class="m-login-box__content">
            <div class="m-login-box__icon" aria-hidden="true">
                <img src="@/assets/img/qqbot/team.svg" svg-inline alt="" />
            </div>
            <div class="m-login-box__title">暂时无法查看活动</div>
            <div class="m-login-box__desc">{{ desc }}</div>
            <el-button class="m-login-box__button" type="primary" @click="clickFunction">
                {{ clickText }}
                <i class="el-icon-arrow-right"></i>
            </el-button>
        </div>
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
};
</script>


<style lang="less">
.m-login-box {
    width: 100%;
    height: 420px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 16px;
    background:
        radial-gradient(circle at 50% 20%, rgba(64, 128, 255, 0.12), transparent 42%),
        linear-gradient(145deg, rgba(42, 44, 51, 0.96), rgba(18, 20, 25, 0.98));
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.24);
    padding: 40px;
    margin-top: 32px;
    color: #fff;

    &__content {
        width: 100%;
        .flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    &__icon {
        .size(72px);
        .flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 22px;
        border-radius: 22px;
        background: linear-gradient(145deg, rgba(64, 128, 255, 0.3), rgba(64, 128, 255, 0.08));
        border: 1px solid rgba(114, 173, 255, 0.34);
        box-shadow: 0 12px 28px rgba(24, 77, 178, 0.22), inset 0 1px rgba(255, 255, 255, 0.12);

        svg {
            width: 30px;
            height: 30px;
            color: #fff;
        }
    }
    &__title {
        margin-bottom: 9px;
        color: #fff;
        font-size: 20px;
        font-weight: 700;
        line-height: 28px;
    }
    &__desc {
        color: rgba(255, 255, 255, 0.5);
        font-size: 14px;
        line-height: 22px;
    }
    &__button {
        min-width: 124px;
        height: 40px;
        margin-top: 26px;
        border: 0;
        border-radius: 20px;
        background: linear-gradient(90deg, #3478f6, #5598ff);
        box-shadow: 0 8px 20px rgba(64, 128, 255, 0.24);
        font-weight: 700;
        transition: transform 0.2s ease, box-shadow 0.2s ease;

        i {
            margin-left: 6px;
        }
        &:hover {
            transform: translateY(-1px);
            background: linear-gradient(90deg, #4080ff, #6aabff);
            box-shadow: 0 10px 24px rgba(64, 128, 255, 0.32);
        }
    }
}
</style>
