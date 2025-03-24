// Uneom Pricing Interface - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    
    // Check if we need to load a quote from session storage
    const loadQuoteId = sessionStorage.getItem('loadQuoteId');
    if (loadQuoteId && document.getElementById('quoteForm')) {
        // Clear the session storage to prevent loading again on refresh
        sessionStorage.removeItem('loadQuoteId');
        // Load the quote
        setTimeout(() => {
            loadQuote(loadQuoteId);
        }, 500);
    }
});

// Function to initialize the application
function initApp() {
    console.log('Initializing application...');
    
    // Set up event listeners
    setupEventListeners();
    
    // Set current date
    setCurrentDate();
    
    // Generate initial quote number
    generateQuoteNumber();
    
    // Add initial product row
    if (document.getElementById('productsContainer') && document.querySelectorAll('.product-item').length === 0) {
        addNewProduct();
    }
    
    // Load saved quotes if on history page
    if (window.location.href.includes('history.html')) {
        loadSavedQuotes();
    }
    
    console.log('Application initialized successfully');
}

function setupEventListeners() {
    // Add product button
    document.getElementById('addProductBtn').addEventListener('click', addNewProduct);
    
    // Generate quote number button
    document.getElementById('generateQuoteNumberBtn').addEventListener('click', generateQuoteNumber);
    
    // Preview quote button
    document.getElementById('previewQuoteBtn').addEventListener('click', function() {
        console.log('Preview button clicked');
        previewQuote();
    });
    
    // Export to PDF button - usando once() para asegurar que solo se ejecute una vez
    document.getElementById('exportPdfBtn').addEventListener('click', function() {
        console.log('Export PDF button clicked');
        
        // Evitar múltiples clics
        if (window.pdfGenerationInProgress) {
            console.log('PDF generation already in progress, ignoring click');
            return;
        }
        
        // Deshabilitar temporalmente el botón
        this.disabled = true;
        
        // Ejecutar exportación
        exportToPdf();
        
        // Reactivar el botón después de un tiempo
        setTimeout(() => {
            this.disabled = false;
        }, 3000);
    });
    
    // Modal export to PDF button - usando once() para asegurar que solo se ejecute una vez
    document.getElementById('modalExportPdfBtn').addEventListener('click', function() {
        console.log('Modal export PDF button clicked');
        
        // Evitar múltiples clics
        if (window.pdfGenerationInProgress) {
            console.log('PDF generation already in progress, ignoring click');
            return;
        }
        
        // Desactivar el botón temporalmente para evitar múltiples clics
        const exportBtn = document.getElementById('modalExportPdfBtn');
        exportBtn.disabled = true;
        
        // Ejecutar la función de generación de PDF
        generatePdf();
        
        // Reactivar el botón después de un tiempo
        setTimeout(function() {
            exportBtn.disabled = false;
        }, 3000);
    });
    
    // Save quote button
    document.getElementById('saveQuoteBtn').addEventListener('click', saveQuote);
    
    // Reset form button
    document.getElementById('resetFormBtn').addEventListener('click', resetForm);
    
    // Product item event delegation for remove buttons and input changes
    document.getElementById('productsContainer').addEventListener('click', function(event) {
        // Check if the clicked element is a remove button
        if (event.target.classList.contains('remove-product-btn') || 
            event.target.parentElement.classList.contains('remove-product-btn')) {
            removeProduct(event);
        }
    });
    
    // Listen for changes in product inputs to update totals
    document.getElementById('productsContainer').addEventListener('input', function(event) {
        const target = event.target;
        if (target.classList.contains('product-price') || 
            target.classList.contains('product-quantity') || 
            target.classList.contains('product-discount')) {
            const productItem = target.closest('.product-item');
            if (productItem) {
                updateProductTotal(productItem);
            }
        }
    });
    
    console.log('Event listeners set up successfully');
}

// Function to add a new product row
function addNewProduct() {
    const productsContainer = document.getElementById('productsContainer');
    const newProduct = document.createElement('div');
    newProduct.className = 'product-item border rounded p-3 mb-3';
    
    newProduct.innerHTML = `
        <div class="row">
            <div class="col-md-6 mb-3">
                <label class="form-label">اسم المنتج / الحل</label>
                <input type="text" class="form-control product-name" required>
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label">الوصف</label>
                <textarea class="form-control product-description" rows="1"></textarea>
            </div>
        </div>
        <div class="row">
            <div class="col-md-3 mb-3">
                <label class="form-label">سعر الوحدة (ريال)</label>
                <input type="number" class="form-control product-price" min="0" step="0.01" required>
            </div>
            <div class="col-md-3 mb-3">
                <label class="form-label">الكمية</label>
                <input type="number" class="form-control product-quantity" min="1" value="1" required>
            </div>
            <div class="col-md-3 mb-3">
                <label class="form-label">الخصم (%)</label>
                <input type="number" class="form-control product-discount" min="0" max="100" value="0">
            </div>
            <div class="col-md-3 mb-3">
                <label class="form-label">الإجمالي (ريال)</label>
                <input type="text" class="form-control product-total" readonly>
            </div>
        </div>
        <button type="button" class="btn btn-sm btn-outline-danger remove-product">
            <i class="fas fa-trash me-1"></i> حذف
        </button>
    `;
    
    productsContainer.appendChild(newProduct);
    
    // Add event listeners to the new product
    newProduct.querySelector('.remove-product').addEventListener('click', removeProduct);
    
    // Add input event listeners
    newProduct.querySelector('.product-price').addEventListener('input', function() {
        updateProductTotal(newProduct);
    });
    newProduct.querySelector('.product-quantity').addEventListener('input', function() {
        updateProductTotal(newProduct);
    });
    newProduct.querySelector('.product-discount').addEventListener('input', function() {
        updateProductTotal(newProduct);
    });
    
    // Add change event listeners for non-keyboard inputs
    newProduct.querySelector('.product-price').addEventListener('change', function() {
        updateProductTotal(newProduct);
    });
    newProduct.querySelector('.product-quantity').addEventListener('change', function() {
        updateProductTotal(newProduct);
    });
    newProduct.querySelector('.product-discount').addEventListener('change', function() {
        updateProductTotal(newProduct);
    });
    
    // Update calculations
    updateProductTotal(newProduct);
    updateTotals();
}

// Function to remove a product
function removeProduct(event) {
    try {
        console.log('Removing product...');
        
        // Find the product item to remove
        let productItem;
        if (event.target) {
            // If called from an event
            productItem = event.target.closest('.product-item');
        } else {
            // If called directly with an element
            productItem = event;
        }
        
        if (!productItem) {
            console.error('Product item not found');
            return;
        }
        
        // Check if this is the only product
    const allProducts = document.querySelectorAll('.product-item');
        if (allProducts.length <= 1) {
            alert('يجب أن يكون هناك منتج واحد على الأقل');
            return;
        }
        
        // Remove the product
        productItem.remove();
        
        // Update totals
        updateTotals();
        
        console.log('Product removed successfully');
    } catch (error) {
        console.error('Error removing product:', error);
    }
}

// Function to update a single product's total
function updateProductTotal(productItem) {
    const priceInput = productItem.querySelector('.product-price');
    const quantityInput = productItem.querySelector('.product-quantity');
    const discountInput = productItem.querySelector('.product-discount');
    const totalInput = productItem.querySelector('.product-total');
    
    // Get values with validation
    const price = parseFloat(priceInput.value) || 0;
    const quantity = parseInt(quantityInput.value) || 0;
    const discount = parseFloat(discountInput.value) || 0;
    
    // Calculate total with discount
    const discountAmount = price * quantity * (discount / 100);
    const total = price * quantity - discountAmount;
    
    // Update the total field
    totalInput.value = total.toFixed(2);
    
    // Add visual feedback for changes
    totalInput.classList.add('bg-light');
    setTimeout(() => {
        totalInput.classList.remove('bg-light');
    }, 300);
    
    // Update overall totals
    updateTotals();
}

// Function to update overall totals (subtotal, VAT, final total)
function updateTotals() {
    let subtotal = 0;
    
    // Sum up all product totals
    document.querySelectorAll('.product-total').forEach(totalField => {
        subtotal += parseFloat(totalField.value) || 0;
    });
    
    // Calculate VAT (15%)
    const vatRate = 0.15;
    const vatAmount = subtotal * vatRate;
    
    // Calculate final total
    const finalTotal = subtotal + vatAmount;
    
    // Update the display with animation
    const subtotalElement = document.getElementById('subtotal');
    const vatElement = document.getElementById('vat');
    const totalElement = document.getElementById('total');
    
    // Add highlight effect
    [subtotalElement, vatElement, totalElement].forEach(el => {
        el.classList.add('bg-light');
        setTimeout(() => {
            el.classList.remove('bg-light');
        }, 300);
    });
    
    // Update text content
    subtotalElement.textContent = subtotal.toFixed(2) + ' ريال';
    vatElement.textContent = vatAmount.toFixed(2) + ' ريال';
    totalElement.textContent = finalTotal.toFixed(2) + ' ريال';
}

