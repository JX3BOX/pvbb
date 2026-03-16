<template>
    <div ref="main" class="main" id="main" :style="{ height: maxH + 'px' }">
        <div
            class="item"
            :class="[moveMode, styleArr[i] && styleArr[i].showClass]"
            v-for="(item, i) in list"
            :key="i"
            :ref="'item' + i"
            :style="styleArr[i]"
        >
            <slot :state="(styleArr[i] && styleArr[i].state) || 'loading'" :data="item" :index="i"></slot>
        </div>
        <iframe v-if="autoResize" ref="autoExpand" class="autoExpand"></iframe>
    </div>
</template>

<script>
export default {
    props: {
        list: {
            type: Array,
            default: () => [],
        },
        imgKey: {
            type: String,
            default: "src",
        },
        col: {
            type: Number,
            default: 0,
        },
        colWidth: {
            type: Number,
            default: 0,
        },
        autoResize: {
            type: Boolean,
            default: true,
        },
        fillBox: {
            type: Boolean,
            default: false,
        },
        moveMode: {
            type: String,
            default: "transform",
        },
        moveTransitionDuration: {
            type: Number,
            default: 0.4,
        },
        // 新增的边距参数
        gutter: {
            type: Number,
            default: 10, // 默认边距为 10px
        },
    },
    data() {
        return {
            styleArr: [],
            colW: 0,
            maxH: 1,
            mainW: 0,
            // eslint-disable-next-line vue/no-reserved-keys
            _col: 0,
            // eslint-disable-next-line vue/no-reserved-keys
            __col: 0,
            batchCB: null,
            onRender: null,
        };
    },
    computed: {
        resizeDebounce() {
            return this.debounce(this.resize, 100);
        },
        isTransition() {
            return this.autoResize && this.col < 1;
        },
    },
    mounted() {
        this.mainW = this.getWidth();
        this.init();
        this.polling();
        document.documentElement.style.setProperty("--gutter", `${this.gutter}px`);
    },
    watch: {
        "list.length": {
            deep: false,
            async handler(newV, oldV) {
                if (newV > oldV) {
                    await this.$nextTick();
                    this.batchCB = this.initItem(oldV);
                }
            },
        },
        autoResize: {
            handler(newV) {
                newV &&
                    setTimeout(() => {
                        this.$refs.autoExpand.contentWindow.onresize = (e) => {
                            this.resizeDebounce();
                        };
                    });
            },
            immediate: true,
        },
    },
    methods: {
        repaints(start = 0, duration) {
            this.mainW = this.getWidth();
            this.calcCol();
            this.calcXY(start, "repaints", duration);
        },
        init(start = 0) {
            this.calcCol();
            this.batchCB = this.initItem(start);
        },
        getWidth() {
            return this.$refs.main ? this.$refs.main.getBoundingClientRect().width : 0;
        },
        async resize(start = 0) {
            let width = this.getWidth();
            if (width === this.mainW) return;
            this.mainW = width;
            this.calcCol();
            if (this.autoResize && (this.fillBox || this.col || this.__col != this._col)) {
                this.calcXY(start, "resize");
            }
        },
        calcCol() {
            let col = 3;
            if (this.col) {
                col = this.col;
                this.colW = Math.floor((this.mainW - (col - 1) * this.gutter) / col);
            } else if (this.colWidth) {
                col = Math.max(parseInt(this.mainW / this.colWidth), 1);
                this.colW = col > 1 ? Math.floor(this.mainW / col) : this.colWidth;
            } else {
                this.colW = Math.floor((this.mainW - (col - 1) * this.gutter) / col);
            }
            this.__col = col;
        },
        polling() {
            // ... 现有 polling 方法
        },
        initItem(start = 0) {
            // ... 现有 initItem 方法
            list.forEach((e, i) => {
                let _i = i + start;
                if (!this.styleArr[_i]) {
                    this.styleArr[_i] = {};
                }
                this.styleArr[_i].width = `${this.colW}px`;
                this.styleArr[_i].gutter = `${this.gutter}px`; // 设置边距
                // ... 其他代码
            });
        },
        waitRender(start) {
            // ... 现有 waitRender 方法
        },
        async calcXY(index, cause, duration) {
            // ... 现有 calcXY 方法
            for (let i = index; i < this.styleArr.length; i++) {
                if (!this.styleArr[i] || !this.styleArr[i].complete) continue;
                // 更新样式以包含边距
                this.styleArr[i].marginBottom = `${this.gutter}px`;
            }
        },
        // ... 其他现有方法
    },
};
</script>

<style scoped>
.main {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    transition-property: height;
}
.main > .item {
    position: absolute;
    z-index: 1;
    opacity: 0;
    box-sizing: border-box;
    transform: translate3d(0, 0, 0);
    margin-bottom: var(--gutter, 10px); /* 使用 CSS 变量设置边距 */
}
.convention {
    transition-property: top, left;
}
.transform {
    transition-property: transform;
}
.show {
    opacity: 1 !important;
}
.main > .col {
    float: left;
}
.col > .item {
    width: 100%;
}
.autoExpand {
    opacity: 0;
    position: absolute;
    left: -100%;
    top: -100%;
    width: 100%;
    height: 100%;
    visibility: hidden;
    pointer-events: none;
}
</style>
