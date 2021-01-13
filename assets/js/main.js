let app = new Vue({
    el: '#app',
    data: {
        movies: [],
        tvShows: [],
        searchInput: "",
        noMoviesResult: false,
        noTvShowsResult: false
    },
    methods: {
        search(){
            if(this.searchInput === ""){
                this.movies = [];
                this.tvShows = [];
            } else {
                const query = encodeURI(this.searchInput);
                //URL per film
                let url = `https://api.themoviedb.org/3/search/movie?api_key=027db1a08822b62e35522e7cae42f3bf&language=it-IT&query=${query}`;
                axios.get(url)
                    .then(response => {
                        this.movies = response.data.results;
                        this.noMoviesResult = isZero(response.data.total_results);
                    })
                    .catch(error => console.log(error));
                
                //URL per serie TV
                url =`https://api.themoviedb.org/3/search/tv?api_key=027db1a08822b62e35522e7cae42f3bf&language=it_IT&query=${query}`;
                axios.get(url)
                    .then(response => {
                        this.tvShows = response.data.results;
                        this.noTvShowsResult = isZero(response.data.total_results);
                    })
                    .catch(error => console.log(error));
            }
        },
        starsVote(vote){
            const stars = Math.ceil(vote / 2);
            const emptyStars = 5 - stars;
            return {stars, emptyStars};
        },
        isFlagImage(language){
            // Restituisce vero se la lingua è una di quelle presenti nella cartella img, falso altrimenti
            return language == 'en' || language == 'it' || language == 'es' || language == 'fr' || language == 'de';
        },
        formatOverview(overview){
            if(overview.length <= 130){
                return overview;
            }
            return overview.substring(0, 130) + '...';
        },
        getBackgroundCover(remotePath){
            if (remotePath == null){
                return '';
            }
            return `background-image: url(https://image.tmdb.org/t/p/w342${remotePath});`
        }
    }
});


function isZero(value){
    return value == 0;
}