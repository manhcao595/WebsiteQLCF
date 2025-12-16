// ==============================
// Danh sách tài khoản demo
// ==============================
const accounts = [
  {
    username: "admin",
    password: "admin123",
    role: "manager",
  },
  {
    username: "staff",
    password: "staff123",
    role: "staff",
  },
];

// ==============================
// Lưu tài khoản lần đầu
// ==============================
if (!localStorage.getItem("accounts")) {
  localStorage.setItem("accounts", JSON.stringify(accounts));
}

// ==============================
// Tự điền nếu nhớ mật khẩu
// ==============================
window.addEventListener("DOMContentLoaded", () => {
  const remembered = JSON.parse(localStorage.getItem("rememberedAccount"));
  if (remembered) {
    document.getElementById("user").value = remembered.username;
    document.getElementById("pass").value = remembered.password;
    document.getElementById("remember").checked = true;
  }
});

// ==============================
// Đăng nhập
// ==============================
function login(event) {
  event.preventDefault();

  const username = document.getElementById("user").value.trim();
  const password = document.getElementById("pass").value.trim();
  const remember = document.getElementById("remember").checked;

  const storedAccounts = JSON.parse(localStorage.getItem("accounts")) || [];

  const account = storedAccounts.find(
    (acc) => acc.username === username && acc.password === password
  );

  if (!account) {
    alert("Sai tên đăng nhập hoặc mật khẩu!");
    return;
  }

  // Lưu user đang đăng nhập
  localStorage.setItem("currentUser", JSON.stringify(account));
  localStorage.setItem("role", account.role);

  // Nhớ mật khẩu
  if (remember) {
    localStorage.setItem(
      "rememberedAccount",
      JSON.stringify({ username, password })
    );
  } else {
    localStorage.removeItem("rememberedAccount");
  }

  // ==============================
  // CHUYỂN TRANG THEO QUYỀN
  // ==============================
  if (account.role === "manager") {
    window.location.href = "all-table-admin.html";
  } else if (account.role === "staff") {
    window.location.href = "all-table-staff.html";
  }
}
