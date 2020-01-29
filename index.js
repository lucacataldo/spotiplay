var express = require("express");
var app = express();
var request = require("request");
var querystring = require("querystring");
var btoa = require("btoa");

require("dotenv").config();

var client_id = process.env.id;
var client_secret = process.env.secret;

app.get("/login", function(req, res) {
  var scopes = "user-read-private user-read-email";

  var redirect_uri = "http://localhost/callback/";
  res.redirect(
    "https://accounts.spotify.com/authorize" +
      "?response_type=code" +
      "&client_id=" +
      client_id +
      (scopes ? "&scope=" + encodeURIComponent(scopes) : "") +
      "&redirect_uri=" +
      encodeURIComponent(redirect_uri)
  );
});

app.get("/callback", (req, respond) => {
  code = req.query.code;

  request.post(
    {
      headers: {
        Authorization: "Basic " + btoa(client_id + ":" + client_secret)
      },
      url: "https://accounts.spotify.com/api/token",
      form: {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: "http://localhost/callback/"
      }
    },
    function(err, res, body) {
      console.log(res.statusCode);

      if (!err && res.statusCode == 200) {
		  
		body = JSON.parse(body);
		
		request({
			headers: {
				"Authorization": "Bearer " + body.access_token
			},
			url: "https://api.spotify.com/v1/me"
		}, (err, res, body)=>{
			console.log(res.statusCode);
			if(!err && res.statusCode == 200){
				respond.json(JSON.parse(body));
			} else{
				respond.redirect("/login")
			}
			
		})
      } else {
		console.error(err);
		respond.redirect("/login")
      }
    }
  );
});

app.listen(80, () => {
  console.log("listening");
});
