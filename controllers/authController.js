import bcrypt from "bcryptjs";

import { User } from "../helpers/databaseSchema/user.js";
import { isEmpty } from "../helpers/functions/validation.js";

export const loginController = async (req, res) => {
  // get the email and password from the form field
  const { email, password } = req.body;
  try {
    // check if any of the field is empty and send an error response
    if (isEmpty(email) || isEmpty(password)) {
      res.status(400).json({ message: "no field should be left empty" });
    } else {
      // get the email info from the database
      const found_user = await User.findOne({ email });

      // check if a user was found if no user send an error
      if (!found_user) {
        res.status(404).json({ message: "no user found for this email " });
      } else {
        // compare the password provided with the hash from found_user
        const comparePassword = await bcrypt.compare(
          password,
          found_user.password
        );
        // send an error if you recieve a false bool
        if (!comparePassword) {
          res.status(401).json({ message: "incorrect password" });
        } else {
          req.session.user = found_user;
          const result = {
            firstName: found_user.firstName,
            lastName: found_user.lastName,
            email: found_user.email,
            number: found_user.number,
            createdAt: found_user.createdAt,
          };
          // send the users login and account info
          res.status(201).json({ result });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "an error occured" });
  }
};

export const signUpController = async (req, res) => {
  const { firstname, lastname, email, password, confirmpassword, number } =
    req.body;

  try {
    // check if any of the field is empty and send an error response
    if (
      isEmpty(email) ||
      isEmpty(password) ||
      isEmpty(confirmpassword) ||
      isEmpty(firstname) ||
      isEmpty(lastname) ||
      isEmpty(number)
    ) {
      res.status(400).json({ message: "no field should be left empty" });
    } else {
      // check if the email and number already exist on the database
      const email_found = await User.findOne({ email: email });
      const number_found = await User.findOne({ number: number });

      // if the email is found send an error messqage
      if (email_found) {
        res.status(409).json({ message: "this email is already in use" });
      } else {
        // if the number is found send an error messqage
        if (number_found) {
          res.status(409).json({ message: "this number is already in use" });
        } else {
          //  check if the confirm password and  password are the same
          if (password !== confirmpassword) {
            res.status(400).json({ message: "the passwords doesn't match " });
          } else {
            // hash the password that the user provided
            const saltRound = 10;
            const hash_passoword = await bcrypt.hash(password, saltRound);

            // create a new user using the provided info
            const new_user = new User({
              firstName: firstname,
              lastName: lastname,
              email,
              number,
              password: hash_passoword,
            });

            // save the new user that was created to the database
            const saved_user = await new_user.save();
            req.session.user = saved_user;
            const result = {
              firstName: firstname,
              lastName: lastname,
              email,
              number,
              createdAt: saved_user.createdAt,
            };
            // send the users info
            res.status(201).json({ result });
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "an error occured" });
  }
};

export const logoutController = (req, res) => {
  req.session.destroy();
};
