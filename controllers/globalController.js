import passport from "passport";
import dotenv from "dotenv";

export const home = (req, res) => res.send("Home");
export const search = (req, res) => res.send("Search");
export const join = (req, res) => res.send("Join");
export const login = (req, res) => res.send("Login");
export const logout = (req, res) => res.send("Logout");

export const authLoginNaverCallback = (req, res, next) => {
  const {
    body: { data }
  } = req;
  const { accessToken } = data;
  const api_url = "https://openapi.naver.com/v1/nid/me";
  var request = require("request");
  var options = {
    url: api_url,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  };
  console.log(accessToken);
  request.get(options, function(error, response, body) {
    const responseDatas = JSON.parse(body).response;
    if (!error && response.statusCode == 200) {
      res
        .status(200)
        .json({ ...responseDatas })
        .end();
    } else {
      res.status(response.statusCode).end();
      console.log("error = " + response.statusCode);
    }
  });
};
