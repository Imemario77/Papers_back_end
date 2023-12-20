import { Router } from "express";
import { createInvoice, deleteInvoice, getAllInvoices, getInvoiceAmount, getOneInvoice } from "../controllers/invoiceController.js";

const route = Router();

route.post("/create", createInvoice);
route.get("/get-all-invoice", getAllInvoices);
route.get("/get-one-invoices/:invoiceId", getOneInvoice);
route.get("/getAmount/:selectedTime", getInvoiceAmount);
route.delete("/delete-invoices/:invoiceId", deleteInvoice);

export default route;
