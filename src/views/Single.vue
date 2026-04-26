<template>
    <SingleLayout>
        <SingleVue :id="id"></SingleVue>
    </SingleLayout>
</template>

<script>
import SingleLayout from '@/layouts/SingleLayout.vue';
import SingleVue from "@/components/bbs/single.vue";
import { getAppID } from "@jx3box/jx3box-common/js/utils";
export default {
    name: "Single",
    components: {
        SingleVue,
        SingleLayout,
    },
    data: function() {
        return {
            id : getAppID()
        };
    },
}
</script>
