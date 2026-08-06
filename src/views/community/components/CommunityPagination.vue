<template>
    <div class="m-topic-pagination">
        <el-button
            class="m-topic-pages"
            :style="{ fontSize: isMobilePagination ? '13px' : hasNextPage ? '14px' : '12px' }"
            :type="hasNextPage ? 'primary' : 'info'"
            :link="!hasNextPage"
            @click="appendPage"
            :loading="loading"
            :disabled="!hasNextPage"
            :icon="hasNextPage ? 'ArrowDown' : ''"
            :size="isMobilePagination ? 'default' : 'large'"
        >
            {{ hasNextPage ? $t("pages.community.list.loadMore") : $t("pages.community.list.noMore") }}
        </el-button>
        <el-pagination
            class="m-community-pages"
            background
            :layout="isMobilePagination ? 'prev, pager, next' : 'total, prev, pager, next, jumper'"
            :pager-count="isMobilePagination ? 5 : 7"
            :hide-on-single-page="true"
            :page-size="per"
            :total="total"
            v-model:current-page="localCurrentPage"
            @current-change="handlePageChange"
        ></el-pagination>
    </div>
</template>

<script>
import responsivePagination from "@/mixins/responsive-pagination";

export default {
    name: "PaginationComponent",
    mixins: [responsivePagination],
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
