import { Business } from "../helpers/databaseSchema/Business.js";
import { Invoice } from "../helpers/databaseSchema/invoice.js";
import { ProductSales } from "../helpers/databaseSchema/productSales.js";
import { Sales } from "../helpers/databaseSchema/sales.js";
import { isEmpty, isMatch } from "../helpers/functions/validation.js";

export const createInvoice = async (req, res) => {
  const { salesId, remarks, dueDate, logo, status } = req.body;
  try {
    if (isEmpty(dueDate) || isEmpty(status)) {
      res.status(400).json({ message: "No field should be left empty" });
    } else {
      const found_business = await Business.findOne({
        _id: req.session.business._id,
      });
      if (!found_business) {
        res
          .status(404)
          .json({ message: "No business tied to this BUSINESS ID" });
      } else {
        if (!found_business.employees.includes(req.session.user._id)) {
          res.status(403).json({
            message:
              "Forbidden! You don't have access to add invoice, contact your admin",
          });
        } else {
          const found_sales = await Sales.findOne({ _id: salesId });
          const found_product_sales = await ProductSales.find(
            {
              salesId: salesId,
            },
            "_id"
          );
          console.log(found_product_sales);
          if (!found_sales)
            return res
              .status(404)
              .json({ message: "No sales found for this id provided" });
          if (found_sales.invoiced)
            return res
              .status(409)
              .json({ message: "this sales already has an invoice" });

          const new_invoice = new Invoice({
            dueDate,
            amount: found_sales.amount,
            salesId,
            productSalesId: found_product_sales,
            remarks,
            businessId: req.session.business._id,
            logo,
            status,
            recorderId: req.session.user._id,
            customerName: found_sales.customerName,
          });
          const result = await new_invoice.save();
          await found_sales.updateOne({ invoiced: true });
          res.status(201).json({ result });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "An error occured when creating the invoice" });
  }
};

export const getInvoiceAmount = async (req, res) => {
  const { selectedTime } = req.params;
  let timeSpan = new Date();
  timeSpan.setDate(timeSpan.getDate() - parseInt(selectedTime));
  try {
    const found_invoice = await Invoice.find(
      {
        dueDate: {
          $gte: timeSpan,
        },
        businessId: req.session.business._id,
        status: "Not Paid",
      },
      "amount"
    );
    if (found_invoice.length === 0)
      res.status(404).json({ message: "No invoice found for this ID" });
    else {
      var sumOfTime = 0;
      found_invoice.map((invoice) => {
        sumOfTime += invoice.amount;
      });
      res.status(200).json({ result: sumOfTime });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured!" });
  }
};

export const deleteInvoice = async (req, res) => {
  const { invoiceId } = req.params;
  try {
    const found_invoice = await Invoice.findOne({ _id: invoiceId });

    if (!found_invoice)
      res.status(404).json({ message: "No invoice found for this business" });
    else {
      const found_business = await Business.findOne({
        _id: req.session.business._id,
      });
      if (!found_business) {
        res.status(404).json({ message: "No business found with this ID" });
      } else {
        if (!isMatch(found_business.adminId, req.session.user._id)) {
          if (!isMatch(found_invoice.recorderId, req.session.user._id))
            return res.status(403).json({
              message:
                "Forbidden! only the admin or recorder can delete this invoices",
            });
        }
        await Invoice.deleteOne({ _id: invoiceId });

        const found_sales = await Sales.findOne({ _id: found_invoice.salesId });
        const updated_invoice = await Invoice.find({
          businessId: req.session.business._id,
        });

        await found_sales.updateOne({ invoiced: false });
        res.status(200).json({ result: updated_invoice });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured!" });
  }
};

export const getAllInvoices = async (req, res) => {
  try {
    const found_invoice = await Invoice.find({
      businessId: req.session.business._id,
    });
    if (!found_invoice)
      res.status(200).json({ message: "No invoice found for this business" });
    else res.status(200).json({ result: found_invoice });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured!" });
  }
};

export const getOneInvoice = async (req, res) => {
  const { invoiceId } = req.params;
  try {
    const found_invoice = await Invoice.findOne({ _id: invoiceId });
    if (!found_invoice)
      res.status(404).json({ message: "No invoice found for this ID" });
    else res.status(200).json({ result: found_invoice });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured!" });
  }
};
