#year = 1990

library("RJSONIO")

makeList<-function(x){
  if(ncol(x)>2){
    listSplit<-split(x[-1],x[1],drop=T)
    lapply(names(listSplit),function(y){list(name=y,children=makeList(listSplit[[y]]))})
  }else{
    lapply(seq(nrow(x[1])),function(y){list(name=x[,1][y],size=x[,2][y])})
  }
}

for (year in 1995:2012){
  #i = i+1
  d <- read.csv(paste0("fertilizer_trade_",year,".csv"))

  cNames <- c()
  fNames <- c()
  vols <- c()

  for (i in 27:nrow(d)){
    
    type = as.character(d[i,3])
    vol = as.numeric(as.character(d[i,6]))
    
    if( type!= "Total" & !is.na(vol) & vol > 100){
      cNames <- c(cNames, as.character(d[i,2]))
      fNames <- c(fNames,type)
      vols <- c(vols,round(vol))
    }
  }

  imports_vol <- data.frame(Country=cNames, Fertilizer=fNames, Volume=vols)

  #imports_vol[i,1] <- year
  #exports_vol[i,1] <- year
  
  jsonOut<-toJSON(list(name="Imports",children=makeList(imports_vol)))
  #cat(jsonOut)
  write(jsonOut, paste0("imports_",toString(year),".json"))
  
}




