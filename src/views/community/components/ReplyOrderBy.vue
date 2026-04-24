<template>
    <div class="w-filter-reply-order" :class="{ on: visible }">
        <span class="u-label" @click="toggleFilter">
            <span class="u-current-order">排序 : {{ current }}</span>
            <span class="u-toggle">
                <i class="el-icon-arrow-down"></i>
                <i class="el-icon-arrow-up"></i>
            </span>
        </span>
        <span class="u-options">
            <span class="u-mode" :class="{ on: order === 'reply' }" @click="filter('reply')">
                <el-icon><ChatDotRound /></el-icon>
                最新回复
            </span>
            <span class="u-mode" :class="{ on: order === 'publish' }" @click="filter('publish')">
                <el-icon><Sort /></el-icon>
                最新发布
            </span>
        </span>
    </div>
</template>

<script>
export default {
    name: "ReplyOrderBy",
    emits: ["filter"],
    props: {
        type: {
            type: [String, Number],
            default: "",
        },
    },
    data: function () {
        return {
            visible: false,
            order: this.type === "" ? "reply" : this.type == 1 ? "reply" : "publish",
        };
    },
    computed: {
        current: function () {
            return this.order === "reply" ? "最新回复" : "最新发布";
        },
    },
    watch: {
        type: function (val) {
            this.order = val === "" ? "reply" : val == 1 ? "reply" : "publish";
        },
    },
    methods: {
        toggleFilter: function () {
            this.visible = !this.visible;
        },
        filter: function (key) {
            this.order = key;
            this.$emit("filter", {
                type: "order_by_last_reply",
                val: key === "reply" ? 1 : "",
            });
            this.visible = false;
        },
    },
};
</script>

<style lang="less">
.w-filter-reply-order {
    .fz(12px);

    .u-label {
        .none;
    }
    .u-toggle {
        .pa;
        .rt(0);
        padding: 6px 10px;
        .pointer;

        .el-icon-arrow-up {
            .none;
        }
    }
    .u-options {
        .flex;
        gap: 15px;
        align-items: center;
    }
    .u-mode {
        .flex;
        gap: 2px;
        align-items: center;
        .pointer;

        &.on {
            color: var(--el-color-primary);
        }
        &:hover {
            color: @pink;
        }
    }
}
@media screen and (max-width: @ipad) {
    .w-filter-reply-order {
        .pr;
        background-color: #f6f8fa;
        border: 1px solid #eee;
        .r(4px);
        user-select: none;
        padding: 5px 0;
        padding-right: 20px;
        .w(150px);

        &.on {
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;

            .u-options {
                .flex;
                flex-direction: column;
                align-items: flex-start;
                gap: 0;
            }
            .el-icon-arrow-down {
                .none;
            }
            .el-icon-arrow-up {
                .db;
            }
        }

        .u-label {
            padding: 0 10px;
            .pointer;
            .db;
        }
        .u-options {
            .pa;
            .lt(-1px, 29px);
            padding: 5px 0;
            .w(100%);
            background-color: #fff;
            border: 1px solid #ddd;
            .z(2);
            .none;

            .u-mode {
                .flex;
                align-items: center;
                gap: 2px;
                padding: 7px 10px;
                .pr;
                .ml(0);
            }
        }
    }
}
@media screen and (max-width: @phone) {
    .w-filter-reply-order {
        .none;
    }
}
</style>
