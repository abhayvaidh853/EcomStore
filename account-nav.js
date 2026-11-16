(() => {
    const link = document.getElementById("accountNav");
    if (!link) return;
    try {
        const email = JSON.parse(localStorage.getItem("ecomstore-session") || "null");
        const users = JSON.parse(localStorage.getItem("ecomstore-users") || "[]");
        const user = Array.isArray(users) ? users.find(item => item.email === email) : null;
        if (user) {
            link.href = "profile.html";
            link.textContent = `Hi, ${String(user.name || "there").split(" ")[0]}`;
            link.setAttribute("aria-label", "Open your profile");
        }
    } catch (error) {
        // Keep the sign-in link available if browser storage is unavailable.
    }
})();
