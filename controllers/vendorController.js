import { Vendor } from "../helpers/databaseSchema/vendors.js";
import { Business } from "../helpers/databaseSchema/Business.js";
import { isEmpty } from "../helpers/functions/validation.js";


export const addVendor = async (req, res) => {
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
            .json({ message: "only employees can add new vendor" });
        else {
          const find_vendor = await Vendor.find({
            $and: [{ email }, { businessId: req.session.business._id }],
          });
          if (find_vendor.length > 0) {
            res.status(409).json({
              message: "your already have a vendor registered with this email",
            });
          } else {
            const new_vendor = new Vendor({
              name,
              email,
              number,
              businessId: req.session.business._id,
              address,
            });
            const result = await new_vendor.save();
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

export const deleteVendor = async (req, res) => {
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
          res.status(401).json({ message: "only admin can delete a vendor" });
        else {
          await Vendor.deleteOne({
            businessId: req.session.business._id,
            email,
          });
          const found_vendor = await Vendor.find({
            businessId: req.session.business._id,
          });
          res.status(200).json({ result: found_vendor });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "an error occured" });
  }
};

export const getAllVendors = async (req, res) => {
  try {
    const found_vendor = await Vendor.find({
      businessId: req.session.business._id,
    });
    if (!found_vendor)
      res
        .status(200)
        .json({ message: "no vendor has been registered  for this business" });
    else res.status(200).json({ result: found_vendor });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured" });
  }
};

export const editVendor = async (req, res) => {
  const { name, email, number, address, vendorId } = req.body;
  console.log("editing vendor info now");
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
            .json({ message: "only employees can remove  vendor" });
        else {
          const found_vendor = await Vendor.findOne({ _id: vendorId });
          if (!found_vendor)
            res.status(404).json({ message: "No vendor tied to this id " });
          else {
            if (found_vendor.email !== email) {
              const find_vendor = await Vendor.find({
                $and: [{ email }, { businessId: req.session.business._id }],
              });
              if (find_vendor.length > 0) {
                return res.status(409).json({
                  message:
                    "your already have a vendor registered with this email",
                });
              }
            }
            await found_vendor.updateOne({ name, email, address, number });
            const result = await Vendor.find({
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
