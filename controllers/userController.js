import dotenv from "dotenv";
import routes from "../routes";
import User from "../models/User";
dotenv.config();
export const users = (req, res) => res.send("Users");
export const userDetail = (req, res) => res.send("User Detail");
export const editProfile = (req, res) => res.send("Edit Profile");
export const changePassword = (req, res) => res.send("Change Password");
export const postJoin = async (req, res, next) => {
    const {
        body: {
            data
        }
    } = req;
    console.log(data)
    const { email, password, password2 } = data;
    if (password !== password2) {
        res.status(400).send({ error: "패스워드가 다릅니다." });
        next();
    } else {
        try {
            const findUser = await User.findOne({
                email
            });
            if (findUser) {
                res.status(400).send({ error: "이미 가입된 이메일 입니다." });
                next();
            } else {
                const user = await User({
                    email
                });
                await User.register(user, password);
                res.status(200).send(user);
                next();
            }

        } catch (error) {
            console.log(error);
            res.status(400).send({ error });
            next();
        }
    }
};