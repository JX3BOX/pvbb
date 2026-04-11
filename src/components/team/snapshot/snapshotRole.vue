<template>
    <el-form :inline="true" :rules="rules" ref="ruleForm" :model="form" class="demo-form-inline">
        <el-form-item label="角色名" prop="name">
            <el-input v-model="form.name" placeholder="角色名"></el-input>
        </el-form-item>
        <el-form-item label="心法" prop="xf">
            <el-select v-model="form.xf" placeholder="心法">
                <el-option v-for="item in xflist" :key="item.name" :label="item.name" :value="item.id"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item>
            <el-button type="success" @click="submitForm('ruleForm')"> <i class="el-icon-right"></i> 添加 </el-button>
        </el-form-item>
    </el-form>
</template>
<script>
import xfmap from "@jx3box/jx3box-data/data/xf/xf.json";

export default {
    name: "snapshotRole",
    props: [],
    data: function() {
        return {
            xfmap,
            form: {
                name: "",
                xf: "",
                key: "",
            },
            rules: {
                name: [
                    {
                        required: true,
                        message: "请输入角色名",
                        trigger: "blur",
                    },
                ],
                xf: [
                    {
                        required: true,
                        message: "请选择角色心法",
                        trigger: "change",
                    },
                ],
            },
        };
    },
    computed: {
        xflist() {
            let arr = [];
            for (const i in this.xfmap) {
                if (this.xfmap[i].id !== 0) {
                    arr.push(this.xfmap[i]);
                }
            }
            return arr;
        },
    },
    methods: {
        submitForm(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    let id = 0;
                    if (this.form.key !== "") {
                        id = this.form.key;
                    }
                    let role = {
                        name: this.form.name,
                        xf: this.form.xf,
                    };
                    this.$emit("change", role);
                    this.$refs[formName].resetFields();
                    this.form.key = "";
                } else {
                    return false;
                }
            });
        },
    },
};
</script>
