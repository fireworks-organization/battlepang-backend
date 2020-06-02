import passport from "passport";
import dotenv from "dotenv";

export const home = (req, res) => res.send("Home");
export const search = (req, res) => res.send("Search");
export const join = (req, res) => res.send("Join");
export const login = (req, res) => res.send("Login");
export const logout = (req, res) => res.send("Logout");
