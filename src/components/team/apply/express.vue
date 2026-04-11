<template>
    <el-form class="u-form" label-width="80px">
        <el-form-item label="收件人">
            <el-input v-model.lazy="name" placeholder="输入收件人姓名"></el-input>
        </el-form-item>
        <el-form-item label="收件电话">
            <el-input
                v-model.lazy="phone"
                placeholder="输入收件人电话"
                @keyup2="phone = phone.replace(/[^\d]/g, '')"
            ></el-input>
        </el-form-item>
        <el-form-item label="选择地区">
            <el-cascader size="large" placeholder="选择地区" :options="options" v-model.lazy="area"> </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址">
            <el-input type="textarea" placeholder="输入详细地址" v-model.lazy="address"></el-input>
        </el-form-item>
    </el-form>
</template>
<script>
import { regionData, CodeToText } from "element-china-area-data";
export default {
    name: "express",
    data: function () {
        return {
            options: regionData,
            name: "",
            phone: "",
            area: "",
            address: "",
        };
    },
    computed: {
        extend() {
            return {
                name: this.name,
                phone: this.phone,
                area: this.area,
                address: this.address,
            };
        },
    },
    watch: {
        extend: {
            deep: true,
            handler: function ({ name, phone, area, address }) {
                if (name && phone && area && address) {
                    address = area.map((item) => CodeToText[item]).join("") + address;
                    this.$emit("isEmit", {
                        name,
                        phone,
                        address,
                    });
                }
            },
        },
    },
    methods: {
        toNumber() {},
        reset() {
            this.name = "";
            this.phone = "";
            this.area = [];
            this.address = "";
        },
    },
};
</script>
<style lang="less" scoped>
.u-form {
    .el-input,
    .el-cascader {
        width: 220px;
    }
    .el-textarea {
        width: 360px;
    }
}

:deep(input::-webkit-outer-spin-button),
:deep(input::-webkit-inner-spin-button) {
    -webkit-appearance: none !important;
}
:deep(input[type="number"]) {
    -moz-appearance: textfield !important;
}
</style>
