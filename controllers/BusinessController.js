import bcrypt from "bcrypt";

import { ActiveLoginAccount } from "../helpers/databaseSchema/ActiveAccount.js";
import { Business } from "../helpers/databaseSchema/Business.js";
import { User } from "../helpers/databaseSchema/user.js";
import { isEmpty } from "../helpers/functions/validation.js";
import { Role } from "../helpers/databaseSchema/userRole.js";

export const addUserToBusiness = async (req, res) => {
  // get the email and password from the form field
  const { email, newUser, firstname, lastname, number, password, role } =
    req.body;
  if (newUser) {
    if (
      isEmpty(email) ||
      isEmpty(firstname) ||
      isEmpty(lastname) ||
      isEmpty(number) ||
      isEmpty(password) ||
      isEmpty(role)
    ) {
      return res.status(401).json({ message: "No field should be empty" });
    }
  } else {
    if (isEmpty(email) || isEmpty(role))
      return res.status(401).json({ message: "No field should be empty" });
  }
  try {
    // find the current business that is trying to be  acessed
    const found_business = await Business.findOne({
      _id: req.session.business._id,
    });
    if (found_business) {
      // making sure only the business owner can add a user
      if (found_business.adminId === req.session.user._id) {
        if (newUser) {
          // check if the email and number already exist on the database
          const email_found = await User.findOne({ email: email });
          const number_found = await User.findOne({ number: number });
          const saltRound = 10;
          const hash_passoword = await bcrypt.hash(password, saltRound);

          // if the email is found send an error messqage
          if (email_found) {
            return res
              .status(409)
              .json({ message: "this email is already in use" });
          } else {
            // if the number is found send an error messqage
            if (number_found) {
              return res
                .status(409)
                .json({ message: "this number is already in use" });
            } else {
              const new_user = new User({
                firstName: firstname,
                lastName: lastname,
                email,
                number,
                password: hash_passoword,
              });
              await new_user.save();
            }
          }
          // create a new user using the provided info
        }
        const found_user = await User.findOne({ email });

        if (found_user)
          if (!found_business) {
            res
              .status(404)
              .json({ message: "couldn't find any bussines tied to this id " });
          } else {
            if (found_business.employees.includes(found_user._id)) {
              res
                .status(409)
                .json({ message: "This user is already in your team" });
            } else {
              //check where this account is currentlly in a business
              const account_login_status = await ActiveLoginAccount.findOne({
                userId: found_user._id,
              });
              if (account_login_status) {
                return res
                  .status(409)
                  .json({ message: "This user is currently in another business" });
              }
              const account = await found_business.updateOne({
                $push: { employees: found_user._id },
              });
              if (account.acknowledged) {
                const updated_business = await Business.findOne({
                  _id: found_business._id,
                });
                const user_role = new Role({
                  role,
                  userId: found_user._id,
                  businessId: found_business._id,
                });
                await user_role.save();

                const currentBusinessAccount = new ActiveLoginAccount({
                  businessId: found_business._id,
                  userId: found_user._id,
                });

                await currentBusinessAccount.save();
                const account = {
                  name: found_business.name,
                  email: found_business.email,
                  description: found_business.description,
                };

                res.status(200).json({ account });
              }
            }
          }
        else
          res
            .status(404)
            .json({ message: "couldn't find any user with this email" });
      } else {
        res.status(403).json({
          message: "only business owner can add a user to the business",
        });
      }
    } else
      res
        .status(404)
        .json({ message: "couldn't find business try again later" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "an error occured" });
  }
};

export const removeUserFromBusiness = async (req, res) => {
  // get the email and password from the form field
  const { userId } = req.body;
  try {
    // find the current business that is trying to be  acessed
    const found_business = await Business.findOne({
      _id: req.session.business._id,
    });
    const found_user = await User.findOne({ _id: userId });
    if (found_user) {
      if (!found_business) {
        res
          .status(404)
          .json({ message: "couldn't find any bussines tied to this id " });
      } else {
        if (!found_business.employees.includes(userId)) {
          res
            .status(404)
            .json({ message: "This user is not a member of your team" });
        } else {
          if (found_business.adminId === userId) {
            res.status(403).json({ message: "you can't delete this Account" });
          } else {
            if (found_business.adminId === req.session.user._id) {
              const account = await found_business.updateOne({
                $pull: { employees: found_user._id },
              });
              await Role.deleteOne({ userId });
              await ActiveLoginAccount.deleteOne({ userId });
              if (account.acknowledged) {
                const updated_business = await Business.findOne({
                  _id: req.session.business._id,
                });
                const allWorkers = await User.find({
                  _id: { $in: updated_business.employees },
                });

                const allWorkersRoles = await Role.find({
                  businessId: req.session.business._id,
                });
                res.status(200).json({
                  result: {
                    staffs: allWorkers,
                    roles: allWorkersRoles,
                  },
                });
              }
            } else
              res
                .status(403)
                .json({ message: "Only business owner can delete a user" });
          }
        }
      }
    } else
      res.status(404).json({ message: "couldn't find any user with this id" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "an error occured" });
  }
};

