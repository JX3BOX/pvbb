<template>
    <SingleLayout>
        <single :id="id"></single>
    </SingleLayout>
</template>

<script>
import SingleLayout from '@/layouts/SingleLayout.vue';
import single from "@/components/bbs/single.vue";
import { getAppID } from "@jx3box/jx3box-common/js/utils";
export default {
    name: "Single",
    components: {
        single,
        SingleLayout,
    },
    data: function() {
        return {
            id : getAppID()
        };
    },
}
</script>
