const https = require('https');
https.get("https://coderbyte.com/api/challenges/json/rest-get-simple", (response) => {
	console.log(response);
});
