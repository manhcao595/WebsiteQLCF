function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}

// ==============================
// Hàm format số thành dạng 10.000 hoặc 1.250.000
// ==============================
function formatNumber(num) {
  if (isNaN(num)) return "0";
  return Number(num).toLocaleString("vi-VN");
}

// Hàm bỏ format khi người dùng nhập vào input giá
function parsePrice(value) {
  return Number(String(value).replace(/\./g, ""));
}

// ==============================
// Load danh mục lên dropdown
// ==============================
async function loadCategoriesToDropdown() {
  const res = await fetch("http://localhost:3000/api/categories");
  const data = await res.json();

  const select = document.getElementById("item-category");
  select.innerHTML = "";
  data.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.CategoryID;
    option.textContent = `${cat.CategoryID} - ${cat.Name}`;
    select.appendChild(option);
  });
}

// ==============================
// Biến phân trang
// ==============================
let currentPage = 1;
const pageSize = 10;
let foodData = []; // Toàn bộ dữ liệu
let filteredData = []; // Dữ liệu sau khi search

// ==============================
// Load món
// ==============================
async function loadFood() {
  const res = await fetch("http://localhost:3000/api/food");
  const data = await res.json();

  // Sắp xếp theo CategoryID tăng dần, Name alphabet
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
// Lọc dữ liệu khi search (frontend)
// ==============================
function searchFood(keyword) {
  if (!keyword) {
    filteredData = [...foodData];
  } else {
    filteredData = foodData.filter((item) =>
      item.Name.toLowerCase().includes(keyword.toLowerCase())
    );
  }
  currentPage = 1;
  renderTablePage();
}

// ==============================
// Hiển thị trang hiện tại
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
// Thanh phân trang với nút trước / sau
// ==============================
function renderPaginationControls() {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  pagination.innerHTML = "";
  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Nút Trang trước
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "« Trước";
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTablePage();
    }
  });
  pagination.appendChild(prevBtn);

  // Nút số trang
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "active" : "";
    btn.addEventListener("click", () => {
      currentPage = i;
      renderTablePage();
    });
    pagination.appendChild(btn);
  }

  // Nút Trang sau
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Sau »";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderTablePage();
    }
  });
  pagination.appendChild(nextBtn);
}

// ==============================
// Thêm sự kiện tìm kiếm
// ==============================
const searchInput = document.querySelector(".search-box-1 input");

searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.trim().toLowerCase();

  if (!keyword) {
    // nếu trống, hiển thị tất cả
    filteredData = [...foodData];
  } else {
    // lọc theo tên món
    filteredData = foodData.filter((item) =>
      item.Name.toLowerCase().includes(keyword)
    );
  }

  currentPage = 1; // reset về trang đầu
  renderTablePage();
});

// ==============================
// Thêm món
// ==============================
async function addFood() {
  const name = document.getElementById("item-name").value.trim();
  const categoryID = parseInt(document.getElementById("item-category").value);
  const price = parsePrice(document.getElementById("item-price").value);
  const status = parseInt(document.getElementById("item-status").value);

  if (!name) return alert("Vui lòng nhập tên món!");
  if (isNaN(categoryID)) return alert("Vui lòng chọn danh mục!");
  if (isNaN(price) || price <= 0) return alert("Vui lòng nhập giá hợp lệ!");
  if (isNaN(status)) return alert("Vui lòng chọn trạng thái!");

  try {
    const res = await fetch("http://localhost:3000/api/food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, categoryID, price, status }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Có lỗi xảy ra khi thêm món");
      return;
    }

    alert("Thêm món thành công!");
    loadFood();
    clearForm();
  } catch (err) {
    alert("Không thể kết nối tới server!");
    console.error(err);
  }
}

// ==============================
// Sửa món
// ==============================
async function updateFood() {
  const id = parseInt(document.getElementById("item-id").value);
  if (!id) return alert("Hãy chọn món!");

  const name = document.getElementById("item-name").value;
  const categoryID = parseInt(document.getElementById("item-category").value);
  const price = parsePrice(document.getElementById("item-price").value);
  const status = parseInt(document.getElementById("item-status").value);

  const res = await fetch(`http://localhost:3000/api/food/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, categoryID, price, status }),
  });

  const data = await res.json();
  alert(data.message);
  loadFood();
  clearForm();
}

// ==============================
// Xóa món
// ==============================
async function deleteFood() {
  const id = parseInt(document.getElementById("item-id").value);
  if (!id) return alert("Hãy chọn món!");
  if (!confirm("Bạn chắc chắn muốn xóa?")) return;

  const res = await fetch(`http://localhost:3000/api/food/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();

  alert(data.message);
  loadFood();
  clearForm();
}

// ==============================
// Clear form
// ==============================
function clearForm() {
  document.getElementById("item-id").value = "";
  document.getElementById("item-name").value = "";
  document.getElementById("item-price").value = "";
  document.getElementById("item-status").value = 1;
}

// ==============================
// Xuất Excel / PDF
// ==============================
function exportExcel(tableName) {
  if (!tableName) return alert("Không xác định bảng để xuất Excel!");
  window.open(`http://localhost:3000/api/export/${tableName}/excel`);
}

function exportPDF(tableName) {
  if (!tableName) return alert("Không xác định bảng để xuất PDF!");
  window.open(`http://localhost:3000/api/export/${tableName}/pdf`);
}

// ==============================
// Khởi chạy
// ==============================
window.onload = () => {
  loadCategoriesToDropdown();
  loadFood();
};
