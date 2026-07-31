<template>
    <el-dialog
        class="m-dkp-dialog-modify"
        title="调整 DKP"
        v-model="show"
        :close-on-click-modal="false"
        :close-on-press-escape="!editFormLoading"
        :show-close="!editFormLoading"
        width="620px"
        append-to-body
    >
        <el-form
            :model="form"
            v-loading="editFormLoading"
            :rules="editFormRules"
            ref="editForm"
            label-position="top"
            class="m-dkp-dialog-form"
        >
            <el-form-item>
                <template #label>
                    <span class="u-field-label">
                        调整对象
                        <em>{{ rows.length }} 人</em>
                    </span>
                </template>
                <div class="m-dkp-target-list">
                    <a
                        v-for="row in rows"
                        :key="row.uid"
                        class="u-user-item"
                        :href="authorLink(row.uid)"
                        target="_blank"
                        :title="row.user_info && row.user_info.display_name"
                    >
                        <img :src="renderAvatar(row.user_info)" class="u-user-avatar" />
                        <span class="u-user-name">
                            {{ row.user_info && row.user_info.display_name }}
                        </span>
                    </a>
                </div>
            </el-form-item>

            <el-form-item v-if="singleRow">
                <template #label>
                    <span class="u-field-label">
                        指定角色
                        <em>选填</em>
                    </span>
                </template>
                <el-select v-model="form.role_id" clearable placeholder="不指定角色则计入成员总分">
                    <el-option
                        v-for="(role, index) in singleRow.roles"
                        :key="index"
                        :label="role.roleInfo.name"
                        :value="role.relation.ID"
                    >
                        <div class="m-dkp-role-option">
                            <img :src="showSchoolIcon(role.roleInfo.mount)" />
                            <span>{{ role.roleInfo.name }}</span>
                        </div>
                    </el-option>
                </el-select>
            </el-form-item>

            <div class="m-dkp-dialog-form__row">
                <el-form-item label="调整原因">
                    <el-radio-group
                        v-model="form.reason"
                        :class="{ 'is-single-option': !singleRow }"
                        @change="turnScorePM"
                    >
                        <el-radio value="manual" border>手动设置</el-radio>
                        <el-radio value="drop" border v-if="singleRow">分配物品</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="变动方向">
                    <el-radio-group v-model="form.action">
                        <el-radio :value="0" border>增加</el-radio>
                        <el-radio :value="1" border>扣减</el-radio>
                    </el-radio-group>
                </el-form-item>
            </div>

            <el-form-item label="分配物品" v-if="form.reason === 'drop'" prop="drop_item_id">
                <el-select
                    v-model="form.drop_item_id"
                    filterable
                    remote
                    placeholder="请输入关键词（≥2字）"
                    :remote-method="fetchSelectItems"
                    :loading="fetchSelectItemsloading"
                    :no-data-text="fetchSelectNoDataText"
                >
                    <el-option
                        v-for="item in fetchedSelectItemsOptions"
                        :key="item.id"
                        :label="item.Name"
                        :value="item.id"
                    >
                        <Items :item="item" />
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="变动分值" required prop="score">
                <el-input
                    v-model.number="form.score"
                    autocomplete="off"
                    min="1"
                    type="number"
                    pattern="[1-9][0-9]*"
                    placeholder="请输入正整数"
                ></el-input>
            </el-form-item>

            <el-form-item label="备注" prop="remark">
                <el-input
                    v-model="form.remark"
                    autocomplete="off"
                    :placeholder="`选填，留空将自动记录为“${remarkPlaceholder}”`"
                ></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="m-dkp-dialog-footer" v-if="!editFormLoading">
                <el-button @click="handleCancel">取消</el-button>
                <el-button type="primary" @click="handleSubmitEdit" :loading="editFormLoading">确认调整</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script>
import Items from "@/components/team/widget/Items.vue";

