<script>
import Thx from "@jx3box/jx3box-ui/src/single/Thx.vue";
import CollectionLike from "./collection_like.vue";

export default {
    name: "CollectionThx",
    extends: Thx,
    emits: ["stat-loaded"],
    components: {
        ...Thx.components,
        Like: CollectionLike,
    },
    provide() {
        return {
            onCollectionStatLoaded: (stat) => this.$emit("stat-loaded", stat),
        };
    },
};
</script>
