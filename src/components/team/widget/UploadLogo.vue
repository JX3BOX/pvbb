<template>
    <div class="c-upload-logo">
        <div v-if="data" class="u-logo">
            <img :src="preview" />
            <i class="u-logo-mask"></i>
            <i class="u-logo-delete el-icon-delete" title="移除" @click="remove"></i>
        </div>
        <div v-else class="u-upload el-upload el-upload--picture-card" @click="select">
            <i class="el-icon-plus"></i>
        </div>
        <input class="u-upload-input" type="file" @change="upload" ref="uploadInput" />
    </div>
</template>

<script>
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
import { uploadImage } from "@/service/team/server.js";
export default {
    name: "upload",
    props: ["modelValue", "content"],
    emits: ["update:modelValue", "update"],
    data: function () {
        return {
            data: this.modelValue || this.content || "",
        };
    },
    watch: {
        data: function (newval) {
            this.$emit("update:modelValue", newval);
            this.$emit("update", newval);
        },
        modelValue: function (newval) {
            this.data = newval;
        },
        content: function (newval) {
            this.data = newval;
        },
    },
    computed: {
        fileInput: function () {
            return this.$refs.uploadInput;
        },
        preview: function () {
            return getThumbnail(this.data, 296, true);
        },
    },
    methods: {
        select: function () {
            this.fileInput.dispatchEvent(new MouseEvent("click"));
        },
        upload: function () {
            let formdata = new FormData();
            formdata.append("avatar", this.fileInput.files[0]);
            uploadImage(formdata).then((res) => {
                this.data = res.data.data[0];
                this.$message({
                    message: "上传成功",
                    type: "success",
                });
            });
        },
        remove: function () {
            this.data = "";
        },
    },
    mounted: function () {},
    components: {},
};
</script>

<style lang="less">
.c-upload-logo {
    .u-logo {
        .pr;
        .size(148px);
        img {
            .size(100%);
            .y(bottom);
        }
        .u-logo-mask {
            .none;
            .pa;
            .lt(0);
            .size(100%);
            background-color: rgba(0, 0, 0, 0.6);
        }
        .u-logo-delete {
            .pa;
            .lt(50%);
            .fz(24px);
            transform: translate(-50%, -50%);
            line-height: 1;
            padding: 0;
            color: #fff;
            .pointer;
            .none;
            z-index: 2;
        }
        &:hover {
            .u-logo-mask,
            .u-logo-delete {
                .db;
            }
        }
    }
    .u-upload-input {
        .none;
    }
}
</style>
