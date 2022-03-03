library(tidyverse)

# read in human trafficking data
dat <- read.csv("ctdc_data041420.csv")

# read in country codes to names
codes <- read.csv("country_codes.csv") %>%
  mutate(Alpha2 = trimws(Alpha.2.code),
         Alpha3 = trimws(Alpha.3.code)) %>%
  select(c("Country", "Alpha2", "Alpha3"))

# add country names to human trafficking data for both country of origin and exploitation
with_names <- dat %>% left_join(codes, by = c("citizenship" = "Alpha2")) %>%
  rename(citizenshipName = Country,
         citizenshipAlpha3 = Alpha3)

with_names <- with_names %>% left_join(codes, by = c("CountryOfExploitation" = "Alpha2")) %>%
  rename(CountryOfExploitationName = Country,
         CountryOfExploitationAlpha3 = Alpha3)

# save
write.csv(with_names, "ctdc_data_final.csv")
dat$citizenship
codes$Alpha2

trimws(codes$Alpha.2.code)
