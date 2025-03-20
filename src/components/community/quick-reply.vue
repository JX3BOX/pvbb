<template>
    <div class="c-jx3box-reply">
        <el-popover
            :visible-arrow="true"
            placement="top"
            ref="quickReply"
            trigger="click"
            popper-class="c-jx3box-reply-pop"
        >
            <div class="c-jx3box-reply-pop__content">
                <i class="el-icon-close u-close" @click="closePop"></i>
                <div class="u-title">快捷回复</div>
                <div class="m-reply-list">
                    <div
                        class="m-reply-list__item"
                        v-for="(item, index) in replyTemplate"
                        :key="index"
                        @click="reply(item)"
                    >
                        {{ item }}
                    </div>
                </div>
            </div>
            <img
                slot="reference"
                class="u-reference"
                width="24"
                height="24"
                src="@/assets/img/comment.svg"
                alt="comment"
            />
        </el-popover>
    </div>
</template>

<script>
export default {
    name: "QuickReply",
    data() {
        return {
            replyTemplate: [
                "真不错，谢谢楼主#胜利#笨猪#胜利",
                "辛苦了，感谢楼主的付出",
                "谢谢楼主，很有用",
                "剑三真好玩，魔盒真好用",
            ],
        };
    },
    emits: ["reply"],
    methods: {
        // 关闭弹窗
        closePop() {
            if (this.$refs.quickReply) {
                this.$refs.quickReply.doClose();
            }
        },
        reply(item) {
            this.$emit("reply", item);
            this.closePop();
        },
    },
};
</script>

<style lang="less" scoped>
.c-jx3box-reply {
    .u-reference {
        cursor: pointer;
        position: relative;
        top: 8px;
        margin-left: 10px;
    }
}
.c-jx3box-reply-pop {
    padding: 0;
    width: 280px;
}

.c-jx3box-reply-pop__content {
    position: relative;

    .u-title {
        font-size: 14px;
        padding: 10px;
    }
    .u-close {
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;
        font-size: 16px;
    }

    .m-reply-list {
        padding: 0 10px 10px 10px;
        max-height: 300px;
        overflow-y: auto;
    }
    .m-reply-list__item {
        cursor: pointer;
        padding: 5px;
        border: 1px solid #eee;
        border-radius: 4px;
        margin-bottom: 5px;
        .u-name {
            font-size: 12px;
            color: #999;
        }
        .u-content {
            font-size: 14px;
            margin-top: 5px;
        }

        &:hover {
            color: #fff;
            background-color: #409eff;
            border-color: #409eff;
            transition: all 0.3s;
        }
    }
}
</style>
