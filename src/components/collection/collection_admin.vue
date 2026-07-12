<template>
    <el-drawer
        class="c-admin"
        :title="$t('pages.collection.admin.panelTitle')"
        :visible="modelValue"
        :before-close="close"
        :append-to-body="true"
        :modal="false"
        :withHeader="false"
    >
        <div class="c-admin-wrapper">
            <el-divider content-position="left">{{ $t("pages.collection.admin.visibility") }}</el-divider>
            <el-radio-group v-model="visible" size="small" class="c-admin-status">
                <el-radio-button v-for="(option, key) in visible_options" :label="key" :key="key">{{
                    option
                }}</el-radio-button>
            </el-radio-group>
            <el-divider content-position="left">{{ $t("pages.collection.admin.featured") }}</el-divider>
            <el-switch v-model="star" :active-value="1" :inactive-value="0"></el-switch>

            <el-divider content-position="left">{{ $t("pages.collection.admin.metadata") }}</el-divider>

            <div class="c-admin-title">
                <el-input v-model="title" :placeholder="$t('pages.collection.admin.titlePlaceholder')" class="input-author drawer-item-content">
                    <template #prepend>{{ $t("pages.collection.admin.formTitle") }}</template>
                </el-input>
            </div>

            <el-divider content-position="left">{{ $t("pages.collection.admin.cover") }}</el-divider>
            <div class="c-admin-banner">
                <el-upload
                    class="c-admin-upload el-upload--picture-card"
                    :action="uploadurl"
                    :with-credentials="true"
                    :show-file-list="false"
                    :on-success="uploadSuccess"
                    :on-error="uploadFail"
                >
                    <img v-if="image" :src="image" />
                    <i class="el-icon-plus" v-else></i>
                </el-upload>
                <el-input class="u-banner" v-model="image">
                    <template #prepend>{{ $t("pages.collection.admin.coverAddress") }}</template>
                    <template #append>
                        <span class="u-btn" @click="removeBanner"> <i class="el-icon-circle-close"></i> {{ $t("pages.collection.admin.removeCover") }} </span>
                    </template>
                </el-input>
            </div>

            <el-divider content-position="left">{{ $t("pages.collection.admin.other") }}</el-divider>

            <div class="c-admin-info">
                <div class="c-admin-author">
                    <el-input
                        v-model="post_author"
                        :placeholder="$t('pages.collection.admin.authorPlaceholder')"
                        class="input-author drawer-item-content"
                    >
                        <template #prepend>{{ $t("pages.collection.admin.author") }}</template>
                    </el-input>
                </div>
            </div>

            <div class="c-admin-buttons">
                <el-button type="primary" @click="submit" :loading="pushing">{{ $t("pages.common.submit") }}</el-button>
                <el-button type="plain" @click="close">{{ $t("pages.common.cancel") }}</el-button>
            </div>
        </div>
    </el-drawer>
</template>

<script>
import { __postType, __cms } from "@/utils/config";
import { updateCollection, getCollection } from "@/service/collection";
import Bus from "@/store/bus";
export default {
    name: "CollectionAdmin",
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
    },
    model: {
        prop: "modelValue",
        event: "update:modelValue",
    },
    data() {
        return {
            type_options: [],
            post_author: "",
            visible: 1,
            star: 0,
            title: "",

            pushing: false,

            // 海报
            uploadurl: __cms + "api/cms/upload",
            banner_preview: "",
            image: "",

            data: {},
        };
    },
    computed: {
        visible_options() {
            return {
                0: this.$t("pages.collection.admin.private"),
                1: this.$t("pages.collection.admin.public"),
            };
        },
        id() {
            return this.$route.params.id;
        },
    },
    watch: {
        modelValue(val) {
            if (val) {
                this.loadCollection();
            }
        },
    },
    mounted() {
        this.initTypeOptions();
    },
    methods: {
        close() {
            this.$emit("update:modelValue", false);
        },
        // 加载类型选项
        initTypeOptions: function () {
            let types = [];
            for (let key in __postType) {
                types.push({
                    value: key,
                    label: __postType[key],
                });
            }
            this.type_options = types;
        },
        loadCollection() {
            getCollection(this.id).then((res) => {
                this.data = res.data.data;
                this.post_author = this.data.user_id;
                this.visible = this.data.public;
                this.star = this.data.star;
                this.title = this.data.title;
                this.image = this.data.image;
            });
        },
        submit() {
            this.pushing = true;
            updateCollection(this.id, {
                public: this.visible,
                title: this.title,
                image: this.image,
                description: this.data.description,
                mark: this.data.mark,
                star: this.star,
                posts: JSON.stringify(this.data.posts),
                user_id: ~~this.post_author,
            })
                .then(() => {
                    this.$message({
                        message: this.$t("pages.collection.admin.updated"),
                        type: "success",
                    });
                    Bus.$emit("updateCollection");
                })
                .finally(() => {
                    this.pushing = false;
                });
        },
        // 上传
        uploadSuccess: function (res, file, list) {
            this.banner_preview = URL.createObjectURL(file.raw);
            this.image = res.data[0];
        },
        uploadFail: function (err, file, fileList) {
            this.$message.error(this.$t("pages.collection.admin.uploadFailed"));
            console.log(err);
        },
        removeBanner: function () {
            this.image = "";
        },
    },
};
</script>

<style lang="less">
.c-admin-title {
    margin-bottom: 20px;
}
.c-admin-banner {
    .u-banner {
        .mt(5px);
    }
    .u-btn {
        .pointer;
    }
}
.c-admin-upload {
    .w(100%) !important;
    .x;

    .el-upload {
        .size(100%);
        box-sizing: border-box;
    }
    overflow: hidden;
}
</style>
