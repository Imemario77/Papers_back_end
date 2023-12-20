import { Business } from "../helpers/databaseSchema/Business.js";
import { isEmpty } from "../helpers/functions/validation.js";
import { Customer } from "../helpers/databaseSchema/customers.js";

export const addCustomer = async (req, res) => {
  const { name, email, number, address } = req.body;
  try {
    if (isEmpty(name) || isEmpty(email) || isEmpty(number) || isEmpty(address))
      res.status(400).json({ message: "no field should be left empty" });
    else {
      const found_business = await Business.findOne({
        _id: req.session.business._id,
      });
      console.log(found_business.employees.includes(req.session.user._id));
      if (!found_business)
        res.status(404).json({ message: "No business tied to this id " });
      else {
        if (!found_business.employees.includes(req.session.user._id))
          res
            .status(401)
            .json({ message: "only employees can add new customer" });
        else {
          const find_customer = await Customer.find({
            $and: [{ email }, { businessId: req.session.business._id }],
          });
          if (find_customer.length > 0) {
            res.status(409).json({
              message: "your already have a customer registered with this email",
            });
          } else {
            const new_customer = new Customer({
              name,
              email,
              number,
              businessId: req.session.business._id,
              address,
            });
            const result = await new_customer.save();
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

export const deleteCustomer = async (req, res) => {
  const { email } = req.params;

  try {
    if (isEmpty(email))
      res.status(400).json({ message: "no field should be left empty" });
    else {
      const found_business = await Business.findOne({
        _id: req.session.business._id,
      });
      if (!found_business)
        res.status(404).json({ message: "No business tied to this id " });
      else {
        if (!found_business.adminId === req.session.user._id)
          res.status(401).json({ message: "only admin can delete a customer" });
        else {
          await Customer.deleteOne({
            businessId: req.session.business._id,
            email,
          });
          const found_customer = await Customer.find({
            businessId: req.session.business._id,
          });
          res.status(200).json({ result: found_customer });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "an error occured" });
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    const found_customer = await Customer.find({
      businessId: req.session.business._id,
    });
    if (!found_customer)
      res
        .status(200)
        .json({ message: "no customer has been registered  for this business" });
    else res.status(200).json({ result: found_customer });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured" });
  }
};

export const editCustomer = async (req, res) => {
  const { name, email, number, address, customerId } = req.body;
  console.log("editing customer info now");
  try {
    if (isEmpty(name) || isEmpty(email) || isEmpty(number) || isEmpty(address))
      res.status(400).json({ message: "no field should be left empty" });
    else {
      const found_business = await Business.findOne({
        _id: req.session.business._id,
      });
      console.log(found_business.employees.includes(req.session.user._id));
      if (!found_business)
        res.status(404).json({ message: "No business tied to this id " });
      else {
        if (!found_business.employees.includes(req.session.user._id))
          res
            .status(401)
            .json({ message: "only employees can remove  customer" });
        else {
          const found_customer = await Customer.findOne({ _id: customerId });
          if (!found_customer)
            res.status(404).json({ message: "No customer tied to this id " });
          else {
            if (found_customer.email !== email) {
              const find_customer = await Customer.find({
                $and: [{ email }, { businessId: req.session.business._id }],
              });
              if (find_customer.length > 0) {
                return res.status(409).json({
                  message:
                    "your already have a customer registered with this email",
                });
              }
            }
            await found_customer.updateOne({ name, email, address, number });
            const result = await Customer.find({
              businessId: req.session.business._id,
            });
            res.status(200).json({ result });
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "an error occured" });
  }
};
