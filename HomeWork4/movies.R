library("ggplot2")
data("movies")

convert2genre <- function (r){
  genre = "Misc"
  if(r[18] == 1){
    genre = "Action"
  }else if(r[19] == 1){
    genre = "Animation"
  }else if(r[20] == 1){
    genre = "Comedy"
  }else if(r[21] == 1){
    genre = "Drama"
  }else if(r[22] == 1){
    genre = "Documentary"
  }else if(r[23] == 1){
    genre = "Romance"
  }else if(r[24] == 1){
    genre = "Short"
  }
  
  genre

}

new_col <- apply(movies,1,convert2genre)
data_new <- movies[,c("year","length","rating")]
data_new$genre <- new_col

write.csv(data_new, file="movies.csv")


