<template>
    <div class="m-topic-pagination">
        <el-button
            class="m-topic-pages"
            :style="{ fontSize: hasNextPage ? '14px' : '12px' }"
            :type="hasNextPage ? 'primary' : 'text'"
            @click="appendPage"
            :loading="loading"
            :disabled="!hasNextPage"
            :icon="hasNextPage ? 'el-icon-arrow-down' : ''"
        >
            {{ hasNextPage ? "加载更多" : "没有更多了" }}
        </el-button>
        <el-pagination
            class="m-community-pages"
            background
            layout="total, prev, pager, next, jumper"
            :hide-on-single-page="true"
            :page-size="per"
            :total="total"
            :current-page.sync="localCurrentPage"
            @current-change="handlePageChange"
        ></el-pagination>
    </div>
</template>

<script>
export default {
    name: "PaginationComponent",
    props: {
        per: {
            type: Number,
            default: 10,
        },
        total: {
            type: Number,
            required: true,
        },
        currentPage: {
            type: Number,
            default: 1,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        hasNextPage: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            localCurrentPage: this.currentPage,
        };
    },
    watch: {
        currentPage(newVal) {
            this.localCurrentPage = newVal;
        },
    },
    methods: {
        appendPage() {
            this.$emit("append-page");
        },
        handlePageChange(page) {
            this.localCurrentPage = page;
            this.$emit("update:currentPage", page);
            this.$emit("current-change", page);
        },
    },
};
</script>
