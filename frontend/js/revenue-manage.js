function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
  alert("Bạn chưa đăng nhập!");
  location.href = "login.html";
}

function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("role");
  location.href = "login.html";
}
// ===============================
// Format tiền
// ===============================
function formatNumber(num) {
  return Number(num).toLocaleString("vi-VN");
}

// ===============================
// Parse saleDate: "HH:mm:ss dd/MM/yyyy"
// ===============================
function parseSaleDate(dateStr) {
  const [time, date] = dateStr.split(" ");
  const [day, month, year] = date.split("/");
  const [hour, minute, second] = time.split(":");
  return new Date(year, month - 1, day, hour, minute, second);
}

// ===============================
// Lấy các tháng trong khoảng
// ===============================
function getMonthsBetween(fromDate, toDate) {
  const months = [];
  let current = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
  const end = new Date(toDate.getFullYear(), toDate.getMonth(), 1);

  while (current <= end) {
    const key = `${current.getFullYear()}-${String(
      current.getMonth() + 1
    ).padStart(2, "0")}`;
    months.push(key);
    current.setMonth(current.getMonth() + 1);
  }
  return months;
}

// ===============================
// Thống kê doanh thu
// ===============================
document.getElementById("btn-statistics").addEventListener("click", () => {
  const fromDateStr = document.getElementById("from-date").value;
  const toDateStr = document.getElementById("to-date").value;

  if (!fromDateStr || !toDateStr) {
    alert("Vui lòng chọn từ ngày và đến ngày!");
    return;
  }

  const fromDate = new Date(fromDateStr);
  const toDate = new Date(toDateStr);
  toDate.setHours(23, 59, 59, 999); // lấy trọn ngày

  const sales = JSON.parse(localStorage.getItem("sales")) || [];

  // ===============================
  // LỌC HÓA ĐƠN ĐÚNG NGÀY
  // ===============================
  const filteredSales = sales.filter((s) => {
    const d = parseSaleDate(s.saleDate);
    return d >= fromDate && d <= toDate;
  });

  if (filteredSales.length === 0) {
    alert("Không có hóa đơn trong khoảng thời gian này");
    return;
  }

  // ===============================
  // TỔNG DOANH THU
  // ===============================
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.finalTotal, 0);

  document.getElementById("total-revenue").textContent =
    formatNumber(totalRevenue) + " VNĐ";

  // ===============================
  // BIỂU ĐỒ DOANH THU THEO THÁNG
  // ===============================
  const months = getMonthsBetween(fromDate, toDate);
  const revenueByMonth = {};
  months.forEach((m) => (revenueByMonth[m] = 0));

  filteredSales.forEach((s) => {
    const d = parseSaleDate(s.saleDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    revenueByMonth[key] += s.finalTotal;
  });

  if (window.lineChartInstance) window.lineChartInstance.destroy();
  window.lineChartInstance = new Chart(document.getElementById("lineChart"), {
    type: "bar",
    data: {
      labels: months,
      datasets: [
        {
          label: "Doanh thu (VNĐ)",
          data: months.map((m) => revenueByMonth[m]),
        },
      ],
    },
    options: { responsive: true },
  });

  // ===============================
  // BIỂU ĐỒ TỶ LỆ MÓN BÁN
  // ===============================
  const itemCountMap = {};

  filteredSales.forEach((s) => {
    s.items.forEach((i) => {
      itemCountMap[i.ItemName] = (itemCountMap[i.ItemName] || 0) + i.Quantity;
    });
  });

  const pieLabels = Object.keys(itemCountMap);
  const pieData = pieLabels.map((k) => itemCountMap[k]);

  if (window.pieChartInstance) window.pieChartInstance.destroy();
  window.pieChartInstance = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: pieLabels,
      datasets: [{ data: pieData }],
    },
  });
});
