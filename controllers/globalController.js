import { getQueryTest } from "../config/db";

export const home = (req, res) => {
  getQueryTest({
    cb: results => {
      res.send(JSON.stringify(results));
      res.end();
    }
  });
};
export const search = (req, res) => res.send("Search");
export const join = (req, res) => res.send("Join");
export const login = (req, res) => res.send("Login");
export const logout = (req, res) => res.send("Logout");
