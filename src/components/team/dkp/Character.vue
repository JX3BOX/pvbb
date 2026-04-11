<template>
    <div class="m-team-character_wrapper">
        <img class="u-character-logo" :src="showSchoolIcon(xf)" />
        <span class="u-character-name">
            {{ name }}
        </span>
    </div>
</template>

<script>
import { __imgPath } from "@/utils/config";
import { showSchoolIcon } from "@/utils/filters";

export default {
    name: "Character",
    props: {
        xf: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
    },
    methods: {
        showSchoolIcon,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/dkp/character.less";
</style>
