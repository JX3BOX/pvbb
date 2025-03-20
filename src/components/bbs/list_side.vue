<template>
    <div class="m-extend-list">
        <RightSideMsg>
            <em>综合交流群</em> :
            <strong @click="onQQClick" class="u-link" title="点击复制">
                <a>{{ qq }}</a>
            </strong>
        </RightSideMsg>
        <minirank />
        <birthday></birthday>
    </div>
</template>

<script>
import minirank from "./minirank.vue";
import birthday from "./birthday.vue";
export default {
    name: "list_side",
    props: [],
    data: function () {
        return {
            activeDocGroup: [],
            jx3dat_newbie: [],
            jx3dat_senior: [],

            qq: "2471800",

            tags: [],
            rules: "",
            apis: [],
        };
    },
    methods: {
        onQQClick() {
            navigator.clipboard.writeText(this.qq).then(() => {
                this.$notify({
                    title: "复制成功",
                    message: "内容：" + this.qq,
                    type: "success",
                });
            });
        },
        highLight: function (val) {
            if (val) {
                return "color:" + val + ";font-weight:bold;";
            }
            return "";
        },
    },
    mounted: function () {},
    components: {
        minirank,
        birthday,
    },
};
</script>

<style lang="less">
.m-side-title {
    margin: 20px 0 10px 0;
}

.m-extend-list {
    .u-link {
        .pointer;
    }

    .c-sidebar-right-msg {
        margin-left: 0;
        margin-right: 0;
    }
}

.m-side-links {
    .u-title {
        .flex;
        align-items: center;
        gap: 10px;
        .fz(18px);
    }

    .u-icon {
        .size(20px);
    }

    .u-groups {
        padding: 0 5px;
    }
    .u-doc {
        .nobreak;
        .flex;
        align-items: center;
        .fz(12px, 34px);
        // border-bottom: 1px solid #eee;
        i {
            .fz(16px);
            color: #666;
            .mr(5px);
        }
        &:last-child {
            border-bottom: none;
        }
        &:hover {
            .bold;
            color: @pink;
        }
    }
}

.m-tool-api {
    .u-item {
        display: block;
        padding: 0 5px;
        font-size: 12px;
        line-height: 3;
        text-align: left;
        border-bottom: 1px dashed #eee;
        cursor: pointer;
        height: 32px;

        &:hover {
            color: @pink;
            font-weight: bold;
        }
    }
}

@media screen and (max-width: @phone) {
    .m-side-rank,
    .m-side-links {
        //.none;
    }
}

.c-sidebar-right-list {
    .u-item {
        i {
            .mr(5px);
        }
    }
}

.c-sidebar-right-title {
    font-weight: bold;

    .u-date {
        font-size: 12px;
        font-weight: normal;
        margin-left: 10px;
    }
}
</style>
