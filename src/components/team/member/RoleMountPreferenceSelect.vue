<template>
    <el-select
        class="m-team-role-mount-select"
        :model-value="normalizedValue"
        multiple
        filterable
        collapse-tags
        collapse-tags-tooltip
        :max-collapse-tags="3"
        :placeholder="$t('team.mountPreference.placeholder')"
        @update:model-value="updateValue"
    >
        <el-option v-for="mount in options" :key="mount.id" :label="mount.name" :value="Number(mount.id)">
            <span class="u-team-mount-option">
                <img :src="showMountIcon(mount.id)" :alt="mount.name" />
                <span>{{ mount.name }}</span>
                <small v-if="isUniversal(mount.id)">{{ $t("team.mountPreference.universal") }}</small>
            </span>
        </el-option>
    </el-select>
</template>

<script>
import {
    UNIVERSAL_TEAM_MOUNT_IDS,
    getRoleMountOptions,
    normalizeTeamMounts,
} from "@/utils/team-role-mounts";
import { showMountIcon } from "@/utils/filters";

export default {
    name: "RoleMountPreferenceSelect",
    props: {
        modelValue: {
            type: Array,
            default: () => [],
        },
        roleMount: {
            type: [Number, String],
            default: 0,
        },
    },
    emits: ["update:modelValue", "change"],
    computed: {
        client() {
            return this.$store?.state?.client || (location.href.includes("origin") ? "origin" : "std");
        },
        options() {
            return getRoleMountOptions(this.roleMount, this.client);
        },
        normalizedValue() {
            return normalizeTeamMounts(this.modelValue);
        },
    },
    methods: {
        updateValue(value) {
            const mounts = normalizeTeamMounts(value);
            this.$emit("update:modelValue", mounts);
            this.$emit("change", mounts);
        },
        isUniversal(mount) {
            return UNIVERSAL_TEAM_MOUNT_IDS.has(Number(mount));
        },
        showMountIcon,
    },
};
</script>

<style lang="less">
.m-team-role-mount-select {
    width: 100%;
}

.u-team-mount-option {
    display: flex;
    align-items: center;
    gap: 8px;

    img {
        width: 22px;
        height: 22px;
        object-fit: contain;
    }

    small {
        margin-left: auto;
        color: #909399;
        font-size: 11px;
    }
}
</style>
