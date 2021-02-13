<style></style>

<template>
    <div class="container">
        <ServerTemplatedComponent
            :content="content"
            :components-defs="defs"
            :extract-content="extractSelector('.page-content')"
        />
    </div>
</template>

<script>
import ServerTemplatedComponent, {
    extractSelector,
} from "~/components/ServerTemplatedComponent";
import { getWagtailPageFromRoute } from "~/utils/content";

const BlockOne = {};

const BlockTwo = {
    data() {
        return { clicks: 0 };
    },

    methods: {
        increment() {
            this.clicks += 1;
        },
    },
};

const BlockThree = {};

export default {
    components: { ServerTemplatedComponent },

    data() {
        return { content: null, extractSelector };
    },

    computed: {
        defs() {
            return { BlockOne, BlockTwo, BlockThree };
        },
    },

    async asyncData({ route }) {
        return {
            content: await getWagtailPageFromRoute(route),
        };
    },
};
</script>
