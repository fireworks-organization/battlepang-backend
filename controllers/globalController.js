import { getQueryTest } from "../config/db";

export const home = (req, res) => {
  getQueryTest({
    cb: params => {
      const { result, err } = params;
      if (result) {
        res.send(JSON.stringify(result));
      } else if (err) {
        res.status(500).send(err);
      }
      res.end();
    }
  });
};
export const search = (req, res) => res.send("Search");
export const join = (req, res) => res.send("Join");
export const login = (req, res) => res.send("Login");
export const logout = (req, res) => res.send("Logout");
