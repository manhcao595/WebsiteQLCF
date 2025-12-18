// ==============================
// Logout
// ==============================
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
// ==============================
// Format tiền
// ==============================
function formatNumber(num) {
  return Number(num).toLocaleString("vi-VN");
}

// ==============================
// LOCALSTORAGE
// ==============================
const SALE_KEY = "sales";

function getSales() {
  return JSON.parse(localStorage.getItem(SALE_KEY)) || [];
}

// ==============================
// Chuẩn hóa mã hóa đơn
// VD: "1" -> "HD1", "HD1" -> "HD1"
// ==============================
function normalizeSaleID(input) {
  if (!input) return "";
  return input.toUpperCase().startsWith("HD")
    ? input.toUpperCase()
    : "HD" + input;
}

// ==============================
// Tìm hóa đơn theo mã
// ==============================
function findSaleByID(inputID) {
  const saleID = normalizeSaleID(inputID);
  return getSales().find((s) => s.saleID === saleID);
}

// ==============================
// Load chi tiết hóa đơn
// ==============================
function loadSaleDetails(inputID) {
  const tbody = document.getElementById("sale-detail-body");
  tbody.innerHTML = "";

  if (!inputID) {
    tbody.innerHTML = `<tr><td colspan="5">Nhập mã hóa đơn để xem chi tiết</td></tr>`;
    return;
  }

  const sale = findSaleByID(inputID);
  if (!sale) {
    tbody.innerHTML = `<tr><td colspan="5">Không tìm thấy hóa đơn</td></tr>`;
    return;
  }

  const items = sale.items || [];
  let index = 1;

  items.forEach((item) => {
    const total = item.Price * item.Quantity;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index++}</td>
      <td>${item.ItemID}</td>
      <td style="text-align:center">${item.Quantity}</td>
      <td style="text-align:right">${formatNumber(item.Price)}</td>
      <td style="text-align:right">${formatNumber(total)}</td>
    `;
    tbody.appendChild(tr);
  });

  tbody.appendChild(createSummaryRow("Ngày lập:", sale.saleDate));
  tbody.appendChild(createSummaryRow("Tổng cộng:", formatNumber(sale.total)));
  tbody.appendChild(
    createSummaryRow(
      `Giảm giá (${sale.discount}%):`,
      formatNumber((sale.total * sale.discount) / 100)
    )
  );
  tbody.appendChild(
    createSummaryRow("Thanh toán:", formatNumber(sale.finalTotal))
  );
}

// ==============================
// Dòng tổng hợp
// ==============================
function createSummaryRow(label, value) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td colspan="4" style="text-align:right"><b>${label}</b></td>
    <td style="text-align:right"><b>${value}</b></td>
  `;
  return tr;
}

// ==============================
// Sự kiện tìm kiếm
// ==============================
const searchInput = document.querySelector(".search-box-1 input");
searchInput.addEventListener("input", () => {
  loadSaleDetails(searchInput.value.trim());
});

// ==============================
// In hóa đơn
// ==============================
function printInvoice() {
  const input = searchInput.value.trim();
  if (!input) return alert("Nhập mã hóa đơn trước khi in!");

  const sale = findSaleByID(input);
  if (!sale) return alert("Không tìm thấy hóa đơn!");

  const items = sale.items || [];
  let rows = "";

  items.forEach((i, idx) => {
    rows += `
      <tr>
        <td>${idx + 1}</td>
        <td>${i.ItemID}</td>
        <td style="text-align:center">${i.Quantity}</td>
        <td style="text-align:right">${formatNumber(i.Price)}</td>
        <td style="text-align:right">${formatNumber(i.Price * i.Quantity)}</td>
      </tr>
    `;
  });

  const win = window.open("", "_blank");
  win.document.write(`
    <html>
    <head>
      <title>Hóa đơn ${sale.saleID}</title>
      <style>
        body { font-family: Arial; margin:20px; }
        table { width:100%; border-collapse:collapse; }
        th, td { border:1px solid #000; padding:6px; }
        h2 { text-align:center; }
      </style>
    </head>
    <body>
      <h2>HÓA ĐƠN BÁN HÀNG</h2>
      <p><b>Mã hóa đơn:</b> ${sale.saleID}</p>
      <p><b>Ngày lập:</b> ${sale.saleDate}</p>

      <table>
        <tr>
          <th>#</th><th>Mã SP</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th>
        </tr>
        ${rows}
      </table>

      <br/>
      <table>
        <tr><td><b>Tổng cộng</b></td><td>${formatNumber(sale.total)}</td></tr>
        <tr><td><b>Giảm giá (${sale.discount}%)</b></td>
            <td>${formatNumber((sale.total * sale.discount) / 100)}</td></tr>
        <tr><td><b>Thanh toán</b></td><td>${formatNumber(
          sale.finalTotal
        )}</td></tr>
      </table>
    </body>
    </html>
  `);

  win.document.close();
  win.onload = () => win.print();
}

// ==============================
// INIT
// ==============================
window.onload = () => {
  document.getElementById(
    "sale-detail-body"
  ).innerHTML = `<tr><td colspan="5">Nhập mã hóa đơn để xem chi tiết</td></tr>`;
};
