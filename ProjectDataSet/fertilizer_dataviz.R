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