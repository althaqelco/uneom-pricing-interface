// Uneom Pricing Interface - Settings JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Load settings when the page loads
    loadSettings();
    
    // Set up event listeners
    setupEventListeners();
});

// Function to set up event listeners
function setupEventListeners() {
    // Save Settings Button
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    
    // Logo Upload Preview
    document.getElementById('companyLogo').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('logoPreview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Export Data Button
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    
    // Import Data Button
    document.getElementById('importDataBtn').addEventListener('click', function() {
        // Show the import modal
        const importModal = new bootstrap.Modal(document.getElementById('importDataModal'));
        importModal.show();
    });
    
    // Confirm Import Button
    document.getElementById('confirmImportBtn').addEventListener('click', importData);
    
    // Clear Data Button
    document.getElementById('clearDataBtn').addEventListener('click', clearData);
}

// Function to load settings from localStorage
function loadSettings() {
    // Get settings from localStorage
    const settings = JSON.parse(localStorage.getItem('uneomSettings')) || getDefaultSettings();
    
    // Company Information
    document.getElementById('companyName').value = settings.company.name || 'يونيوم';
    document.getElementById('companyAddress').value = settings.company.address || 'العليا العام, Al Olaya, Riyadh 12213, Saudi Arabia';
    document.getElementById('companyPhone').value = settings.company.phone || '+966 53 488 2396';
    document.getElementById('companyEmail').value = settings.company.email || 'info@uneom.com';
    document.getElementById('companyWebsite').value = settings.company.website || 'https://uneom.com/';
    
    // If there's a saved logo, display it
    if (settings.company.logo) {
        document.getElementById('logoPreview').src = settings.company.logo;
    }
    
    // Social Media
    document.getElementById('facebookUrl').value = settings.social.facebook || 'https://www.facebook.com/uneomuniforms/';
    document.getElementById('twitterUrl').value = settings.social.twitter || 'https://x.com/uneomcom';
    document.getElementById('instagramUrl').value = settings.social.instagram || 'https://www.instagram.com/uneomuniforms/';
    document.getElementById('youtubeUrl').value = settings.social.youtube || 'https://www.youtube.com/@uneom-uniforms';
    
    // Default Terms
    document.getElementById('defaultTerms').value = settings.terms || `1. يسري هذا العرض لمدة 30 يوماً من تاريخ إصداره.
2. جميع الأسعار بالريال السعودي وتشمل ضريبة القيمة المضافة.
3. يتم تحديد موعد التسليم بعد استلام أمر الشراء.
4. يتطلب دفع 50% من قيمة الطلب كدفعة مقدمة.`;
    
    // System Settings
    document.getElementById('vatRate').value = settings.system.vatRate || 15;
    document.getElementById('quotePrefix').value = settings.system.quotePrefix || 'UNM';
    document.getElementById('currency').value = settings.system.currency || 'SAR';
    document.getElementById('quotesExpiry').value = settings.system.quotesExpiry || 30;
}

// Function to save settings to localStorage
function saveSettings() {
    // Create settings object
    const settings = {
        company: {
            name: document.getElementById('companyName').value,
            address: document.getElementById('companyAddress').value,
            phone: document.getElementById('companyPhone').value,
            email: document.getElementById('companyEmail').value,
            website: document.getElementById('companyWebsite').value,
            logo: document.getElementById('logoPreview').src
        },
        social: {
            facebook: document.getElementById('facebookUrl').value,
            twitter: document.getElementById('twitterUrl').value,
            instagram: document.getElementById('instagramUrl').value,
            youtube: document.getElementById('youtubeUrl').value
        },
        terms: document.getElementById('defaultTerms').value,
        system: {
            vatRate: parseFloat(document.getElementById('vatRate').value) || 15,
            quotePrefix: document.getElementById('quotePrefix').value,
            currency: document.getElementById('currency').value,
            quotesExpiry: parseInt(document.getElementById('quotesExpiry').value) || 30
        }
    };
    
    // Save to localStorage
    localStorage.setItem('uneomSettings', JSON.stringify(settings));
    
    // Show success message
    alert('تم حفظ الإعدادات بنجاح!');
}

// Function to get default settings
function getDefaultSettings() {
    return {
        company: {
            name: 'يونيوم',
            address: 'الرياض، المملكة العربية السعودية',
            phone: '+966 53 488 2396',
            email: 'info@uneom.com',
            website: 'https://uneom.com',
            logo: 'assets/logo.svg'
        },
        social: {
            facebook: 'https://www.facebook.com/uneomuniforms/',
            twitter: 'https://x.com/uneomcom',
            instagram: 'https://www.instagram.com/uneomuniforms/',
            youtube: 'https://www.youtube.com/@uneom-uniforms'
        },
        terms: `1. يسري هذا العرض لمدة 30 يوماً من تاريخ إصداره.
2. جميع الأسعار بالريال السعودي وتشمل ضريبة القيمة المضافة.
3. يتم تحديد موعد التسليم بعد استلام أمر الشراء.
4. يتطلب دفع 50% من قيمة الطلب كدفعة مقدمة.`,
        system: {
            vatRate: 15,
            quotePrefix: 'UNM',
            currency: 'SAR',
            quotesExpiry: 30
        }
    };
}

// Function to export all data
function exportData() {
    // Get all data from localStorage
    const data = {
        settings: JSON.parse(localStorage.getItem('uneomSettings')) || getDefaultSettings(),
        quotes: JSON.parse(localStorage.getItem('uneomQuotes')) || []
    };
    
    // Convert to JSON string
    const jsonData = JSON.stringify(data, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and click it
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uneom_data_' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// Function to import data
function importData() {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('يرجى اختيار ملف للاستيراد');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validate data structure
            if (!data.settings || !data.quotes) {
                throw new Error('بنية الملف غير صالحة');
            }
            
            // Import settings
            localStorage.setItem('uneomSettings', JSON.stringify(data.settings));
            
            // Import quotes
            localStorage.setItem('uneomQuotes', JSON.stringify(data.quotes));
            
            // Close the modal
            const importModal = bootstrap.Modal.getInstance(document.getElementById('importDataModal'));
            importModal.hide();
            
            // Reload settings
            loadSettings();
            
            // Show success message
            alert('تم استيراد البيانات بنجاح!');
            
        } catch (error) {
            alert('حدث خطأ أثناء استيراد البيانات: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}

// Function to clear all data
function clearData() {
    if (!confirm('هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
        return;
    }
    
    // Clear settings and quotes
    localStorage.removeItem('uneomSettings');
    localStorage.removeItem('uneomQuotes');
    
    // Reload settings with defaults
    loadSettings();
    
    // Show success message
    alert('تم مسح جميع البيانات بنجاح!');
} 