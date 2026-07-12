<template>
    <ListLayout>
        <div class="v-joke v-content-page">
            <JokeSingle v-if="id" :id="id" />
            <JokeList v-else />
        </div>
    </ListLayout>
</template>

<script>
import ListLayout from "@/layouts/ListLayout.vue";
import JokeList from "./JokeList.vue";
import JokeSingle from "./JokeSingle.vue";

export default {
    name: "Joke",
    components: {
        ListLayout,
        JokeList,
        JokeSingle,
    },
    computed: {
        id() {
            return this.$route.params.id;
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/common/content-list.less";
@import "~@/assets/css/joke/joke.less";
</style>
