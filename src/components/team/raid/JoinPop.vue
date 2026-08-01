<template>
    <el-dialog
        class="m-team-joinpop m-raid-joinpop"
        :title="title"
        v-model="visible"
        width="920px"
        align-center
        append-to-body
        :close-on-click-modal="false"
        :close-on-press-escape="false"
    >
        <div class="m-raid-joinpop-content">
            <div class="m-raid-joinpop-mode" v-if="isLogin && auth !== 1">
                <div>
                    <strong>报名角色</strong>
                    <span>选择已绑定角色，或临时填写本次活动角色</span>
                </div>
                <el-radio-group v-model="custom">
                    <el-radio-button :value="0"><i class="el-icon-user"></i> 已有角色</el-radio-button>
                    <el-radio-button :value="1"><i class="el-icon-edit"></i> 临时自定义</el-radio-button>
                </el-radio-group>
            </div>

            <!-- 已有角色列表 -->
            <section class="m-raid-joinpop-section m-raid-joinpop-box" v-if="!custom && isLogin" v-loading="loading">
                <header class="u-section-heading">
                    <div>
                        <strong>选择角色</strong>
                        <span>每次预约可选择一个角色</span>
                    </div>
                    <span class="u-selection-count">已选 {{ roles.length }}/1</span>
                </header>
                <div class="m-raid-joinpop-list" v-if="roleData && roleData.length">
                    <el-checkbox-group class="u-list" v-model="roles" @change="checkIsAll">
                        <el-checkbox v-for="item in roleData" :value="item.ID" :key="item.ID" class="u-item" border>
                            <el-tooltip
                                class="item"
                                effect="dark"
                                :content="item.note || item.name"
                                placement="bottom"
                            >
                                <div class="u-role-card">
                                    <img class="u-item-avatar" :src="showAvatar(item.mount)" />

                                    <span class="u-item-name">{{ item.name }}</span>
                                    <span class="u-item-server">{{ item.server }}</span>
                                </div>
                            </el-tooltip>
                        </el-checkbox>
                    </el-checkbox-group>
                </div>
                <div class="m-team-joinpop-null" v-else>
                    <el-alert title="暂无可用角色，请绑定角色或临时自定义" type="warning" show-icon></el-alert>
                </div>
            </section>

            <!-- 角色名称（仅自定义） -->
            <section
                class="m-raid-joinpop-section m-team-joinpop-block is-name-block"
                v-if="custom || !isLogin"
            >
                <p class="u-label"><i class="el-icon-postcard"></i> 角色名称 <b>必填</b></p>
                <el-input v-model="form.name" placeholder="请输入角色名" :maxlength="12" show-word-limit></el-input>
            </section>

            <!-- 角色心法（即使选择角色也需要设置心法） -->
            <section
                class="m-raid-joinpop-section m-team-joinpop-block is-mount-block"
                v-if="custom || (!custom && roleData && roleData.length)"
            >
                <div class="u-section-heading">
                    <div>
                        <p class="u-label"><i class="el-icon-orange"></i> 角色心法 <b>必选</b></p>
                        <span>选择本次活动使用的心法</span>
                    </div>
                </div>
                <div class="m-team-xf">
                    <el-radio v-for="(item, i) in xfMaps" v-model="form.mount" :value="String(item.id)" :key="i">
                        <img class="u-pic" :src="showMountIcon(item.id)" :alt="item.name" />
                        <span class="u-txt">{{ item.name }}</span>
                    </el-radio>
                </div>
            </section>

            <!-- 角色备注（不管怎样总是显示备注） -->
            <section
                class="m-raid-joinpop-section m-team-joinpop-block is-remark-block"
                v-if="custom || (!custom && roleData && roleData.length)"
            >
                <p class="u-label"><i class="el-icon-chat-line-square"></i> 备注信息 <span>选填</span></p>
                <el-input
                    v-model="form.remark"
                    placeholder="可填写进组时间、装备情况等说明"
                    :maxlength="20"
                    show-word-limit
                ></el-input>
            </section>
        </div>

        <template #footer>
            <div class="m-raid-joinpop-footer">
                <span><i class="el-icon-info"></i> 提交后可在候选名单中查看报名状态</span>
                <div>
                    <el-button @click="visible = false">取消</el-button>
                    <el-button type="primary" @click="confirm">确认报名</el-button>
                </div>
            </div>
        </template>
    </el-dialog>
