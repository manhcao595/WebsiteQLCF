let currentTableID = null;
let currentBill = []; // Mảng lưu tạm hóa đơn

// ================================
// KIỂM TRA ĐĂNG NHẬP & PHÂN QUYỀN
// ================================
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {
  alert("Bạn chưa đăng nhập!");
  window.location.href = "login.html";
}

const page = window.location.pathname;

// Trang admin
if (page.includes("admin") && currentUser.role !== "manager") {
  alert("Bạn không có quyền truy cập trang này!");
  window.location.href = "login.html";
}

// Trang staff
if (page.includes("staff") && currentUser.role !== "staff") {
  alert("Bạn không có quyền truy cập trang này!");
  window.location.href = "login.html";
}

function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}

// ==============================
// Hàm format tiền (dấu chấm ngăn cách)
// ==============================
function formatNumber(num) {
  return Number(num).toLocaleString("vi-VN");
}

// ==============================
// Lưu/Load hóa đơn tạm vào localStorage
// ==============================
function saveBillToLocalStorage(tableID) {
  localStorage.setItem(`bill_${tableID}`, JSON.stringify(currentBill));
}

function loadBillFromLocalStorage(tableID) {
  const data = localStorage.getItem(`bill_${tableID}`);
  return data ? JSON.parse(data) : [];
}

// ==============================
// Load danh sách bàn
// ==============================
async function loadAllTables() {
  try {
    const res = await fetch("http://localhost:3000/api/tables");
    const data = await res.json();

    const wrapper = document.querySelector(".tables");
    wrapper.innerHTML = "";

    data.forEach((t) => {
      const btn = document.createElement("button");
      btn.className = `table ${t.Status === "Trống" ? "green" : "red"}`;
      btn.innerHTML = `${t.TableName}<br><small>${t.Status}</small>`;
      btn.dataset.tableId = t.TableID;

      // Kiểm tra tạm hóa đơn
      const tempBill = loadBillFromLocalStorage(t.TableID);
      if (tempBill.length > 0) {
        btn.classList.remove("green");
        btn.classList.add("red");
        btn.querySelector("small").textContent = "Đã có người";
      }

      btn.addEventListener("click", () => {
        currentTableID = t.TableID;
        currentBill = loadBillFromLocalStorage(currentTableID);
        renderBill(t.TableName);
      });

      wrapper.appendChild(btn);
    });
  } catch (err) {
    console.error("Lỗi load bàn:", err);
  }
}

// ==============================
// Cập nhật trạng thái bàn
// ==============================
function updateTableStatus(tableID, isOccupied = true) {
  const tableButtons = document.querySelectorAll(".tables button");

  tableButtons.forEach((btn) => {
    if (Number(btn.dataset.tableId) === Number(tableID)) {
      btn.classList.toggle("green", !isOccupied);
      btn.classList.toggle("red", isOccupied);
      btn.querySelector("small").textContent = isOccupied
        ? "Đã có người"
        : "Trống";
    }
  });
}

