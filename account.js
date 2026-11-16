(() => {
    const USERS_KEY = "ecomstore-users";
    const SESSION_KEY = "ecomstore-session";
    const message = document.getElementById("accountMessage");
    const loginForm = document.getElementById("loginPanel");
    const signupForm = document.getElementById("signupPanel");
    const loginTab = document.getElementById("loginTab");
    const signupTab = document.getElementById("signupTab");

    function readUsers() {
        try {
            const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
            return Array.isArray(users) ? users.filter(user => user && typeof user.email === "string") : [];
        } catch (error) {
            return [];
        }
    }

    function setMessage(text, isSuccess = false) {
        message.textContent = text;
        message.classList.toggle("success", isSuccess);
    }

    function activateTab(tab) {
        const isLogin = tab === "login";
        loginForm.hidden = !isLogin;
        signupForm.hidden = isLogin;
        loginTab.classList.toggle("active", isLogin);
        signupTab.classList.toggle("active", !isLogin);
        loginTab.setAttribute("aria-selected", String(isLogin));
        signupTab.setAttribute("aria-selected", String(!isLogin));
        setMessage("");
    }

    function bytesToHex(bytes) {
        return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
    }

    function hexToBytes(hex) {
        return new Uint8Array(hex.match(/.{2}/g).map(pair => parseInt(pair, 16)));
    }

    async function hashPassword(password, saltHex) {
        if (!window.crypto?.subtle) throw new Error("Secure browser crypto is unavailable. Open this site with localhost or HTTPS.");
        const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
        const bits = await crypto.subtle.deriveBits({
            name: "PBKDF2", salt: hexToBytes(saltHex), iterations: 150000, hash: "SHA-256"
        }, key, 256);
        return bytesToHex(new Uint8Array(bits));
    }

    function setSession(email) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(email));
        window.location.href = "profile.html";
    }

    loginTab.addEventListener("click", () => activateTab("login"));
    signupTab.addEventListener("click", () => activateTab("signup"));

    signupForm.addEventListener("submit", async event => {
        event.preventDefault();
        if (!signupForm.reportValidity()) return;
        const formData = new FormData(signupForm);
        const name = String(formData.get("name")).trim();
        const email = String(formData.get("email")).trim().toLowerCase();
        const password = String(formData.get("password"));
        const users = readUsers();
        if (users.some(user => user.email === email)) {
            activateTab("login");
            loginForm.elements.email.value = email;
            setMessage("An account with this email already exists. Please log in.");
            return;
        }

        try {
            const salt = bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
            const passwordHash = await hashPassword(password, salt);
            users.push({ name, email, phone: "", salt, passwordHash, createdAt: new Date().toISOString() });
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            setSession(email);
        } catch (error) {
            setMessage(error.message || "Could not create the account. Check browser storage and try again.");
        }
    });

    loginForm.addEventListener("submit", async event => {
        event.preventDefault();
        if (!loginForm.reportValidity()) return;
        const formData = new FormData(loginForm);
        const email = String(formData.get("email")).trim().toLowerCase();
        const password = String(formData.get("password"));
        const user = readUsers().find(account => account.email === email);
        if (!user) {
            setMessage("Account not found. Check the email or create an account.");
            return;
        }
        try {
            if (await hashPassword(password, user.salt) !== user.passwordHash) {
                setMessage("Email or password is incorrect.");
                return;
            }
            setSession(email);
        } catch (error) {
            setMessage(error.message || "Could not log in. Please try again.");
        }
    });
})();
