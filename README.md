# weathergen API 

A standalone API for the R weathergen package, borrowed heavily from the work done by Jeff Walker on the [Climate Stress Tool](https://github.com/walkerjeffd/climate-stress-tool). To understand what you're using, I'd recommend reviewing the [Introduction to the weathergen Package](https://s3.amazonaws.com/walkerenvres.com/reports/academics/2015-umass-cee-weathergen/AppendixA-Introduction_to_the_weathergen_Package.pdf).

The R weathergen package is based on R scripts written by Scott Steinschneider. More information about the models these scripts employ can be found in Steinschneider and Brown (2013).

## Using the API

### What's exposed

You can use this API to call `wgen_daily()`, the workhorse function from in the weathergen package. `wgen_daily()` generates synthetic weather data for a single site based on historical data provided by the user, along with a set of inputs that specify changes in the statistics of the weather data compared to the historical data. 

You can call `wgen_daily()` either in single run or batch mode. Batch mode allows you to specify an array

These are the current arguments that are exposed, along with their defaults for a single run (formatted in JSON, as the API expects). If you wanted to run a batch run, you would provide an array of values for any of `dry_spell_changes`, `wet_spell_changes`, `prcp_mean_changes`, `prcp_cv_changes`, or `temp_mean_changes`.

```JSON
{
	"inputs": {
		"n_year": 10,
		"start_month": 10,
		"start_water_year": 2000, 
		"dry_spell_changes": 1,
		"wet_spell_changes": 1,
		"prcp_mean_changes": 1,
		"prcp_cv_changes": 1,
		"temp_mean_changes": 0
	},

	"data": {
		//...
	}
}
```

Arguments are explained in the [Introduction to the weathergen Package](https://s3.amazonaws.com/walkerenvres.com/reports/academics/2015-umass-cee-weathergen/AppendixA-Introduction_to_the_weathergen_Package.pdf)

### What you get

### Calling the API

#### Expected input format

// input

// data (required data? Wind?)

## Running the API

### Installation
Installation *should* be as simple as running

```bash
npm install
```
in the project directory. 

### Start-up

To run the API, navigate to the directory in three separate terminals. Run each of the following sets of commands in a separate terminal.

```bash
redis-server
```

```bash
cd worker
./run.sh
```

```bash
npm run dev # or "npm run start" in a production environment
```

### DevOps notes

- You'll need the AWS credentials to get this up and running on a new set-up. Email me if you need them (tbadams45@gmail.com). 

## It doesn't work!

Feel free to contact me at tbadams45@gmail.com with questions you may have.

## References

- Steinschneider, S., and C. Brown (2013), A semiparametric multivariate, multisite weather generator with low-frequency variability for use in climate risk assessments, Water Resour. Res., 49, 7205–7220. doi:[10.1002/wrcr.20528](http://dx.doi.org/10.1002/wrcr.20528).
