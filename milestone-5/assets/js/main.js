let app = new Vue({
    el: '#app',
    data: {
        movies: [],
        tvShows: [],
        searchInput: "",
        noMoviesResult: false,
        noTvShowsResult: false,
        flagImages: ['en', 'it', 'es', 'fr', 'de'],
        moreMoviesDetailsReady: false,
        moviesInfo: [] // vettore di oggetti con chiavi id, cast[] e genre[]
    },
    methods: {
        search(){
            // Ad ogni nuova ricerca elimino le info aggiuntive della ricerca precedente
            this.moreMoviesDetailsReady=false;
            this.moviesInfo.splice(0, this.moviesInfo.length);

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
                        if(!this.noMoviesResult){
                            this.getMoreInfoForAllMovies();
                        }
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
            return this.flagImages.includes(language);
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
        },
        // Metodi per milestone 5
        getMoreInfo(id, typeOfShow){
            if(typeOfShow === 'movie'){
                const url = `https://api.themoviedb.org/3/movie/${id}/credits?api_key=027db1a08822b62e35522e7cae42f3bf`;
                return axios.get(url);
            }
        },
        getMoreInfoForAllMovies(){
            const getRequests = [];
            this.movies.forEach(movie => {
                getRequests.push(this.getMoreInfo(movie.id, 'movie'));
            });

            Promise.all(getRequests)
            .then(results => {
                results.forEach(result => {
                    const cast = [];
                    const id = result.data.id;
                    let actorCounter = 0;
                    while(actorCounter < 5 && result.data.cast[actorCounter] != undefined){
                        cast.push(result.data.cast[actorCounter]);
                        actorCounter++;
                    }
                    this.moviesInfo.push({id, cast});
                }) //parentesi del foreach

                this.moreMoviesDetailsReady = true;
            })
            .catch(error => console.log(error));
        },
        getCast(id){
            if(this.moreMoviesDetailsReady){
                const cast = this.moviesInfo.find(info => info.id == id).cast;
                return cast;
            }
        }
    }
});


function isZero(value){
    return value == 0;
}