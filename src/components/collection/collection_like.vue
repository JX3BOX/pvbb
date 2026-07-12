<script>
import Like from "@jx3box/jx3box-ui/src/interact/Like.vue";
import { getStat } from "@jx3box/jx3box-common/js/stat";

export default {
    name: "CollectionLike",
    extends: Like,
    inject: {
        onCollectionStatLoaded: {
            default: null,
        },
    },
    methods: {
        ...Like.methods,
        loadStat() {
            getStat(this.postType, this.postId).then((res) => {
                this.count = res.data.likes || 0;
                this.onCollectionStatLoaded?.(res.data);
            });
        },
    },
};
</script>
