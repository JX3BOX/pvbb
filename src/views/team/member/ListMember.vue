<template>
    <div class="v-member-list">
        <div class="m-filter m-title">
            <el-radio-group v-model="tab">
                <el-radio-button label="user">正式团员</el-radio-button>
                <el-radio-button label="pending">成员管理</el-radio-button>
            </el-radio-group>
            <!-- <div class="u-member-op">
                <a href="/tool/23785" class="u-help" target="_blank"> <i class="el-icon-info"></i> 帮助文档 </a>
            </div> -->
        </div>
        <component :is="activeComponent" :id="id" />
    </div>
</template>

<script>
import PendingList from "./PendingList.vue";
import RoleList from "./RoleList.vue";
import UserList from "./UserList.vue";
export default {
    props: ["id"],
    data: function () {
        return {
            tab: "user",
        };
    },
    computed: {
        activeComponent() {
            return this.tab === "pending" ? PendingList : UserList;
        },
    },
    components: {
        PendingList,
        RoleList,
        UserList,
    },
};
</script>

<style lang="less">
.v-member-list {
    .m-filter {
        .x;
        .mb(20px);
        .pr;
    }

    .u-member-op {
        .pa;
        .rt(0);
    }
}
.m-select-org {
    .ml(5px);
}
@media screen and (max-width: @phone) {
    .v-member-list {
        .u-op {
            .none;
        }
    }
}
</style>
