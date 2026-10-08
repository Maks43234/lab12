let globalStoreProducts = [];

async function fetchProducts() {
    try {
        const response = await fetch(
            "https://fakestoreapi.com/products?limit=8"
        );

        if (!response.ok) {
            throw new Error(`HTTP помилка: ${response.status}`);
        }

        const realProducts = await response.json();

        return realProducts;
    } catch (error) {
        console.error(
            "Помилка завантаження товарів:",
            error.message
        );

        throw error;
    }
}

let cart = [];

const productsGrid = document.querySelector(".products-grid");
const cartButton = document.querySelector(".btn-cart");
const cartOverlay = document.getElementById("cartOverlay");
const closeBtn = document.getElementById("closeCartBtn");
const cartItemsContainer = document.getElementById("cartItemsContainer");
const cartTotalSum = document.getElementById("cartTotalSum");

async function initShop() {
    const loader = document.getElementById("loader");
    const container = document.querySelector(".products-grid");

    loader.classList.remove("hidden");
    container.innerHTML = "";

    try {
        const data = await fetchProducts();

        globalStoreProducts = data;

        loader.classList.add("hidden");

        container.innerHTML = data.map((product) => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.title}">
                <h3>${product.title}</h3>
                <p class="product-price">$${product.price}</p>
                <button class="btn btn-buy" data-id="${product.id}">
                    Купити
                </button>
            </div>
        `).join("");

    } catch (error) {
        loader.classList.add("hidden");

        container.innerHTML = `
            <p class="error">Помилка мережі: ${error.message}</p>
        `;
    }
}

productsGrid.addEventListener("click", (event) => {
    if (event.target.classList.contains("btn-buy")) {
        const productId = Number(event.target.dataset.id);

        const selectedProduct = globalStoreProducts.find(
            (p) => p.id === productId
        );

        if (selectedProduct) {
            addToCart(selectedProduct);
        }
    }
});

function addToCart(product) {
    const existingItem = cart.find(
        (item) => item.id === product.id
    );

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            name: product.title,
            quantity: 1
        });
    }

    updateUI();
}

function increaseQuantity(productId) {
    const item = cart.find(
        (item) => item.id === productId
    );

    if (item) {
        item.quantity += 1;
    }

    updateUI();
}

function decreaseQuantity(productId) {
    const item = cart.find(
        (item) => item.id === productId
    );

    if (!item) {
        return;
    }

    item.quantity -= 1;

    if (item.quantity <= 0) {
        cart = cart.filter(
            (cartItem) => cartItem.id !== productId
        );
    }

    updateUI();
}

function calculateTotal() {
    return cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );
}

function renderCartItems() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p>Кошик порожній.</p>";
        cartTotalSum.textContent = "0";
        return;
    }

    cartItemsContainer.innerHTML = cart.map((item) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">

            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-price">$${item.price}</div>
            </div>

            <div class="cart-item-controls">
                <button
                    class="quantity-btn"
                    data-action="decrease"
                    data-id="${item.id}"
                    type="button"
                >
                    −
                </button>

                <span class="quantity">${item.quantity}</span>

                <button
                class="quantity-btn"
                    data-action="increase"
                    data-id="${item.id}"
                    type="button"
                >
                    +
                </button>
            </div>
        </div>
    `).join("");

    cartTotalSum.textContent = `$${calculateTotal().toFixed(2)}`;
}

cartItemsContainer.addEventListener("click", (event) => {
    const button = event.target.closest(".quantity-btn");

    if (!button) {
        return;
    }

    const productId = Number(button.dataset.id);

    if (button.dataset.action === "increase") {
        increaseQuantity(productId);
    }

    if (button.dataset.action === "decrease") {
        decreaseQuantity(productId);
    }
});

function updateUI() {
    const cartCounter = document.querySelector(".cart-counter");

    const totalItems = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    if (cartCounter) {
        cartCounter.textContent = totalItems;
    }

    renderCartItems();
}

function openCartModal() {
    renderCartItems();
    cartOverlay.classList.remove("hidden");
}

function closeCartModal() {
    cartOverlay.classList.add("hidden");
}

cartButton.addEventListener("click", openCartModal);

closeBtn.addEventListener("click", closeCartModal);

cartOverlay.addEventListener("click", (event) => {
    if (event.target === cartOverlay) {
        closeCartModal();
    }
});

initShop();
updateUI();