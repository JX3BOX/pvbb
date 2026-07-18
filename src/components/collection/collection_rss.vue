<script>
import Rss from "@jx3box/jx3box-ui/src/interact/Rss.vue";
import { getCollectionRss, subscribeCollection, unsubscribeCollection } from "@/service/rss";

export default {
    name: "CollectionRss",
    extends: Rss,
    computed: {
        getRssFn() {
            return getCollectionRss;
        },
        subscribeFn() {
            return subscribeCollection;
        },
        unsubscribeFn() {
            return unsubscribeCollection;
        },
    },
};
</script>
