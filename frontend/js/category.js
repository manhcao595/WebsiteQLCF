function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}

// =======================
// 1. LOAD CATEGORY LÊN BẢNG
// =======================
async function loadCategories() {
  const res = await fetch("http://localhost:3000/api/categories");
  const data = await res.json();

  const tbody = document.getElementById("category-body");
  tbody.innerHTML = "";

  data.forEach((cat) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${cat.CategoryID}</td>
            <td>${cat.Name}</td>
        `;

    // Khi click vào dòng -> hiện lên ô input
    row.addEventListener("click", () => {
      document.getElementById("cat-id").value = cat.CategoryID;
      document.getElementById("cat-name").value = cat.Name;
    });

    tbody.appendChild(row);
  });
}

// Load khi trang mở
window.onload = loadCategories;

// =======================
// 2. THÊM DANH MỤC
// =======================
async function addCategory() {
  let name = document.getElementById("cat-name").value;

  if (!name.trim()) {
    alert("Tên danh mục không được để trống");
    return;
  }

  const res = await fetch("http://localhost:3000/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (res.ok) {
    alert("Thêm thành công!");
    loadCategories();
    clearForm();
  } else {
    alert("Lỗi thêm danh mục");
  }
}

// =======================
// 3. SỬA DANH MỤC
// =======================
async function updateCategory() {
  let id = parseInt(document.getElementById("cat-id").value);
  let name = document.getElementById("cat-name").value;

  if (!id || isNaN(id)) {
    alert("Hãy chọn danh mục cần sửa!");
    return;
  }
  if (!name.trim()) {
    alert("Tên danh mục không được để trống!");
    return;
  }

  console.log("PUT /api/categories/" + id, "body:", { name });

  const res = await fetch(`http://localhost:3000/api/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (res.ok) {
    alert("Cập nhật thành công!");
    loadCategories();
    clearForm();
  } else {
    const err = await res.json();
    alert("Lỗi cập nhật: " + err.message);
  }
}

// =======================
// 4. XÓA DANH MỤC
// =======================
async function deleteCategory() {
  let id = parseInt(document.getElementById("cat-id").value);

  if (!id) {
    alert("Hãy chọn danh mục cần xóa!");
    return;
  }

  if (!confirm("Bạn có chắc chắn muốn xóa không?")) return;

  const res = await fetch(`http://localhost:3000/api/categories/${id}`, {
    method: "DELETE",
  });

  if (res.ok) {
    alert("Xóa thành công!");
    loadCategories();
    clearForm();
  } else {
    alert("Lỗi xóa danh mục");
  }
}

// =======================
// 5. CLEAR FORM
// =======================
function clearForm() {
  document.getElementById("cat-id").value = "";
  document.getElementById("cat-name").value = "";
}
// =======================
// BIẾN LƯU TẤT CẢ CATEGORY
// =======================
let allCategories = [];

// =======================
// 1. LOAD CATEGORY LÊN BẢNG
// =======================
async function loadCategories() {
  const res = await fetch("http://localhost:3000/api/categories");
  const data = await res.json();

  allCategories = data; // lưu dữ liệu để tìm kiếm

  renderTable(data);
}

document.getElementById("search-box").addEventListener("input", function () {
  let keyword = this.value.toLowerCase();

  let filtered = allCategories.filter((cat) =>
    cat.Name.toLowerCase().includes(keyword)
  );

  renderTable(filtered);
});
// Hàm render bảng
function renderTable(list) {
  const tbody = document.getElementById("category-body");
  tbody.innerHTML = "";

  list.forEach((cat) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${cat.CategoryID}</td>
        <td>${cat.Name}</td>
    `;

    row.addEventListener("click", () => {
      document.getElementById("cat-id").value = cat.CategoryID;
      document.getElementById("cat-name").value = cat.Name;
    });

    tbody.appendChild(row);
  });
}

function exportExcel(tableName) {
  if (!tableName) return alert("Không xác định bảng để xuất Excel!");
  window.open(`http://localhost:3000/api/export/${tableName}/excel`);
}

function exportPDF(tableName) {
  if (!tableName) return alert("Không xác định bảng để xuất PDF!");
  window.open(`http://localhost:3000/api/export/${tableName}/pdf`);
}

// Load khi mở trang
window.onload = loadCategories;
