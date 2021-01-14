let app = new Vue({
    el: '#app',
    data: {
        movies: [],
        tvShows: [],
        searchInput: "",
        noMoviesResult: false,
        noTvShowsResult: false,
        flagImages: ['en', 'it', 'es', 'fr', 'de'],
        moviesCastReady: false,
        moviesCast: [], // array di oggetti con chiavi id, cast[]
        moviesGenresReady: false,
        moviesGenres: [], // array di oggetti con chiavi id, genresString
        tvShowsCastReady: false,
        tvShowsCast: [], // array di oggetti con chiavi id, cast[]
        tvShowsGenresReady: false,
        tvShowsGenres: [] // array di oggetti con chiavi id, genresString
    },
    methods: {
        search(){
            // Ad ogni nuova ricerca elimino le info aggiuntive della ricerca precedente
            this.moviesCastReady=false;
            this.moviesCast.splice(0, this.moviesCast.length);
            this.moviesGenresReady=false;
            this.moviesGenres.splice(0, this.moviesGenres.length);
            this.tvShowsCastReady=false;
            this.tvShowsCast.splice(0, this.tvShowsCast.length);
            this.tvShowsGenresReady=false;
            this.tvShowsGenres.splice(0, this.tvShowsGenres.length);

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
                            this.getAllMoviesAndShowsCast('movie');
                            this.getAllGenresInThisPage('movie');
                        }
                    })
                    .catch(error => console.log(error));
                
                //URL per serie TV
                url =`https://api.themoviedb.org/3/search/tv?api_key=027db1a08822b62e35522e7cae42f3bf&language=it_IT&query=${query}`;
                axios.get(url)
                    .then(response => {
                        this.tvShows = response.data.results;
                        this.noTvShowsResult = isZero(response.data.total_results);
                        if(!this.noTvShowsResult){
                            this.getAllMoviesAndShowsCast('tv');
                            this.getAllGenresInThisPage('tv');
                        }
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
        getCredits(id, typeOfShow){
            if(typeOfShow === 'movie'){
                const url = `https://api.themoviedb.org/3/movie/${id}/credits?api_key=027db1a08822b62e35522e7cae42f3bf`;
                return axios.get(url);
            } else {
                const url = `https://api.themoviedb.org/3/tv/${id}/credits?api_key=027db1a08822b62e35522e7cae42f3bf`;
                return axios.get(url);
            }
        },
        getAllMoviesAndShowsCast(typeOfShow){
            const getRequests = [];
            if (typeOfShow === 'movie'){
                this.movies.forEach(movie => {
                    getRequests.push(this.getCredits(movie.id, 'movie'));
                });
            } else {
                this.tvShows.forEach(show => {
                    getRequests.push(this.getCredits(show.id, 'tv'));
                });
            }

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
                    if(typeOfShow === 'movie'){
                        this.moviesCast.push({id, cast});
                    } else {
                        this.tvShowsCast.push({id, cast});
                    }
                }) //parentesi del foreach

                if(typeOfShow === 'movie'){
                    this.moviesCastReady = true;
                } else {
                    this.tvShowsCastReady = true;
                }
            })
            .catch(error => console.log(error));
        },
        getCast(id, typeOfShow){
            if(this.moviesCastReady && typeOfShow === 'movie'){
                const cast = this.moviesCast.find(info => info.id == id).cast;
                return cast;
            }

            if(this.tvShowsCastReady && typeOfShow === 'tv'){
                const cast = this.tvShowsCast.find(info => info.id == id).cast;
                return cast;
            }
        },
        getDetails(id, typeOfShow){
            if(typeOfShow === 'movie'){
                const url = `https://api.themoviedb.org/3/movie/${id}?api_key=027db1a08822b62e35522e7cae42f3bf`;
                return axios.get(url);
            } else {
                const url = `https://api.themoviedb.org/3/tv/${id}?api_key=027db1a08822b62e35522e7cae42f3bf`;
                return axios.get(url);
            }
        },
        getAllGenresInThisPage(typeOfShow){
            const getRequests = [];
            
            if(typeOfShow === 'movie'){
                this.movies.forEach(movie => {
                    getRequests.push(this.getDetails(movie.id, typeOfShow));
                });
            } else {
                this.tvShows.forEach(show => {
                    getRequests.push(this.getDetails(show.id, typeOfShow));
                });
            }

            Promise.all(getRequests)
            .then(results => {
                results.forEach(result => {
                    let genresString = '';
                    const id = result.data.id;
                    result.data.genres.forEach(genre => genresString+= genre.name + ", ");
                    // Tolgo gli ultimi due caratteri: ', '
                    genresString = genresString.substring(0, genresString.length-2);
                    if(typeOfShow === 'movie'){
                        this.moviesGenres.push({id, genresString});
                    } else {
                        this.tvShowsGenres.push({id, genresString});
                    }
                }) //parentesi del foreach

                if(typeOfShow === 'movie'){
                    this.moviesGenresReady = true;
                } else {
                    this.tvShowsGenresReady = true;
                }
            })
            .catch(error => console.log(error));
        },
        getGenresString(id, typeOfShow){
            if(this.moviesGenresReady && typeOfShow === 'movie'){
                const genresString = this.moviesGenres.find(info => info.id == id).genresString;
                return genresString;
            }

            if(this.tvShowsGenresReady && typeOfShow === 'tv'){
                const genresString = this.tvShowsGenres.find(info => info.id == id).genresString;
                return genresString;
            }
        }
    }
});


function isZero(value){
    return value == 0;
}