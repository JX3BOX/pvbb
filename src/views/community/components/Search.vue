<template>
    <div class="m-search-wrapper" :class="{ 'u-sticky': inSearch }">
        <div :class="`m-community-search ${isFocus && 'is-focus'}`">
            <div class="m-search-button" @click="onSearch">
                <i class="el-icon-search"></i>
                <span class="u-button-text">搜一下</span>
            </div>
            <div class="m-search-input">
                <input
                    ref="input"
                    v-model="search"
                    @blur="onBlur"
                    @focus="isFocus = true"
                    v-on:keyup.enter="onSearch"
                    class="u-input"
                    placeholder="查找帖子"
                    type="text"
                />
            </div>
        </div>
        <div class="m-community-search__right">
            <slot name="right"></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: "CommunitySearch",
    data() {
        return {
            searchList: [],
            isFocus: false,
            search: "",
            inSearch: false,
        };
    },
    methods: {
        onSearch() {
            if (!this.isFocus && !this.inSearch) {
                this.$refs.input.focus();
                return;
            }
            this.inSearch = true;
            this.$emit("search", {
                q: this.search,
            });
        },
        onBlur() {
            if (!this.search && !this.inSearch) {
                this.isFocus = false;
            }
        },
        closeSearch() {
            this.search = "";
            this.isFocus = false;
            this.inSearch = false;
        },
    },
};
</script>

<style lang="less" scoped>
.m-search-wrapper {
    backdrop-filter: blur(10px);
    top: 100px;
    padding: 20px 32px;
    // .pr;
}
.u-sticky {
    position: sticky;
}
.m-community-search {
    width: 180px;
    height: 48px;
    position: relative;
    border-radius: 40px;
    border: 2px solid rgba(64, 128, 255, 1);
    transition: 0.4s;
    box-sizing: border-box;
    .m-search-button {
        position: absolute;
        transition: 0.3s;
        left: -2px;
        top: 0;
        width: 60px;
        border-radius: 40px;
        height: 100%;
        background: rgba(64, 128, 255, 1);
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        z-index: 10;
        cursor: pointer;
        &:hover {
            opacity: 0.9;
        }
        .u-button-text {
            width: 0;
            opacity: 0;
            margin-left: 8px;
            white-space: nowrap;
            display: none;
        }
    }
    .m-search-input {
        position: absolute;
        height: 100%;
        width: 100%;
        left: 0;
        top: 0;
        z-index: 0;
        padding-left: 60px;
        box-sizing: border-box;
        .u-input {
            width: 100%;
            height: 100%;
            border-radius: 40px;
            font-size: 18px;
            border: 0;
            box-sizing: border-box;
            padding: 0 12px;
        }
    }
}

.m-community-search.is-focus {
    width: 720px;
    .m-search-button {
        width: 120px;
        left: calc(100% - 115px);
        .el-icon-search {
            padding-left: 15px;
        }
        .u-button-text {
            display: block;
            width: 80px;
            opacity: 1;
        }
    }
    .m-search-input {
        padding-left: 0;
        .u-input {
            padding: 0 24px;
        }
    }
}

.m-community-search__right {
    .pa;
    right: 32px;
    top: 30px;
}
@media screen and (max-width: @ipad) {
    .m-search-wrapper {
        padding: 12px 15px;
    }
    .m-community-search.is-focus {
        width: 100%;
    }
    .m-community-search__right{
        top:20px;
    }
}
</style>
