let app = new Vue({
    el: '#app',
    data: {
        movies: [],
        searchInput: ""
    },
    methods: {
        search(){
            if(this.searchInput === ""){
                this.movies = [];
            } else {
                const query = encodeURI(this.searchInput);
                const url = `https://api.themoviedb.org/3/search/movie?api_key=027db1a08822b62e35522e7cae42f3bf&language=it-IT&query=${query}`;
                axios.get(url)
                    .then(response => this.movies = response.data.results)
                    .catch(error => console.log(error));
                
            }
        },
        starsVote(vote){
            const stars = Math.ceil(vote / 2);
            const emptyStars = 5 - stars;
            return {stars, emptyStars};
        }
    }
});