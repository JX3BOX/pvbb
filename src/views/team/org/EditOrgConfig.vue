<template>
    <div class="v-team-config">
        <!-- 快照密码 -->
        <snapshot-password :id="id"></snapshot-password>

        <!-- 团队海报 -->
        <team-banner :team-info="teamInfo"></team-banner>

        <!-- DKP制度 -->
        <dkp-rule></dkp-rule>
    </div>
</template>

<script>
import DkpRule from "../dkp/EditDkpRule.vue";
import EditPassword from "../snapshot/EditPassword.vue";
import TeamBanner from '@/components/team/org/team_banner.vue';
export default {
    name: "",
    props: ['teamInfo'],
    components: {
        "dkp-rule": DkpRule,
        "snapshot-password": EditPassword,
        "team-banner": TeamBanner,
    },
    data: function () {
        return {
            password: "",
        };
    },
    computed: {
        id: function () {
            return ~~this.$route.params.id;
        },
    },
    methods: {
        onSubmit() {},
    },
    filters: {},
    created: function () {},
    mounted: function () {},
};
</script>
