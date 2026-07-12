<template>
    <div class="m-archive-search m-content-search">
        <el-input
            v-model.trim="keywordModel"
            :placeholder="placeholder"
            clearable
            size="large"
            @keydown.enter="$emit('search')"
            @clear="$emit('search')"
        >
            <template #prefix><i class="el-icon-search"></i></template>
            <template #suffix>
                <el-switch
                    v-model="starModel"
                    class="u-star"
                    :inactive-value="0"
                    :active-value="1"
                    inline-prompt
                    :active-text="featuredLabel"
                    :inactive-text="featuredLabel"
                />
            </template>
        </el-input>
    </div>
</template>

<script>
export default {
    name: "ContentSearchBar",
    props: {
        keyword: {
            type: String,
            default: "",
        },
        star: {
            type: Number,
            default: 0,
        },
        placeholder: {
            type: String,
            default: "",
        },
        featuredLabel: {
            type: String,
            default: "",
        },
    },
    emits: ["update:keyword", "update:star", "search"],
    computed: {
        keywordModel: {
            get() {
                return this.keyword;
            },
            set(value) {
                this.$emit("update:keyword", value);
            },
        },
        starModel: {
            get() {
                return this.star;
            },
            set(value) {
                this.$emit("update:star", value);
            },
        },
    },
};
</script>