// Function to set the current date
function setCurrentDate() {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    
    // Add time components
    const hours = today.getHours().toString().padStart(2, '0');
    const minutes = today.getMinutes().toString().padStart(2, '0');
    
    // Store the formatted date and time for use in preview and export
    window.currentDate = `${day}/${month}/${year} ${hours}:${minutes}`;
    
    // Set the date input if it exists
    const quoteDateInput = document.getElementById('quoteDate');
    if (quoteDateInput) {
        const formattedDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        quoteDateInput.value = formattedDate;
    }
}

// Function to preview the quote
function previewQuote() {
    try {
        console.log('Starting preview generation...');
        
        // Get client information
        const clientName = document.getElementById('clientName').value || 'عميل جديد';
        const clientEmail = document.getElementById('clientEmail').value || 'بريد إلكتروني غير متوفر';
        const clientPhone = document.getElementById('clientPhone').value || 'هاتف غير متوفر';
        const clientAddress = document.getElementById('clientAddress').value || 'عنوان غير متوفر';
        
        // Get quote number and date
        let quoteNumber = document.getElementById('quoteNumber').value;
        if (!quoteNumber) {
            // Generate a timestamp-based quote number if none is provided
            const timestamp = new Date().getTime().toString().slice(-6);
            quoteNumber = `QT-${timestamp}`;
            document.getElementById('quoteNumber').value = quoteNumber;
        }
        
        // Format the date
        const currentDate = document.getElementById('quoteDate').value || new Date().toLocaleDateString('ar-SA');
        window.currentDate = currentDate; // Store for PDF generation
        
        // Get company information from settings
        const companyName = localStorage.getItem('companyName') || 'يونيوم';
        const companyAddress = localStorage.getItem('companyAddress') || 'الرياض، المملكة العربية السعودية';
        const companyPhone = localStorage.getItem('companyPhone') || '+966 53 488 2396';
        const companyEmail = localStorage.getItem('companyEmail') || 'info@uneom.com';
        const companyWebsite = localStorage.getItem('companyWebsite') || 'https://uneom.com';
    
    // Get products
    const products = [];
    document.querySelectorAll('.product-item').forEach(item => {
            const productName = item.querySelector('.product-name').value;
            const productPrice = parseFloat(item.querySelector('.product-price').value) || 0;
            const productQuantity = parseInt(item.querySelector('.product-quantity').value) || 1;
            const productDiscount = parseFloat(item.querySelector('.product-discount').value) || 0;
            
            // Calculate total for this product
            const total = (productPrice * productQuantity) * (1 - productDiscount / 100);
        
        products.push({
                name: productName,
                price: productPrice.toFixed(2),
                quantity: productQuantity,
                discount: productDiscount,
                total: total.toFixed(2)
        });
    });
    
        // Calculate subtotal, VAT, and total
        const subtotal = products.reduce((sum, product) => sum + parseFloat(product.total), 0);
        const vat = subtotal * 0.15; // 15% VAT
        const total = subtotal + vat;
        
        // Format currency
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
        };
        
        // Build the HTML for the quote preview
        let html = `
        <div class="quote-preview">
            <div class="quote-header" style="background: linear-gradient(135deg, #001A33 0%, #3498db 100%); color: white; padding: 25px; border-radius: 15px; margin-bottom: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
                <div class="row align-items-center">
                    <div class="col-md-6 text-center text-md-end">
                        <div style="background-color: white; padding: 15px; border-radius: 12px; display: inline-block; margin-bottom: 20px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
                            <img src="assets/logo.svg" alt="${companyName}" class="quote-company-logo" style="max-width: 220px; height: auto; display: block;">
                </div>
                    </div>
                    <div class="col-md-6 text-center text-md-start">
                        <h1 style="font-size: 28px; margin-bottom: 20px; font-weight: bold; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">عرض سعر</h1>
                        <p class="quote-number" style="font-size: 16px; margin-bottom: 10px; color: white; opacity: 1; font-weight: 500; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">
                            <i class="fas fa-hashtag"></i> رقم العرض: ${quoteNumber}
                        </p>
                        <p class="quote-date" style="font-size: 16px; margin-bottom: 0; color: white; opacity: 1; font-weight: 500; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">
                            <i class="fas fa-calendar-alt"></i> التاريخ: ${currentDate}
                        </p>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <div class="quote-company-info" style="margin-bottom: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-right: 5px solid #001A33;">
                        <h3 style="font-size: 20px; margin-bottom: 15px; color: #001A33; font-weight: bold;">معلومات الشركة</h3>
                        <p style="margin-bottom: 10px;"><i class="fas fa-building"></i> ${companyName}</p>
                        <p style="margin-bottom: 10px;"><i class="fas fa-map-marker-alt"></i> ${companyAddress}</p>
                        <p style="margin-bottom: 10px;"><i class="fas fa-phone"></i> ${companyPhone}</p>
                        <p style="margin-bottom: 10px;"><i class="fas fa-envelope"></i> ${companyEmail}</p>
                        <p style="margin-bottom: 0;"><i class="fas fa-globe"></i> ${companyWebsite}</p>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="quote-client-info" style="margin-bottom: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-right: 5px solid #3498db;">
                        <h3 style="font-size: 20px; margin-bottom: 15px; color: #001A33; font-weight: bold;">معلومات العميل</h3>
                        <p style="margin-bottom: 10px;"><i class="fas fa-user"></i> ${clientName}</p>
                        <p style="margin-bottom: 10px;"><i class="fas fa-envelope"></i> ${clientEmail}</p>
                        <p style="margin-bottom: 10px;"><i class="fas fa-phone"></i> ${clientPhone}</p>
                        <p style="margin-bottom: 0;"><i class="fas fa-map-marker-alt"></i> ${clientAddress}</p>
                    </div>
                </div>
            </div>
            
            <div class="quote-products" style="margin-bottom: 30px;">
                <h3 style="font-size: 20px; margin-bottom: 15px; color: #001A33; font-weight: bold; padding-bottom: 10px; border-bottom: 2px solid #3498db;">المنتجات والخدمات</h3>
                <div class="table-responsive">
                    <table class="table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                                <th style="background-color: #001A33; color: white; padding: 15px; text-align: center; font-weight: bold; font-size: 16px; border-bottom: 2px solid #3498db;">المنتج / الخدمة</th>
                                <th style="background-color: #001A33; color: white; padding: 15px; text-align: center; font-weight: bold; font-size: 16px; border-bottom: 2px solid #3498db;">السعر</th>
                                <th style="background-color: #001A33; color: white; padding: 15px; text-align: center; font-weight: bold; font-size: 16px; border-bottom: 2px solid #3498db;">الكمية</th>
                                <th style="background-color: #001A33; color: white; padding: 15px; text-align: center; font-weight: bold; font-size: 16px; border-bottom: 2px solid #3498db;">الخصم</th>
                                <th style="background-color: #001A33; color: white; padding: 15px; text-align: center; font-weight: bold; font-size: 16px; border-bottom: 2px solid #3498db;">الإجمالي</th>
                        </tr>
                    </thead>
                        <tbody>`;
        
        // Add products to the table
        products.forEach(product => {
            html += `
            <tr>
                <td style="padding: 12px; border: 1px solid #dee2e6; font-size: 15px;">${product.name}</td>
                <td style="padding: 12px; border: 1px solid #dee2e6; font-size: 15px; text-align: center;">${formatCurrency(product.price)}</td>
                <td style="padding: 12px; border: 1px solid #dee2e6; font-size: 15px; text-align: center;">${product.quantity}</td>
                <td style="padding: 12px; border: 1px solid #dee2e6; font-size: 15px; text-align: center;">${product.discount}%</td>
                <td style="padding: 12px; border: 1px solid #dee2e6; font-size: 15px; text-align: center;">${formatCurrency(product.total)}</td>
            </tr>`;
        });
        
        // Add totals
        html += `
                    </tbody>
                </table>
            </div>
            
                <div class="row justify-content-end mt-4">
                    <div class="col-md-6">
                        <table class="table quote-totals" style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 12px; border: 1px solid #dee2e6; font-size: 15px; text-align: start; font-weight: bold;">المجموع الفرعي</td>
                                <td style="padding: 12px; border: 1px solid #dee2e6; font-size: 15px; text-align: center;">${formatCurrency(subtotal)}</td>
                        </tr>
                        <tr>
                                <td style="padding: 12px; border: 1px solid #dee2e6; font-size: 15px; text-align: start; font-weight: bold;">ضريبة القيمة المضافة (15%)</td>
                                <td style="padding: 12px; border: 1px solid #dee2e6; font-size: 15px; text-align: center;">${formatCurrency(vat)}</td>
                        </tr>
                            <tr>
                                <td style="padding: 18px; font-size: 18px; text-align: start; font-weight: bold; background: linear-gradient(135deg, #001A33 0%, #3498db 100%); color: white; border: none;">الإجمالي</td>
                                <td style="padding: 18px; font-size: 18px; text-align: center; font-weight: bold; background: linear-gradient(135deg, #001A33 0%, #3498db 100%); color: white; border: none;">${formatCurrency(total)}</td>
                        </tr>
                    </table>
                    </div>
                </div>
            </div>
            
            <div class="quote-terms" style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-right: 5px solid #001A33;">
                <h3 style="font-size: 20px; margin-bottom: 15px; color: #001A33; font-weight: bold;">الشروط والأحكام</h3>
                <ul style="padding-right: 20px; margin-bottom: 0;">
                    <li style="margin-bottom: 10px;">هذا العرض ساري لمدة 30 يوم من تاريخ الإصدار.</li>
                    <li style="margin-bottom: 10px;">يتم الدفع 50% مقدماً و 50% عند التسليم.</li>
                    <li style="margin-bottom: 10px;">جميع الأسعار تشمل ضريبة القيمة المضافة (15%).</li>
                    <li style="margin-bottom: 0;">لا يشمل هذا العرض أي خدمات إضافية غير مذكورة.</li>
                </ul>
            </div>
            
            <!-- معلومات الشركة -->
            <div class="company-info-section" style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-right: 5px solid #3498db;">
                <h3 style="font-size: 20px; margin-bottom: 15px; color: #001A33; font-weight: bold;">معلومات الشركة</h3>
                
                <div class="row">
                    <div class="col-12 mb-3">
                        <h5 style="font-size: 16px; color: #001A33; font-weight: bold; margin-bottom: 8px;">شركة الظل الفضي للإنتاج الإعلامي المرئي والمسموع</h5>
                        <p style="margin-bottom: 0; font-size: 14px;">حي العليا – شارع العليا – رقم المبنى: 8472 – الرقم الفرعي: 2901 – الرمز البريدي: 12213 – الرياض – المملكة العربية السعودية</p>
                    </div>
                </div>
                
                <div class="row mt-3">
                    <div class="col-md-6">
                        <div style="background-color: rgba(0, 26, 51, 0.03); border-radius: 10px; padding: 15px; height: 100%;">
                            <h5 style="font-size: 16px; color: #3498db; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px;">سجل تجاري</h5>
                            <p style="margin-bottom: 8px; font-size: 14px;"><strong>الرقم الموحد:</strong> ٧٠٠٢٩٩٨٤٧٩</p>
                            <p style="margin-bottom: 8px; font-size: 14px;"><strong>رقم المنشأة:</strong> ١٠١٠٢١٦٣٥٦</p>
                            <p style="margin-bottom: 8px; font-size: 14px;"><strong>رقم التسجيل الضريبي:</strong> ٣١٢٥١١٩٩٩٤٠٠٠٠٣</p>
                            <p style="margin-bottom: 0; font-size: 14px;"><strong>القيمة المضافة:</strong> ١٠٢٢٤٠٠٠٥٩٢٤٥١٣</p>
                        </div>
                    </div>
                    <div class="col-md-6 mt-3 mt-md-0">
                        <div style="background-color: rgba(52, 152, 219, 0.03); border-radius: 10px; padding: 15px; height: 100%;">
                            <h5 style="font-size: 16px; color: #3498db; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px;">بيانات التحويل البنكي</h5>
                            <p style="margin-bottom: 8px; font-size: 14px;"><strong>اسم الشركة التجاري:</strong> شركة الظل الفضي للانتاج الاعلامي المرئي والمسموع</p>
                            <p style="margin-bottom: 8px; font-size: 14px;"><strong>رقم الحساب:</strong> 369000010006080981111</p>
                            <p style="margin-bottom: 8px; font-size: 14px;"><strong>رقم الآيبان:</strong> SA6980000369608010981111</p>
                            <p style="margin-bottom: 0; font-size: 14px;"><strong>رقم الهوية الوطنية:</strong> 7002998479</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="quote-footer" style="margin-top: 40px; padding: 25px; border-radius: 15px; background: linear-gradient(135deg, #001A33 0%, #3498db 100%); color: white; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                <div class="row justify-content-center">
                    <div class="col-md-8 text-center">
                        <div class="quote-footer-contact d-flex flex-column align-items-center">
                            <div class="d-flex align-items-center mb-3" style="gap: 15px;">
                                <p style="margin-bottom: 0; direction: ltr; padding: 8px 15px; background-color: rgba(255,255,255,0.15); border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); font-weight: 500;"><i class="fas fa-phone me-2"></i> ${companyPhone}</p>
                                <p style="margin-bottom: 0; direction: ltr; padding: 8px 15px; background-color: rgba(255,255,255,0.15); border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); font-weight: 500;"><i class="fas fa-envelope me-2"></i> ${companyEmail}</p>
                            </div>
                            <p style="margin-bottom: 0; padding: 8px 15px; background-color: rgba(255,255,255,0.15); border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); font-weight: 500;"><i class="fas fa-globe me-2"></i> ${companyWebsite}</p>
                        </div>
                    </div>
                </div>
                <div class="text-center mt-4">
                    <p style="margin-bottom: 0; opacity: 0.8; font-size: 14px;">© ${new Date().getFullYear()} ${companyName}. جميع الحقوق محفوظة.</p>
                </div>
            </div>
        </div>`;
        
        // Display the preview in the modal
        const previewContent = document.getElementById('previewContent');
        previewContent.innerHTML = html;
    } catch (error) {
        console.error('Error in preview generation:', error);
        alert('حدث خطأ أثناء إنشاء المعاينة. يرجى المحاولة مرة أخرى.');
    }
}

