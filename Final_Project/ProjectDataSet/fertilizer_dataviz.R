rm(list=ls())
# library("xlsx")
# 
# colNames <- c("Country", "Commodity", "Exports.Tons", "Exports.Dollars", "Imports.Tons", "Imports.Dollars")
# #for (year in 1990:2012){
#   year = 2012
#   temp_dat <- read.xlsx2("fertilizertradebyyear.xls", sheetName = toString(year))
#   
#   data <- temp_dat[2:nrow(temp_dat),c(-1)]
#   colnames(data) <- colNames
#   
#   write.csv(data, file = paste0("fertilizer_trade_",year,".csv"))
# #}

# For Multi Series Line Plot
imports_vol <- matrix(nrow=23,ncol=26)
exports_vol <- matrix(nrow=23,ncol=26)
imports_vol <- as.data.frame(imports_vol)
exports_vol <- as.data.frame(exports_vol)
i= 0
for (year in 1990:2012){
  i = i+1
  d <- read.csv(paste0("fertilizer_trade_",year,".csv"))
  imports_vol[i,1] <- year
  imports_vol[i,2:26] <- d[2:26,6]
  exports_vol[i,1] <- year
  exports_vol[i,2:26] <- d[2:26,4]
}

imports_vol <- imports_vol[6:23,]
colnames(imports_vol) <- c("year",as.character(d[2:26,3]))
colnames(exports_vol) <- c("year",as.character(d[2:26,3]))

write.csv(imports_vol, file = "fertilizer_imports_timeseries_volume.csv", row.names=F)
write.csv(exports_vol, file = "fertilizer_exports_timeseries_volume.csv", row.names=F)

# For Map
imports_vol <- matrix(nrow=24,ncol=192)
exports_vol <- matrix(nrow=24,ncol=26)
imports_vol <- as.data.frame(imports_vol)
exports_vol <- as.data.frame(exports_vol)

ccodes <- read.csv("country-codes.csv", header=T)

colNamesVec <- c("id")
for (c in 1:192){
  cFullName <- as.character(d[((26*(c-1))+27),2])
  id <- which(ccodes$name == cFullName)
  if (length(id) == 1 ){
    colNamesVec <- c(colNamesVec, as.character(ccodes[id,4]))
  }else{
    colNamesVec <- c(colNamesVec, cFullName)
  }
}

colNamesVec <- c("id")
for (c in 1:192){
  cFullName <- as.character(d[((26*(c-1))+27),2])
  colNamesVec <- c(colNamesVec, cFullName)
}
write.csv(colNamesVec, file = "temp.csv", row.names=F)



i = 1
for (year in 1990:2012){
  i = i+1
  d <- read.csv(paste0("fertilizer_trade_",year,".csv"))
  imports_vol[i,1] <- year
  exports_vol[i,1] <- year
  for (c in 1:192){
    imports_vol[i,(c+1)] = as.character(d[((26*(c-1))+27),6])
    exports_vol[i,(c+1)] = as.character(d[((26*(c-1))+27),4])
  }
}

imports_vol <- imports_vol[6:23,]
imports_vol[1,] <- colNamesVec

exports_vol[1,] <- colNamesVec

imports_vol_c <- t(imports_vol)

write.csv(t(imports_vol), file = "fertilizer_imports_timeseries_volume_byCountry.csv", row.names=F)
write.csv(t(exports_vol), file = "fertilizer_exports_timeseries_volume_byCountry.csv", row.names=F)
