function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}

// ===============================
// Format số tiền
// ===============================
function formatNumber(num) {
  return Number(num).toLocaleString("vi-VN");
}

// ===============================
// Hàm tạo danh sách các tháng trong khoảng
// ===============================
function getMonthsBetween(fromDate, toDate) {
  const months = [];
  let current = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
  const end = new Date(toDate.getFullYear(), toDate.getMonth(), 1);

  while (current <= end) {
    const monthKey = `${current.getFullYear()}-${String(
      current.getMonth() + 1
    ).padStart(2, "0")}`;
    months.push(monthKey);
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

// ===============================
// Thống kê doanh thu khi nhấn nút
// ===============================
document
  .getElementById("btn-statistics")
  .addEventListener("click", async () => {
    const fromDateStr = document.getElementById("from-date").value;
    const toDateStr = document.getElementById("to-date").value;

    if (!fromDateStr || !toDateStr) {
      alert("Vui lòng chọn cả từ ngày và đến ngày!");
      return;
    }

    const fromDate = new Date(fromDateStr);
    const toDate = new Date(toDateStr);

    try {
      // Lấy dữ liệu doanh thu
      const res = await fetch(
        `http://localhost:3000/api/revenue?fromDate=${fromDateStr}&toDate=${toDateStr}`
      );

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.message || "Lỗi khi lấy dữ liệu thống kê!");
        return;
      }

      const data = await res.json();
      const { totalRevenue, sales } = data;

      // Hiển thị tổng doanh thu
      document.getElementById("total-revenue").textContent = `${formatNumber(
        totalRevenue
      )} VNĐ`;

      if (!sales || sales.length === 0) {
        alert("Không có hóa đơn nào trong khoảng thời gian này");
        return;
      }

      // ===============================
      // Biểu đồ doanh thu theo tháng (Bar chart)
      // ===============================
      const allMonths = getMonthsBetween(fromDate, toDate);
      const revenueByMonth = {};
      allMonths.forEach((m) => (revenueByMonth[m] = 0));

      sales.forEach((sale) => {
        const date = new Date(sale.SaleDate);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        revenueByMonth[monthKey] += parseFloat(sale.TotalAmount);
      });

      const lineLabels = allMonths;
      const lineData = allMonths.map((m) => revenueByMonth[m]);

      const lineCtx = document.getElementById("lineChart").getContext("2d");
      if (window.lineChartInstance) window.lineChartInstance.destroy();
      window.lineChartInstance = new Chart(lineCtx, {
        type: "bar",
        data: {
          labels: lineLabels,
          datasets: [
            {
              label: "Doanh thu (VNĐ)",
              data: lineData,
              backgroundColor: "rgba(54, 162, 235, 0.6)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
          },
          scales: { y: { beginAtZero: true } },
        },
      });

      // ===============================
      // Biểu đồ % số lượng món bán được (Pie chart)
      // ===============================
      const itemCountMap = {}; // { "Tên món": tổng số lượng }

      for (const sale of sales) {
        const saleDetailsRes = await fetch(
          `http://localhost:3000/api/sale/${sale.SaleID}`
        );
        if (!saleDetailsRes.ok) continue;
        const saleDetails = await saleDetailsRes.json();

        saleDetails.forEach((detail) => {
          // Lấy tên món từ API, fallback ItemID
          const itemName = detail.ItemName || `Món ${detail.ItemID}`;
          itemCountMap[itemName] =
            (itemCountMap[itemName] || 0) + detail.Quantity;
        });
      }

      const pieLabels = Object.keys(itemCountMap);
      const pieData = pieLabels.map((k) => itemCountMap[k]);

      const pieCtx = document.getElementById("pieChart").getContext("2d");
      if (window.pieChartInstance) window.pieChartInstance.destroy();
      window.pieChartInstance = new Chart(pieCtx, {
        type: "pie",
        data: {
          labels: pieLabels,
          datasets: [
            {
              data: pieData,
              backgroundColor: pieLabels.map(
                (_) => `hsl(${Math.random() * 360}, 70%, 60%)`
              ),
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "right" },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const value = context.raw;
                  const total = pieData.reduce((a, b) => a + b, 0);
                  const percent = ((value / total) * 100).toFixed(1);
                  return `${context.label}: ${value} (${percent}%)`;
                },
              },
            },
          },
        },
      });
    } catch (err) {
      console.error("Lỗi khi thống kê doanh thu:", err);
      alert("Lỗi khi lấy dữ liệu thống kê!");
    }
  });