// Function to save the quote to localStorage
function saveQuote() {
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Get all form data
    const clientName = document.getElementById('clientName').value || 'اسم العميل';
    const clientEmail = document.getElementById('clientEmail').value || 'البريد الإلكتروني';
    const clientPhone = document.getElementById('clientPhone').value || 'رقم الهاتف';
    const clientAddress = document.getElementById('clientAddress').value || 'عنوان العميل';
    
    // Get quote number and date
    const quoteNumber = document.getElementById('quoteNumber')?.value || 'QUO-' + new Date().getTime().toString().slice(-6);
    let quoteDate = window.currentDate;
    
    // Use the date from the date picker if available
    const quoteDateInput = document.getElementById('quoteDate');
    if (quoteDateInput && quoteDateInput.value) {
        const selectedDate = new Date(quoteDateInput.value);
        const day = selectedDate.getDate().toString().padStart(2, '0');
        const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
        const year = selectedDate.getFullYear();
        quoteDate = `${day}/${month}/${year}`;
    }
    
    // Get products
    const products = [];
    document.querySelectorAll('.product-item').forEach(item => {
        const price = parseFloat(item.querySelector('.product-price').value) || 0;
        const quantity = parseInt(item.querySelector('.product-quantity').value) || 0;
        const discount = parseFloat(item.querySelector('.product-discount').value) || 0;
        const total = parseFloat(item.querySelector('.product-total').value) || 0;
        
        products.push({
            name: item.querySelector('.product-name').value || 'منتج',
            description: item.querySelector('.product-description').value || '',
            price: price,
            quantity: quantity,
            discount: discount,
            total: total
        });
    });
    
    // Get totals
    let subtotal = 0;
    products.forEach(product => {
        subtotal += product.total;
    });
    
    const vatRate = 0.15;
    const vatAmount = subtotal * vatRate;
    const finalTotal = subtotal + vatAmount;
    
    // Get terms and conditions
    const termsConditions = document.getElementById('termsConditions').value;
    
    // Create quote object
    const quote = {
        id: quoteNumber,
        date: quoteDate,
        client: {
            name: clientName,
            email: clientEmail,
            phone: clientPhone,
            address: clientAddress
        },
        products: products,
        totals: {
            subtotal: subtotal,
            vat: vatAmount,
            total: finalTotal
        },
        terms: termsConditions
    };
    
    // Get existing quotes from localStorage
    let savedQuotes = JSON.parse(localStorage.getItem('uneomQuotes')) || [];
    
    // Check if a quote with this ID already exists
    const existingQuoteIndex = savedQuotes.findIndex(q => q.id === quoteNumber);
    
    if (existingQuoteIndex !== -1) {
        // Ask for confirmation to overwrite
        if (confirm('يوجد عرض سعر بنفس الرقم. هل تريد استبداله؟')) {
            savedQuotes[existingQuoteIndex] = quote;
        } else {
            return;
        }
    } else {
    // Add new quote to the beginning of the array
    savedQuotes.unshift(quote);
    }
    
    // Save back to localStorage
    localStorage.setItem('uneomQuotes', JSON.stringify(savedQuotes));
    
    // Show success message
    alert('تم حفظ عرض السعر بنجاح!');
    
    // Update the history sidebar if we're on that page
    if (document.querySelector('.history-container')) {
        loadSavedQuotes();
    }
}

