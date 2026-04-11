<template>
    <el-dialog title="模板列表" :visible="visible" destory-on-close @close="handleClose">
        <el-table :data="templates" size="small" v-loading="loading" class="u-table-box">
            <el-table-column label="模板名称" prop="template_name">
                <template #default="props">
                    <template v-if="!props.row.editable">
                        <span>{{ props.row.template_name }}</span>
                        <span class="u-op">
                            <el-button type="text" size="small" @click="editTemplate(props.row)" icon="Edit"
                                >修改</el-button
                            >
                        </span>
                    </template>
                    <template v-else>
                        <el-input
                            size="small"
                            style="width: 70%"
                            v-model="editTmpName"
                            placeholder="请输入模板名称"
                        ></el-input>
                        <span class="u-op">
                            <el-button type="text" size="small" @click="handleEditConfirm(props.row)" icon="Check"
                                >确认</el-button
                            >
                            <el-button type="text" size="small" @click="handleEditCancel(props.row)" icon="Close"
                                >取消</el-button
                            >
                        </span>
                    </template>
                </template>
            </el-table-column>
            <el-table-column label="创建人" width="100px">
                <template #default="props">
                    <a class="u-author" :href="authorLink(props.row.author_id)" target="_blank">{{
                        props.row.author_name
                    }}</a>
                </template>
            </el-table-column>
            <el-table-column label="修改时间" prop="updated_at" width="150px">
                <template #default="props">{{ showTime(props.row.updated_at) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="200px">
                <template #default="props">
                    <template>
                        <el-button size="small" type="primary" @click="useTemplate(props.row)" icon="DocumentCopy"
                            >使用</el-button
                        >
                        <el-popconfirm title="确认删除该模板？" @confirm="removeTemplate(props.row)">
                            <template #reference>
                                <el-button size="small" style="margin-left: 10px" icon="Delete">删除</el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </template>
            </el-table-column>
        </el-table>
    </el-dialog>
</template>

<script>
import { listRaidTemplate, deleteRaidTemplate, updateRaidTemplate } from "@/service/team/raid.js";
import { showTime, authorLink } from "@/utils/filters";
export default {
    name: "TemplateList",
    props: ["teamId", "visible"],
    watch: {
        teamId: function (val) {
            if (val) {
                this.getTemplateList();
            }
        },
    },
    data() {
        return {
            templates: [],
            editTmpName: "",
            loading: false,
        };
    },
    methods: {
        async getTemplateList() {
            this.loading = true;
            try {
                const res = await listRaidTemplate(this.teamId);
                this.templates = res.data.data.map((tmp) => {
                    tmp["editable"] = false;
                    return tmp;
                });
            } catch (e) {
                console.log(e);
            } finally {
                this.loading = false;
            }
        },
        // 删除模板
        removeTemplate(row) {
            deleteRaidTemplate(this.teamId, row.id)
                .then((res) => {
                    this.$message({
                        type: "success",
                        message: res.message || "删除模板成功",
                    });
                    this.getTemplateList();
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        // 修改模板
        editTemplate(row) {
            this.editTmpName = row.template_name;
            row.editable = true;
        },
        async handleEditConfirm(row) {
            try {
                await updateRaidTemplate(row.id, {
                    team_id: this.teamId,
                    template_name: this.editTmpName,
                });
                this.getTemplateList();
                row.editable = false;
            } catch (err) {
                console.log(error);
            }
        },
        handleEditCancel(row) {
            row.editable = false;
            this.editTmpName = "";
        },
        useTemplate(row) {
            this.$emit("apply", row);
        },
        handleClose() {
            this.templates.forEach((tmp) => (tmp.editable = false));
            this.$emit("close");
        },
        showTime,
        authorLink,
    },
};
</script>

<style scoped lang="less">
.u-op {
    .ml(5px);
}
.u-table-box {
    max-height: 600px;
    overflow: auto;
}
.u-author {
    .underline(@v4primary);
}
</style>
