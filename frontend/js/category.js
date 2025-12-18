// =======================
// LOGOUT
// =======================
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
// =======================
// KEY LOCALSTORAGE
// =======================
const CATEGORY_KEY = "categories";

// =======================
// BIẾN LƯU DANH MỤC
// =======================
let allCategories = [];

// =======================
// LẤY DỮ LIỆU TỪ LOCALSTORAGE
// =======================
function getCategories() {
  return JSON.parse(localStorage.getItem(CATEGORY_KEY)) || [];
}

// =======================
// LƯU DỮ LIỆU VÀO LOCALSTORAGE
// =======================
function saveCategories(data) {
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(data));
}

// =======================
// LOAD CATEGORY LÊN BẢNG
// =======================
function loadCategories() {
  allCategories = getCategories();
  renderTable(allCategories);
}

// =======================
// RENDER TABLE
// =======================
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

// =======================
// THÊM DANH MỤC
// =======================
function addCategory() {
  let name = document.getElementById("cat-name").value.trim();
  if (!name) {
    alert("Tên danh mục không được để trống!");
    return;
  }

  let categories = getCategories();

  let newCategory = {
    CategoryID:
      categories.length > 0
        ? Math.max(...categories.map((c) => c.CategoryID)) + 1
        : 1,
    Name: name,
  };

  categories.push(newCategory);
  saveCategories(categories);

  alert("Thêm thành công!");
  loadCategories();
  clearForm();
}

// =======================
// SỬA DANH MỤC
// =======================
function updateCategory() {
  let id = parseInt(document.getElementById("cat-id").value);
  let name = document.getElementById("cat-name").value.trim();

  if (!id) {
    alert("Hãy chọn danh mục cần sửa!");
    return;
  }
  if (!name) {
    alert("Tên danh mục không được để trống!");
    return;
  }

  let categories = getCategories();
  let index = categories.findIndex((c) => c.CategoryID === id);

  if (index === -1) {
    alert("Danh mục không tồn tại!");
    return;
  }

  categories[index].Name = name;
  saveCategories(categories);

  alert("Cập nhật thành công!");
  loadCategories();
  clearForm();
}

// =======================
// XÓA DANH MỤC
// =======================
function deleteCategory() {
  let id = parseInt(document.getElementById("cat-id").value);

  if (!id) {
    alert("Hãy chọn danh mục cần xóa!");
    return;
  }

  if (!confirm("Bạn có chắc chắn muốn xóa không?")) return;

  let categories = getCategories();
  categories = categories.filter((c) => c.CategoryID !== id);

  saveCategories(categories);

  alert("Xóa thành công!");
  loadCategories();
  clearForm();
}

// =======================
// CLEAR FORM
// =======================
function clearForm() {
  document.getElementById("cat-id").value = "";
  document.getElementById("cat-name").value = "";
}

// =======================
// TÌM KIẾM
// =======================
document.getElementById("search-box").addEventListener("input", function () {
  let keyword = this.value.toLowerCase();
  let filtered = allCategories.filter((cat) =>
    cat.Name.toLowerCase().includes(keyword)
  );
  renderTable(filtered);
});

// =======================
// EXPORT (THÔNG BÁO GIẢ LẬP)
// =======================
function exportExcel() {
  alert("Chức năng export Excel mô phỏng (chưa dùng backend)");
}

function exportPDF() {
  alert("Chức năng export PDF mô phỏng (chưa dùng backend)");
}

// =======================
// LOAD KHI MỞ TRANG
// =======================
window.onload = loadCategories;
