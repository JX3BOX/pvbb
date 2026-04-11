<template>
    <el-dialog class="m-rank-relevance-dialog" :visible="modelValue" :title="title" @close="close" width="500px">
        <el-form label-position="right" label-width="90px">
            <!-- 关联战斗 -->
            <el-form-item label="战斗统计">
                <el-select
                    class="u-select"
                    v-model="form.jx3box_battle_id"
                    placeholder="请选择关联的战斗统计"
                    size="large"
                    clearable
                    filterable
                    remote
                    :filter-method="loadBattle"
                    :default-first-option="true"
                >
                    <el-option v-for="item in battleList" :key="item.id" :label="item.title" :value="item.id">
                    </el-option>
                    <ElSelectLoading
                        :page="battleQuery.BattlePage"
                        :loading="battleQuery.BattleLoading"
                        :hasMore="battleQuery.BattleHasMore"
                        @loadMore="loadMoreBattle"
                    ></ElSelectLoading>
                </el-select>
            </el-form-item>
            <el-form-item label="日志JCL">
                <el-select
                    class="u-select"
                    v-model="form.jx3box_jcl_id"
                    placeholder="请选择关联的日志分析"
                    size="large"
                    clearable
                    filterable
                    remote
                    :filter-method="loadJcl"
                    :default-first-option="true"
                >
                    <el-option v-for="item in jclList" :key="item.id" :label="item.title" :value="item.id"> </el-option>
                    <ElSelectLoading
                        :page="jclQuery.JclPage"
                        :loading="jclQuery.JclLoading"
                        :hasMore="jclQuery.JclHasMore"
                        @loadMore="loadMoreJcl"
                    ></ElSelectLoading>
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="close">取消</el-button>
                <el-button type="primary" @click="submit"> 确认 </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script>
import { getBattleOrJcl, setBattleJcL } from "@/service/team/battle.js";
import ElSelectLoading from "./el-select-loading.vue";
export default {
    components: { ElSelectLoading },
    props: {
        modelValue: {
            type: Boolean,
            default: true,
        },
        role: {
            type: Boolean,
            default: false,
        },
        data: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            form: {
                jx3box_battle_id: null,
                jx3box_jcl_id: null,
            },

            battleList: [],
            battleQuery: {
                title: "",
                total: 0,
                BattleLoading: false,
                BattlePage: 1,
                BattleHasMore: false,
            },

            jclList: [],
            jclQuery: {
                title: "",
                total: 0,
                JclLoading: false,
                JclPage: 1,
                JclHasMore: false,
            },
        };
    },
    computed: {
        id() {
            return this.data.ID;
        },
        title() {
            return this.role
                ? "关联角色（" + this.data.role + "）战斗数据"
                : "关联团队（" + this.data.team_info.name + "）战斗数据";
        },
    },
    watch: {
        data: {
            immediate: true,
            deep: true,
            handler: function () {
                this.form.jx3box_battle_id = this.data.jx3box_battle_id;
                this.form.jx3box_jcl_id = this.data.jx3box_jcl_id;
            },
        },
    },
    created() {
        this.loadJcl();
        this.loadBattle();
    },
    methods: {
        close() {
            this.$emit("update", false);
        },
        loadBattle(title = "", pageIndex = 1) {
            if (title !== this.battleQuery.title) {
                pageIndex = 1;
            }
            this.battleQuery.title = title;
            this.battleQuery.BattleLoading = true;
            getBattleOrJcl({ pageIndex: pageIndex, type: "tinymins", title: title })
                .then((res) => {
                    const Battle = res.data?.data?.list || [];
                    if (pageIndex === 1) {
                        this.battleList = Battle;
                    } else {
                        this.battleList = this.battleList.concat(Battle);
                    }
                    const page = res.data?.data?.page || {};
                    const { index, pageTotal } = page;
                    this.battleQuery.BattlePage = index;
                    this.battleQuery.BattleHasMore = index < pageTotal;
                })
                .finally(() => {
                    this.battleQuery.BattleLoading = false;
                });
        },
        loadMoreBattle(page) {
            this.loadBattle(this.battleQuery.title, page);
        },
        loadJcl(title = "", pageIndex = 1) {
            if (title !== this.jclQuery.title) {
                pageIndex = 1;
            }
            this.jclQuery.title = title;
            this.jclQuery.JclLoading = true;
            getBattleOrJcl({ pageIndex: pageIndex, type: "jcl", subject: "team", title: title })
                .then((res) => {
                    const Jcl = res.data?.data?.list || [];
                    if (pageIndex === 1) {
                        this.jclList = Jcl;
                    } else {
                        this.jclList = this.jclList.concat(Jcl);
                    }
                    const page = res.data?.data?.page || {};
                    const { index, pageTotal } = page;
                    this.jclQuery.JclPage = index;
                    this.jclQuery.JclHasMore = index < pageTotal;
                })
                .finally(() => {
                    this.jclQuery.JclLoading = false;
                });
        },
        loadMoreJcl(page) {
            this.loadJcl(this.jclQuery.title, page);
        },

        submit() {
            setBattleJcL(this.id, this.form).then(() => {
                this.$message.success("关联审核提交成功");
                this.$emit("update");
                this.close();
            });
        },
    },
};
</script>
<style lang="less">
.m-rank-relevance-dialog {
    margin-top: 10vh;

    .el-form-item__label {
        .h(40px);
        line-height: 40px;
    }
    .u-select {
        .w(100%);
    }
}
</style>
