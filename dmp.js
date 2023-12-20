     found_expense.sort((a, b) => {
        const date1 = new Date(a.date);
        const date2 = new Date(b.date);
        return date1 - date2;
      });
      found_sales.sort((a, b) => {
        const date1 = new Date(a.saleDate);
        const date2 = new Date(b.saleDate);
        return date1 - date2;
      });

      var expense_value = {};
      var sale_value = {};
      found_expense.map((expense) => {
        {
          const date = expense.date;
          if (!expense_value[date]) {
            expense_value[date] = [expense];
          } else {
            expense_value[date].push(expense);
          }
        }
      });
      found_sales.map((sale) => {
        {
          const date = sale.saleDate;
          if (!sale_value[date]) {
            sale_value[date] = [sale];
          } else {
            sale_value[date].push(sale);
          }
        }
      });

      expense_value = Object.values(expense_value);
      sale_value = Object.values(sale_value);
      console.log("expense date", expense_value);
      console.log("sale date", sale_value);
      const chartData = {};
      sale_value.map((sale, index) => {
        sale.map((info) => {
          if (!chartData[index]) {
            chartData[index] = [
              {
                name: `day ${index}`,
                expense: ,
              },
            ];
          }
        });
      });
