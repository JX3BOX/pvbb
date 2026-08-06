export default {
    data() {
        return {
            isMobilePagination: false,
            paginationMediaQuery: null,
        };
    },
    mounted() {
        this.paginationMediaQuery = window.matchMedia("(max-width: 560px)");
        this.updatePaginationViewport(this.paginationMediaQuery);
        this.paginationMediaQuery.addEventListener("change", this.updatePaginationViewport);
    },
    beforeUnmount() {
        this.paginationMediaQuery?.removeEventListener("change", this.updatePaginationViewport);
    },
    methods: {
        updatePaginationViewport(event) {
            this.isMobilePagination = event.matches;
        },
    },
};
