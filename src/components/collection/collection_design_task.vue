<template>
    <el-dialog
        custom-class="m-design-task"
        :width="isPhone ? '95%' : '600px'"
        :visible="modelValue"
        @close="close"
        :title="$t('pages.collection.admin.quickPush')"
        append-to-body
    >
        <el-form :model="form" ref="form" :rules="rules" :label-position="isPhone ? 'top' : 'left'" label-width="80px">
            <el-form-item :label="$t('pages.collection.admin.formTitle')" prop="title">
                <el-input v-model="form.title" :placeholder="$t('pages.collection.admin.titlePlaceholder')"></el-input>
            </el-form-item>
            <el-form-item :label="$t('pages.collection.admin.type')" prop="type">
                <el-select v-model="form.type" :placeholder="$t('pages.collection.admin.typePlaceholder')" style="width: 100%" filterable>
                    <el-option v-for="item in config" :key="item.id" :label="item.label" :value="item.name"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('pages.collection.admin.version')">
                <el-radio-group v-model="form.version">
                    <el-radio-button v-for="(label, key) in versions" :key="key" :label="key">{{
                        label
                    }}</el-radio-button>
                </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('pages.collection.admin.remark')">
                <el-input v-model="form.remark" :placeholder="$t('pages.collection.admin.remarkPlaceholder')"></el-input>
            </el-form-item>
            <el-form-item :label="$t('pages.collection.admin.rating')" class="m-star-line">
                <el-rate v-model="form.star" :colors="colors"></el-rate>
            </el-form-item>
        </el-form>

        <el-divider content-position="left"> {{ $t("pages.collection.admin.recentPushes") }} </el-divider>
        <template v-if="logs && logs.length">
            <el-table :data="logs" border size="small" max-height="300px">
                <el-table-column :label="$t('pages.collection.admin.pushedAt')" prop="push_at" align="center">
                    <template #default="{ row }">
                        {{ formatTime(row.push_at) }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('pages.collection.admin.pusher')" prop="pusher.display_name" align="center"></el-table-column>
                <el-table-column :label="$t('pages.collection.admin.rating')" prop="star" align="center">
                    <template #default="{ row }">
                        <el-rate v-model="row.star" disabled :colors="colors"></el-rate>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('pages.collection.admin.remark')" prop="remark" align="center"></el-table-column>
            </el-table>
        </template>
        <el-alert v-else :title="$t('pages.collection.admin.noPushHistory')" type="info" show-icon :closable="false"></el-alert>
        <template #footer>
            <el-button @click="close">{{ $t("pages.common.cancel") }}</el-button>
            <el-button type="primary" @click="onConfirm">{{ $t("pages.common.confirm") }}</el-button>
        </template>
    </el-dialog>
</template>

<script>
import { createDesignTask, getDesignTask, getConfigBannerTypes } from "@/service/design";
import { pick } from "lodash";
import dayjs from "dayjs";
import User from "@jx3box/jx3box-common/js/user";
export default {
    name: "CollectionDesignTask",
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        post: {
            type: Object,
            default: () => {},
        },
    },
    model: {
        prop: "modelValue",
        event: "update:modelValue",
    },
    emits: ["update:modelValue"],
    data() {
        return {
            form: {
                title: "",
                remark: "",
                star: 0,
                subtype: "",
                version: "std",
                type: "",
            },
            colors: ["#99A9BF", "#F7BA2A", "#FF9900"],

            logs: [],
            config: [],

            isPhone: window.innerWidth < 768,
            isEditor: User.isEditor(),

            versions: {
                std: this.$t("pages.collection.admin.flagship"),
                origin: this.$t("pages.collection.admin.origin"),
                wujie: this.$t("pages.collection.admin.wujie"),
                test: this.$t("pages.collection.admin.test"),
            },

            rules: {
                title: [{ required: true, message: this.$t("pages.collection.admin.titlePlaceholder"), trigger: "blur" }],
                type: [{ required: true, message: this.$t("pages.collection.admin.typePlaceholder"), trigger: "change" }],
            },
        };
    },
    computed: {
        client: function () {
            return this.$store.state.client || "std";
        },
    },
    watch: {
        modelValue(val) {
            if (val) {
                if (this.post) {
                    this.form.title = this.post.post_title;
                    if (this.post?.post_type) {
                        this.form.type = this.post.post_type;
                    }
                }
                this.loadLogs();

                if (User.isTeammate()) {
                    this.loadConfig();
                }
            }
        },
    },
    methods: {
        close() {
            this.$emit("update:modelValue", false);
        },
        clearForm() {
            this.form = {
                title: "",
                remark: "",
                star: 0,
                subtype: "",
                version: "std",
                type: "",
            };

            this.$refs?.form?.clearValidate();
        },
        onConfirm() {
            if (!this.post?.ID) return;
            this.$refs.form.validate((valid, fields) => {
                if (valid) {
                    const data = pick(this.post, ["client", "author"]);
                    if (!data.client) {
                        data.client = this.client;
                    }
                    data.title = this.form.title;
                    data.remark = this.form.remark;
                    data.star = this.form.star;
                    data.subtype = this.form.type;
                    data.version = this.form.version;

                    // data.source_type = this.post?.post_type;
                    data.source_type = "collection";
                    data.source_id = String(this.post?.ID);
                    data.link = `/collection/${this.post?.ID}`;
                    data.flow = 0;
                    createDesignTask(data).then(() => {
                        this.$message.success(this.$t("pages.collection.admin.submitted"));
                        this.close();
                    });
                } else {
                    console.log("error submit!!!", fields);
                }
            });
        },
        onCancel() {
            this.close();
            this.clearForm();
        },
        loadLogs() {
            if (!this.post?.ID) return;
            getDesignTask({ source_id: this.post?.ID }).then((res) => {
                this.logs = res.data.data || [];
            });
        },
        loadConfig() {
            getConfigBannerTypes({ _no_page: 1 }).then((res) => {
                this.config = res.data.data || [];
                this.config = this.config.filter((item) => item.parent_id == 1);
            });
        },
        formatTime(time) {
            const value = dayjs(time);
            if (!value.isValid()) return "";

            return new Intl.DateTimeFormat(this.$i18n?.locale || "zh-CN", {
                dateStyle: "medium",
                timeStyle: "medium",
            }).format(value.toDate());
        },
    },
};
</script>

<style lang="less">
.m-design-task {
    .el-form-item {
        margin-bottom: 12px;
    }
    .m-star-line {
        .el-form-item__content {
            top: 10px;
        }
    }
    .u-time {
        color: #c0c4cc;
    }
}

@media screen and (max-width: @phone) {
    .m-design-task {
        .m-star-line {
            .el-form-item__content {
                top: 0;
            }
        }
    }
}
</style>
