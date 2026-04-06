<template>
    <el-dialog :modelValue="editDialogVisible" width="30%" title="编辑活动" @close="$emit('close')">
        <el-form :model="editData" label-width="100px">
            <el-form-item label="活动名称">
                <el-input v-model="editData.activity_name" />
            </el-form-item>
            <el-form-item label="活动公告">
                <el-input v-model="editData.remark" />
            </el-form-item>
            <el-form-item label="活动状态">
                <el-select v-model="editData.status" placeholder="请选择活动状态">
                    <el-option
                        v-for="item in statusOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button type="primary" @click="handleEdit">确定</el-button>
                <el-button plain @click="$emit('close')">取消</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script>
import { updateActivity } from "@/service/qqbot";
export default {
    name: "EditDialog",
    data() {
        return {
            editData: {
                activity_name: "",
                remark: "",
                status: "",
            },
            statusOptions: [
                {
                    value: 1,
                    label: "招募中",
                },
                {
                    value: -1,
                    label: "已结束",
                },
            ],
        };
    },
    props: {
        editDialogVisible: {
            type: Boolean,
            default: false,
        },
        raidDetail: {
            type: Object,
            default: () => {},
        },
    },
    watch: {
        raidDetail: {
            handler(newVal) {
                this.editData = {
                    activity_name: newVal.game_activity_name,
                    remark: newVal.remark,
                    status: newVal.status,
                };
            },
            immediate: true,
        },
    },
    methods: {
        handleEdit() {
            updateActivity(this.$route.query.id, this.editData).then((res) => {
                this.$message.success("编辑成功");
                this.$emit("close");
                this.$emit("success");
            });
        },
    },
};
</script>