import { searchItem, updateDkp } from "@/service/team/dkp.js";
import { showAvatar } from "@jx3box/jx3box-common/js/utils";
import cloneDeep from "lodash/cloneDeep";
import { showSchoolIcon, authorLink } from "@/utils/filters";
export default {
    name: "dkp_dialog",
    props: {
        org: {
            type: Number,
            default: -1,
        },
        modelValue: {
            type: Boolean,
            default: false,
        },
        rows: {
            type: Array,
            default: () => [],
        },
    },
    emits: ["update:modelValue", "updateRows"],
    components: {
        Items,
    },
    data: function () {
        var validateDrop = (rule, value, callback) => {
            if (this.form.reason === "drop" && value.length < 1) {
                callback(new Error("请选择至少一个物品"));
            } else {
                callback();
            }
        };
        return {
            form: {
                reason: "manual",
                role_id: "",
                drop_item_id: "",
                action: 0,
                remark: "",
                score: "",
            },
            fetchSelectItemsloading: false,
            fetchedSelectItemsOptions: [],
            fetchSelectNoDataText: "请输入至少2个字",
            editFormLoading: false,
            editFormRules: {
                remark: [
                    {
                        min: 0,
                        max: 255,
                        message: "备注不能超过255个字符",
                        trigger: "change",
                    },
                ],
                score: [
                    { required: true, message: "必须填写一个分值" },
                    {
                        type: "number",
                        message: "分值必须是一个整数",
                        min: 1,
                        message: "分值最小为1",
                    },
                ],
                drop_item_id: [{ validator: validateDrop, trigger: "blur" }],
            },
            show: false,
        };
    },
    computed: {
        remarkPlaceholder() {
            switch (this.form.reason) {
                case "drop":
                    return "分配物品";
                case "penalty":
                    return "犯错罚款";
                case "manual":
                    return "手动补正";
                default:
                    return "";
            }
        },
        singleRow({ rows }) {
            if (rows.length === 1) {
                return rows[0];
            }
            return null;
        },
    },
    filters: {},
    watch: {
        show(val) {
            this.$emit("update:modelValue", val);
            if (!val) {
                this.form = this.$options.data().form;
                this.$refs.editForm.clearValidate();
                this.fetchedSelectItemsOptions = [];
            }
        },
        modelValue(val) {
            this.show = val;
        },
    },
    methods: {
        editDkp() {
            this.editFormLoading = true;
            let data = [];
            if (this.singleRow) {
                const _data = cloneDeep(this.form);
                _data.user_id = this.singleRow.uid;
                // 如果remark为空，则自动根据reason填写
                if (_data["remark"].replace(/\ /g, "") === "") {
                    _data["remark"] = this.remarkPlaceholder;
                }
                // 如果存在物品分配，将 name 和 icon 一并提交
                if (_data.drop_item_id) {
                    const item = this.fetchedSelectItemsOptions.find((_item) => _item.id === _data.drop_item_id);
                    _data["drop_item_name"] = item.Name;
                    _data["drop_item_icon"] = item.IconID;
                }
                data.push(_data);
            } else {
                this.rows.forEach((row) => {
                    const _data = cloneDeep(this.form);
                    _data.user_id = row.uid;
                    if (_data["remark"].replace(/\ /g, "") === "") {
                        _data["remark"] = this.remarkPlaceholder;
                    }
                    data.push(_data);
                });
            }

            updateDkp(this.org, data)
                .then((res) => {
                    this.$message({
                        type: "success",
                        message: "修改分值成功",
                    });

                    this.$emit("updateRows", { action: this.form.action, score: this.form.score });

                    this.$refs["editForm"].resetFields();
                    this.show = false;
                })
                .finally(() => {
                    this.editFormLoading = false;
                    this.editFormVisible = false;
                });
        },
        handleSubmitEdit() {
            this.$refs["editForm"].validate((valid) => {
                if (valid) {
                    this.editDkp();
                } else {
                    return false;
                }
            });
        },
        fetchSelectItems(query) {
            this.fetchSelectNoDataText = "请输入至少2个字";
            if (query !== "" && query.length >= 2) {
                this.fetchSelectItemsloading = true;
                searchItem({
                    keyword: query,
                    page: 1,
                    limit: 100,
                    fields: "id,UiID,Name,IconID,Quality,IsQuest,Level",
                })
                    .then((res) => {
                        this.fetchSelectNoDataText = "无匹配物品";
                        // console.log(res.data.data.data);
                        this.fetchedSelectItemsOptions = res.data.data.data.map((item) => {
                            // 为了给武器等 有区分等级的物品 名字后面添加等级
                            let tmpItem = item;
                            if (tmpItem["Level"]) {
                                tmpItem.Name += ` (${tmpItem["Level"]})`;
                            }
                            return tmpItem;
                        });
                    })
                    .catch((err) => {
                        this.fetchSelectNoDataText = "无匹配物品";
                        this.fetchedSelectItemsOptions = [];
                    })
                    .finally(() => {
                        this.fetchSelectItemsloading = false;
                    });
            } else {
                this.fetchedSelectItemsOptions = [];
            }
        },
        // 调整默认正负
        turnScorePM: function (val) {
            if (val == "drop" || val == "penalty") {
                this.form.action = 1;
            } else {
                this.form.action = 0;
            }
        },

        // 头像渲染
        renderAvatar: function (userinfo) {
            return showAvatar(userinfo?.user_avatar || userinfo?.avatar);
        },
        // 取消
        handleCancel: function () {
            this.show = false;
        },
        showSchoolIcon,
        authorLink,
    },
};
</script>

<style lang="less">
@import "~@/assets/css/team/dkp/dkp_dialog.less";
</style>