// Function to validate the form before saving
function validateForm() {
    // Check client name
    if (!document.getElementById('clientName').value) {
        alert('يرجى إدخال اسم العميل');
        document.getElementById('clientName').focus();
        return false;
    }
    
    // Check client email
    const emailInput = document.getElementById('clientEmail');
    if (!emailInput.value) {
        alert('يرجى إدخال البريد الإلكتروني للعميل');
        emailInput.focus();
        return false;
    }
    
    // Check if at least one product has name and price
    let validProducts = false;
    document.querySelectorAll('.product-item').forEach(item => {
        const productName = item.querySelector('.product-name').value;
        const productPrice = item.querySelector('.product-price').value;
        
        if (productName && productPrice) {
            validProducts = true;
        }
    });
    
    if (!validProducts) {
        alert('يرجى إدخال اسم وسعر منتج واحد على الأقل');
        return false;
    }
    
    return true;
}

// Function to load saved quotes
function loadSavedQuotes() {
    const historyContainer = document.querySelector('.history-container');
    if (!historyContainer) return;
    
    // Get saved quotes from localStorage
    const savedQuotes = JSON.parse(localStorage.getItem('uneomQuotes')) || [];
    
    // Store the quotes in a global variable for filtering
    window.allSavedQuotes = savedQuotes;
    
    // Apply filters if any
    filterSavedQuotes();
}

// Function to filter saved quotes
window.filterSavedQuotes = function() {
    const historyContainer = document.querySelector('.history-container');
    if (!historyContainer) return;
    
    // Get filter values
    const searchTerm = document.getElementById('searchQuotes')?.value?.toLowerCase() || '';
    const sortBy = document.getElementById('sortQuotesBy')?.value || 'date-desc';
    const dateFrom = document.getElementById('dateFrom')?.value || '';
    const dateTo = document.getElementById('dateTo')?.value || '';
    
    // Get all saved quotes
    let filteredQuotes = window.allSavedQuotes || [];
    
    // Apply search filter
    if (searchTerm) {
        filteredQuotes = filteredQuotes.filter(quote => {
            return (
                quote.client.name.toLowerCase().includes(searchTerm) ||
                quote.client.email.toLowerCase().includes(searchTerm) ||
                quote.id.toLowerCase().includes(searchTerm) ||
                quote.products.some(product => product.name.toLowerCase().includes(searchTerm))
            );
        });
    }
    
    // Apply date filters
    if (dateFrom) {
        const fromDate = new Date(dateFrom);
        filteredQuotes = filteredQuotes.filter(quote => {
            // Parse the quote date (format: DD/MM/YYYY HH:MM or DD/MM/YYYY)
            try {
                const dateParts = quote.date.split(' ')[0].split('/');
                if (dateParts.length === 3) {
                    const day = parseInt(dateParts[0]);
                    const month = parseInt(dateParts[1]) - 1; // Months are 0-indexed in JS
                    const year = parseInt(dateParts[2]);
                    const quoteDate = new Date(year, month, day);
                    return quoteDate >= fromDate;
                }
                return true;
            } catch (e) {
                console.error('Error parsing date:', e);
                return true;
            }
        });
    }
    
    if (dateTo) {
        const toDate = new Date(dateTo);
        // Set time to end of day
        toDate.setHours(23, 59, 59, 999);
        
        filteredQuotes = filteredQuotes.filter(quote => {
            // Parse the quote date (format: DD/MM/YYYY HH:MM or DD/MM/YYYY)
            try {
                const dateParts = quote.date.split(' ')[0].split('/');
                if (dateParts.length === 3) {
                    const day = parseInt(dateParts[0]);
                    const month = parseInt(dateParts[1]) - 1; // Months are 0-indexed in JS
                    const year = parseInt(dateParts[2]);
                    const quoteDate = new Date(year, month, day);
                    return quoteDate <= toDate;
                }
                return true;
            } catch (e) {
                console.error('Error parsing date:', e);
                return true;
            }
        });
    }
    
    // Apply sorting
    filteredQuotes.sort((a, b) => {
        switch (sortBy) {
            case 'date-asc':
                // Parse dates for comparison
                try {
                    const aDateParts = a.date.split(' ')[0].split('/');
                    const bDateParts = b.date.split(' ')[0].split('/');
                    
                    const aDate = new Date(
                        parseInt(aDateParts[2]), // Year
                        parseInt(aDateParts[1]) - 1, // Month (0-indexed)
                        parseInt(aDateParts[0]) // Day
                    );
                    
                    const bDate = new Date(
                        parseInt(bDateParts[2]), // Year
                        parseInt(bDateParts[1]) - 1, // Month (0-indexed)
                        parseInt(bDateParts[0]) // Day
                    );
                    
                    return aDate - bDate;
                } catch (e) {
                    console.error('Error sorting by date:', e);
                    return 0;
                }
            case 'date-desc':
                // Parse dates for comparison
                try {
                    const aDateParts = a.date.split(' ')[0].split('/');
                    const bDateParts = b.date.split(' ')[0].split('/');
                    
                    const aDate = new Date(
                        parseInt(aDateParts[2]), // Year
                        parseInt(aDateParts[1]) - 1, // Month (0-indexed)
                        parseInt(aDateParts[0]) // Day
                    );
                    
                    const bDate = new Date(
                        parseInt(bDateParts[2]), // Year
                        parseInt(bDateParts[1]) - 1, // Month (0-indexed)
                        parseInt(bDateParts[0]) // Day
                    );
                    
                    return bDate - aDate;
                } catch (e) {
                    console.error('Error sorting by date:', e);
                    return 0;
                }
            case 'total-asc':
                return a.totals.total - b.totals.total;
            case 'total-desc':
                return b.totals.total - a.totals.total;
            default:
                return 0;
        }
    });
    
    // Display filtered quotes
    displayQuotes(filteredQuotes);
};

