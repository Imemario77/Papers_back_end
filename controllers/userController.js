import bcrypt from "bcryptjs";

import { User } from "../helpers/databaseSchema/user.js";
import { isEmpty } from "../helpers/functions/validation.js";
import { transporter } from "../helpers/functions/emailTransporter.js";
import { Otp } from "../helpers/databaseSchema/otp.js";

export const update_email = async (req, res) => {
  const { email } = req.body;
  try {
    const found_email = await User.findOne({
      email,
    });
    if (found_email)
      return res.status(409).json({ message: "email already exits" });

    const found_user = await User.findOne({
      _id: req.session.user._id,
    });
    if (!found_user)
      res.status(404).json({ message: "no user found for this id" });
    else {
      await found_user.updateOne({ email });
      const result = await User.findOne({ email });
      res.status(200).json({ result });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured" });
  }
};

export const update_firstName = async (req, res) => {
  const { firstName } = req.body;
  try {
    const found_user = await User.findOne({
      _id: req.session.user._id,
    });
    console.log(found_user);
    if (!found_user)
      res.status(404).json({ message: "no user found for this id" });
    else {
      await found_user.updateOne({ firstName });
      const result = await User.findOne({ _id: req.session.user._id });
      res.status(200).json({ result });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured" });
  }
};

export const update_lastName = async (req, res) => {
  const { lastName } = req.body;
  try {
    const found_user = await User.findOne({
      _id: req.session.user._id,
    });
    if (!found_user)
      res.status(404).json({ message: "no user found for this id" });
    else {
      await found_user.updateOne({ lastName });
      const result = await User.findOne({ _id: req.session.user._id });
      res.status(200).json({ result });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured" });
  }
};

export const update_number = async (req, res) => {
  const { number } = req.body;
  try {
    const found_user = await User.findOne({
      _id: req.session.user._id,
    });
    if (!found_user)
      res.status(404).json({ message: "no user found for this id" });
    else {
      await found_user.updateOne({ number });
      const result = await User.findOne({ _id: req.session.user._id });
      res.status(200).json({ result });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured" });
  }
};

export const update_password = async (req, res) => {
  const { prevPassword, newPassword } = req.body;
  if (isEmpty(prevPassword) || isEmpty(newPassword))
    return res.status(400).json({ message: "no field should be left empty" });
  try {
    const found_user = await User.findOne({
      _id: req.session.user._id,
    });
    if (!found_user)
      res.status(404).json({ message: "no user found for this id" });
    else {
      const comparePassword = await bcrypt.compare(
        prevPassword,
        found_user.password
      );
      if (!comparePassword)
        return res.status(401).json({ message: "prev password is incorrect" });

      // hash the password that the user provided
      const saltRound = 10;
      const hash_passoword = await bcrypt.hash(newPassword, saltRound);
      await found_user.updateOne({ password: hash_passoword });
      const result = await User.findOne({ _id: req.session.user._id });
      res.status(200).json({ result });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured" });
  }
};

export const resetPassword = async (req, res) => {
  if (!req.body.email)
    return res.status(400).json({ message: "no field should be left empty" });

  try {
    const found_user = await User.findOne({
      email: req.body.email,
    });
    if (!found_user)
      return res
        .status(404)
        .json({ message: "no account found for this email" });
    await Otp.deleteMany({ id: found_user._id });
    // generating and sending otp code
    const otpCode = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    try {
      const currentTime = new Date().getTime();
      const minutes = 10;
      const otpExpirationTime = minutes * 60000;
      const saveOtp = new Otp({
        otp: otpCode,
        id: found_user._id,
        created: currentTime,
        expries: currentTime + otpExpirationTime,
      });
      await saveOtp.save();
      const sentMail = await transporter(
        found_user.email,
        found_user.firstName + " " + found_user.lastName,
        otpCode,
        "Paper",
        "Password reset"
      );
      console.log(sentMail);
      if (sentMail === true) {
        res.status(200).json({
          message: "Otp has been sent to this email  " + found_user.email,
        });
      } else {
        res.status(500).json({
          message: "error processing otp try again",
        });
      }
    } catch (e) {
      res.status(500).json({
        message: "error processing otp try again",
      });
      console.log(e);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured" });
  }
};

export const deletePrevPasswordAndReset = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  if (password !== confirmPassword)
    return res.status(404).json({ message: "password's don't match" });
  try {
    try {
      const found_user = await User.findOne({
        email,
      });
      console.log(found_user);
      if (!found_user)
        res.status(404).json({ message: "no user found for this id" });
      else {
        // hash the password that the user provided
        const saltRound = 10;
        const hash_passoword = await bcrypt.hash(password, saltRound);
        await found_user.updateOne({ password: hash_passoword });
        res.status(200).json({ message: "password updated" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "An error occured" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured" });
  }
};
