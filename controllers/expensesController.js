import { Business } from "../helpers/databaseSchema/Business.js";
import { Expense } from "../helpers/databaseSchema/expenses.js";
import { Sales } from "../helpers/databaseSchema/sales.js";
import { isEmpty, isMatch } from "../helpers/functions/validation.js";

export const addExpenses = async (req, res) => {
  const { category, attachment, amount, vendor, remarks, date } = req.body;
  try {
    if (
      isEmpty(category) ||
      isEmpty(amount) ||
      isEmpty(remarks) ||
      isEmpty(vendor)
    ) {
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
              "Forbidden! You don't have access to add expenses, contact your admin",
          });
        } else {
          if (amount < 1) {
            res.status(400).json({
              message: "Invalid! amount must be greater than 1",
            });
          } else {
            const new_expenses = new Expense({
              category,
              attachment,
              date,
              amount,
              vendor,
              remarks,
              businessId: req.session.business._id,
              recorderId: req.session.user._id,
            });
            const result = await new_expenses.save();
            res.status(201).json({ result });
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "An error occured when creating the expense" });
  }
};

export const getAllExpenses = async (req, res) => {
  try {
    const found_expense = await Expense.find({
      businessId: req.session.business._id,
    });
    if (!found_expense)
      res.status(200).json({ message: "No expense found for this business" });
    else res.status(200).json({ result: found_expense });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured!" });
  }
};

export const getOneExpense = async (req, res) => {
  const { expenseId } = req.params;
  try {
    const found_expense = await Expense.findOne({ _id: expenseId });
    if (!found_expense)
      res.status(404).json({ message: "No expense found for this ID" });
    else res.status(200).json({ result: found_expense });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured!" });
  }
};

export const approveExpense = async (req, res) => {
  const { expenseId, creatorId, businessId } = req.body;
  try {
    const found_expense = await Expense.findOne({ _id: expenseId });
    if (!found_expense)
      res.status(404).json({ message: "No expense found for this business" });
    else {
      const found_business = await Business.findOne({ _id: businessId });
      if (!found_business) {
        res.status(404).json({ message: "No business found with this ID" });
      } else {
        if (!isMatch(found_business.adminId, creatorId)) {
          res.status(403).json({
            message: "Forbidden! only the admin can approve expenses",
          });
        } else {
          const updated_expensis = await Expense.updateOne(
            { _id: expenseId },
            { approvalStatus: true }
          );
          res.status(200).json({ result: updated_expensis });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured!" });
  }
};

export const deleteExpense = async (req, res) => {
  const { expenseId } = req.params;
  try {
    const found_expense = await Expense.findOne({ _id: expenseId });

    if (!found_expense)
      res.status(404).json({ message: "No expense found for this business" });
    else {
      const found_business = await Business.findOne({
        _id: req.session.business._id,
      });
      if (!found_business) {
        res.status(404).json({ message: "No business found with this ID" });
      } else {
        if (!isMatch(found_business.adminId, req.session.user._id)) {
          if (!isMatch(found_expense.recorderId, req.session.user._id))
            return res.status(403).json({
              message:
                "Forbidden! only the admin or recorder can delete this expenses",
            });
        }
        await Expense.deleteOne({ _id: expenseId });
        const updated_expense = await Expense.find({
          businessId: req.session.business._id,
        });
        res.status(200).json({ result: updated_expense });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured!" });
  }
};

export const getExpenseAmount = async (req, res) => {
  const { selectedTime } = req.params;
  let timeSpan = new Date();
  timeSpan.setDate(timeSpan.getDate() - parseInt(selectedTime));
  try {
    const found_expense = await Expense.find(
      {
        date: {
          $gte: timeSpan,
        },
        businessId: req.session.business._id,
      },
      "amount"
    );
    if (found_expense.length === 0)
      res.status(404).json({ message: "No expense found for this ID" });
    else {
      var sumOfTime = 0;
      found_expense.map((expense) => {
        sumOfTime += expense.amount;
      });
      res.status(200).json({ result: sumOfTime });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured!" });
  }
};

export const getExpenseChartData = async (req, res) => {
  const { selectedTime } = req.params;
  var count = selectedTime;
  let chartData = [];
  try {
    while (count > 0) {
      let timeSpan = new Date();
      timeSpan.setUTCHours(0, 0, 0, 0);
      timeSpan.setDate(timeSpan.getDate() - parseInt(count - 1));
      --count;
      const found_expense = await Expense.find(
        {
          date: timeSpan,
          businessId: req.session.business._id,
        },
        "amount"
      );
      const found_sales = await Sales.find(
        {
          saleDate: timeSpan,
          businessId: req.session.business._id,
        },
        "amount"
      );
      let insert_into_chart_data = {
        name: `day ${count + 1}`,
        expenses: 0,
        revenue: 0,
      };

      if (found_expense.length === 0) {
        insert_into_chart_data.expenses = 0;
      } else {
        var sumOfExpenses = 0;
        found_expense.map((expense) => {
          sumOfExpenses += expense.amount;
        });
        insert_into_chart_data.expenses = sumOfExpenses;
      }

      if (found_sales.length === 0) {
        insert_into_chart_data.revenue = 0;
      } else {
        var sumOfSale = 0;
        found_sales.map((sale) => {
          sumOfSale += sale.amount;
        });
        insert_into_chart_data.revenue = sumOfSale;
      }
      chartData.push(insert_into_chart_data);
    }

    res.status(200).json({ result: chartData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured!" });
  }
};
