const form = document.getElementById("productForm");
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const productTable = document.getElementById("productTable");
const message = document.getElementById("message");

let editingId = null;

// Display messages
function showMessage(text, error = false) {
    message.textContent = text;
    message.className = error ? "error-message" : "success-message";
}

// Fetch products and display them
async function loadProducts() {
    try {
        const response = await fetch("/products");
        const products = await response.json();

        if (!response.ok) {
            throw new Error(products.error || "Unable to load products");
        }

        if (!Array.isArray(products)) {
            throw new Error("Expected a list of products from the server");
        }

        productTable.innerHTML = "";

        if (products.length === 0) {
            productTable.innerHTML =
                '<tr><td colspan="4">No products added yet!</td></tr>';
            return;
        }

        products.forEach(product => {
            const row = document.createElement("tr");

            // Use textContent so product names are displayed safely
            const idCell = document.createElement("td");
            idCell.textContent = product.id;

            const nameCell = document.createElement("td");
            nameCell.textContent = product.name;

            const priceCell = document.createElement("td");
            priceCell.textContent = product.price;

            const actionCell = document.createElement("td");

            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.className = "edit-btn";
            editButton.addEventListener("click", () => editProduct(product.id));

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-btn";
            deleteButton.addEventListener("click", () => deleteProduct(product.id));

            actionCell.append(editButton, deleteButton);
            row.append(idCell, nameCell, priceCell, actionCell);
            productTable.appendChild(row);
        });

    } catch (error) {
        productTable.innerHTML =
            '<tr><td colspan="4">Products could not be loaded.</td></tr>';
        showMessage(error.message, true);
        console.error("Loading error:", error);
    }
}

// Add a new product or update an existing one
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const priceText = priceInput.value;
    const price = Number(priceText);

    if (!name || priceText === "" || !Number.isFinite(price) || price < 0) {
        showMessage("Please enter a valid name and price.", true);
        return;
    }

    const url = editingId === null
        ? "/products"
        : `/products/${editingId}`;

    const method = editingId === null ? "POST" : "PUT";

    try {
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, price })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Unable to save product");
        }

        showMessage(
            editingId === null
                ? "Yay! Product added successfully."
                : "Product updated successfully."
        );

        resetForm();
        await loadProducts();

    } catch (error) {
        showMessage(error.message, true);
        console.error("Save error:", error);
    }
});

// Fill the form when Edit is clicked
async function editProduct(id) {
    try {
        const response = await fetch(`/products/${id}`);
        const product = await response.json();

        if (!response.ok) {
            throw new Error(product.error || "Product not found");
        }

        nameInput.value = product.name;
        priceInput.value = product.price;

        editingId = product.id;
        submitBtn.textContent = "Update";
        cancelBtn.hidden = false;

        showMessage("Change the details and click Update.");

        form.scrollIntoView({ behavior: "smooth", block: "center" });

    } catch (error) {
        showMessage(error.message, true);
        console.error("Edit error:", error);
    }
}

// Delete a product
async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    try {
        const response = await fetch(`/products/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Unable to delete product");
        }

        if (editingId === id) {
            resetForm();
        }

        showMessage("Product deleted successfully.");
        await loadProducts();

    } catch (error) {
        showMessage(error.message, true);
        console.error("Delete error:", error);
    }
}

// Cancel editing and clear the form
cancelBtn.addEventListener("click", function () {
    resetForm();
    showMessage("Editing cancelled.");
});

function resetForm() {
    form.reset();
    editingId = null;
    submitBtn.textContent = "Submit";
    cancelBtn.hidden = true;
}

// Display products when the page opens
loadProducts();
