import { Business } from "../helpers/databaseSchema/Business.js";
import { ProductSales } from "../helpers/databaseSchema/productSales.js";
import { Product } from "../helpers/databaseSchema/Product.js";
import { Sales } from "../helpers/databaseSchema/sales.js";
import { isEmpty, isMatch } from "../helpers/functions/validation.js";

export const createSales = async (req, res) => {
  const { saleDate, allProducts, totalSum, customerId } = req.body;

  if (
    isEmpty(saleDate) ||
    isEmpty(allProducts) ||
    isEmpty(totalSum) ||
    isEmpty(customerId)
  )
    return res.status(400).json({
      message: "No field should be left empty",
    });
  try {
    const businessAccount = await Business.findOne({
      _id: req.session.business._id,
    });
    if (businessAccount)
      if (!businessAccount.employees.includes(req.session.user._id))
        res.status(401).json({
          message:
            "only business emplpoyees can  perform actions to this business",
        });
      else {
        if (allProducts.length === 0)
          res.status(401).json({
            message: "There should al least one product to save sales",
          });
        else {
          const new_sales = new Sales({
            businessId: req.session.business._id,
            amount: totalSum,
            saleDate,
            customerId: customerId.split("CustomerName")[0],
            customerName: customerId.split("CustomerName")[1],
            productQuantity: allProducts.length,
          });
          const saved_sales = await new_sales.save();
          allProducts.forEach(async (product) => {
            const new_sales_product = new ProductSales({
              salesId: saved_sales._id,
              productId: product.name.split("ProductID")[1],
              quantity: product.quantity,
              unitAmount: product.unitAmount,
              totalAmount: product.totalAmount,
              productName: product.name.split("ProductID")[0],
            });
            new_sales_product.save();
            const found_product = await Product.findOne({
              _id: product.name.split("ProductID")[1],
              businessId: req.session.business._id,
            });
            await found_product.updateOne({
              quantity:
                parseInt(found_product.quantity) - parseInt(product.quantity),
            });
          });
          res.status(201).json({ result: saved_sales });
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

export const getAllSales = async (req, res) => {
  try {
    const businessAccount = await Business.findOne({
      _id: req.session.business._id,
    });
    if (businessAccount)
      if (!businessAccount.employees.includes(req.session.user._id))
        return res.status(401).json({
          message:
            "only business emplpoyees can  perform actions to this business",
        });
      else {
        const found_sales = await Sales.find({
          businessId: req.session.business._id,
        });
        res.status(200).json({ result: found_sales });
      }
    else
      res
        .status(404)
        .json({ message: "You are not register under any business" });
  } catch (error) {
    console.log(error);
  }
};

export const deleteOneSales = async (req, res) => {
  const { salesId } = req.params;
  try {
    const businessAccount = await Business.findOne({
      _id: req.session.business._id,
    });
    if (businessAccount)
      if (!businessAccount.employees.includes(req.session.user._id))
        return res.status(401).json({
          message:
            "only business emplpoyees can  perform actions to this business",
        });
      else {
        if (!isMatch(businessAccount.adminId, req.session.user._id))
          return res.status(403).json({
            message:
              "Forbidden! only the admin or recorder can delete this sales",
          });
        await Sales.deleteOne({
          _id: salesId,
        });

        await ProductSales.deleteMany({ salesId });
        const updated_sales = await Sales.find({
          businessId: req.session.business._id,
        });
        res.status(200).json({ result: updated_sales });
      }
    else
      res
        .status(404)
        .json({ message: "You are not register under any business" });
  } catch (error) {
    console.log(error);
  }
};

export const getSalesAmount = async (req, res) => {
  const { salesId, selectedTime } = req.params;
  let timeSpan = new Date();
  timeSpan.setDate(timeSpan.getDate() - parseInt(selectedTime));
  try {
    const found_sales = await Sales.find(
      {
        saleDate: {
          $gte: timeSpan,
        },
        businessId: req.session.business._id,
      },
      "amount"
    );
    if (found_sales.length === 0)
      res.status(404).json({ message: "No sales found for this ID" });
    else {
      var sumOfTime = 0;
      found_sales.map((sales) => {
        sumOfTime += sales.amount;
      });
      res.status(200).json({ result: sumOfTime });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured!" });
  }
};

export const getOneSales = async (req, res) => {
  const { salesId } = req.params;
  try {
    const found_sales = await Sales.findOne({ _id: salesId });
    const found_products_info = await ProductSales.find({ salesId });
    if (!found_sales && found_products_info.length <= 0)
      res.status(404).json({ message: "No sales found for this ID" });
    else
      res
        .status(200)
        .json({ result_A: found_sales, result_B: found_products_info });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured!" });
  }
};
