<template>
    <div class="namespace-mobile" v-loading="loading">
        <div class="m-content" @scroll="handleScroll">
            <div
                v-for="namespace in displayList"
                :key="namespace.id"
                class="m-item"
                :class="{
                    long: namespace.isLong,
                }"
                @click="goNamespace(namespace.link)"
            >
                <div class="m-item-user">
                    <div class="m-item-user-name">
                        {{ (namespace.creator && namespace.creator.display_name) || "匿名" }}
                    </div>
                    <div class="m-item-user-time">{{ namespace.created | dataFormat }}</div>
                </div>
                <div class="m-item-info">
                    <div class="m-item-info-key">{{ namespace.key || "未知" }}</div>
                    <div class="m-item-info-desc">{{ namespace.desc || namespace.key || "未知" }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getNamespaceList } from "@/service/namespace.js";
import { showDate } from "@jx3box/jx3box-common/js/moment";

export default {
    name: "Namespace",
    props: [],
    data: function () {
        return {
            list: [],
            displayList: [],
            per: 24,
            total: 1,
            page: 1,
            search: "",
            query: "",
            loading: false,
        };
    },
    computed: {
        params: function () {
            return {
                page: this.page,
                per: this.per,
                sort: "updated",
            };
        },
    },
    filters: {
        dataFormat: function (val) {
            return (val && showDate(~~val * 1000)) || "-";
        },
    },
    methods: {
        handleScroll(event) {
            const { target } = event;
            if (this.loading) return;
            if (target.scrollHeight - target.scrollTop - 60 < target.clientHeight) {
                this.page = this.page + 1;
            }
        },
        loadNamespaceList: function () {
            this.loading = true;
            const params = this.removeEmpty(
                Object.assign({}, this.params, {
                    key: this.search,
                })
            );
            getNamespaceList(params)
                .then((res) => {
                    if (this.page == 1) {
                        this.list = res?.data?.data?.list;
                    } else {
                        this.list = [...this.list, ...res?.data?.data?.list];
                    }
                    this.total = res.data.data.total;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        onSearch: function () {
            if (this.page != 1) {
                this.page = 1;
                return;
            }
            this.loadNamespaceList();
        },
        removeEmpty: function (obj) {
            Object.keys(obj).forEach((key) => {
                if (obj[key] === null || obj[key] === undefined || obj[key] === "") {
                    delete obj[key];
                }
            });
            return obj;
        },
        goNamespace(link) {
            window.location.href = link;
        },
        processArray(array) {
            const processed = array.map((item) => {
                const isLong = item.key && item.key.length > 6;
                return {
                    ...item,
                    isLong,
                };
            });

            this.displayList = this.layoutItemsEnhanced(processed);
        },
        layoutItemsEnhanced(processed) {
            const items = processed;
            const result = [];

            // 模拟网格布局，每行2列
            let currentRow = [];
            let rowCount = 0;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];

                if (item.isLong) {
                    // 长项：需要单独占一行
                    // 如果当前行有短项，先把当前行处理完
                    if (currentRow.length > 0) {
                        // 当前行已经有短项，但还没满（应该只有一个短项）
                        // 找后面的短项来填满这一行
                        let foundShort = false;
                        for (let j = i + 1; j < items.length && !foundShort; j++) {
                            if (!items[j].isLong && !items[j].used) {
                                // 找到后面的短项，提前放到当前行
                                currentRow.push(items[j]);
                                items[j].used = true; // 标记已使用
                                foundShort = true;

                                // 把提前的短项从原位置移除
                                items.splice(j, 1);
                                i--; // 因为数组长度变了，需要调整索引
                            }
                        }

                        // 无论是否找到短项，都把当前行加入结果
                        result.push(...currentRow);
                        currentRow = [];
                        rowCount++;
                    }

                    // 长项自己占一行
                    result.push(item);
                    rowCount++;
                } else {
                    // 短项：添加到当前行
                    currentRow.push(item);

                    // 如果当前行满了（2个短项），加入结果并重置
                    if (currentRow.length === 2) {
                        result.push(...currentRow);
                        currentRow = [];
                        rowCount++;
                    }
                }
            }

            // 处理最后一行可能不满的情况
            if (currentRow.length > 0) {
                result.push(...currentRow);
            }

            return result;
        },
        getComplexLayout(array) {
            const result = [];
            let i = 0;

            while (i < array.length) {
                const current = array[i];

                if (current.isLong) {
                    // 如果是长项，检查前面的短项
                    if (i > 0 && !array[i - 1].isLong) {
                        // 长项前面有短项，长项单独处理
                        result.push({ type: "long-separator" });
                    }
                    result.push(current);
                } else {
                    result.push(current);
                }
                i++;
            }

            return result;
        },
    },
    watch: {
        params: {
            deep: true,
            immediate: true,
            handler: function (newVal) {
                this.query = "";
                this.loadNamespaceList();
            },
        },
        list: {
            deep: true,
            handler(newArray) {
                this.processArray(newArray);
            },
        },
    },
    created: function () {
        this.query = this.$route.query.namespace;
    },
};
</script>

<style lang="less">
@import "../assets/css/namespace/namespace-mobile.less";
</style>
