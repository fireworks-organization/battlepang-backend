import passport from "passport";
import dotenv from "dotenv";
import User from "../models/User"
import BankAccountNumber from "../models/BankAccountNumber"
dotenv.config();

export const bankAccountNumber = async (req, res) => {
  const {
    query: { },
  } = req;
  try {
    const paymentHistories = await PaymentHistory.find().populate("user");
    console.log(paymentHistories)
    res.status(200).send({ paymentHistories });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};
export const addBankAccountNumber = async (req, res) => {
  const {
    body: { data },
  } = req;
  const bankAccountNumberObj = data.bankAccountNumberObj;
  console.log(bankAccountNumberObj)
  try {
    let bankAccountNumberObjJSON = JSON.parse(bankAccountNumberObj);
    const findUser = await User.findOne({
      _id: bankAccountNumberObjJSON.user
    });
    if (!findUser) {
      const error = "등록 유저를 찾을 수 없습니다.";
      res.status(400).send({ error });
      return false;
    }
    const bankAccountNumber = new BankAccountNumber(bankAccountNumberObjJSON);
    const insertedBankAccountNumber = await bankAccountNumber.save();

    findUser.bankAccountNumbers = [...findUser.bankAccountNumbers, insertedBankAccountNumber._id];
    await findUser.save();
    res.status(200).send({ bankAccountNumberObj: insertedBankAccountNumber });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error });
  }
};