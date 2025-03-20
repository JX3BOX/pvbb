<template>
    <a :href="publish_link" class="u-publish el-button el-button--primary el-button--medium">
        <i class="el-icon-edit-outline"></i>
        <span>发布</span>
    </a>
</template>

<script>
import { publishLink, getAppType } from "@jx3box/jx3box-common/js/utils";
export default {
    name: "publishGate",
    props: [],
    data: function () {
        return {
            redirect_types : ['index','forum','notice','feedback', 'single']
        };
    },
    computed: {
        channel: function () {
            if(this.$route){
                let routename = this.$route.name
                if(this.redirect_types.includes(routename)){
                    routename = 'bbs'
                } else if (routename.includes('community')) {
                    routename = 'community'
                }
                return routename;
            }else{
                return 'bbs'
            }
        },
        publish_link: function () {
            return publishLink(this.channel)
        },
    },
    methods: {},
    mounted: function () {},
    components: {},
};
</script>
