// // Data Storage

// const products = [

//     {
//         id: 1,
//         name: "Wireless....",
//         price: 999,
//         desc: "utffhgvgvvhvhg"
//     },

//      {
//         id: 2,
//         name: "Wireless....",
//         price: 999,
//         desc: "uyfuyfguv"
//     }
// ]



// ForEach method() se loop

// products.forEach(product => {
//     console.log(product.name)
// })

const name = "<h1>Hello</h1>"

console.log(name)

document.body.innerHTML = name










"use strict";

// STEP 1: Connect HTML Elements

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const cartButton = document.getElementById("cartBtn");
const cartCount = document.getElementById("cartCount");
const categoryFilters = document.getElementById("category-Filters");
const productGrid = document.getElementById("productGrid");
const sortSelect = document.getElementById("sortSelect");

const productModal = document.getElementById("productModal");
const productDetails = document.getElementById("productDetails");
const closeModal = document.getElementById("closeModal");


// STEP 2: Product Data

const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        Categories: "electronics",
        price: 1999,
        rating: 4.5,
        image: "images/headphones.jpg"
    },
    {
        id: 2,
        name: "Smart Watch",
        Categories: "electronics",
        price: 2999,
        rating: 4.7,
        image: "images/smartwatch.jpg"
    },
    {
        id: 3,
        name: "Bluetooth Speaker",
        Categories: "electronics",
        price: 1499,
        rating: 4.3,
        image: "images/speaker.jpg"
    },
    {
        id: 4,
        name: "Digital Camera",
        Categories: "electronics",
        price: 8999,
        rating: 4.8,
        image: "images/camera.jpg"
    },
    {
        id: 5,
        name: "Men's Casual Shirt",
        Categories: "fashion",
        price: 999,
        rating: 4.2,
        image: "images/shirt.jpg"
    },
    {
        id: 6,
        name: "Women's Handbag",
        Categories: "fashion",
        price: 1599,
        rating: 4.6,
        image: "images/handbag.jpg"
    },
    {
        id: 7,
        name: "Wireless Mouse",
        Categories: "computer accessories",
        price: 699,
        rating: 4.4,
        image: "images/mouse.jpg"
    },
    {
        id: 8,
        name: "Mechanical Keyboard",
        Categories: "computer accessories",
        price: 2499,
        rating: 4.7,
        image: "images/keyboard.jpg"
    },
    {
        id: 9,
        name: "Table Lamp",
        Categories: "home & living",
        price: 899,
        rating: 4.1,
        image: "images/lamp.jpg"
    },
    {
        id: 10,
        name: "Decorative Plant",
        Categories: "home & living",
        price: 499,
        rating: 4.3,
        image: "images/plant.jpg"
    }
];


// STEP 3: Cart Count

let cartItems = 0;


// STEP 4: Escape HTML

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}


// STEP 5: Render Products

function renderProducts(productList) {

    if (productList.length === 0) {
        productGrid.innerHTML = "<p>No products found.</p>";
        return;
    }

    productGrid.innerHTML = productList.map(product => `
        <div class="product-card">

            <img
                src="${escapeHTML(product.image)}"
                alt="${escapeHTML(product.name)}"
            >

            <h3>${escapeHTML(product.name)}</h3>

            <p>Category: ${escapeHTML(product.Categories)}</p>

            <p>Price: ₹${Number(product.price).toLocaleString("en-IN")}</p>

            <p>Rating: ${Number(product.rating).toFixed(1)} ⭐</p>

            <button
                class="view-details-btn"
                type="button"
                data-product-id="${Number(product.id)}"
            >
                View Details
            </button>

            <button
                class="add-to-cart-btn"
                type="button"
                data-product-id="${Number(product.id)}"
                disabled
            >
                Add to Cart
            </button>

        </div>
    `).join("");
}


// STEP 6: Search, Category Filter and Sorting

let selectedCategory = "all";

function applyFilters() {

    const searchTerm = searchInput.value.toLowerCase().trim();

    let filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm)
    );

    if (selectedCategory !== "all") {

        filteredProducts = filteredProducts.filter(product =>
            product.Categories === selectedCategory.toLowerCase()
        );
    }

    const sortValue = sortSelect.value;

    if (sortValue === "price-low") {
        filteredProducts.sort((a, b) => a.price - b.price);
    }

    else if (sortValue === "price-high") {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    else if (sortValue === "rating") {
        filteredProducts.sort((a, b) => b.rating - a.rating);
    }

    renderProducts(filteredProducts);
}


// STEP 7: Search Events

searchBtn.addEventListener("click", applyFilters);

searchInput.addEventListener("input", applyFilters);

searchInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        applyFilters();
    }

});


// STEP 8: Category Filter Events

categoryFilters.addEventListener("click", function (event) {

    const button = event.target.closest("button[data-category]");

    if (!button) {
        return;
    }

    selectedCategory = button.dataset.category;

    applyFilters();

});


// STEP 9: Sorting Event

sortSelect.addEventListener("change", applyFilters);


// STEP 10: Open Product Details Modal

function openProductModal(productId) {

    const product = products.find(item =>
        String(item.id) === String(productId)
    );

    if (!product) {
        console.log("Product not found.");
        return;
    }

    productDetails.innerHTML = `
        <img
            class="modal-product-image"
            src="${escapeHTML(product.image)}"
            alt="${escapeHTML(product.name)}"
        >

        <h2>${escapeHTML(product.name)}</h2>

        <p>Category: ${escapeHTML(product.Categories)}</p>

        <p>Rating: ${Number(product.rating).toFixed(1)} ⭐</p>

        <p class="modal-product-price">
            ₹${Number(product.price).toLocaleString("en-IN")}
        </p>

        <p class="modal-product-description">
            Discover ${escapeHTML(product.name)} at EcomStore.
        </p>
    `;

    productModal.classList.remove("hidden");

}


// STEP 11: View Details Event

productGrid.addEventListener("click", function (event) {

    const button = event.target.closest(".view-details-btn");

    if (!button) {
        return;
    }

    const productId = button.dataset.productId;

    openProductModal(productId);

});


// STEP 12: Close Modal

closeModal.addEventListener("click", function () {

    productModal.classList.add("hidden");

});


// Close Modal When Clicking Outside

productModal.addEventListener("click", function (event) {

    if (event.target === productModal) {
        productModal.classList.add("hidden");
    }

});


// STEP 13: Cart Button

cartButton.addEventListener("click", function () {

    alert(`Your cart contains ${cartItems} items.`);

});


// STEP 14: Initial Product Rendering

renderProducts(products);
