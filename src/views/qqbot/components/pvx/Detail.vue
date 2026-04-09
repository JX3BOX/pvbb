<template>
    <div v-if="!isTreasure" class="p-qqrobot-pvx-detail">
        <div class="m-pvx__container">
            <AdventureSingle v-if="type === 'adventure'" :source-id="id" />
            <PetSingle v-else-if="type === 'pet'" :source-id="id" />
            <HorseSingle v-else-if="type === 'horse'" :source-id="id" />
            <ReputationSingle v-else-if="type === 'reputation'" :source-id="id" />
            <BookSingle v-else-if="type === 'book'" :source-id="id" />
            <MissingContent v-else :type="type" :id="id" />
            <PvxBottom v-if="supportedType" :type="type" :id="id"></PvxBottom>
        </div>
    </div>
    <Treasure v-else></Treasure>
</template>

<script>
import PvxBottom from "./Bottom.vue";
import Treasure from "./Treasure.vue";
import MissingContent from "./MissingContent.vue";
import AdventureSingle from "./AdventureSingle.vue";
import PetSingle from "./PetSingle.vue";
import HorseSingle from "./HorseSingle.vue";
import ReputationSingle from "./ReputationSingle.vue";
import BookSingle from "./BookSingle.vue";

export default {
    name: "QQRobotPvxDetail",
    components: {
        AdventureSingle,
        PetSingle,
        HorseSingle,
        ReputationSingle,
        BookSingle,
        PvxBottom,
        Treasure,
        MissingContent,
    },
    computed: {
        type() {
            return this.$route.query.type || "";
        },
        id() {
            return this.$route.query.id || "";
        },
        isTreasure() {
            return this.type === "treasure";
        },
        supportedType() {
            return ["adventure", "pet", "horse", "reputation", "book"].includes(this.type);
        },
    },
};
</script>

<style lang="less">
.p-qqrobot-pvx-detail {
    position: relative;
    width: 560px;
    box-sizing: border-box;
    .m-pvx__item {
        padding: 12px;
        border-radius: 8px;
        box-sizing: border-box;
        background: linear-gradient(to top, #383838 0%, #000000 100%);
        border: 1px solid #6e6e6e !important;
        box-shadow: inset 0px 10px 5px #000000;
        text-shadow: none !important;
        font-size: 10px;
    }
    .m-pvx__container {
        // margin: 0 auto;
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
    .m-wiki-post-empty {
        &.is-robot-empty {
            width: 100%;
            border-radius: 8px;
            box-sizing: border-box;
            background: linear-gradient(to top, #383838 0%, #000000 100%);
            border: 1px solid #6e6e6e !important;
            box-shadow: inset 0px 10px 5px #000000;
            text-shadow: none !important;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            padding: 12px;
            color: rgba(#fff, 0.75) !important;
        }
    }
}
</style>
