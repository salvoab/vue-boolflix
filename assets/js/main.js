let app = new Vue({
    el: '#app',
    data: {
        movies: [],
        tvShows: [],
        searchInput: ""
    },
    methods: {
        search(){
            if(this.searchInput === ""){
                this.movies = [];
            } else {
                const query = encodeURI(this.searchInput);
                //URL per film
                let url = `https://api.themoviedb.org/3/search/movie?api_key=027db1a08822b62e35522e7cae42f3bf&language=it-IT&query=${query}`;
                axios.get(url)
                    .then(response => this.movies = response.data.results)
                    .catch(error => console.log(error));
                
                //URL per serie TV
                url =`https://api.themoviedb.org/3/search/tv?api_key=027db1a08822b62e35522e7cae42f3bf&language=it_IT&query=${query}`;
                axios.get(url)
                    .then(response => this.tvShows = response.data.results)
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
        }
    }
});