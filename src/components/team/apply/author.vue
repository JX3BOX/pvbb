<template>
    <el-form class="m-author-form" label-width="110px">
        <el-form-item>
            <el-button class="u-add-author" type="success" @click="addAuthor" icon="Plus">{{ $t("team.apply.addAuthor") }}</el-button>
        </el-form-item>
        <el-form-item v-for="(item, index) in authors" :key="index" :label="$t('team.apply.contractedAuthor')">
            <el-input class="u-author" :placeholder="$t('team.apply.authorUid')" v-model.lazy="authors[index]">
                <template #prepend>https://www.jx3box.com/author/</template>
            </el-input>
            <el-button class="u-add-author" type="danger" @click="delAuthor(index)">{{ $t("team.apply.delete") }}</el-button>
        </el-form-item>
        <el-form-item :label="$t('team.apply.remark')">
            <el-input type="textarea" rows="2" resize="none" :placeholder="$t('team.apply.fillInfo')" v-model.lazy="desc"> </el-input>
        </el-form-item>
    </el-form>
</template>
<script>
export default {
    name: "author",
    data: function () {
        return {
            authors: [],
            desc: "",
        };
    },
    computed: {
        extend() {
            return {
                desc: this.desc,
                authors: this.authors.filter((l) => l),
            };
        },
    },
    watch: {
        extend: {
            deep: true,
            handler: function ({ desc, authors }) {
                if (desc) {
                    let _data = { desc };
                    if (authors.length) _data.authors = authors;
                    this.$emit("isEmit", _data);
                }
            },
        },
    },
    methods: {
        // 添加作者
        addAuthor() {
            this.authors.push("");
        },
        // 删除作者
        delAuthor(key) {
            this.authors.splice(key, 1);
        },
        reset() {
            this.authors = [];
            this.desc = "";
        },
    },
};
</script>
<style lang="less">
.m-author-form {
    .pr(20px);
    .el-form-item__content {
        .flex;
    }
    .u-author .el-input__inner {
        .w(110px);
    }
}
</style>
