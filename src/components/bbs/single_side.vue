<template>
    <div class="m-single-side">
        <!-- <PostCollection v-if="showSideCollection" :store="collection_data"/> -->
        <PostTopic v-if="id" :type="type" :id="~~id" />
        <PostDirectory id="directory"/>
    </div>
</template>

<script>
import PostDirectory from '@jx3box/jx3box-common-ui/src/single/PostDirectory.vue'
// import PostCollection from '@jx3box/jx3box-common-ui/src/single/PostCollection.vue'
import PostTopic from "@jx3box/jx3box-common-ui/src/single/PostTopic.vue";
export default {
    name: "single_side",
    props: {
        id: {
            type: String,
            default: ""
        },
        type: {
            type: String,
            default: "bbs"
        }
    },
    data: function() {
        return {

        };
    },
    components : {
        PostDirectory,
        // PostCollection,
        PostTopic
    },
    computed : {
        hasDirectory : function (){
            return this.$store.state.extend?.directory
        },
        showSideCollection : function (){
            let hasCollection = this.$store.state.post?.post_collection
            let foldTopCollection = !this.$store.state.post?.collection_collapse
            return hasCollection && foldTopCollection
        },
        collection_data : function (){
            return this.$store.state.extend?.collection_data
        }
    }
};
</script>

<style lang="less">
.m-single-side {
    // padding: 20px;
}
.m-single-directory {
    .mb(20px);
}
</style>
