// ==================================================
// AUTH
// ==================================================
let currentTableID = null;
let currentBill = [];

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

// ==================================================
// LOCALSTORAGE KEYS
// ==================================================
const TABLE_KEY = "tables";
const CATEGORY_KEY = "categories";
const FOOD_KEY = "foods";
const SALE_KEY = "sales";
const SALE_COUNTER_KEY = "sale_counter"; // 👈 dùng cho ID tăng dần

// ==================================================
// HELPER
// ==================================================
function formatNumber(num) {
  return Number(num).toLocaleString("vi-VN");
}

function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ==================================================
// SALE ID (HD1, HD2, HD3...)
// ==================================================
function generateSaleID() {
  let counter = Number(localStorage.getItem(SALE_COUNTER_KEY)) || 0;
  counter++;
  localStorage.setItem(SALE_COUNTER_KEY, counter);
  return "HD" + counter;
}

// ==================================================
// BILL TEMP (theo bàn)
// ==================================================
function saveBill(tableID) {
  localStorage.setItem(`bill_${tableID}`, JSON.stringify(currentBill));
}

function loadBill(tableID) {
  return JSON.parse(localStorage.getItem(`bill_${tableID}`)) || [];
}

// ==================================================
// LOAD TABLES
// ==================================================
function loadAllTables() {
  const tables = getData(TABLE_KEY);
  const wrapper = document.querySelector(".tables");
  wrapper.innerHTML = "";

  tables.forEach((t) => {
    const btn = document.createElement("button");
    const tempBill = loadBill(t.TableID);
    const occupied = tempBill.length > 0;

    btn.className = `table ${occupied ? "red" : "green"}`;
    btn.innerHTML = `${t.TableName}<br><small>${
      occupied ? "Đã có người" : "Trống"
    }</small>`;
    btn.dataset.tableId = t.TableID;

    btn.onclick = () => {
      currentTableID = t.TableID;
      currentBill = loadBill(currentTableID);
      renderBill(t.TableName);
    };

    wrapper.appendChild(btn);
  });
}

// ==================================================
// UPDATE TABLE STATUS (UI)
// ==================================================
function updateTableStatus(tableID, occupied) {
  document.querySelectorAll(".tables button").forEach((btn) => {
    if (+btn.dataset.tableId === +tableID) {
      btn.className = `table ${occupied ? "red" : "green"}`;
      btn.querySelector("small").textContent = occupied
        ? "Đã có người"
        : "Trống";
    }
  });
}

