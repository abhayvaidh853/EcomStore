(() => {
    const USERS_KEY = "ecomstore-users";
    const SESSION_KEY = "ecomstore-session";
    const CHECKOUT_KEY = "ecomstore-checkout-details";
    const ORDERS_KEY = "ecomstore-orders";

    function read(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
        catch (error) { return fallback; }
    }

    const email = read(SESSION_KEY, "");
    const users = read(USERS_KEY, []);
    const userList = Array.isArray(users) ? users.filter(account => account && typeof account.email === "string") : [];
    const user = userList.find(account => account.email === email);
    if (!user) {
        window.location.replace("account.html");
        return;
    }

    const form = document.getElementById("profileForm");
    form.elements.name.value = user.name || "";
    form.elements.email.value = user.email;
    form.elements.phone.value = user.phone || "";

    form.addEventListener("submit", event => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const updatedUser = {
            ...user,
            name: form.elements.name.value.trim(),
            phone: form.elements.phone.value.trim()
        };
        const updatedUsers = userList.map(account => account.email === email ? updatedUser : account);
        try {
            localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
            const checkout = read(CHECKOUT_KEY, {});
            localStorage.setItem(CHECKOUT_KEY, JSON.stringify({
                ...(checkout && typeof checkout === "object" ? checkout : {}),
                name: updatedUser.name,
                phone: updatedUser.phone
            }));
            document.getElementById("profileMessage").textContent = "Profile saved.";
            document.getElementById("profileMessage").classList.add("success");
        } catch (error) {
            document.getElementById("profileMessage").textContent = "Could not save the profile. Check browser storage and try again.";
        }
    });

    document.getElementById("logoutButton").addEventListener("click", () => {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = "account.html";
    });

    const savedOrders = read(ORDERS_KEY, []);
    const orders = (Array.isArray(savedOrders) ? savedOrders : [])
        .filter(order => order && order.email === email);
    const ordersContainer = document.getElementById("profileOrders");
    if (orders.length === 0) {
        ordersContainer.textContent = "You haven’t placed any orders yet.";
    } else {
        orders.slice(0, 10).forEach(order => {
            const article = document.createElement("article");
            article.className = "profile-order";
            const heading = document.createElement("strong");
            heading.textContent = `Order ${order.id}`;
            const info = document.createElement("span");
            const date = new Date(order.createdAt);
            info.textContent = `${Number.isNaN(date.getTime()) ? "Recent order" : date.toLocaleDateString("en-IN")} · ${money(order.total)}`;
            article.append(heading, info);
            ordersContainer.appendChild(article);
        });
    }

    function money(amount) {
        return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
    }
})();
