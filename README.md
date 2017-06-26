# weathergen API 

A standalone API for the R weathergen package, borrowed heavily from the work done by Jeff Walker on the [Climate Stress Tool](https://github.com/walkerjeffd/climate-stress-tool). To understand what you're using, I'd recommend reviewing the [Introduction to the weathergen Package](https://s3.amazonaws.com/walkerenvres.com/reports/academics/2015-umass-cee-weathergen/AppendixA-Introduction_to_the_weathergen_Package.pdf).

The R weathergen package is based on R scripts written by Scott Steinschneider. More information about the models these scripts employ can be found in Steinschneider and Brown (2013).

## Using the API

### What's exposed

You can use this API to call `wgen_daily()`, the workhorse function from in the weathergen package. `wgen_daily()` generates synthetic weather data for a single site based on historical data provided by the user, along with a set of inputs that specify changes in the statistics of the weather data compared to the historical data. 

You can call `wgen_daily()` either in single run or batch mode. Batch mode allows you to specify an array

These are the current arguments that are exposed, along with their defaults for a single run (formatted in JSON, as the API expects). If you wanted to run a batch run, you would provide an array of values for any of `dry_spell_changes`, `wet_spell_changes`, `prcp_mean_changes`, `prcp_cv_changes`, or `temp_mean_changes`.

```javascript
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

Arguments are explained in the [Introduction to the weathergen Package](https://s3.amazonaws.com/walkerenvres.com/reports/academics/2015-umass-cee-weathergen/AppendixA-Introduction_to_the_weathergen_Package.pdf).

### Calling the API

Once the API is running, you can either a single or batch run by calling `API_IP_ADDRESS_OR_DOMAIN_NAME/api/wgen/single` or `API_IP_ADDRESS_OR_DOMAIN_NAME/api/wgen/batch`, respectively. Calls should be POST requests, and should include the inputs and historical data in a single json object as the body. When the run(s) are finished, the output will be a zip file containing the results of the run(s) and the inputs used to calculate that run. Simulation output data is stored in CSV format.

Runs can take a long time (~1-2 minutes for single runs and easily around 2 hours for batch runs). Therefore, when the API receives your request for a run, it will start a job that will perform the simulation run and send back a 202 Accepted response. The body of this response will contain a URI that you can poll with a GET request to find out when your job has been completed (i.e., at `API_IP_ADDRESS_OR_DOMAIN_NAME/URI`. When the job is done, the server will send a 303 See Other code, along with a location header that specifies where the URI where job results can be found. A GET request at this URI will return a zip file with the results of the job.

Putting it all together, submitting a job and polling for its task completion would look something like this. This example is written using Node and the request library to send the actual HTTP requests.

```javascript
var historical = require('./inputs_and_historical_data.json');
request(
	{
	    method: "POST",
	    url: "http://API_IP_ADDRESS_OR_DOMAIN_NAME/wgen/batch",
	    json: historical
	},
	function(error, response, body) {
	    if(response.statusCode === 202) { //accepted
		var uri = body;
		pollQueue(uri, 0, function(location) {
		    console.log("polled, and got " + location + " for location");
		    request({
			    method: 'GET',
			    url: "http://API_IP_ADDRESS_OR_DOMAIN_NAME" + location,
			    encoding: null
			}, function(error, response, body) {
			    fs.writeFile("/path/to/file/batch_results.zip", body, function() {
				console.log("wrote batch zip file");
			    });
			}
		    )
		});
	    }
	}
);

function pollQueue(uri, timesPolled, callback, lastTimeout) {
    console.log("timesPolled: ", timesPolled);
    if(timesPolled > 28800) {
        // 288800 is (60 sec/min * 60 min/hr * 24 hr) / 3 sec/poll. Aka 24 hours.
        throw 'ResourceWillNeverBeReady';
    }

    console.log("polling " + uri);
    request({
      url: "http://API_IP_ADDRESS_OR_DOMAIN_NAME/" + uri,
      followRedirect: false
    }, function (error, response, body) {
        if(response.statusCode === 303) {
            callback(response.headers.location);
            return;
        }
        setTimeout(function() { pollQueue(uri, timesPolled + 1, callback);}, 3000);
    });
}
```

### Expected input format

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