export const createBusiness = async (req, res) => {
  // get  the form field
  const { businessName, description, businessEmail } = req.body;
  if (isEmpty(businessEmail) || isEmpty(businessName))
    res.status(400).json({ message: "no field should be left empty" });
  else
    try {
      // check if the email given is tied to another business
      const found_business = await Business.findOne({
        email: businessEmail,
      });

      if (found_business) {
        res
          .status(409)
          .json({ message: "this email is tied to another business account" });
      } else {
        const new_business = new Business({
          name: businessName,
          email: businessEmail,
          adminId: req.session.user._id,
          description: description,
          employees: [req.session.user._id],
        });

        const result = await new_business.save();
        const currentBusinessAccount = new ActiveLoginAccount({
          businessId: result._id,
          userId: req.session.user._id,
        });
        const account = {
          name: result.name,
          email: result.email,
          description: result.description,
        };

        const role = new Role({
          businessId: result._id,
          userId: req.session.user._id,
          role: "Business Owner",
        });

        await role.save();
        await currentBusinessAccount.save();
        res.status(201).json({ account });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "an error occured" });
    }
};

export const getBusinessDetails = async (req, res) => {
  // check if the user is currently in any bussiness account
  if (req.session.user) {
    const result = await ActiveLoginAccount.findOne({
      userId: req.session.user._id,
    });


    if (result)
      try {
        const businessAccount = await Business.findOne({
          _id: result.businessId,
        });
        if (businessAccount)
          if (!businessAccount.employees.includes(req.session.user._id))
            res
              .status(401)
              .json({ message: "only business emplpoyees can see business" });
          else {
            req.session.business = businessAccount;
            const account = {
              name: businessAccount.name,
              email: businessAccount.email,
              description: businessAccount.description,
            };
            res.status(200).json({ account });
          }
        else
          res
            .status(404)
            .json({ message: "You are not register under any business" });
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "an error occured" });
      }
    else
      res
        .status(404)
        .json({ message: "You are not register under any business" });
  } else {
    res.status(401).json({ message: "No user loged in" });
  }
};

export const allBusinessStaffs = async (req, res) => {
  try {
    const businessAccount = await Business.findOne({
      _id: req.session.business._id,
    });
    if (businessAccount)
      if (!businessAccount.employees.includes(req.session.user._id))
        res
          .status(401)
          .json({ message: "only business emplpoyees can see business" });
      else {
        const allWorkers = await User.find({
          _id: { $in: businessAccount.employees },
        });

        const allWorkersRoles = await Role.find({
          businessId: req.session.business._id,
        });
        res.status(200).json({
          result: {
            staffs: allWorkers,
            roles: allWorkersRoles,
          },
        });
      }
    else
      res
        .status(404)
        .json({ message: "You are not register under any business" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "an error occured" });
  }
};

export const updateUserRole = async (req, res) => {
  const { userId, role } = req.body;
  try {
    const businessAccount = await Business.findOne({
      _id: req.session.business._id,
    });
    const found_user_role = await Role.findOne({ userId });
    if (businessAccount)
      if (businessAccount.adminId !== req.session.user._id)
        res.status(403).json({ message: "only admin change change user role" });
      else {
        if (!found_user_role)
          res.status(404).json({ message: "no user found for this id" });
        else {
          if (businessAccount.adminId === userId)
            res.status(403).json({ message: "you can't edit this Account" });
          else {
            await found_user_role.updateOne({ role });
            const allWorkersRoles = await Role.find({
              businessId: req.session.business._id,
            });
            res.status(200).json({ result: allWorkersRoles });
          }
        }
      }
    else
      res
        .status(404)
        .json({ message: "You are not register under any business" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "an error occured" });
  }
};