// ==============================
// Render hóa đơn
// ==============================
function renderBill(tableName) {
  const tbody = document.querySelector(".bill tbody");
  const title = document.getElementById("bill-title");
  title.textContent = `Hóa đơn của '${tableName}'`;

  tbody.innerHTML = "";
  let totalAmount = 0;

  currentBill.forEach((item, index) => {
    const total = Number(item.Price) * Number(item.Quantity);
    totalAmount += total;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.ItemName}</td>
      <td>${item.Quantity}</td>
      <td>${formatNumber(item.Price)}</td>
      <td>${formatNumber(total)}</td>
      <td>
        <button class="btn-edit" onclick="editQuantity(${index})">Sửa</button>
        <button class="btn-delete" onclick="removeItem(${index})">Xóa</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  // Hàng tổng tiền
  const totalRow = document.createElement("tr");
  totalRow.innerHTML = `
    <td colspan="3" style="text-align:right"><b>Tổng cộng:</b></td>
    <td><b>${formatNumber(totalAmount)}</b></td>
    <td></td>
  `;
  tbody.appendChild(totalRow);

  // Tự động set giảm giá khi render
  autoSetDiscount(totalAmount);
}

// ==============================
// Sửa số lượng món
// ==============================
function editQuantity(index) {
  const newQty = prompt("Nhập số lượng mới:", currentBill[index].Quantity);
  const qty = Number(newQty);
  if (isNaN(qty) || qty <= 0) {
    alert("Số lượng không hợp lệ!");
    return;
  }
  currentBill[index].Quantity = qty;
  saveBillToLocalStorage(currentTableID);
  renderBill(document.getElementById("bill-title").textContent.split("'")[1]);
}

// ==============================
// Thêm món vào hóa đơn tạm
// ==============================
function addFoodToTable() {
  if (!currentTableID) return alert("Vui lòng chọn bàn!");

  const foodSelect = document.getElementById("select-food");
  const quantityInput = document.getElementById("food-quantity");

  const itemID = foodSelect.value;
  const itemName = foodSelect.selectedOptions[0].textContent;
  const price = Number(foodSelect.selectedOptions[0].dataset.price);
  const quantity = Number(quantityInput.value);

  if (!itemID || quantity <= 0) return alert("Chọn món và số lượng hợp lệ");

  const existing = currentBill.find((i) => i.ItemID === itemID);
  if (existing) {
    existing.Quantity += quantity;
  } else {
    currentBill.push({
      ItemID: itemID,
      ItemName: itemName,
      Price: price,
      Quantity: quantity,
    });
  }

  saveBillToLocalStorage(currentTableID);
  renderBill(document.getElementById("bill-title").textContent.split("'")[1]);
  updateTableStatus(currentTableID, true);
}

// ==============================
// Xóa món
// ==============================
function removeItem(index) {
  currentBill.splice(index, 1);
  saveBillToLocalStorage(currentTableID);
  renderBill(document.getElementById("bill-title").textContent.split("'")[1]);

  if (currentBill.length === 0) updateTableStatus(currentTableID, false);
}

// ==============================
// Load danh mục
// ==============================
async function loadCategories() {
  try {
    const res = await fetch("http://localhost:3000/api/categories");
    const data = await res.json();
    const selectCategory = document.getElementById("select-category");
    selectCategory.innerHTML = '<option value="">Tất cả</option>';

    data.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.CategoryID;
      opt.textContent = cat.Name;
      selectCategory.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
  }
}

// ==============================
// Load món theo danh mục (chỉ Status = 1, sắp xếp alphabet)
// ==============================
async function loadFoodItems(categoryID = "") {
  try {
    let url = "http://localhost:3000/api/food";
    if (categoryID) url += `?categoryID=${categoryID}`;

    const res = await fetch(url);
    const data = await res.json();

    const selectFood = document.getElementById("select-food");
    selectFood.innerHTML = '<option value="">-- Chọn món --</option>';

    // Lọc món đang sử dụng
    let available = data.filter((f) => f.Status === true);

    // Sắp xếp theo tên alphabet
    available.sort((a, b) => a.Name.localeCompare(b.Name));

    // Thêm vào select
    available.forEach((food) => {
      const opt = document.createElement("option");
      opt.value = food.ItemID;
      opt.dataset.price = food.Price;
      opt.textContent = food.Name;
      selectFood.appendChild(opt);
    });

    document.getElementById("food-price").value = "";
  } catch (err) {
    console.error(err);
  }
}

// ==============================
// Khi chọn danh mục
// ==============================
document.getElementById("select-category").onchange = (e) => {
  loadFoodItems(e.target.value);
};

// Khi chọn món
document.getElementById("select-food").onchange = (e) => {
  const selected = e.target.selectedOptions[0];
  document.getElementById("food-price").value = selected
    ? selected.dataset.price
    : "";
};

// ==========================================================
// 🎉 TÍNH TỰ ĐỘNG GIẢM GIÁ
// ==========================================================
function autoSetDiscount(total) {
  const discountInput = document.getElementById("discount");

  let discount = 0;
  if (total > 1000000) discount = 7;
  else if (total > 500000) discount = 3;

  discountInput.value = discount;
  return discount;
}

// ==========================================================
// 🎉 THANH TOÁN (HOÀN CHỈNH – DÙNG API + GIẢM GIÁ + CLEAR BILL)
// ==========================================================
async function payBill() {
  if (!currentTableID) return alert("Vui lòng chọn bàn!");

  // Tính tổng tạm
  let total = 0;
  currentBill.forEach((i) => (total += i.Price * i.Quantity));

  if (total <= 0) return alert("Bàn chưa có món!");

  // Giảm giá tự động
  const discount = autoSetDiscount(total);
  const discountAmount = (total * discount) / 100;
  const finalTotal = total - discountAmount;

  // Xác nhận
  if (
    !confirm(
      `Tổng tiền: ${formatNumber(total)} đ\n` +
        `Giảm giá: ${discount}% (-${formatNumber(discountAmount)} đ)\n` +
        `Thanh toán: ${formatNumber(finalTotal)} đ\n\nXác nhận thanh toán?`
    )
  ) {
    return;
  }

  // Chuẩn bị dữ liệu gửi API
  const payload = {
    tableID: currentTableID,
    items: currentBill.map((i) => ({
      ItemID: i.ItemID,
      Quantity: i.Quantity,
      Price: i.Price,
    })),
    totalAmount: finalTotal,
  };

  try {
    const res = await fetch("http://localhost:3000/api/sale/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Lỗi thanh toán: " + data.message);
      return;
    }

    alert("Thanh toán thành công!");

    // Xóa bill tạm
    localStorage.removeItem(`bill_${currentTableID}`);
    currentBill = [];

    // Cập nhật bàn -> Trống
    updateTableStatus(currentTableID, false);

    // Xóa giao diện bill
    renderBill("Chưa chọn bàn");

    // Reload danh sách bàn
    loadAllTables();
  } catch (err) {
    console.error("Lỗi:", err);
    alert("Không thể kết nối server!");
  }
}

// ==============================
// Khởi tạo
// ==============================
window.onload = () => {
  loadAllTables();
  loadCategories();
  loadFoodItems();
};
