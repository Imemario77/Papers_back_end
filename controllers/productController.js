import { Product } from "../helpers/databaseSchema/Product.js";
import { isEmpty, isMatch } from "../helpers/functions/validation.js";
import { Business } from "../helpers/databaseSchema/Business.js";

export const createProduct = async (req, res) => {
  const { image, description, name, amount, stock } = req.body;

  if (isEmpty(name) || isEmpty(amount) || isEmpty(stock) || isEmpty(image))
    res.status(401).json({ message: "no field should be left empty" });
  else {
    try {
      const businessAccount = await Business.findOne({
        _id: req.session.business._id,
      });
      if (businessAccount) {
        if (!businessAccount.employees.includes(req.session.user._id))
          res
            .status(403)
            .json({ message: "only business emplpoyees add products" });
        else {
          if (amount < 1) {
            return res.status(401).json({
              message: "amount cant be a negative figure or lover than 1",
            });
          }
          const last_product = await Product.findOne({
            businessId: req.session.business._id,
          })
            .sort({ productId: -1 })
            .limit(1);
          console.log("find last product: ", last_product);
          const productId = last_product ? last_product.productId + 1 : 0;
          console.log(productId);
          const new_product = new Product({
            image,
            description,
            name,
            businessId: req.session.business._id,
            quantity: stock,
            amount,
            productId,
          });
          await new_product.save();
          res.status(200).json({ result: "Product was created sucessfully " });
        }
      } else
        res
          .status(404)
          .json({ message: "You are not register under any business" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "an error occured ewhen creeating this product" });
    }
  }
};

export const getAllProduct = async (req, res) => {
  try {
    const found_product = await Product.find({
      businessId: req.session.business._id,
    });
    if (!found_product)
      res.status(200).json({ message: "no product found for this id" });
    else res.status(200).json({ result: found_product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured" });
  }
};

const checkValidProductCode = (productId) => {
  let productCode = 0;
  const productIdNumber = productId.split(" ");
  productCode = parseInt(productIdNumber[1]);
  if (
    isNaN(productCode) ||
    productIdNumber[0] !== "PRDC" ||
    /[a-zA-Z]/.test(productIdNumber[1])
  ) {
    console.log("true");
    return { status: true };
  } else {
    console.log("false");
    return { status: false, productCode };
  }
};

export const deleteProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const productCodeResult = checkValidProductCode(productId);
    if (productCodeResult.status) {
      return res
        .status(400)
        .json({ message: "Invalid product code  " + productId });
    }

    const found_product = await Product.findOne({
      productId: productCodeResult.productCode,
      businessId: req.session.business._id,
    });
    console.log("product: ", found_product);
    if (!found_product)
      res.status(404).json({
        message: "No product found for this product code " + productId,
      });
    else {
      const found_business = await Business.findOne({
        _id: req.session.business._id,
      });
      if (!found_business) {
        res.status(404).json({ message: "No business found with this ID" });
      } else {
        if (!isMatch(found_business.adminId, req.session.user._id)) {
          return res.status(403).json({
            message: "Forbidden! only the admin can delete this products",
          });
        }
        await found_product.deleteOne();
        res
          .status(200)
          .json({ result: "deleted " + productId + " sucessfully" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured!" });
  }
};

export const restockProduct = async (req, res) => {
  const { quantity, productCode } = req.body;
  if (isEmpty(quantity) || isEmpty(productCode))
    return res.status(401).json({ message: "no field should be left empty" });
  if (parseInt(quantity) <= 0)
    return res.status(404).json({
      message: "Quantity can't be less than or equal to 0",
    });
  try {
    const productCodeResult = checkValidProductCode(productCode);
    if (productCodeResult.status) {
      return res
        .status(400)
        .json({ message: "Invalid product code  " + productCode });
    }
    const found_product = await Product.findOne({
      productId: productCodeResult.productCode,
      businessId: req.session.business._id,
    });
    if (!found_product)
      return res.status(404).json({
        message: "No product found for this product code " + productCode,
      });

    await found_product.updateOne({
      quantity: parseInt(found_product.quantity) + parseInt(quantity),
    });
    res.status(200).json({ result: "Updated " + productCode + " sucessfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "An error occured!" });
  }
};
