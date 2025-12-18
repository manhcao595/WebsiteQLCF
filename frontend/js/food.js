// ==============================
// LOGOUT
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
// KEY LOCALSTORAGE
// ==============================
const CATEGORY_KEY = "categories";
const FOOD_KEY = "foods";

// ==============================
// FORMAT GIÁ
// ==============================
function formatNumber(num) {
  if (isNaN(num)) return "0";
  return Number(num).toLocaleString("vi-VN");
}

function parsePrice(value) {
  return Number(String(value).replace(/\./g, ""));
}

// ==============================
// LOCALSTORAGE HELPER
// ==============================
function getCategories() {
  return JSON.parse(localStorage.getItem(CATEGORY_KEY)) || [];
}

function getFoods() {
  return JSON.parse(localStorage.getItem(FOOD_KEY)) || [];
}

function saveFoods(data) {
  localStorage.setItem(FOOD_KEY, JSON.stringify(data));
}

// ==============================
// LOAD CATEGORY -> DROPDOWN
// ==============================
function loadCategoriesToDropdown() {
  const categories = getCategories();
  const select = document.getElementById("item-category");
  select.innerHTML = "";

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.CategoryID;
    option.textContent = `${cat.CategoryID} - ${cat.Name}`;
    select.appendChild(option);
  });
}

// ==============================
// PHÂN TRANG
// ==============================
let currentPage = 1;
const pageSize = 10;
let foodData = [];
let filteredData = [];

// ==============================
// LOAD FOOD
// ==============================
function loadFood() {
  let data = getFoods();

  data.sort((a, b) => {
    if (a.CategoryID !== b.CategoryID) return a.CategoryID - b.CategoryID;
    return a.Name.localeCompare(b.Name);
  });

  foodData = data;
  filteredData = [...foodData];
  currentPage = 1;
  renderTablePage();
}

// ==============================
// RENDER TABLE
// ==============================
function renderTablePage() {
  const tbody = document.querySelector(".table tbody");
  tbody.innerHTML = "";

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = filteredData.slice(start, end);

  pageItems.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.ItemID}</td>
      <td>${item.Name}</td>
      <td>${item.CategoryID}</td>
      <td>${formatNumber(item.Price)}</td>
      <td>${item.Status ? "Sử dụng" : "Ngưng bán"}</td>
    `;

    row.addEventListener("click", () => {
      document.getElementById("item-id").value = item.ItemID;
      document.getElementById("item-name").value = item.Name;
      document.getElementById("item-category").value = item.CategoryID;
      document.getElementById("item-price").value = formatNumber(item.Price);
      document.getElementById("item-status").value = item.Status ? 1 : 0;
    });

    tbody.appendChild(row);
  });

  renderPaginationControls();
}

// ==============================
// PAGINATION
// ==============================
function renderPaginationControls() {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  pagination.innerHTML = "";
  const totalPages = Math.ceil(filteredData.length / pageSize);

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "« Trước";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    currentPage--;
    renderTablePage();
  };
  pagination.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "active" : "";
    btn.onclick = () => {
      currentPage = i;
      renderTablePage();
    };
    pagination.appendChild(btn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Sau »";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    currentPage++;
    renderTablePage();
  };
  pagination.appendChild(nextBtn);
}

// ==============================
// SEARCH
// ==============================
document.querySelector(".search-box-1 input").addEventListener("input", (e) => {
  const keyword = e.target.value.toLowerCase();
  filteredData = foodData.filter((item) =>
    item.Name.toLowerCase().includes(keyword)
  );
  currentPage = 1;
  renderTablePage();
});

// ==============================
// ADD FOOD
// ==============================
function addFood() {
  const name = document.getElementById("item-name").value.trim();
  const categoryID = parseInt(document.getElementById("item-category").value);
  const price = parsePrice(document.getElementById("item-price").value);
  const status = parseInt(document.getElementById("item-status").value);

  if (!name) return alert("Vui lòng nhập tên món!");
  if (isNaN(categoryID)) return alert("Chọn danh mục!");
  if (isNaN(price) || price <= 0) return alert("Giá không hợp lệ!");

  let foods = getFoods();

  const newFood = {
    ItemID: foods.length > 0 ? Math.max(...foods.map((f) => f.ItemID)) + 1 : 1,
    Name: name,
    CategoryID: categoryID,
    Price: price,
    Status: status === 1,
  };

  foods.push(newFood);
  saveFoods(foods);

  alert("Thêm món thành công!");
  loadFood();
  clearForm();
}

// ==============================
// UPDATE FOOD
// ==============================
function updateFood() {
  const id = parseInt(document.getElementById("item-id").value);
  if (!id) return alert("Hãy chọn món!");

  let foods = getFoods();
  const index = foods.findIndex((f) => f.ItemID === id);
  if (index === -1) return alert("Món không tồn tại!");

  foods[index].Name = document.getElementById("item-name").value;
  foods[index].CategoryID = parseInt(
    document.getElementById("item-category").value
  );
  foods[index].Price = parsePrice(document.getElementById("item-price").value);
  foods[index].Status =
    parseInt(document.getElementById("item-status").value) === 1;

  saveFoods(foods);

  alert("Cập nhật thành công!");
  loadFood();
  clearForm();
}

// ==============================
// DELETE FOOD
// ==============================
function deleteFood() {
  const id = parseInt(document.getElementById("item-id").value);
  if (!id) return alert("Hãy chọn món!");
  if (!confirm("Bạn chắc chắn muốn xóa?")) return;

  let foods = getFoods().filter((f) => f.ItemID !== id);
  saveFoods(foods);

  alert("Xóa thành công!");
  loadFood();
  clearForm();
}

// ==============================
// CLEAR FORM
// ==============================
function clearForm() {
  document.getElementById("item-id").value = "";
  document.getElementById("item-name").value = "";
  document.getElementById("item-price").value = "";
  document.getElementById("item-status").value = 1;
}

// ==============================
// EXPORT (MÔ PHỎNG)
// ==============================
function exportExcel() {
  alert("Export Excel mô phỏng (không backend)");
}

function exportPDF() {
  alert("Export PDF mô phỏng (không backend)");
}

// ==============================
// INIT
// ==============================
window.onload = () => {
  loadCategoriesToDropdown();
  loadFood();
};
