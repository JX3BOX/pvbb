<template>
    <el-form class="u-form" label-width="80px">
        <el-form-item :label="$t('team.apply.recipient')">
            <el-input v-model.lazy="name" :placeholder="$t('team.apply.recipientName')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('team.apply.phone')">
            <el-input
                v-model.lazy="phone"
                :placeholder="$t('team.apply.phonePlaceholder')"
                @keyup2="phone = phone.replace(/[^\d]/g, '')"
            ></el-input>
        </el-form-item>
        <el-form-item :label="$t('team.apply.region')">
            <el-cascader size="large" :placeholder="$t('team.apply.region')" :options="options" v-model.lazy="area"> </el-cascader>
        </el-form-item>
        <el-form-item :label="$t('team.apply.address')">
            <el-input type="textarea" :placeholder="$t('team.apply.addressPlaceholder')" v-model.lazy="address"></el-input>
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