// Function to display quotes in the history container
function displayQuotes(quotes) {
    const historyContainer = document.querySelector('.history-container');
    if (!historyContainer) return;
    
    // Clear the container
    historyContainer.innerHTML = '';
    
    if (quotes.length === 0) {
        historyContainer.innerHTML = '<div class="alert alert-info">لا توجد عروض أسعار تطابق معايير البحث.</div>';
        return;
    }
    
    // Create a card for each quote
    quotes.forEach(quote => {
        const quoteCard = document.createElement('div');
        quoteCard.className = 'card mb-3';
        quoteCard.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0">${quote.client.name}</h6>
                <span class="badge bg-secondary">${quote.date}</span>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                <p class="mb-1"><strong>رقم العرض:</strong> ${quote.id}</p>
                        <p class="mb-1"><strong>البريد الإلكتروني:</strong> ${quote.client.email}</p>
                        <p class="mb-1"><strong>رقم الهاتف:</strong> ${quote.client.phone}</p>
                    </div>
                    <div class="col-md-6">
                <p class="mb-1"><strong>الإجمالي:</strong> ${quote.totals.total.toFixed(2)} ريال</p>
                        <p class="mb-1"><strong>عدد المنتجات:</strong> ${quote.products.length}</p>
                        <p class="mb-2"><strong>المنتجات:</strong> ${quote.products.map(p => p.name).join(', ').substring(0, 50)}${quote.products.map(p => p.name).join(', ').length > 50 ? '...' : ''}</p>
                    </div>
                </div>
                <div class="d-flex justify-content-end mt-2">
                    <button class="btn btn-sm btn-outline-primary me-2 load-quote" data-quote-id="${quote.id}">
                        <i class="fas fa-edit me-1"></i> تحميل
                    </button>
                    <button class="btn btn-sm btn-outline-secondary me-2 preview-quote" data-quote-id="${quote.id}">
                        <i class="fas fa-eye me-1"></i> معاينة
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-quote" data-quote-id="${quote.id}">
                        <i class="fas fa-trash me-1"></i> حذف
                    </button>
                </div>
            </div>
        `;
        
        historyContainer.appendChild(quoteCard);
    });
    
    // Add event listeners to load, preview, and delete buttons
    document.querySelectorAll('.load-quote').forEach(button => {
        button.addEventListener('click', function() {
            const quoteId = this.getAttribute('data-quote-id');
            loadQuote(quoteId);
        });
    });
    
    document.querySelectorAll('.preview-quote').forEach(button => {
        button.addEventListener('click', function() {
            const quoteId = this.getAttribute('data-quote-id');
            previewSavedQuote(quoteId);
        });
    });
    
    document.querySelectorAll('.delete-quote').forEach(button => {
        button.addEventListener('click', function() {
            const quoteId = this.getAttribute('data-quote-id');
            deleteQuote(quoteId);
        });
    });
}

// Function to load a specific quote
function loadQuote(quoteId) {
    // Get saved quotes from localStorage
    const savedQuotes = JSON.parse(localStorage.getItem('uneomQuotes')) || [];
    
    // Find the quote with the matching ID
    const quote = savedQuotes.find(q => q.id === quoteId);
    if (!quote) {
        alert('عرض السعر غير موجود!');
        return;
    }
    
    // Navigate to the quote creation page if not already there
    if (!document.getElementById('quoteForm')) {
        window.location.href = 'index.html';
        // Store the quote ID to load after navigation
        sessionStorage.setItem('loadQuoteId', quoteId);
        return;
    }
    
    // Fill in the form with the quote data
    document.getElementById('clientName').value = quote.client.name;
    document.getElementById('clientEmail').value = quote.client.email;
    document.getElementById('clientPhone').value = quote.client.phone;
    document.getElementById('clientAddress').value = quote.client.address;
    
    // Set quote number
    if (document.getElementById('quoteNumber')) {
        document.getElementById('quoteNumber').value = quote.id;
    }
    
    // Set quote date if available
    if (document.getElementById('quoteDate') && quote.date) {
        // Try to parse the date from the stored format (DD/MM/YYYY)
        try {
            const dateParts = quote.date.split(' ')[0].split('/');
            if (dateParts.length === 3) {
                const day = dateParts[0];
                const month = dateParts[1];
                const year = dateParts[2];
                const formattedDate = `${year}-${month}-${day}`;
                document.getElementById('quoteDate').value = formattedDate;
            }
        } catch (e) {
            console.error('Error parsing date:', e);
            // Set to today's date as fallback
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            document.getElementById('quoteDate').value = formattedDate;
        }
    }
    
    // Clear existing products except the first one
    const productsContainer = document.getElementById('productsContainer');
    while (productsContainer.children.length > 1) {
        productsContainer.removeChild(productsContainer.lastChild);
    }
    
    // Update the first product with the first product from the quote
    if (quote.products.length > 0) {
        const firstProduct = productsContainer.querySelector('.product-item');
        const product = quote.products[0];
        
        firstProduct.querySelector('.product-name').value = product.name;
        firstProduct.querySelector('.product-description').value = product.description;
        firstProduct.querySelector('.product-price').value = product.price;
        firstProduct.querySelector('.product-quantity').value = product.quantity;
        firstProduct.querySelector('.product-discount').value = product.discount;
        
        // Update the total
        updateProductTotal(firstProduct);
    }
    
    // Add the rest of the products
    for (let i = 1; i < quote.products.length; i++) {
        addNewProduct();
        
        const productItem = productsContainer.lastChild;
        const product = quote.products[i];
        
        productItem.querySelector('.product-name').value = product.name;
        productItem.querySelector('.product-description').value = product.description;
        productItem.querySelector('.product-price').value = product.price;
        productItem.querySelector('.product-quantity').value = product.quantity;
        productItem.querySelector('.product-discount').value = product.discount;
        
        // Update the total
        updateProductTotal(productItem);
    }
    
    // Update terms and conditions
    document.getElementById('termsConditions').value = quote.terms;
    
    // Update overall totals
    updateTotals();
    
    alert('تم تحميل عرض السعر بنجاح!');
}

// Function to preview a saved quote
function previewSavedQuote(quoteId) {
    // Get saved quotes from localStorage
    const savedQuotes = JSON.parse(localStorage.getItem('uneomQuotes')) || [];
    
    // Find the quote with the matching ID
    const quote = savedQuotes.find(q => q.id === quoteId);
    if (!quote) {
        alert('عرض السعر غير موجود!');
        return;
    }
    
    // Get the relative path for the logo
    const logoPath = 'assets/logo.svg';
    
    // Get social media icons paths with relative URLs
    const facebookIcon = 'public/images/facebook.svg';
    const twitterIcon = 'public/images/twitter.svg';
    const instagramIcon = 'public/images/instagram.svg';
    const youtubeIcon = 'public/images/youtube.svg';
    
    // Load settings if available
    const settings = JSON.parse(localStorage.getItem('uneomSettings')) || getDefaultSettings();
    
    // Build the preview HTML
    const previewHTML = `
        <div class="quote-preview">
            <!-- Header with gradient background -->
            <div class="quote-header row" style="background: linear-gradient(135deg, #001A33 0%, #3498db 100%); color: white; padding: 25px; border-radius: 15px; margin-bottom: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
                <div class="col-md-6">
                    <div style="background-color: white; padding: 15px; border-radius: 12px; display: inline-block; margin-bottom: 20px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
                        <img src="${logoPath}" alt="يونيوم" class="quote-company-logo img-fluid" style="max-width: 220px; height: auto;">
                    </div>
                    <h1 class="quote-title" style="font-size: 32px; font-weight: 700; margin-bottom: 15px; text-shadow: 1px 1px 3px rgba(0,0,0,0.3);"><i class="fas fa-file-invoice me-2"></i>عرض سعر</h1>
                    <p class="quote-date" style="font-size: 18px; color: white; font-weight: 500;"><i class="fas fa-calendar-alt me-2"></i>التاريخ: ${quote.date}</p>
                    <p class="quote-number" style="font-size: 18px; color: white; font-weight: 500;"><i class="fas fa-hashtag me-2"></i>رقم العرض: ${quote.id}</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <div class="quote-company-info" style="background-color: rgba(255,255,255,0.1); padding: 15px; border-radius: 12px; backdrop-filter: blur(5px);">
                        <h5 class="quote-section-title" style="font-size: 22px; font-weight: 600; margin-bottom: 15px; color: #FFD700;"><i class="fas fa-building me-2"></i>${settings.company.name}</h5>
                        <p style="margin-bottom: 8px; font-size: 16px;"><i class="fas fa-map-marker-alt me-2" style="color: #FFD700;"></i>${settings.company.address}</p>
                        <p style="margin-bottom: 8px; font-size: 16px;"><i class="fas fa-phone me-2" style="color: #FFD700;"></i>${settings.company.phone}</p>
                        <p style="margin-bottom: 8px; font-size: 16px;"><i class="fas fa-envelope me-2" style="color: #FFD700;"></i>${settings.company.email}</p>
                        <p style="margin-bottom: 8px; font-size: 16px;"><i class="fas fa-globe me-2" style="color: #FFD700;"></i>${settings.company.website}</p>
                    </div>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="quote-client-info" style="background-color: #f8f9fa; padding: 20px; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-right: 5px solid #3498db;">
                        <h5 class="quote-section-title" style="color: #001A33; font-size: 22px; font-weight: 600; margin-bottom: 15px; border-bottom: 3px solid #3498db; padding-bottom: 8px;"><i class="fas fa-user me-2" style="color: #3498db;"></i>بيانات العميل</h5>
                        <p style="margin-bottom: 12px; font-size: 16px;"><strong><i class="fas fa-id-card me-2" style="color: #3498db;"></i>الاسم:</strong> ${quote.client.name}</p>
                        <p style="margin-bottom: 12px; font-size: 16px;"><strong><i class="fas fa-envelope me-2" style="color: #3498db;"></i>البريد الإلكتروني:</strong> ${quote.client.email}</p>
                        <p style="margin-bottom: 12px; font-size: 16px;"><strong><i class="fas fa-phone me-2" style="color: #3498db;"></i>رقم الهاتف:</strong> ${quote.client.phone}</p>
                        <p style="margin-bottom: 12px; font-size: 16px;"><strong><i class="fas fa-map-marker-alt me-2" style="color: #3498db;"></i>العنوان:</strong> ${quote.client.address}</p>
                    </div>
                </div>
            </div>
            
            <div class="quote-products mb-4">
                <h5 class="quote-section-title" style="color: #001A33; font-size: 22px; font-weight: 600; margin-bottom: 20px; border-bottom: 3px solid #3498db; padding-bottom: 8px;"><i class="fas fa-shopping-cart me-2" style="color: #3498db;"></i>المنتجات / الحلول</h5>
                <div class="table-responsive" style="box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-radius: 15px; overflow: hidden;">
                    <table class="quote-products-table table table-bordered" style="border-collapse: collapse; width: 100%; margin-bottom: 0;">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #001A33 0%, #3498db 100%); color: white;">
                                <th style="padding: 15px; text-align: center; font-size: 16px;">#</th>
                                <th style="padding: 15px; text-align: right; font-size: 16px;">المنتج / الحل</th>
                                <th style="padding: 15px; text-align: right; font-size: 16px;">الوصف</th>
                                <th style="padding: 15px; text-align: center; font-size: 16px;">سعر الوحدة</th>
                                <th style="padding: 15px; text-align: center; font-size: 16px;">الكمية</th>
                                <th style="padding: 15px; text-align: center; font-size: 16px;">الخصم</th>
                                <th style="padding: 15px; text-align: center; font-size: 16px;">الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${quote.products.map((product, index) => `
                                <tr style="${index % 2 === 0 ? 'background-color: #f8f9fa;' : 'background-color: #ffffff;'}">
                                    <td style="padding: 12px; text-align: center; font-size: 15px;">${index + 1}</td>
                                    <td style="padding: 12px; text-align: right; font-weight: 600; font-size: 15px;">${product.name}</td>
                                    <td style="padding: 12px; text-align: right; font-size: 15px;">${product.description}</td>
                                    <td style="padding: 12px; text-align: center; font-size: 15px;">${product.price.toFixed(2)} ريال</td>
                                    <td style="padding: 12px; text-align: center; font-size: 15px;">${product.quantity}</td>
                                    <td style="padding: 12px; text-align: center; font-size: 15px;">${product.discount}%</td>
                                    <td style="padding: 12px; text-align: center; font-weight: 600; font-size: 15px; color: #001A33;">${product.total.toFixed(2)} ريال</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="quote-totals row">
                <div class="col-md-6 offset-md-6">
                    <div style="box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-radius: 15px; overflow: hidden;">
                        <table class="table" style="border-collapse: collapse; width: 100%; margin-bottom: 0;">
                            <tr>
                                <td style="padding: 15px; text-align: right; border-bottom: 1px solid #dee2e6; font-size: 16px;"><i class="fas fa-calculator me-2" style="color: #3498db;"></i>المجموع:</td>
                                <td style="padding: 15px; text-align: left; border-bottom: 1px solid #dee2e6; font-size: 16px; font-weight: 600;">${quote.totals.subtotal.toFixed(2)} ريال</td>
                            </tr>
                            <tr>
                                <td style="padding: 15px; text-align: right; border-bottom: 1px solid #dee2e6; font-size: 16px;"><i class="fas fa-percentage me-2" style="color: #3498db;"></i>ضريبة القيمة المضافة (15%):</td>
                                <td style="padding: 15px; text-align: left; border-bottom: 1px solid #dee2e6; font-size: 16px; font-weight: 600;">${quote.totals.vat.toFixed(2)} ريال</td>
                            </tr>
                            <tr style="background: linear-gradient(135deg, #001A33 0%, #3498db 100%); color: white;">
                                <td style="padding: 18px; text-align: right; font-weight: bold; font-size: 18px;"><i class="fas fa-money-bill-wave me-2"></i>الإجمالي النهائي:</td>
                                <td style="padding: 18px; text-align: left; font-weight: bold; font-size: 18px;">${quote.totals.total.toFixed(2)} ريال</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="quote-terms" style="background-color: #f8f9fa; padding: 20px; border-radius: 15px; margin-top: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-right: 5px solid #001A33;">
                <h5 class="quote-section-title" style="color: #001A33; font-size: 22px; font-weight: 600; margin-bottom: 15px; border-bottom: 3px solid #3498db; padding-bottom: 8px;"><i class="fas fa-gavel me-2" style="color: #3498db;"></i>الشروط والأحكام</h5>
                <div style="line-height: 1.8; font-size: 15px;">${quote.terms.replace(/\n/g, '<br>')}</div>
            </div>
            
            <!-- معلومات الشركة -->
            <div class="company-info-section" style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-right: 5px solid #3498db;">
                <h3 style="font-size: 20px; margin-bottom: 15px; color: #001A33; font-weight: bold;">معلومات الشركة</h3>
                
                <div class="row">
                    <div class="col-12 mb-3">
                        <h5 style="font-size: 16px; color: #001A33; font-weight: bold; margin-bottom: 8px;">شركة الظل الفضي للإنتاج الإعلامي المرئي والمسموع</h5>
                        <p style="margin-bottom: 0; font-size: 14px;">حي العليا – شارع العليا – رقم المبنى: 8472 – الرقم الفرعي: 2901 – الرمز البريدي: 12213 – الرياض – المملكة العربية السعودية</p>
                    </div>
                </div>
                
                <div class="row mt-3">
                    <div class="col-md-6">
                        <div style="background-color: rgba(0, 26, 51, 0.03); border-radius: 10px; padding: 15px; height: 100%;">
                            <h5 style="font-size: 16px; color: #3498db; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px;">سجل تجاري</h5>
                            <p style="margin-bottom: 8px; font-size: 14px;"><strong>الرقم الموحد:</strong> ٧٠٠٢٩٩٨٤٧٩</p>
                            <p style="margin-bottom: 8px; font-size: 14px;"><strong>رقم المنشأة:</strong> ١٠١٠٢١٦٣٥٦</p>
                            <p style="margin-bottom: 8px; font-size: 14px;"><strong>رقم التسجيل الضريبي:</strong> ٣١٢٥١١٩٩٩٤٠٠٠٠٣</p>
                            <p style="margin-bottom: 0; font-size: 14px;"><strong>القيمة المضافة:</strong> ١٠٢٢٤٠٠٠٥٩٢٤٥١٣</p>
                        </div>
                    </div>
                    <div class="col-md-6 mt-3 mt-md-0">
                        <div style="background-color: rgba(52, 152, 219, 0.03); border-radius: 10px; padding: 15px; height: 100%;">
                            <h5 style="font-size: 16px; color: #3498db; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #e0e0e0; padding-bottom: 8px;">بيانات التحويل البنكي</h5>
                            <p style="margin-bottom: 8px; font-size: 14px;"><strong>اسم الشركة التجاري:</strong> شركة الظل الفضي للانتاج الاعلامي المرئي والمسموع</p>
                            <p style="margin-bottom: 8px; font-size: 14px;"><strong>رقم الحساب:</strong> 369000010006080981111</p>
                            <p style="margin-bottom: 8px; font-size: 14px;"><strong>رقم الآيبان:</strong> SA6980000369608010981111</p>
                            <p style="margin-bottom: 0; font-size: 14px;"><strong>رقم الهوية الوطنية:</strong> 7002998479</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="quote-footer" style="margin-top: 40px; padding: 25px; border-radius: 15px; background: linear-gradient(135deg, #001A33 0%, #3498db 100%); color: white; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                <div class="row justify-content-center">
                    <div class="col-md-8 text-center">
                        <div class="quote-footer-contact d-flex flex-column align-items-center">
                            <div class="d-flex align-items-center mb-3" style="gap: 15px;">
                                <p style="margin-bottom: 0; direction: ltr; padding: 8px 15px; background-color: rgba(255,255,255,0.15); border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); font-weight: 500;"><i class="fas fa-phone me-2"></i> ${companyPhone}</p>
                                <p style="margin-bottom: 0; direction: ltr; padding: 8px 15px; background-color: rgba(255,255,255,0.15); border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); font-weight: 500;"><i class="fas fa-envelope me-2"></i> ${companyEmail}</p>
                            </div>
                            <p style="margin-bottom: 0; padding: 8px 15px; background-color: rgba(255,255,255,0.15); border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); font-weight: 500;"><i class="fas fa-globe me-2"></i> ${companyWebsite}</p>
                        </div>
                    </div>
                </div>
                <div class="text-center mt-4">
                    <p style="margin-bottom: 0; opacity: 0.8; font-size: 14px;">© ${new Date().getFullYear()} ${companyName}. جميع الحقوق محفوظة.</p>
                </div>
            </div>
        </div>`;
    
    // Display the preview in the modal
    document.getElementById('previewContent').innerHTML = previewHTML;
    
    // Show the modal
    const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
    previewModal.show();
}

// Function to delete a quote
function deleteQuote(quoteId) {
    if (!confirm('هل أنت متأكد من حذف عرض السعر هذا؟')) {
        return;
    }
    
    // Get saved quotes from localStorage
    let savedQuotes = JSON.parse(localStorage.getItem('uneomQuotes')) || [];
    
    // Remove the quote with the matching ID
    savedQuotes = savedQuotes.filter(q => q.id !== quoteId);
    
    // Save back to localStorage
    localStorage.setItem('uneomQuotes', JSON.stringify(savedQuotes));
    
    // Update the global variable
    window.allSavedQuotes = savedQuotes;
    
    // Reload the quotes list
    filterSavedQuotes();
    
    alert('تم حذف عرض السعر بنجاح!');
}

// Function to export the quote to PDF
function exportToPdf() {
    try {
        console.log('Starting PDF export process...');
        
    // First make sure the preview is generated
    if (!document.querySelector('.quote-preview')) {
            console.log('No preview found, generating preview first...');
        previewQuote();
        // Give more time for the preview to render and images to load
        setTimeout(() => {
            generatePdf();
        }, 1000);
    } else {
            console.log('Preview already exists, generating PDF directly...');
        // Still add a small delay to ensure all images are loaded
        setTimeout(() => {
            generatePdf();
        }, 500);
        }
    } catch (error) {
        console.error('Error in PDF export:', error);
        alert('حدث خطأ أثناء تصدير PDF. يرجى المحاولة مرة أخرى.');
    }
}

// Function to generate the PDF
function generatePdf() {
    try {
        console.log('Starting PDF generation...');
        
        // Crear un id único para esta generación de PDF para evitar duplicaciones
        const pdfGenerationId = 'pdf_gen_' + new Date().getTime();
        
        // Verificar si ya hay una generación en curso
        if (window.pdfGenerationInProgress) {
            console.log('PDF generation already in progress, aborting');
            return;
        }
        
        // Marcar que hay una generación en curso
        window.pdfGenerationInProgress = pdfGenerationId;
        
        // Create a loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">جاري التحميل...</span></div><p class="mt-2">جاري إنشاء ملف PDF...</p>';
        loadingIndicator.style.position = 'fixed';
        loadingIndicator.style.top = '50%';
        loadingIndicator.style.left = '50%';
        loadingIndicator.style.transform = 'translate(-50%, -50%)';
        loadingIndicator.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        loadingIndicator.style.padding = '20px';
        loadingIndicator.style.borderRadius = '10px';
        loadingIndicator.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
        loadingIndicator.style.zIndex = '9999';
        loadingIndicator.style.textAlign = 'center';
        document.body.appendChild(loadingIndicator);
        
        // Get the preview content element
        const previewElement = document.getElementById('previewContent');
        if (!previewElement) {
            console.error('Preview element not found');
            alert('حدث خطأ: لم يتم العثور على عنصر المعاينة. يرجى المحاولة مرة أخرى.');
            document.body.removeChild(loadingIndicator);
            window.pdfGenerationInProgress = null;
            return;
        }
        
        // Store original styles for restoration later
        const originalStyles = {
            width: previewElement.style.width,
            maxWidth: previewElement.style.maxWidth,
            backgroundColor: previewElement.style.backgroundColor,
            padding: previewElement.style.padding,
            borderRadius: previewElement.style.borderRadius,
            boxShadow: previewElement.style.boxShadow,
            overflow: previewElement.style.overflow
        };
        
        // Set optimal styles for PDF capture
        previewElement.style.width = '800px';
        previewElement.style.maxWidth = '800px';
        previewElement.style.backgroundColor = 'white';
        previewElement.style.padding = '20px';
        previewElement.style.borderRadius = '0';
        previewElement.style.boxShadow = 'none';
        previewElement.style.overflow = 'visible';
        
        // Make sure the preview modal is visible
        const previewModal = document.getElementById('previewModal');
        previewModal.style.display = 'block';
        previewModal.style.opacity = '1';
        
        // Clean up any existing SVG logos to prevent duplication
        const existingLogos = previewElement.querySelectorAll('svg');
        existingLogos.forEach(logo => {
            if (logo.id === 'uneom-logo-svg') {
                logo.remove();
            }
        });
        
        // Find and replace the logo with inline SVG BEFORE html2canvas capture
        const logoContainer = previewElement.querySelector('.quote-header .col-md-6 div');
        if (logoContainer) {
            // Limpiar completamente el contenedor para evitar duplicaciones
            logoContainer.innerHTML = '';
            
            // Create the SVG directly in the container
            const logoSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            logoSvg.setAttribute('width', '220');
            logoSvg.setAttribute('height', '80');
            logoSvg.setAttribute('viewBox', '0 0 220 80');
            logoSvg.setAttribute('id', 'uneom-logo-svg');
            logoSvg.style.maxWidth = '100%';
            logoSvg.style.height = 'auto';
            
            // Add background rectangle
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', '0');
            rect.setAttribute('y', '0');
            rect.setAttribute('width', '220');
            rect.setAttribute('height', '80');
            rect.setAttribute('rx', '8');
            rect.setAttribute('fill', 'white');
            rect.setAttribute('stroke', '#e0e0e0');
            rect.setAttribute('stroke-width', '1');
            logoSvg.appendChild(rect);
            
            // Add UNEOM text
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', '110');
            text.setAttribute('y', '48');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-family', 'Arial, Helvetica, sans-serif');
            text.setAttribute('font-size', '32');
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('fill', '#001A33');
            text.textContent = 'UNEOM';
            logoSvg.appendChild(text);
            
            // Add decorative line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '50');
            line.setAttribute('y1', '55');
            line.setAttribute('x2', '170');
            line.setAttribute('y2', '55');
            line.setAttribute('stroke', '#3498db');
            line.setAttribute('stroke-width', '2');
            logoSvg.appendChild(line);
            
            // Append the SVG to the container
            logoContainer.appendChild(logoSvg);
            
            console.log('Logo SVG created and inserted');
        } else {
            console.warn('Logo container not found');
        }
        
        // Replace icons with unicode symbols
        replaceIcons(previewElement);
        
        // Add a delay to ensure all DOM manipulations are complete
        setTimeout(() => {
            // Verificar si este proceso sigue siendo el activo
            if (window.pdfGenerationInProgress !== pdfGenerationId) {
                console.log('Another PDF generation process has started, aborting this one');
                restoreOriginalState(previewModal, previewElement, originalStyles);
                document.body.removeChild(loadingIndicator);
                return;
            }
            
            // Get client info for filename
            const clientName = document.getElementById('clientName')?.value || 'عميل_جديد';
            
            // Get date for filename
            const date = new Date();
            const formattedDate = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
            
            console.log('Starting html2canvas capture...');
            
            // Use html2canvas with optimized settings
            html2canvas(previewElement, {
                scale: 2, // Higher resolution
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false, // Disable logging to prevent console spam
                letterRendering: true,
                imageTimeout: 0,
                onclone: function(clonedDoc) {
                    console.log('html2canvas clone callback triggered');
                    
                    // Clear any duplicate logos in the cloned document
                    const clonedSvgs = clonedDoc.querySelectorAll('svg');
                    clonedSvgs.forEach(svg => {
                        if (svg.id === 'uneom-logo-svg') {
                            svg.remove();
                        }
                    });
                    
                    // Ensure logo is visible in the cloned document too
                    const clonedLogoContainer = clonedDoc.querySelector('.quote-header .col-md-6 div');
                    if (clonedLogoContainer) {
                        console.log('Creating SVG in cloned document');
                        
                        // Limpiar completamente el contenedor clonado
                        clonedLogoContainer.innerHTML = '';
                        
                        // Create a simpler, more compatible SVG logo in the cloned document
                        const logoSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        logoSvg.setAttribute('width', '220');
                        logoSvg.setAttribute('height', '80');
                        logoSvg.setAttribute('viewBox', '0 0 220 80');
                        logoSvg.setAttribute('id', 'uneom-logo-svg-clone');
                        
                        // Add background rectangle
                        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                        rect.setAttribute('x', '0');
                        rect.setAttribute('y', '0');
                        rect.setAttribute('width', '220');
                        rect.setAttribute('height', '80');
                        rect.setAttribute('rx', '8');
                        rect.setAttribute('fill', 'white');
                        logoSvg.appendChild(rect);
                        
                        // Add UNEOM text
                        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        text.setAttribute('x', '110');
                        text.setAttribute('y', '48');
                        text.setAttribute('text-anchor', 'middle');
                        text.setAttribute('font-family', 'Arial, Helvetica, sans-serif');
                        text.setAttribute('font-size', '32');
                        text.setAttribute('font-weight', 'bold');
                        text.setAttribute('fill', '#001A33');
                        text.textContent = 'UNEOM';
                        logoSvg.appendChild(text);
                        
                        // Add decorative line
                        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        line.setAttribute('x1', '50');
                        line.setAttribute('y1', '55');
                        line.setAttribute('x2', '170');
                        line.setAttribute('y2', '55');
                        line.setAttribute('stroke', '#3498db');
                        line.setAttribute('stroke-width', '2');
                        logoSvg.appendChild(line);
                        
                        // Append the SVG to the container
                        clonedLogoContainer.appendChild(logoSvg);
                    }
                }
            }).then(canvas => {
                try {
                    console.log('Canvas generated successfully, creating PDF...');
                    
                    // Verificar si este proceso sigue siendo el activo
                    if (window.pdfGenerationInProgress !== pdfGenerationId) {
                        console.log('Another PDF generation process has started, aborting this one');
                        restoreOriginalState(previewModal, previewElement, originalStyles);
                        document.body.removeChild(loadingIndicator);
                        return;
                    }
                    
                    // Create PDF using jsPDF
                    const { jsPDF } = window.jspdf;
                    
                    // Create A4 PDF with proper dimensions
                    const pdf = new jsPDF({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: 'a4',
                        compress: true,
                        hotfixes: ['px_scaling']
                    });
                    
                    // Calculate optimal dimensions for single page fitting
                    const a4Width = 210; // A4 width in mm
                    const a4Height = 297; // A4 height in mm
                    const contentRatio = canvas.height / canvas.width;
                    
                    // Set maximum width with margins
                    let imgWidth = 190; // 10mm margins on each side
                    let imgHeight = imgWidth * contentRatio;
                    
                    // Scale down if content is too tall
                    if (imgHeight > 277) { // 10mm margins top and bottom
                        imgHeight = 277;
                        imgWidth = imgHeight / contentRatio;
                    }
                    
                    // Center the content on page
                    const xPos = (a4Width - imgWidth) / 2;
                    const yPos = 10; // 10mm margin from top
                    
                    // Add canvas as image
                    pdf.addImage(canvas, 'PNG', xPos, yPos, imgWidth, imgHeight, '', 'FAST');
                    
                    // Company info is now included in the HTML template and captured in the canvas
                    
                    // Save the PDF
                    try {
                        // Clean filename - remove problematic characters
                        const safeClientName = clientName.replace(/[\/\\:*?"<>|]/g, '_');
                        const filename = `عرض_سعر_${safeClientName}_${formattedDate}.pdf`;
                        pdf.save(filename);
                        console.log('PDF saved successfully');
                    } catch (e) {
                        console.error('Error saving PDF:', e);
                        pdf.save('عرض_سعر.pdf');
                    }
                } catch (error) {
                    console.error('Error creating PDF from canvas:', error);
                    alert(`حدث خطأ أثناء إنشاء ملف PDF: ${error.message}`);
                } finally {
                    // Always restore original styles and remove loading indicator
                    restoreOriginalState(previewModal, previewElement, originalStyles);
                    document.body.removeChild(loadingIndicator);
                    // Resetear el flag de generación en curso
                    window.pdfGenerationInProgress = null;
                }
            }).catch(error => {
                console.error('Error capturing preview with html2canvas:', error);
                alert(`حدث خطأ أثناء التقاط المعاينة: ${error.message}`);
                restoreOriginalState(previewModal, previewElement, originalStyles);
                document.body.removeChild(loadingIndicator);
                window.pdfGenerationInProgress = null;
            });
        }, 500); // Increased delay to ensure DOM is fully updated
    } catch (error) {
        console.error('Unexpected error in PDF generation:', error);
        alert(`حدث خطأ غير متوقع أثناء إنشاء ملف PDF: ${error.message}`);
        
        // Try to remove loading indicator if it exists
        try {
            const indicator = document.querySelector('.loading-indicator');
            if (indicator) {
                document.body.removeChild(indicator);
            }
        } catch (e) {
            console.error('Error removing loading indicator:', e);
        }
        
        // Make sure to reset the flag
        window.pdfGenerationInProgress = null;
    }
}

// Helper function to replace icons with unicode symbols
function replaceIcons(previewElement) {
    const iconElements = previewElement.querySelectorAll('.fas, .fab, .fa');
    const iconMappings = {
        'fa-file-invoice': '📄',
        'fa-calendar-alt': '📅',
        'fa-hashtag': '#️⃣',
        'fa-building': '🏢',
        'fa-map-marker-alt': '📍',
        'fa-phone': '📞',
        'fa-envelope': '✉️',
        'fa-globe': '🌐',
        'fa-user': '👤',
        'fa-id-card': '🪪',
        'fa-shopping-cart': '🛒',
        'fa-calculator': '🧮',
        'fa-percentage': '%',
        'fa-money-bill-wave': '💵',
        'fa-gavel': '🔨',
        'fa-facebook-f': 'f',
        'fa-twitter': 't',
        'fa-instagram': 'i'
    };
    
    iconElements.forEach(icon => {
        // Get icon class
        const iconClass = Array.from(icon.classList).find(cls => cls.startsWith('fa-'));
        if (iconClass) {
            const unicodeSymbol = iconMappings[iconClass] || '•';
            const replacement = document.createElement('span');
            replacement.textContent = unicodeSymbol;
            replacement.style.fontWeight = 'bold';
            replacement.style.display = 'inline-block';
            replacement.style.marginRight = '5px';
            if (icon.parentNode) {
                icon.parentNode.replaceChild(replacement, icon);
            }
        }
    });
}

// Helper function to restore original state
function restoreOriginalState(previewModal, previewElement, originalStyles) {
    // Restore preview modal to normal
    previewModal.style.display = '';
    previewModal.style.opacity = '';
    
    // Restore original styles
    previewElement.style.width = originalStyles.width;
    previewElement.style.maxWidth = originalStyles.maxWidth;
    previewElement.style.backgroundColor = originalStyles.backgroundColor;
    previewElement.style.padding = originalStyles.padding;
    previewElement.style.borderRadius = originalStyles.borderRadius;
    previewElement.style.boxShadow = originalStyles.boxShadow;
    previewElement.style.overflow = originalStyles.overflow;
}

// Function to generate a new quote number
function generateQuoteNumber() {
    // Generate a timestamp-based quote number
    const timestamp = new Date().getTime().toString().slice(-6);
    const quoteNumber = `QT-${timestamp}`;
    
    // Set the quote number in the input field
    document.getElementById('quoteNumber').value = quoteNumber;
}

// Function to reset the form
function resetForm() {
    if (confirm('هل أنت متأكد من إعادة تعيين النموذج؟ سيتم مسح جميع البيانات المدخلة.')) {
        // Clear client information
        document.getElementById('clientName').value = '';
        document.getElementById('clientEmail').value = '';
        document.getElementById('clientPhone').value = '';
        document.getElementById('clientAddress').value = '';
        
        // Generate new quote number
        generateQuoteNumber();
        
        // Set current date
        setCurrentDate();
        
        // Clear products except the first one
        const productsContainer = document.getElementById('productsContainer');
        while (productsContainer.children.length > 1) {
            productsContainer.removeChild(productsContainer.lastChild);
        }
        
        // Reset the first product
        const firstProduct = productsContainer.querySelector('.product-item');
        if (firstProduct) {
            firstProduct.querySelector('.product-name').value = '';
            firstProduct.querySelector('.product-description').value = '';
            firstProduct.querySelector('.product-price').value = '';
            firstProduct.querySelector('.product-quantity').value = '1';
            firstProduct.querySelector('.product-discount').value = '0';
            firstProduct.querySelector('.product-total').value = '';
        }
        
        // Reset terms and conditions to default
        document.getElementById('termsConditions').value = 'هذا العرض ساري لمدة 30 يوم من تاريخ الإصدار.\nيتم الدفع 50% مقدماً و 50% عند التسليم.\nجميع الأسعار تشمل ضريبة القيمة المضافة (15%).\nلا يشمل هذا العرض أي خدمات إضافية غير مذكورة.';
        
        // Update totals
        updateTotals();
    }
}

// Function to handle the onclone event for html2canvas
function handleOnClone(clonedDoc) {
    try {
        console.log('Handling onclone event for html2canvas...');
        
        // Find all images in the cloned document and ensure they are loaded
        const images = clonedDoc.querySelectorAll('img');
        const imagePromises = Array.from(images).map(img => {
            return new Promise((resolve, reject) => {
                if (img.complete) {
                    resolve();
                } else {
                    img.onload = resolve;
                    img.onerror = reject;
                }
            });
        });
        
        // Return a promise that resolves when all images are loaded
        return Promise.all(imagePromises);
    } catch (error) {
        console.error('Error in onclone function:', error);
    }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);