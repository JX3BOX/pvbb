<template>
    <div class="m-single-nav">
        <CommonAuthor :uid="uid"/>
    </div>
</template>

<script>
import CommonAuthor from "@jx3box/jx3box-ui/src/single/Author.vue";

export default {
    name: "single_nav",
    components: {
        CommonAuthor,
    },
    props: [],
    data: function() {
        return {
            
        };
    },
    computed: {
        uid : function (){
            return this.$store.state.user_id
        }
    },
    methods: {
        
    },
    mounted: function() {},
};
</script>

