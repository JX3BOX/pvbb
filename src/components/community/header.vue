<template>
    <div class="m-community-header">
        <div class="m-community-publish">
            <a class="u-publish" href="/publish/#/community" target="_blank"> </a>
        </div>
        <div
            class="m-community-header__tags"
            :style="{
                gridTemplateColumns: `repeat(${lineCount}, 1fr)`,
            }"
        >
            <el-popover
                popper-class="m-community-header__popover"
                v-for="(item, index) in showNavList"
                :key="index"
                :placement="(index + 1) / lineCount > 1 ? 'bottom' : 'top'"
                trigger="hover"
                :content="item.remark"
                :disabled="!item.remark"
            >
                <a
                    slot="reference"
                    :href="item.href || 'javascript:;'"
                    :class="`
                    ${selectedCategory === item.value && 'u-active'}
                    ${item.mark && 'has-mark'}
                    u-item`"
                    @click="handleChange(item)"
                    :style="{
                        '--hover-bg-color': item.hoverColor,
                        '--hover-color': item.color,
                    }"
                >
                    <span>{{ item.name }}</span>
                    <!-- <img -->
                        <!-- v-svg-inline -->
                        <!-- class="u-icon" -->
                        <!-- :src="require(`@/assets/img/community/category/${item.icon}.svg`)" -->
                    <!-- /> -->

                    <CategoryLottieMark class="u-mark" v-if="item.mark && item.mark_enable" :mark="item.mark"></CategoryLottieMark>

                    <!-- <img
                        v-if="item.mark && item.mark.indexOf('.svg') >= 0"
                        v-svg-inline
                        class="u-mark"
                        :style="{ color: item.color }"
                        :src="require(`@/assets/img/community/category/${item.mark}`)"
                    />
                    <img
                        v-else-if="item.mark"
                        class="u-mark"
                        :src="require(`@/assets/img/community/category/${item.mark}`)"
                    /> -->
                </a>
            </el-popover>

            <el-dropdown size="small" :disabled="moreNavList.length === 0">
                <a href="javascript:;" :class="`u-item u-more ${moreNavList.length === 0 && 'is-disabled'}`">
                    <span>更多</span>
                    <i class="el-icon-arrow-down"></i>
                </a>
                <el-dropdown-menu slot="dropdown" class="m-community-dropdown">
                    <el-dropdown-item
                        v-for="(item, index) in moreNavList"
                        :key="index"
                        :style="{
                            '--hover-bg-color': item.hoverColor,
                            '--hover-color': item.color,
                            '--active-color': item.activeColor || '#fff',
                        }"
                        class="m-community-dropdown__item"
                    >
                        <a
                            :href="item.href || 'javascript:;'"
                            :class="`${selectedCategory === item.value && 'active'} u-item`"
                            @click="handleChange(item)"
                        >
                            <span> {{ item.name }}</span>
                            <!-- <img
                                v-svg-inline
                                class="u-icon"
                                :src="require(`@/assets/img/community/category/${item.icon}.svg`)"
                            /> -->
                        </a>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
        <div class="m-community-header__special-box">
            <div class="m-community-header__special-list">
                <a href="/event" target="_blank">
                    <img src="@/assets/img/community/event.svg" alt="活动专题" />
                    <span>活动专题</span>
                </a>
                <a href="/topic" target="_blank">
                    <img src="@/assets/img/community/topic.svg" alt="资料片专题" />
                    <span>资料片专题</span>
                </a>
            </div>
            <img class="u-ewm" src="@/assets/img/community/ewm.png" alt="" srcset="" />
        </div>
    </div>
</template>

<script>
import CategoryLottieMark from "./category_lottie_mark.vue";
export default {
    name: "CommunityHeader",
    components: {
        CategoryLottieMark,
    },
    props: ["categoryList"],
    inject: ["onCategoryChange"],
    data() {
        return {
            selectedCategory: "",
            showNavList: [],
            moreNavList: [],
            hoveredItem: null,
            lineCount: 8,
        };
    },
    mounted() {
        window.addEventListener("resize", this.handleResize);
        this.handleResize();
    },
    beforeDestroy() {
        window.removeEventListener("resize", this.handleResize);
    },
    watch: {
        lineCount: function () {
            this.initNavList();
        },
        categoryList: {
            deep: true,
            immediate: true,
            handler: function () {
                this.initNavList();
            },
        },
        "$route.query": {
            deep: true,
            immediate: true,
            handler: function (query) {
                if (Object.keys(query).length) {
                    if (query.category) {
                        this.selectedCategory = query.category;
                    }
                }
            },
        },
    },
    methods: {
        handleResize() {
            if (window.innerWidth >= 520) {
                this.lineCount = 8;
            } else {
                this.lineCount = 5;
            }
        },
        initNavList() {
            const len = this.lineCount * 2 - 1;
            const categoryList = this.categoryList.map((item) => {
                if (item.value === "全部") {
                    return {
                        ...item,
                        value: "",
                    };
                } else {
                    return item;
                }
            });

            this.showNavList = categoryList.slice(0, len);
            this.moreNavList = categoryList.slice(len);
        },
        handleChange: function (item) {
            if (!item.href) {
                let selectedCategory = item.value;
                if (this.selectedCategory === selectedCategory) {
                    return;
                }
                this.selectedCategory = selectedCategory;
                this.onCategoryChange(selectedCategory);
            }
        },
    },
};
</script>

<style lang="less">
@import "../../assets/css/community/header.less";
</style>
