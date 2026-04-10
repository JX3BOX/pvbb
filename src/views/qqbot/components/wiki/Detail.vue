<template>
    <div class="p-qqrobot-wiki-detail">
        <div class="m-wiki__container">
            <CjSingle v-if="type === 'cj'" :source-id="id" />
            <KnowledgeSingle v-else-if="type === 'knowledge'" :source-id="id" />
            <QuestSingle v-else-if="type === 'quest'" :source-id="id" />
            <ItemSingle v-else-if="type === 'item'" :source-id="id" />
            <div v-else class="m-wiki-post-empty is-robot-empty">未找到对应的百科类型</div>
        </div>
    </div>
</template>

<script>
import CjSingle from "./CjSingle.vue";
import KnowledgeSingle from "./KnowledgeSingle.vue";
import QuestSingle from "./QuestSingle.vue";
import ItemSingle from "./ItemSingle.vue";

export default {
    name: "QQRobotWikiDetail",
    components: {
        CjSingle,
        KnowledgeSingle,
        QuestSingle,
        ItemSingle,
    },
    computed: {
        type() {
            return this.$route.query.type || "";
        },
        id() {
            return this.$route.query.id || "";
        },
    },
};
</script>

<style lang="less">
.p-qqrobot-wiki-detail {
    position: relative;
    width: 560px;
    background-color: #000;
    box-sizing: border-box;

    .m-wiki__container {
        margin: 0 auto;
        width: 560px;
        height: 100%;
        overflow: hidden;
        .r(12px);
        padding: 10px;
        box-sizing: border-box;
        color: rgba(#ffffff, 0.75);
        border: 0.5px solid transparent;
        background-clip: padding-box, border-box;
        background-origin: padding-box, border-box;
        background-image: linear-gradient(to top, rgba(64, 64, 64, 1), rgba(87, 87, 87, 1)),
            linear-gradient(to top, #000, rgba(255, 255, 255, 0.75));

        overflow-y: auto;
    }

    .m-wiki-post-empty.is-robot-empty {
        width: 100%;
        border-radius: 8px;
        box-sizing: border-box;
        background: linear-gradient(to top, #383838 0%, #000000 100%);
        border: 1px solid #6e6e6e;
        box-shadow: inset 0px 10px 5px #000000;
        padding: 12px;
        color: rgba(#ffffff, 0.75);
        font-size: 12px;
        text-align: center;
    }
}
</style>
