// Initialize inventory from localStorage or an empty array
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let currentPage = 1;
const itemsPerPage = 5;

// DOM Elements
const productNameInput = document.getElementById('productName');
const productSKUInput = document.getElementById('productSKU');
const productTotalQuantityInput = document.getElementById('productTotalQuantity');
const productRemainingQuantityInput = document.getElementById('productRemainingQuantity');
const searchInput = document.getElementById('searchInput');
const inventoryItemsList = document.getElementById('inventoryItems');
const pageInfo = document.getElementById('pageInfo');
const prevPageButton = document.getElementById('prevPage');
const nextPageButton = document.getElementById('nextPage');

// Add a new product to the inventory
function addProduct() {
    const productName = productNameInput.value.trim();
    const productSKU = productSKUInput.value.trim();
    const productTotalQuantity = parseInt(productTotalQuantityInput.value);
    const productRemainingQuantity = parseInt(productRemainingQuantityInput.value);

    // Validate inputs
    if (!productName || !productSKU || isNaN(productTotalQuantity) || isNaN(productRemainingQuantity)) {
        alert('Please fill in all fields correctly.');
        return;
    }

    const product = {
        name: productName,
        sku: productSKU,
        totalQuantity: productTotalQuantity,
        remainingQuantity: productRemainingQuantity
    };

    inventory.push(product);
    saveInventory();
    renderInventory();
    clearForm();
}

// Save inventory to localStorage
function saveInventory() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

// Clear the form inputs
function clearForm() {
    productNameInput.value = '';
    productSKUInput.value = '';
    productTotalQuantityInput.value = '';
    productRemainingQuantityInput.value = '';
}

// Render the inventory list
function renderInventory() {
    const inventoryItemsList = document.getElementById('inventoryItems');
    inventoryItemsList.innerHTML = '';

    // Add sticky header
    const header = document.createElement('li');
    header.className = 'sticky-header';
    header.innerHTML = `
        <span>Name</span>
        <span>SKU</span>
        <span>Total QTY</span>
        <span>Remaining QTY</span>
        <span>Percentage Left</span>
        <span>Actions</span>
    `;
    inventoryItemsList.appendChild(header);

    // Filter inventory based on search term
    const searchTerm = searchInput.value.toLowerCase();
    const filteredInventory = inventory.filter(product =>
        product.name.toLowerCase().includes(searchTerm) || product.sku.toLowerCase().includes(searchTerm)
    );

    // Paginate the filtered inventory
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedInventory = filteredInventory.slice(startIndex, endIndex);

    // Render each product in the inventory
    paginatedInventory.forEach((product, index) => {
        const li = document.createElement('li');
        const actualIndex = inventory.findIndex(item => item.sku === product.sku); // Find actual index in the inventory array

        // Calculate percentage left
        const percentageLeft = ((product.remainingQuantity / product.totalQuantity) * 100).toFixed(2);

        li.innerHTML = `
            <span>${product.name}</span>
            <span>${product.sku}</span>
            <span>${product.totalQuantity}</span>
            <span>${product.remainingQuantity}</span>
            <span>${percentageLeft}%</span>
            <span>
                <button onclick="editProduct(${actualIndex})">Edit</button>
                <button onclick="removeProduct(${actualIndex})">Remove</button>
            </span>
        `;
        inventoryItemsList.appendChild(li);
    });

    // Update pagination controls
    updatePagination(filteredInventory.length);
}
// Edit a product
function editProduct(index) {
    const product = inventory[index];
    productNameInput.value = product.name;
    productSKUInput.value = product.sku;
    productTotalQuantityInput.value = product.totalQuantity;
    productRemainingQuantityInput.value = product.remainingQuantity;

    // Remove the product from the inventory to update it
    inventory.splice(index, 1);
    saveInventory();
    renderInventory();
}

// Remove a product
function removeProduct(index) {
    if (confirm('Are you sure you want to remove this product?')) {
        inventory.splice(index, 1);
        saveInventory();
        renderInventory();
    }
}

// Update pagination controls
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages || totalPages === 0;
}

// Go to the previous page
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderInventory();
    }
}

// Go to the next page
function nextPage() {
    const totalPages = Math.ceil(inventory.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderInventory();
    }
}

// Search inventory
function searchInventory() {
    currentPage = 1;
    renderInventory();
}

// Download inventory as an Excel file
function downloadExcel() {
    // Create a worksheet from the inventory data
    const worksheetData = inventory.map(product => [product.name, product.sku, product.totalQuantity, product.remainingQuantity]);
    const worksheet = XLSX.utils.aoa_to_sheet([
        ["Name", "SKU", "Total Quantity", "Remaining Quantity"], // Header row
        ...worksheetData // Inventory data
    ]);

    // Create a new workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

    // Export the workbook as an Excel file
    XLSX.writeFile(workbook, "inventory.xlsx");
}
// WhatsApp Share Function
function shareOnWhatsApp() {
    const message = encodeURIComponent("Manage our inventory with help of inventory management website: ");
    const url = encodeURIComponent("https://abhishek82047.github.io/inventory-management-by-Abhishek/");
    window.open(`https://api.whatsapp.com/send?text=${message}${url}`, '_blank');
}

// Initial render
renderInventory();