</template>

<script>
import { getRoles, getAllMyRoles } from "@/service/team/role.js";
import xf_map from "@jx3box/jx3box-data/data/xf/xf.json";
import { __imgPath } from "@/utils/config";
import User from "@jx3box/jx3box-common/js/user";
import { showMountIcon } from "@/utils/filters";
export default {
    name: "RaidJoinPop",
    props: ["title", "modelValue", "auth", "client"],
    emits: ["update:modelValue", "confirm"],
    data: function () {
        return {
            isLogin: User.isLogin(),
            visible: false,
            data: [],

            roles: [],
            form: {
                name: "",
                mount: "",
                remark: "",
            },
            // 未解之谜 custom不能生效
            custom: 1,
            checkAll: false,
            isIndeterminate: false,

            xf_map,

            loading: false,
        };
    },
    watch: {
        modelValue: function (newval) {
            this.open(newval);
        },
        visible: function (newval) {
            this.$emit("update:modelValue", newval);
            if (newval) {
                if (this.isLogin) {
                    this.loading = true;
                    getAllMyRoles()
                        .then((res) => {
                            this.data = res.data.data.list || [];
                            this.custom = this.data.length ? 0 : 1;
                        })
                        .finally(() => {
                            this.loading = false;
                        });
                } else {
                    this.custom = 1;
                }
            }
        },
        // 切换radio重置表单
        custom() {
            this.form = {
                name: "",
                mount: "0",
                remark: "",
            };
            this.roles = [];
        },
        roles: {
            deep: true,
            handler(newVal) {
                if (newVal.length) {
                    this.form.mount = String(Object.values(this.xfMaps)[0]?.id);
                }
            },
        },
    },
    computed: {
        roleData: function () {
            if (this.auth === 1) return this.data.filter((d) => !d?.custom);
            return this.data;
        },
        params: function () {
            return {
                roles: this.roles,
                team_id: this.$route.params.id,
            };
        },
        school: function ({ roles, data }) {
            const [current] = roles;
            if (current) {
                return Number(data.find((d) => d.ID === current).mount);
            }
            return 0;
        },
        xfMaps: function ({ school }) {
            const xfWithClient = Object.values(xf_map).filter((item) => item.client.includes(this.client));
            if (school) {
                const obj = {};
                for (const key in xfWithClient) {
                    if (xfWithClient[key].school === school) {
                        obj[key] = xfWithClient[key];
                    }
                }
                return obj;
            }
            return xfWithClient;
        },
    },
    methods: {
        open(newval) {
            this.visible = newval;
            this.resetForm();
            this.$nextTick(() => {
                this.form.mount = "0";
            });
        },
        confirm: function () {
            const [current] = this.roles || [];
            const formData = {
                role_id: current,
                name: this.data.find((d) => d.ID === current)?.name || this.form.name,
                mount: this.form.mount,
                server: this.data.find((d) => d.ID === current)?.server,
                remark: this.form.remark,
            };

            if (!formData.name) {
                this.$message.warning("请输入角色名称");
                return;
            }

            this.$emit("confirm", formData);
        },
        checkIsAll(value) {
            if (value.length) {
                const current = value[value.length - 1];
                this.roles = [current];
            }
        },
        showAvatar: function (mount, body_type) {
            return __imgPath + "image/school/" + mount + ".png";
        },
        resetForm: function () {
            this.form = {
                name: "",
                mount: "",
                remark: "",
            };
            this.custom = 0;
            this.roles = [];
        },
        showMountIcon,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/raid/joinpop.less";
</style>
