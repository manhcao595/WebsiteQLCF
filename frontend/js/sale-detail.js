function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}

// ==============================
// Format tiền
// ==============================
function formatNumber(num) {
  return Number(num).toLocaleString("vi-VN");
}

// ==============================
// Load chi tiết hóa đơn theo SaleID
// ==============================
async function loadSaleDetails(saleID) {
  const tbody = document.getElementById("sale-detail-body");
  tbody.innerHTML = "";

  if (!saleID) {
    tbody.innerHTML = `<tr><td colspan="6">Nhập mã hóa đơn để xem chi tiết</td></tr>`;
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/sale/${saleID}`);
    if (!res.ok) {
      tbody.innerHTML = `<tr><td colspan="6">Không tìm thấy hóa đơn</td></tr>`;
      return;
    }

    const details = await res.json();
    if (!details || details.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">Hóa đơn trống</td></tr>`;
      return;
    }

    // Giả sử API trả SaleDate và TotalAmount trong mỗi record
    const saleDate = details[0].SaleDate ? new Date(details[0].SaleDate) : null;

    let totalBeforeDiscount = 0;

    details.forEach((item) => {
      const total = item.Quantity * item.Price;
      totalBeforeDiscount += total;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.SaleDetailID}</td>
        <td>${item.ItemID}</td>
        <td>${item.Quantity}</td>
        <td>${formatNumber(item.Price)}</td>
        <td>${formatNumber(total)}</td>
      `;
      tbody.appendChild(row);
    });

    // Tính giảm giá tự động (cùng logic với order)
    let discount = 0;
    if (totalBeforeDiscount > 1000000) discount = 7;
    else if (totalBeforeDiscount > 500000) discount = 3;

    const discountAmount = (totalBeforeDiscount * discount) / 100;
    const finalTotal = totalBeforeDiscount - discountAmount;

    // Dòng ngày lập hóa đơn
    const dateRow = document.createElement("tr");
    dateRow.innerHTML = `
      <td colspan="4" style="text-align:right"><b>Ngày lập hóa đơn:</b></td>
      <td><b>${saleDate ? saleDate.toLocaleDateString() : ""}</b></td>
    `;
    tbody.appendChild(dateRow);

    // Tổng cộng
    const totalRow = document.createElement("tr");
    totalRow.innerHTML = `
      <td colspan="4" style="text-align:right"><b>Tổng cộng:</b></td>
      <td><b>${formatNumber(totalBeforeDiscount)}</b></td>
    `;
    tbody.appendChild(totalRow);

    // Giảm giá
    const discountRow = document.createElement("tr");
    discountRow.innerHTML = `
      <td colspan="4" style="text-align:right"><b>Giảm giá (${discount}%):</b></td>
      <td><b>${formatNumber(discountAmount)}</b></td>
    `;
    tbody.appendChild(discountRow);

    // Thành tiền cuối cùng
    const finalRow = document.createElement("tr");
    finalRow.innerHTML = `
      <td colspan="4" style="text-align:right"><b>Thanh toán:</b></td>
      <td><b>${formatNumber(finalTotal)}</b></td>
    `;
    tbody.appendChild(finalRow);
  } catch (err) {
    console.error("Lỗi load chi tiết hóa đơn:", err);
    tbody.innerHTML = `<tr><td colspan="6">Lỗi kết nối server</td></tr>`;
  }
}

// ==============================
// Sự kiện tìm kiếm
// ==============================
const searchInput = document.querySelector(".search-box-1 input");
searchInput.addEventListener("input", () => {
  const saleID = searchInput.value.trim();
  loadSaleDetails(saleID);
});

// ==============================
// In hóa đơn
// ==============================
function printInvoice() {
  const saleDetailTable = document.getElementById("sale-detail-body");
  const saleID = searchInput.value.trim(); // ← SỬA TẠI ĐÂY

  if (!saleID) {
    alert("Hãy nhập mã hóa đơn trước khi in!");
    return;
  }

  if (!saleDetailTable || saleDetailTable.children.length === 0) {
    alert("Không có dữ liệu để in!");
    return;
  }

  // Lấy ngày lập hóa đơn
  let saleDate = "";
  const rows = saleDetailTable.querySelectorAll("tr");
  rows.forEach((r) => {
    if (r.innerText.includes("Ngày lập hóa đơn")) {
      const td = r.querySelector("td b");
      if (td) saleDate = td.innerText;
    }
  });

  // Lấy dòng tổng hợp
  let summaryRows = "";
  rows.forEach((r) => {
    if (
      r.innerText.includes("Tổng cộng") ||
      r.innerText.includes("Giảm giá") ||
      r.innerText.includes("Thanh toán")
    ) {
      summaryRows += `
        <tr>
          <td colspan="2" style="text-align:right">${
            r.children[0]?.innerHTML || ""
          }</td>
          <td style="text-align:right">${r.children[1]?.innerHTML || ""}</td>
        </tr>
      `;
    }
  });

  // Lấy dòng món ăn
  let itemsRows = "";
  rows.forEach((r) => {
    // Chỉ lấy các row có 5 cột và không chứa "Tổng"
    if (r.children.length === 5 && !r.innerText.includes("Tổng")) {
      itemsRows += `
        <tr>
          <td>${r.children[0].innerText}</td>
          <td>${r.children[1].innerText}</td>
          <td style="text-align:center">${r.children[2].innerText}</td>
          <td style="text-align:right">${r.children[3].innerText}</td>
          <td style="text-align:right">${r.children[4].innerText}</td>
        </tr>
      `;
    }
  });

  // Tạo popup in toàn màn hình
  const width = window.screen.width;
  const height = window.screen.height;
  const printWindow = window.open(
    "",
    "_blank",
    `width=${window.screen.width},height=${window.screen.height},top=0,left=0,scrollbars=yes,resizable=yes`
  );

  printWindow.document.write(`
  <html>
  <head>
    <title>In hóa đơn</title>
    <style>
      body { font-family: Arial; margin: 20px; }
      h2 { text-align:center; }
      table { width:100%; border-collapse: collapse; margin-top:10px; }
      th, td { border:1px solid #000; padding:8px; }
      .no-border td { border:none; }
    </style>
  </head>
  <body>
    <h2>HÓA ĐƠN BÁN HÀNG</h2>

    <table class="no-border">
      <tr>
        <td><b>Mã hóa đơn:</b> ${saleID}</td>
        <td><b>Ngày lập:</b> ${saleDate}</td>
      </tr>
    </table>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Mã SP</th>
          <th>SL</th>
          <th>Đơn giá</th>
          <th>Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <br/>

    <table>
      ${summaryRows}
    </table>

  </body>
  </html>
  `);

  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
}

// ==============================
// Khi load trang
// ==============================
window.onload = () => {
  document.getElementById(
    "sale-detail-body"
  ).innerHTML = `<tr><td colspan="6">Nhập mã hóa đơn để xem chi tiết</td></tr>`;
};
