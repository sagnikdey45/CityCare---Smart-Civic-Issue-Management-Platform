async function loginUser(email, password) {
  const mockUser = {
    email: "valid@email.com",
    password: "correctPassword",
  };

  if (!email || !password) {
    return { success: false, message: "Missing credentials" };
  }

  if (email === mockUser.email && password === mockUser.password) {
    return { success: true, message: "Login successful" };
  }

  return { success: false, message: "Invalid credentials" };
}

module.exports = { loginUser };
