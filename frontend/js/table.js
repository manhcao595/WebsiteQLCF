// ===============================
// LOGOUT
// ===============================
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
// LOCALSTORAGE KEY
// ===============================
const TABLE_KEY = "tables";

// ===============================
// BIẾN TOÀN CỤC
// ===============================
let tables = [];
let currentPage = 1;
const rowsPerPage = 10;

// ===============================
// LOCALSTORAGE HELPER
// ===============================
function getTables() {
  return JSON.parse(localStorage.getItem(TABLE_KEY)) || [];
}

function saveTables(data) {
  localStorage.setItem(TABLE_KEY, JSON.stringify(data));
}

// ===============================
// LOAD DỮ LIỆU
// ===============================
function loadTables() {
  tables = getTables();
  currentPage = 1;
  renderTable();
  renderPagination();
}

// ===============================
// HIỂN THỊ BẢNG THEO TRANG
// ===============================
function renderTable() {
  const tbody = document.querySelector(".table tbody");
  tbody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageItems = tables.slice(start, end);

  pageItems.forEach((t) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.TableID}</td>
      <td>${t.TableName}</td>
      <td>${t.Status}</td>
    `;

    row.onclick = () => {
      document.getElementById("table-id").value = t.TableID;
      document.getElementById("table-name").value = t.TableName;
      document.getElementById("table-status").value = t.Status;
    };

    tbody.appendChild(row);
  });
}

// ===============================
// PHÂN TRANG
// ===============================
function renderPagination() {
  const totalPages = Math.ceil(tables.length / rowsPerPage);
  const pageNumbers = document.getElementById("page-numbers");
  pageNumbers.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");

    btn.onclick = () => {
      currentPage = i;
      renderTable();
      renderPagination();
    };

    pageNumbers.appendChild(btn);
  }

  document.getElementById("prev-page").onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
      renderPagination();
    }
  };

  document.getElementById("next-page").onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderTable();
      renderPagination();
    }
  };
}

// ===============================
// CLEAR FORM
// ===============================
function clearForm() {
  document.getElementById("table-id").value = "";
  document.getElementById("table-name").value = "";
  document.getElementById("table-status").value = "Trống";
}

// ===============================
// THÊM BÀN
// ===============================
function addTable() {
  const tableName = document.getElementById("table-name").value.trim();
  const status = document.getElementById("table-status").value;

  if (!tableName) return alert("Tên bàn không được để trống!");

  let data = getTables();

  const newTable = {
    TableID: data.length > 0 ? Math.max(...data.map((t) => t.TableID)) + 1 : 1,
    TableName: tableName,
    Status: status,
  };

  data.push(newTable);
  saveTables(data);

  alert("Thêm bàn thành công!");
  clearForm();
  loadTables();
}

// ===============================
// CẬP NHẬT BÀN
// ===============================
function updateTable() {
  const id = parseInt(document.getElementById("table-id").value);
  const tableName = document.getElementById("table-name").value.trim();
  const status = document.getElementById("table-status").value;

  if (!id) return alert("Chọn bàn để cập nhật!");
  if (!tableName) return alert("Tên bàn không được để trống!");

  let data = getTables();
  const index = data.findIndex((t) => t.TableID === id);

  if (index === -1) return alert("Bàn không tồn tại!");

  data[index].TableName = tableName;
  data[index].Status = status;

  saveTables(data);

  alert("Cập nhật thành công!");
  clearForm();
  loadTables();
}

// ===============================
// XÓA BÀN
// ===============================
function deleteTable() {
  const id = parseInt(document.getElementById("table-id").value);
  if (!id) return alert("Chọn bàn để xóa!");

  if (!confirm("Bạn chắc chắn muốn xóa bàn này?")) return;

  let data = getTables().filter((t) => t.TableID !== id);
  saveTables(data);

  alert("Xóa bàn thành công!");
  clearForm();
  loadTables();
}

// ===============================
// EXPORT (MÔ PHỎNG)
// ===============================
function exportExcel() {
  alert("Xuất Excel mô phỏng (không backend)");
}

function exportPDF() {
  alert("Xuất PDF mô phỏng (không backend)");
}

// ===============================
// INIT
// ===============================
window.onload = () => {
  loadTables();
};
