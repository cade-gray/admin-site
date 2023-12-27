export async function logoutPost() {
  const tokenString = sessionStorage.getItem("cg-admin-token");
  const { user, token } = JSON.parse(tokenString);
  try {
    await fetch("https://api.cadegray.dev/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user }),
    });
  } catch (error) {
    alert("error logging out: " + error);
  }
}
