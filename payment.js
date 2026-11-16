(() => {
    const CART_KEY = "ecomstore-cart";
    const CHECKOUT_KEY = "ecomstore-checkout-details";
    const COUPON_KEY = "ecomstore-coupon";
    const ORDERS_KEY = "ecomstore-orders";
    const PAYMENT_KEY = "ecomstore-payment-method";
    const read = (key, fallback) => {
        try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
        catch (error) { return fallback; }
    };
    const cartData = read(CART_KEY, []);
    const cart = Array.isArray(cartData) ? cartData.filter(item => item &&
        typeof item.name === "string" && Number.isFinite(Number(item.price)) &&
        Number(item.price) >= 0 && Number.isSafeInteger(Number(item.quantity)) &&
        Number(item.quantity) > 0).map(item => ({
            id: item.id, name: item.name, price: Number(item.price), quantity: Number(item.quantity)
        })) : [];
    const checkout = read(CHECKOUT_KEY, {});
    const savedCoupon = read(COUPON_KEY, "");
    const couponCode = savedCoupon === true ? "WELCOME10" : String(savedCoupon || "");
    const couponRules = {
        WELCOME10: { type: "percent", value: 10, minimum: 0 },
        SAVE200: { type: "flat", value: 200, minimum: 1500 },
        FIRST15: { type: "percent", value: 15, cap: 500, minimum: 3000 }
    };
    const money = amount => `₹${Number(amount).toLocaleString("en-IN")}`;
    const totalItems = document.getElementById("paymentItems");
    const confirmButton = document.getElementById("confirmOrder");
    const paymentMessage = document.getElementById("paymentMessage");
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const rule = couponRules[couponCode];
    const discount = rule && subtotal >= rule.minimum
        ? Math.min(subtotal, rule.type === "flat" ? rule.value : Math.min(
            Math.round(subtotal * rule.value / 100), rule.cap ?? subtotal
        ))
        : 0;

    if (cart.length === 0) {
        totalItems.textContent = "Your cart is empty. Return to the store to add products.";
        confirmButton.disabled = true;
    } else {
        cart.forEach(item => {
            const row = document.createElement("div");
            row.className = "checkout-item";
            const label = document.createElement("span");
            label.textContent = `${item.name} × ${item.quantity}`;
            const price = document.createElement("strong");
            price.textContent = money(item.price * item.quantity);
            row.append(label, price);
            totalItems.appendChild(row);
        });
    }

    document.getElementById("paymentSubtotal").textContent = money(subtotal);
    document.getElementById("paymentDiscount").textContent = `−${money(discount)}`;
    document.getElementById("paymentTotal").textContent = money(subtotal - discount);
    if (rule && discount > 0) {
        document.getElementById("paymentDiscountLabel").textContent = `Discount (${couponCode})`;
    }

    const address = document.getElementById("paymentAddress");
    const addressLines = [checkout.name, checkout.street, [checkout.city, checkout.state, checkout.pin].filter(Boolean).join(", "), checkout.phone]
        .filter(value => typeof value === "string" && value.trim());
    address.textContent = addressLines.length ? addressLines.join(" · ") : "No delivery address saved yet.";
    const hasCompleteAddress = ["name", "phone", "street", "city", "state", "pin"]
        .every(key => typeof checkout[key] === "string" && checkout[key].trim());
    if (cart.length > 0 && !hasCompleteAddress) {
        paymentMessage.textContent = "Add your delivery address in checkout before confirming the order.";
        confirmButton.disabled = true;
    }

    const savedMethod = read(PAYMENT_KEY, "upi");
    const methodOption = Array.from(document.querySelectorAll('input[name="payment"]'))
        .find(option => option.value === savedMethod);
    if (methodOption) methodOption.checked = true;

    confirmButton.addEventListener("click", () => {
        if (cart.length === 0) return;
        const payment = document.querySelector('input[name="payment"]:checked');
        if (!payment) {
            paymentMessage.textContent = "Choose a payment method to continue.";
            return;
        }

        const existingOrders = read(ORDERS_KEY, []);
        const orders = Array.isArray(existingOrders) ? existingOrders : [];
        const orderNumber = `EC${Date.now().toString().slice(-8)}`;
        const sessionEmail = read("ecomstore-session", "");
        orders.unshift({
            id: orderNumber,
            email: typeof sessionEmail === "string" ? sessionEmail : "",
            items: cart,
            address: checkout,
            subtotal,
            discount,
            coupon: discount ? couponCode : "",
            total: subtotal - discount,
            payment: payment.value,
            createdAt: new Date().toISOString()
        });

        try {
            localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
            localStorage.setItem(CART_KEY, "[]");
            localStorage.removeItem(COUPON_KEY);
            localStorage.removeItem(PAYMENT_KEY);
        } catch (error) {
            paymentMessage.textContent = "Could not save your demo order. Check browser storage and try again.";
            return;
        }

        document.getElementById("paymentContent").hidden = true;
        const confirmation = document.getElementById("orderConfirmation");
        confirmation.hidden = false;
        document.getElementById("confirmationText").textContent =
            `Demo order ${orderNumber} is confirmed. ${payment.value === "cod" ? "Payment is due on delivery." : "No payment was collected in this demo."}`;
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
})();
