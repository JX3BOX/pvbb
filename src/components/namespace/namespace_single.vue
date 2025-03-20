<template>
    <div>

    </div>
</template>

<script>
import {getNamespaceDetail} from "@/service/namespace";
export default {
    name: "NamespaceSingle",
    props: [],
    data: function () {
        return {};
    },
    computed: {
        id : function (){
            return this.$route.params.id
        }
    },
    watch: {
        id: {
            handler: function (val) {
                getNamespaceDetail(val).then(res => {
                    if (res?.data?.data?.link) {
                        window.location.href = res.data.data.link
                    }
                })
            },
            immediate: true
        }
    },
};
</script>
