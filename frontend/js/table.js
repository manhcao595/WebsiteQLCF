let tables = []; // toàn bộ dữ liệu
let currentPage = 1;
const rowsPerPage = 10;

function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}

const API = "http://localhost:3000/api/tables";

// ===============================
// LOAD DỮ LIỆU
// ===============================
async function loadTables() {
  try {
    const res = await fetch(API);
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("API trả về không phải mảng:", data);
      return;
    }

    tables = data;
    currentPage = 1;
    renderTable();
    renderPagination();
  } catch (err) {
    console.error(err);
    alert("Không thể load dữ liệu bàn!");
  }
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

    btn.addEventListener("click", () => {
      currentPage = i;
      renderTable();
      renderPagination();
    });

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
// XÓA FORM
// ===============================
function clearForm() {
  document.getElementById("table-id").value = "";
  document.getElementById("table-name").value = "";
  document.getElementById("table-status").value = "Trống";
}

// ===============================
// THÊM BÀN
// ===============================
async function addTable() {
  const tableName = document.getElementById("table-name").value;
  const status = document.getElementById("table-status").value;

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableName, status }),
    });
    const data = await res.json();
    alert(data.message);
    clearForm();
    loadTables();
  } catch (err) {
    console.error(err);
    alert("Thêm bàn thất bại!");
  }
}

// ===============================
// CẬP NHẬT BÀN
// ===============================
async function updateTable() {
  const id = document.getElementById("table-id").value;
  const tableName = document.getElementById("table-name").value;
  const status = document.getElementById("table-status").value;

  try {
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableName, status }),
    });
    const data = await res.json();
    alert(data.message);
    clearForm();
    loadTables();
  } catch (err) {
    console.error(err);
    alert("Cập nhật bàn thất bại!");
  }
}

// ===============================
// XÓA BÀN
// ===============================
async function deleteTable() {
  const id = document.getElementById("table-id").value;
  if (!id) return alert("Chọn bàn để xóa!");

  try {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    const data = await res.json();
    alert(data.message);
    clearForm();
    loadTables();
  } catch (err) {
    console.error(err);
    alert("Xóa bàn thất bại!");
  }
}
function exportExcel(tableName) {
  if (!tableName) return alert("Không xác định bảng để xuất Excel!");
  window.open(`http://localhost:3000/api/export/${tableName}/excel`);
}

function exportPDF(tableName) {
  if (!tableName) return alert("Không xác định bảng để xuất PDF!");
  window.open(`http://localhost:3000/api/export/${tableName}/pdf`);
}
// ===============================
// KHI LOAD TRANG
// ===============================
window.onload = () => {
  loadTables();
};
