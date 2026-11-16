const CART_STORAGE_KEY = "ecomstore-cart";
const CHECKOUT_STORAGE_KEY = "ecomstore-checkout-details";
const COUPON_STORAGE_KEY = "ecomstore-coupon";
const COUPONS = {
    WELCOME10: { type: "percent", value: 10, minimum: 0, label: "10% off" },
    SAVE200: { type: "flat", value: 200, minimum: 1500, label: "₹200 off on orders of ₹1,500 or more" },
    FIRST15: { type: "percent", value: 15, cap: 500, minimum: 3000, label: "15% off up to ₹500 on orders of ₹3,000 or more" }
};
const checkoutItems = document.getElementById("checkoutItems");
const subtotalElement = document.getElementById("checkoutSubtotal");
const discountElement = document.getElementById("checkoutDiscount");
const totalElement = document.getElementById("checkoutTotal");
const couponInput = document.getElementById("couponInput");
const couponMessage = document.getElementById("couponMessage");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutMessage = document.getElementById("checkoutMessage");
const payButton = document.getElementById("payButton");

function readStorage(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value ?? fallback;
    } catch (error) {
        return fallback;
    }
}

const savedCart = readStorage(CART_STORAGE_KEY, []);
const cart = Array.isArray(savedCart)
    ? savedCart
        .filter(item => item && typeof item.name === "string" &&
            Number.isFinite(Number(item.price)) && Number(item.price) >= 0 &&
            Number.isSafeInteger(Number(item.quantity)) && Number(item.quantity) > 0)
        .map(item => ({ ...item, price: Number(item.price), quantity: Number(item.quantity) }))
    : [];
const storedCoupon = readStorage(COUPON_STORAGE_KEY, "");
let appliedCouponCode = storedCoupon === true ? "WELCOME10" : String(storedCoupon || "");

function money(amount) {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function renderOrder() {
    checkoutItems.replaceChildren();
    if (!Array.isArray(cart) || cart.length === 0) {
        checkoutItems.textContent = "Your cart is empty. Add products before checking out.";
        subtotalElement.textContent = money(0);
        discountElement.textContent = `−${money(0)}`;
        totalElement.textContent = money(0);
        payButton.disabled = true;
        return;
    }

    let subtotal = 0;
    cart.forEach(item => {
        const quantity = Number(item.quantity) || 0;
        const lineTotal = Number(item.price) * quantity;
        subtotal += lineTotal;

        const row = document.createElement("div");
        row.className = "checkout-item";
        const name = document.createElement("span");
        name.textContent = `${item.name} × ${quantity}`;
        const price = document.createElement("strong");
        price.textContent = money(lineTotal);
        row.append(name, price);
        checkoutItems.appendChild(row);
    });

    const coupon = COUPONS[appliedCouponCode];
    const discount = coupon
        ? Math.min(subtotal, coupon.type === "flat"
            ? coupon.value
            : Math.min(Math.round(subtotal * coupon.value / 100), coupon.cap ?? subtotal))
        : 0;
    subtotalElement.textContent = money(subtotal);
    discountElement.textContent = `−${money(discount)}`;
    totalElement.textContent = money(subtotal - discount);
    payButton.disabled = false;
}

function setCoupon(code, message, success = false) {
    appliedCouponCode = success ? code : "";
    couponMessage.textContent = message;
    couponMessage.classList.toggle("success", success);
    try {
        if (appliedCouponCode) {
            localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCouponCode));
        } else {
            localStorage.removeItem(COUPON_STORAGE_KEY);
        }
    } catch (error) {
        console.warn("Could not save coupon:", error);
    }
    renderOrder();
}

document.getElementById("applyCoupon").addEventListener("click", () => {
    const code = couponInput.value.trim().toUpperCase();
    const coupon = COUPONS[code];
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (!coupon) {
        setCoupon("", code ? "That coupon code isn’t valid." : "Enter a coupon code first.");
    } else if (subtotal < coupon.minimum) {
        setCoupon("", `This code requires a minimum order of ${money(coupon.minimum)}.`);
    } else {
        setCoupon(code, `${code} applied: ${coupon.label}.`, true);
    }
});

// Restore saved address fields for convenience.
const savedDetails = readStorage(CHECKOUT_STORAGE_KEY, {});
Object.entries(savedDetails && typeof savedDetails === "object" ? savedDetails : {}).forEach(([name, value]) => {
    const field = checkoutForm.elements.namedItem(name);
    if (field && field.type !== "radio" && typeof value === "string") field.value = value;
});
const signedInEmail = readStorage("ecomstore-session", "");
const savedUsers = readStorage("ecomstore-users", []);
const signedInUser = Array.isArray(savedUsers)
    ? savedUsers.find(user => user && user.email === signedInEmail)
    : null;
if (signedInUser) {
    if (!checkoutForm.elements.name.value) checkoutForm.elements.name.value = signedInUser.name || "";
    if (!checkoutForm.elements.phone.value) checkoutForm.elements.phone.value = signedInUser.phone || "";
}
if (typeof savedDetails.payment === "string") {
    const savedPayment = Array.from(checkoutForm.querySelectorAll('input[name="payment"]'))
        .find(option => option.value === savedDetails.payment);
    if (savedPayment) savedPayment.checked = true;
}

checkoutForm.addEventListener("submit", event => {
    event.preventDefault();
    if (cart.length === 0 || !checkoutForm.reportValidity()) return;

    const formData = new FormData(checkoutForm);
    const details = Object.fromEntries(formData.entries());
    try {
        localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(details));
    } catch (error) {
        console.warn("Could not save checkout details:", error);
    }

    try {
        localStorage.setItem("ecomstore-payment-method", JSON.stringify(details.payment));
    } catch (error) {
        console.warn("Could not save payment method:", error);
    }
    window.location.href = "payment.html";
});

if (COUPONS[appliedCouponCode]) {
    couponInput.value = appliedCouponCode;
    couponMessage.textContent = `${appliedCouponCode} applied: ${COUPONS[appliedCouponCode].label}.`;
    couponMessage.classList.add("success");
} else if (appliedCouponCode) {
    appliedCouponCode = "";
    try {
        localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch (error) {
        console.warn("Could not clear invalid coupon:", error);
    }
}
renderOrder();
