<style>
.x-block-two {
    background: #444;
    color: white;
}

.x-block-two button {
    border: 2px solid white;
    border-radius: 2px;
    padding: 15px;
    margin: 15px;
    background: antiquewhite;
    color: indigo;
}
</style>

<script>
export default {
    selector: '.x-block-two',

    data() {
        return { clicks: 0 };
    },

    methods: {
        increment() {
            this.clicks += 1;
        },
    },
}
</script>