// ==================================================
// RENDER BILL
// ==================================================
function renderBill(tableName) {
  const tbody = document.querySelector(".bill tbody");
  const title = document.getElementById("bill-title");
  title.textContent = tableName
    ? `Hóa đơn của '${tableName}'`
    : "Chưa chọn bàn";

  tbody.innerHTML = "";
  let total = 0;

  currentBill.forEach((item, i) => {
    const amount = item.Price * item.Quantity;
    total += amount;

    tbody.innerHTML += `
      <tr>
        <td>${item.ItemName}</td>
        <td>${item.Quantity}</td>
        <td>${formatNumber(item.Price)}</td>
        <td>${formatNumber(amount)}</td>
        <td class="action-cell">
          <button class="btn-edit" onclick="editQuantity(${i})">Sửa</button>
          <button class="btn-delete" onclick="removeItem(${i})">Xóa</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML += `
    <tr>
      <td colspan="3" align="right"><b>Tổng:</b></td>
      <td><b>${formatNumber(total)}</b></td>
      <td></td>
    </tr>
  `;

  autoSetDiscount(total);
}

// ==================================================
// BILL ACTION
// ==================================================
function editQuantity(index) {
  const qty = Number(prompt("Nhập số lượng mới:", currentBill[index].Quantity));
  if (qty <= 0) return alert("Số lượng không hợp lệ!");
  currentBill[index].Quantity = qty;
  saveBill(currentTableID);
  renderBill(getTableName(currentTableID));
}

function removeItem(index) {
  currentBill.splice(index, 1);
  saveBill(currentTableID);
  renderBill(getTableName(currentTableID));
  if (currentBill.length === 0) updateTableStatus(currentTableID, false);
}

function addFoodToTable() {
  if (!currentTableID) return alert("Vui lòng chọn bàn!");

  const foodSelect = document.getElementById("select-food");
  const qty = Number(document.getElementById("food-quantity").value);
  if (!foodSelect.value || qty <= 0) return alert("Dữ liệu không hợp lệ!");

  const itemID = foodSelect.value;
  const itemName = foodSelect.selectedOptions[0].text;
  const price = Number(foodSelect.selectedOptions[0].dataset.price);

  const exist = currentBill.find((i) => i.ItemID === itemID);
  if (exist) exist.Quantity += qty;
  else {
    currentBill.push({
      ItemID: itemID,
      ItemName: itemName,
      Price: price,
      Quantity: qty,
    });
  }

  saveBill(currentTableID);
  renderBill(getTableName(currentTableID));
  updateTableStatus(currentTableID, true);
}

// ==================================================
// LOAD CATEGORY & FOOD
// ==================================================
function loadCategories() {
  const select = document.getElementById("select-category");
  select.innerHTML = `<option value="">Tất cả</option>`;
  getData(CATEGORY_KEY).forEach((c) => {
    select.innerHTML += `<option value="${c.CategoryID}">${c.Name}</option>`;
  });
}

function loadFoodItems(categoryID = "") {
  const select = document.getElementById("select-food");
  select.innerHTML = `<option value="">-- Chọn món --</option>`;

  let foods = getData(FOOD_KEY).filter((f) => f.Status);
  if (categoryID) foods = foods.filter((f) => f.CategoryID == categoryID);

  foods.sort((a, b) => a.Name.localeCompare(b.Name));

  foods.forEach((f) => {
    select.innerHTML += `
      <option value="${f.ItemID}" data-price="${f.Price}">
        ${f.Name}
      </option>
    `;
  });
}

document.getElementById("select-category").onchange = (e) =>
  loadFoodItems(e.target.value);

document.getElementById("select-food").onchange = (e) => {
  const opt = e.target.selectedOptions[0];
  document.getElementById("food-price").value = opt ? opt.dataset.price : "";
};

// ==================================================
// DISCOUNT
// ==================================================
function autoSetDiscount(total) {
  let discount = total > 1000000 ? 7 : total > 500000 ? 3 : 0;
  document.getElementById("discount").value = discount;
  return discount;
}

// ==================================================
// PAY BILL
// ==================================================
function payBill() {
  if (!currentTableID) return alert("Vui lòng chọn bàn!");

  let total = 0;
  currentBill.forEach((i) => (total += i.Price * i.Quantity));
  if (total <= 0) return alert("Bàn chưa có món!");

  let discount = total > 1000000 ? 7 : total > 500000 ? 3 : 0;
  const discountAmount = (total * discount) / 100;
  const finalTotal = total - discountAmount;

  const saleID = generateSaleID();
  const saleDate = new Date().toLocaleString("vi-VN");

  if (
    !confirm(
      `Mã hóa đơn: ${saleID}\n` +
        `Tổng tiền: ${formatNumber(total)} đ\n` +
        `Giảm giá: ${discount}% (-${formatNumber(discountAmount)} đ)\n` +
        `Thanh toán: ${formatNumber(finalTotal)} đ\n\nXác nhận thanh toán?`
    )
  )
    return;

  const saleData = {
    saleID,
    tableID: currentTableID,
    tableName: getTableName(currentTableID),
    saleDate,
    total,
    discount,
    finalTotal,
    items: currentBill,
  };

  const sales = getData(SALE_KEY);
  sales.push(saleData);
  saveData(SALE_KEY, sales);

  localStorage.removeItem(`bill_${currentTableID}`);
  currentBill = [];

  updateTableStatus(currentTableID, false);
  renderBill("");
  loadAllTables();

  alert("Thanh toán thành công!\nMã hóa đơn: " + saleID);
}

// ==================================================
// UTILS
// ==================================================
function getTableName(id) {
  const t = getData(TABLE_KEY).find((t) => t.TableID == id);
  return t ? t.TableName : "";
}

// ==================================================
// INIT
// ==================================================
window.onload = () => {
  loadAllTables();
  loadCategories();
  loadFoodItems();
};
