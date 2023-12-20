import { Router } from "express";
import {
  addExpenses,
  approveExpense,
  deleteExpense,
  getAllExpenses,
  getExpenseAmount,
  getExpenseChartData,
  getOneExpense,
} from "../controllers/expensesController.js";

const route = Router();

route.post("/add-expenses", addExpenses);
route.get("/get-all-expenses", getAllExpenses);
route.get("/get-one-expenses/:expenseId", getOneExpense);
route.get("/getAmount/:selectedTime", getExpenseAmount);
route.get("/getChartData/:selectedTime", getExpenseChartData);
route.put("/approve-expenses", approveExpense);
route.delete("/delete-expenses/:expenseId", deleteExpense);

export default route;
