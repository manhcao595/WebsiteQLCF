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
function changePassword() {
  const oldPass = document.getElementById("oldPass").value.trim();
  const newPass = document.getElementById("newPass").value.trim();
  const confirmPass = document.getElementById("confirmPass").value.trim();

  // Lấy danh sách tài khoản
  let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

  // Lấy currentUser (object)
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    alert("Chưa có người dùng đăng nhập!");
    return;
  }

  console.log("Current user:", currentUser);
  console.log("Accounts:", accounts);

  // Tìm tài khoản trong danh sách
  let user = accounts.find((acc) => acc.username === currentUser.username);

  if (!user) {
    alert("Không tìm thấy tài khoản hiện tại!");
    return;
  }

  // Kiểm tra mật khẩu cũ
  if (oldPass !== user.password) {
    alert("Mật khẩu hiện tại không chính xác!");
    return;
  }

  // Kiểm tra mật khẩu mới
  if (newPass !== confirmPass) {
    alert("Mật khẩu nhập lại không khớp!");
    return;
  }

  if (newPass.length < 3) {
    alert("Mật khẩu mới phải có ít nhất 3 ký tự!");
    return;
  }

  // Cập nhật mật khẩu
  user.password = newPass;

  // Cập nhật accounts và currentUser
  localStorage.setItem("accounts", JSON.stringify(accounts));
  currentUser.password = newPass;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  alert("Đổi mật khẩu thành công!");

  // Xóa dữ liệu ô nhập
  document.getElementById("oldPass").value = "";
  document.getElementById("newPass").value = "";
  document.getElementById("confirmPass").value = "";
}
