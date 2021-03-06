#!/usr/local/bin/Rscript

fail <- function(txt, status=1) {
  write(txt, file=stderr())
  q('no', status=status)
}

suppressPackageStartupMessages(library(dplyr))
suppressPackageStartupMessages(library(lubridate))
suppressPackageStartupMessages(library(weathergen))
suppressPackageStartupMessages(library(jsonlite))
suppressPackageStartupMessages(library(zoo))

# parse command line arguments
args <- commandArgs(trailingOnly = TRUE)

cat("Starting Weather Generator\n\n")

wd <- args[1]
if (!file.exists(wd)) {
  fail("Error: Working directory does not exist")
}
cat(paste0("Working Directory: ", wd), '\n\n')
setwd(wd)

# load inputs ----
cat('Loading parameters...')
inputs <- fromJSON('inputs.json')

inputs_names <- c("n_year","start_month","start_water_year","dry_spell_changes","wet_spell_changes","prcp_mean_changes","prcp_cv_changes","temp_mean_changes")
missing_inputs <- setdiff(inputs_names, names(inputs))
if (length(missing_inputs) > 0) {
  cat('\nFailed to load parameters\n')
  fail(paste0("Error: Missing input parameters (", paste(missing_inputs, collapse=','), ')'))
}

n_year <- inputs[['n_year']]
start_month <- inputs[['start_month']]
start_water_year <- inputs[['start_water_year']]
dry_spell_changes <- inputs[['dry_spell_changes']]
wet_spell_changes <- inputs[['wet_spell_changes']]
prcp_mean_changes <- inputs[['prcp_mean_changes']]
prcp_cv_changes <- inputs[['prcp_cv_changes']]
temp_mean_changes <- inputs[['temp_mean_changes']]
cat('done\n\n')

cat('Input Parameters:\n')
for (nm in inputs_names) {
  cat(' ', paste(nm, inputs[[nm]], sep=': '), '\n')
}
cat('\n')

# load data ----
cat("Loading input data...")
clim.da <- fromJSON('data.json')

clim.da$date <- ymd_hms(clim.da$date)

names(clim.da) <- toupper(names(clim.da))
clim.da$TEMP <- (clim.da$TMIN+clim.da$TMAX)/2

clim.mon <- group_by(clim.da, DATE=floor_date(DATE, 'month')) %>%
  summarise(PRCP=sum(PRCP),
            TMAX=mean(TMAX),
            TMIN=mean(TMIN),
            TEMP=mean(TEMP),
            WIND=mean(WIND))
clim.wyr <- group_by(clim.da, WYEAR=wyear(DATE, start_month=start_month)) %>%
  summarise(N=n(),
            PRCP=sum(PRCP),
            TMAX=mean(TMAX),
            TMIN=mean(TMIN),
            TEMP=mean(TEMP),
            WIND=mean(WIND))

complete_years <- clim.wyr$WYEAR[which(clim.wyr$N>=365)]

clim.da <- filter(clim.da, wyear(DATE, start_month=start_month) %in% complete_years)
clim.mon <- filter(clim.mon, wyear(DATE, start_month=start_month) %in% complete_years)
clim.wyr <- filter(clim.wyr, WYEAR %in% complete_years)
cat('done\n\n')

# annual sim ----
cat("Running weather generator...")
sim <- tryCatch({
  suppressWarnings(wgen_daily(obs_day = zoo(x = clim.da[, c('PRCP', 'TEMP', 'TMIN', 'TMAX', 'WIND')],
                                            order.by = clim.da[['DATE']]),
             n_year=n_year, n_knn_annual=100,
             dry_wet_threshold=0.3, wet_extreme_quantile_threshold=0.8,
             start_month=start_month, start_water_year=start_water_year, include_leap_days=FALSE,
             adjust_annual_precip=TRUE, annual_precip_adjust_limits=c(0.9, 1.1),
             dry_spell_changes=dry_spell_changes,
             wet_spell_changes=wet_spell_changes,
             prcp_mean_changes=prcp_mean_changes,
             prcp_cv_changes=prcp_cv_changes,
             temp_mean_changes=temp_mean_changes))
}, error = function(err) {
  cat("\n\nFailed to run weather generator:\n")
  cat(as.character(err), '\n')
  fail(as.character(err))
})
cat("done\n\n")


cat("Saving output to csv...")
select(sim$out, DATE, PRCP, TEMP, TMIN, TMAX, WIND) %>%
  write.csv(file='sim.csv', row.names=FALSE)
save(sim, file='sim.rda')
cat("done\n")
