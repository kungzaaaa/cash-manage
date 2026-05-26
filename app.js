/**
 * Application State & Logic
 * Cash & Bank Flow Tracker
 */

// Category Configurations with emojis and Lucide icon keys
const CATEGORIES = {
    income: [
        { id: 'salary', label: 'เงินเดือน / ค่าจ้าง', icon: 'briefcase', color: 'hsl(150, 80%, 42%)' },
        { id: 'business', label: 'รายได้ธุรกิจ', icon: 'store', color: 'hsl(205, 90%, 50%)' },
        { id: 'investment', label: 'การลงทุน / ปันผล', icon: 'trending-up', color: 'hsl(280, 80%, 60%)' },
        { id: 'gift', label: 'ของขวัญ / โบนัส', icon: 'gift', color: 'hsl(40, 95%, 50%)' },
        { id: 'others-income', label: 'รายรับอื่น ๆ', icon: 'plus-circle', color: 'hsl(190, 80%, 45%)' }
    ],
    expense: [
        { id: 'food', label: 'อาหาร & เครื่องดื่ม', icon: 'utensils', color: 'hsl(0, 80%, 60%)' },
        { id: 'shopping', label: 'ช้อปปิ้ง', icon: 'shopping-cart', color: 'hsl(330, 80%, 55%)' },
        { id: 'travel', label: 'เดินทาง & พาหนะ', icon: 'car', color: 'hsl(205, 90%, 50%)' },
        { id: 'bills', label: 'บิล & ค่าใช้จ่ายคงที่', icon: 'receipt', color: 'hsl(28, 90%, 55%)' },
        { id: 'housing', label: 'ที่อยู่อาศัย', icon: 'home', color: 'hsl(260, 70%, 60%)' },
        { id: 'health', label: 'สุขภาพ & รักษาพยาบาล', icon: 'heart', color: 'hsl(350, 85%, 55%)' },
        { id: 'entertainment', label: 'ท่องเที่ยว & บันเทิง', icon: 'film', color: 'hsl(170, 75%, 40%)' },
        { id: 'others-expense', label: 'รายจ่ายอื่น ๆ', icon: 'minus-circle', color: 'hsl(0, 0%, 55%)' }
    ]
};

// Initial Mock Data (used if localStorage is completely empty for demonstration)
const MOCK_TRANSACTIONS = [
    {
        id: 'mock-1',
        type: 'income',
        amount: 32000.00,
        method: 'bank',
        category: 'salary',
        date: '2026-05-25T09:00',
        description: 'เงินเดือนประจำเดือน พฤษภาคม'
    },
    {
        id: 'mock-2',
        type: 'expense',
        amount: 1420.00,
        method: 'bank',
        category: 'bills',
        date: '2026-05-25T11:30',
        description: 'ค่าบริการอินเทอร์เน็ตและไฟฟ้ารอบเดือน'
    },
    {
        id: 'mock-3',
        type: 'income',
        amount: 3000.00,
        method: 'cash',
        category: 'gift',
        date: '2026-05-25T18:00',
        description: 'รางวัลจากคุณแม่'
    },
    {
        id: 'mock-4',
        type: 'expense',
        amount: 280.00,
        method: 'cash',
        category: 'food',
        date: '2026-05-26T08:15',
        description: 'มื้อเช้าและกาแฟสตาร์บัคส์'
    },
    {
        id: 'mock-5',
        type: 'expense',
        amount: 1800.00,
        method: 'bank',
        category: 'shopping',
        date: '2026-05-26T14:40',
        description: 'ซื้อรองเท้าผ้าใบสีขาวคู่ใหม่'
    }
];

// App State Management
let state = {
    transactions: [],
    filters: {
        type: 'all', // all, income, expense, cash, bank
        search: ''
    },
    currentTheme: 'dark',
    activeChartTab: 'flow' // flow, category
};

// Chart.js Instances
let flowChartInstance = null;
let categoryChartInstance = null;

// DOM Elements
const elements = {
    html: document.documentElement,
    themeToggleBtn: document.getElementById('theme-toggle'),
    btnLoadMock: document.getElementById('btn-load-mock'),
    btnClearAll: document.getElementById('btn-clear-all'),
    btnExportCsv: document.getElementById('btn-export-csv'),
    
    // Summary values
    totalBalance: document.getElementById('total-balance'),
    totalIncome: document.getElementById('total-income'),
    totalExpense: document.getElementById('total-expense'),
    cashBalance: document.getElementById('cash-balance'),
    cashIncome: document.getElementById('cash-income'),
    cashExpense: document.getElementById('cash-expense'),
    bankBalance: document.getElementById('bank-balance'),
    bankIncome: document.getElementById('bank-income'),
    bankExpense: document.getElementById('bank-expense'),
    
    // Transaction Form
    transactionForm: document.getElementById('transaction-form'),
    typeIncomeRadio: document.getElementById('type-income'),
    typeExpenseRadio: document.getElementById('type-expense'),
    txAmount: document.getElementById('tx-amount'),
    txMethod: document.getElementById('tx-method'),
    txCategory: document.getElementById('tx-category'),
    txDate: document.getElementById('tx-date'),
    txDescription: document.getElementById('tx-description'),
    
    // Ledger / Filter elements
    ledgerSearch: document.getElementById('ledger-search'),
    filterButtons: document.querySelectorAll('.filter-btn'),
    ledgerList: document.getElementById('ledger-list'),
    ledgerEmptyState: document.getElementById('ledger-empty-state'),
    
    // Chart tab switchers
    chartTabs: document.querySelectorAll('.chart-tab'),
    chartFlowContainer: document.getElementById('chart-flow-container'),
    chartCategoryContainer: document.getElementById('chart-category-container'),
    
    // Toast
    toast: document.getElementById('notification-toast'),

    // Edit Modal
    editModalOverlay: document.getElementById('edit-modal-overlay'),
    editModalClose: document.getElementById('edit-modal-close'),
    editModalCancel: document.getElementById('edit-modal-cancel'),
    editForm: document.getElementById('edit-transaction-form'),
    editTxId: document.getElementById('edit-tx-id'),
    editTypeIncome: document.getElementById('edit-type-income'),
    editTypeExpense: document.getElementById('edit-type-expense'),
    editTxAmount: document.getElementById('edit-tx-amount'),
    editTxMethod: document.getElementById('edit-tx-method'),
    editTxCategory: document.getElementById('edit-tx-category'),
    editTxDate: document.getElementById('edit-tx-date'),
    editTxDescription: document.getElementById('edit-tx-description'),

    // Edit Profile Modal
    userProfileSection: document.getElementById('user-profile-section'),
    editProfileModal: document.getElementById('edit-profile-modal'),
    editProfileClose: document.getElementById('edit-profile-close'),
    editProfileCancel: document.getElementById('edit-profile-cancel'),
    editProfileForm: document.getElementById('edit-profile-form'),
    editProfileName: document.getElementById('edit-profile-name'),
    editProfileAvatar: document.getElementById('edit-profile-avatar')
};

// -------------------------------------------------------------
// Core Initialization
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Date input value to current local time (formatted as YYYY-MM-DDTHH:MM)
    initFormDateTime();
    
    // 2. Initialize Theme configuration
    initTheme();
    
    // 3. Initialize Categories options
    updateCategorySelectOptions();
    
    // 4. Initialize Events
    setupEventListeners();
    
    // 5. Create Lucide Icons
    lucide.createIcons();

    // Note: Data loading and renderDashboard are now triggered by Firebase Auth state
    // (see initAppForUser in auth.js)
});

// -------------------------------------------------------------
// Firebase Integration (Called by auth.js)
// -------------------------------------------------------------
let txRef = null;
let unsubscribeSnapshot = null;

async function initAppForUser(user) {
    state.currentUser = user;
    txRef = db.collection('users').doc(user.uid).collection('transactions');
    
    // Set up real-time listener
    unsubscribeSnapshot = txRef.onSnapshot((snapshot) => {
        state.transactions = snapshot.docs.map(doc => {
            return { id: doc.id, ...doc.data() };
        });
        
        // Sort by date descending
        state.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // If it's a completely new user with no transactions, load mock data automatically
        if (state.transactions.length === 0 && snapshot.metadata.fromCache === false && snapshot.size === 0) {
            // Check if user just signed up (we'll only load mock if the collection is truly empty)
            // But to be safe, we'll wait for them to click "ข้อมูลทดลอง" manually instead of auto-populating
        }
        
        renderDashboard();
    }, (error) => {
        console.error("Error fetching transactions: ", error);
        showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'danger');
    });
}

function clearAppForLogout() {
    state.currentUser = null;
    txRef = null;
    state.transactions = [];
    if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
    }
    renderDashboard();
}

// Setup DateTime local picker input correctly
function initFormDateTime() {
    const now = new Date();
    // Offset local timezone
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    elements.txDate.value = `${year}-${month}-${day}T${hours}:${minutes}`;
}

// -------------------------------------------------------------
// Category management based on Type selection
// -------------------------------------------------------------
function updateCategorySelectOptions() {
    const isIncome = elements.typeIncomeRadio.checked;
    populateCategorySelect(elements.txCategory, isIncome);
}

function updateEditCategorySelectOptions() {
    const isIncome = elements.editTypeIncome.checked;
    populateCategorySelect(elements.editTxCategory, isIncome);
}

// Reusable helper: populates a <select> with category options
function populateCategorySelect(selectEl, isIncome) {
    const activeCategories = isIncome ? CATEGORIES.income : CATEGORIES.expense;
    const currentValue = selectEl.value; // preserve selection when possible
    selectEl.innerHTML = '';

    const EMOJI_MAP = {
        food: '🍔', shopping: '🛍️', travel: '🚗', bills: '🧾',
        housing: '🏠', health: '❤️', entertainment: '🎬',
        salary: '💼', business: '🏪', investment: '📈', gift: '🎁'
    };

    activeCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        const iconSymbol = EMOJI_MAP[cat.id] || (isIncome ? '📥' : '💸');
        option.textContent = `${iconSymbol} ${cat.label}`;
        selectEl.appendChild(option);
    });

    // Restore previous selection if it still exists in the new list
    if ([...selectEl.options].some(o => o.value === currentValue)) {
        selectEl.value = currentValue;
    }
}

// -------------------------------------------------------------
// Theme Management
// -------------------------------------------------------------
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    state.currentTheme = savedTheme;
    elements.html.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const nextTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
    state.currentTheme = nextTheme;
    elements.html.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
    
    // Re-draw charts with appropriate text colors for Light/Dark themes
    updateCharts();
}

// Removed loadStateFromStorage and saveStateToStorage as we now use Firestore.

// -------------------------------------------------------------
// Core Calculations and Layout Render Engine
// -------------------------------------------------------------
function renderDashboard() {
    // 1. Calculate values
    let totalCashIncome = 0;
    let totalCashExpense = 0;
    let totalBankIncome = 0;
    let totalBankExpense = 0;

    state.transactions.forEach(tx => {
        const amount = parseFloat(tx.amount) || 0;
        if (tx.method === 'cash') {
            if (tx.type === 'income') totalCashIncome += amount;
            else totalCashExpense += amount;
        } else if (tx.method === 'bank') {
            if (tx.type === 'income') totalBankIncome += amount;
            else totalBankExpense += amount;
        }
    });

    const currentCashBalance = totalCashIncome - totalCashExpense;
    const currentBankBalance = totalBankIncome - totalBankExpense;
    const overallBalance = currentCashBalance + currentBankBalance;
    const overallIncome = totalCashIncome + totalBankIncome;
    const overallExpense = totalCashExpense + totalBankExpense;

    // 2. Format & Update DOM Elements safely
    elements.totalBalance.textContent = formatCurrency(overallBalance);
    elements.totalIncome.textContent = `+฿${formatCurrency(overallIncome)}`;
    elements.totalExpense.textContent = `-฿${formatCurrency(overallExpense)}`;
    
    elements.cashBalance.textContent = formatCurrency(currentCashBalance);
    elements.cashIncome.textContent = `+฿${formatCurrency(totalCashIncome)}`;
    elements.cashExpense.textContent = `-฿${formatCurrency(totalCashExpense)}`;

    elements.bankBalance.textContent = formatCurrency(currentBankBalance);
    elements.bankIncome.textContent = `+฿${formatCurrency(totalBankIncome)}`;
    elements.bankExpense.textContent = `-฿${formatCurrency(totalBankExpense)}`;

    // Add green/red aesthetic to overall balances
    elements.totalBalance.parentElement.className = 'balance-value';
    if (overallBalance < 0) {
        elements.totalBalance.parentElement.classList.add('text-danger');
    }

    // 3. Render Historical List
    renderLedgerList();

    // 4. Update Charts
    updateCharts();
}

// Format numbers nicely: 12500 -> 12,500.00
function formatCurrency(number) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number);
}

// Render ledger rows
function renderLedgerList() {
    const listContainer = elements.ledgerList;
    listContainer.innerHTML = '';
    
    // Sort transactions chronologically (Newest first)
    const sortedTx = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Apply filters
    const searchVal = state.filters.search.toLowerCase().trim();
    const filterType = state.filters.type;
    
    const filteredTx = sortedTx.filter(tx => {
        // Filter by Type/Method
        if (filterType === 'income' && tx.type !== 'income') return false;
        if (filterType === 'expense' && tx.type !== 'expense') return false;
        if (filterType === 'cash' && tx.method !== 'cash') return false;
        if (filterType === 'bank' && tx.method !== 'bank') return false;
        
        // Filter by Search Keyword (Amount, Description, or Category display name)
        if (searchVal) {
            const amountStr = tx.amount.toString();
            const descStr = (tx.description || '').toLowerCase();
            const categoryObj = getCategoryObj(tx.type, tx.category);
            const categoryLabel = categoryObj ? categoryObj.label.toLowerCase() : '';
            
            return amountStr.includes(searchVal) || descStr.includes(searchVal) || categoryLabel.includes(searchVal);
        }
        
        return true;
    });

    if (filteredTx.length === 0) {
        elements.ledgerEmptyState.classList.remove('hidden');
        return;
    }
    
    elements.ledgerEmptyState.classList.add('hidden');

    filteredTx.forEach(tx => {
        const itemLi = document.createElement('li');
        itemLi.className = 'ledger-item';
        
        const categoryObj = getCategoryObj(tx.type, tx.category);
        const iconName = categoryObj ? categoryObj.icon : 'help-circle';
        const colorVal = categoryObj ? categoryObj.color : 'var(--text-muted)';
        const categoryLabel = categoryObj ? categoryObj.label : 'หมวดหมู่ทั่วไป';
        
        const sign = tx.type === 'income' ? '+' : '-';
        const amountClass = tx.type === 'income' ? 'text-success' : 'text-danger';
        
        // Clean beautiful relative dates
        const dateObj = new Date(tx.date);
        const formattedDate = dateObj.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const methodBadgeIcon = tx.method === 'cash' ? 'banknote' : 'landmark';
        
        itemLi.innerHTML = `
            <div class="ledger-item-left">
                <div class="item-icon-wrapper" style="background-color: ${colorVal}18; border: 1px solid ${colorVal}30;">
                    <i data-lucide="${iconName}" style="color: ${colorVal}"></i>
                    <div class="method-indicator bg-${tx.method}" title="${tx.method === 'cash' ? 'เงินสด' : 'บัญชีธนาคาร'}">
                        <i data-lucide="${methodBadgeIcon}"></i>
                    </div>
                </div>
                <div class="item-title-desc">
                    <div class="item-title-row">
                        <span class="item-title">${categoryLabel}</span>
                        <span class="method-text-badge bg-${tx.method} text-${tx.method}">${tx.method === 'cash' ? 'เงินสด' : 'ธนาคาร'}</span>
                    </div>
                    ${tx.description ? `<span class="item-desc">${tx.description}</span>` : ''}
                    <span class="item-date">${formattedDate}</span>
                </div>
            </div>
            <div class="ledger-item-right">
                <div class="item-amount-wrapper">
                    <span class="item-amount ${amountClass}">${sign}฿${formatCurrency(tx.amount)}</span>
                </div>
                <div class="item-actions">
                    <button class="btn-action-sm btn-edit" title="แก้ไขรายการ" data-id="${tx.id}">
                        <i data-lucide="pencil"></i>
                    </button>
                    <button class="btn-action-sm btn-delete" title="ลบรายการนี้" data-id="${tx.id}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;

        // Setup Edit button Event
        const editBtn = itemLi.querySelector('.btn-edit');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditModal(tx.id);
        });

        // Setup Delete button Event
        const deleteBtn = itemLi.querySelector('.btn-delete');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTransaction(tx.id);
        });

        listContainer.appendChild(itemLi);
    });

    // Re-create icons dynamically
    lucide.createIcons();
}

// Find Category configuration helper
function getCategoryObj(type, categoryId) {
    const list = type === 'income' ? CATEGORIES.income : CATEGORIES.expense;
    return list.find(item => item.id === categoryId) || null;
}

// -------------------------------------------------------------
// Interactive Charting Engine (Chart.js)
// -------------------------------------------------------------
function updateCharts() {
    const isDark = state.currentTheme === 'dark';
    const textBaseColor = isDark ? '#a0a3b0' : '#4e515d';
    const borderGridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

    // Compute Cash vs Bank values
    let totalCash = 0;
    let totalBank = 0;
    state.transactions.forEach(tx => {
        const amount = parseFloat(tx.amount) || 0;
        if (tx.method === 'cash') {
            totalCash += (tx.type === 'income' ? amount : -amount);
        } else {
            totalBank += (tx.type === 'income' ? amount : -amount);
        }
    });

    // 1. FLOW CHART (Doughnut Chart displaying Asset Split)
    const flowCtx = document.getElementById('flowChart').getContext('2d');
    if (flowChartInstance) {
        flowChartInstance.destroy();
    }
    
    flowChartInstance = new Chart(flowCtx, {
        type: 'doughnut',
        data: {
            labels: ['เงินสด (Cash)', 'เงินในธนาคาร (Bank)'],
            datasets: [{
                data: [Math.max(0, totalCash), Math.max(0, totalBank)],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.75)',  // Cash Emerald Green
                    'rgba(59, 130, 246, 0.75)'   // Bank Sky Blue
                ],
                borderColor: isDark ? '#14151a' : '#ffffff',
                borderWidth: 2,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textBaseColor,
                        font: { family: 'Kanit', size: 12 }
                    }
                },
                tooltip: {
                    titleFont: { family: 'Kanit' },
                    bodyFont: { family: 'Kanit' }
                }
            },
            cutout: '65%'
        }
    });

    // 2. CATEGORY CHART (Pie Chart analyzing Expenses Breakdown)
    // Gather all expenses and group them by category
    const expenseData = {};
    // Populate categories initially
    CATEGORIES.expense.forEach(c => {
        expenseData[c.id] = {
            label: c.label,
            amount: 0,
            color: c.color
        };
    });

    let totalExpenses = 0;
    state.transactions.forEach(tx => {
        if (tx.type === 'expense') {
            const amount = parseFloat(tx.amount) || 0;
            totalExpenses += amount;
            if (expenseData[tx.category]) {
                expenseData[tx.category].amount += amount;
            } else {
                // Unknown Category fallback
                if (!expenseData['others-expense']) {
                    expenseData['others-expense'] = { label: 'อื่น ๆ', amount: 0, color: '#777' };
                }
                expenseData['others-expense'].amount += amount;
            }
        }
    });

    // Extract categories with values > 0 for standard display
    const chartLabels = [];
    const chartData = [];
    const chartColors = [];

    Object.keys(expenseData).forEach(key => {
        const item = expenseData[key];
        if (item.amount > 0) {
            chartLabels.push(item.label);
            chartData.push(item.amount);
            chartColors.push(item.color);
        }
    });

    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    if (chartData.length === 0) {
        // Empty state for category chart
        categoryChartInstance = new Chart(categoryCtx, {
            type: 'pie',
            data: {
                labels: ['ยังไม่มีข้อมูลค่าใช้จ่าย'],
                datasets: [{
                    data: [1],
                    backgroundColor: [isDark ? '#2a2b36' : '#e2e8f0'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: textBaseColor, font: { family: 'Kanit' } }
                    },
                    tooltip: { enabled: false }
                }
            }
        });
    } else {
        categoryChartInstance = new Chart(categoryCtx, {
            type: 'pie',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: chartData,
                    backgroundColor: chartColors,
                    borderColor: isDark ? '#14151a' : '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textBaseColor,
                            font: { family: 'Kanit', size: 11 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const val = context.raw || 0;
                                const percentage = ((val / totalExpenses) * 100).toFixed(1);
                                return ` ${context.label}: ฿${formatCurrency(val)} (${percentage}%)`;
                            }
                        },
                        titleFont: { family: 'Kanit' },
                        bodyFont: { family: 'Kanit' }
                    }
                }
            }
        });
    }
}

// -------------------------------------------------------------
// Interactive Events Handlers
// -------------------------------------------------------------
function setupEventListeners() {
    // 1. Theme Toggle
    elements.themeToggleBtn.addEventListener('click', toggleTheme);

    // 2. Quick Demo / Reset
    elements.btnLoadMock.addEventListener('click', async () => {
        if (!txRef) {
            showToast('กรุณาเข้าสู่ระบบก่อน', 'danger');
            return;
        }
        if (confirm('คำเตือน: คุณต้องการโหลดข้อมูลทดลองใช่หรือไม่?\n\nระบบจะเพิ่มข้อมูลตัวอย่างเข้าไปในรายการปัจจุบัน')) {
            try {
                const batch = db.batch();
                MOCK_TRANSACTIONS.forEach(tx => {
                    const newId = 'tx-mock-' + Date.now() + Math.random().toString(36).substr(2, 5);
                    const newTx = { ...tx, id: newId };
                    const docRef = txRef.doc(newId);
                    batch.set(docRef, newTx);
                });
                await batch.commit();
                showToast('โหลดข้อมูลทดลองเสร็จสิ้น', 'success');
            } catch (error) {
                console.error(error);
                showToast('ไม่สามารถโหลดข้อมูลตัวอย่างได้', 'danger');
            }
        }
    });

    elements.btnClearAll.addEventListener('click', async () => {
        if (!txRef) return;
        if (confirm('คุณต้องการลบข้อมูลประวัติการทำรายการทั้งหมดใช่หรือไม่? ข้อมูลจะไม่สามารถกู้คืนได้')) {
            try {
                const snapshot = await txRef.get();
                const batch = db.batch();
                snapshot.docs.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                showToast('ล้างข้อมูลบัญชีเรียบร้อย', 'danger');
            } catch (error) {
                console.error(error);
                showToast('ไม่สามารถลบข้อมูลได้', 'danger');
            }
        }
    });

    // 3. Tab Selectors dynamically changing Categories list
    elements.typeIncomeRadio.addEventListener('change', updateCategorySelectOptions);
    elements.typeExpenseRadio.addEventListener('change', updateCategorySelectOptions);

    // 4. Form Submission
    elements.transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!txRef) {
            showToast('กรุณาเข้าสู่ระบบก่อน', 'danger');
            return;
        }

        const type = elements.typeIncomeRadio.checked ? 'income' : 'expense';
        const amount = parseFloat(elements.txAmount.value);
        const method = elements.txMethod.value; // cash or bank
        const category = elements.txCategory.value;
        const date = elements.txDate.value;
        const description = elements.txDescription.value.trim();

        if (isNaN(amount) || amount <= 0) {
            showToast('กรุณากรอกจำนวนเงินให้ถูกต้อง', 'danger');
            return;
        }

        if (!date) {
            showToast('กรุณาเลือกวันเวลาทำรายการ', 'danger');
            return;
        }

        const txId = 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const newTx = { id: txId, type, amount, method, category, date, description };

        try {
            await txRef.doc(txId).set(newTx);
            // Reset Inputs
            elements.txAmount.value = '';
            elements.txDescription.value = '';
            initFormDateTime(); // reset back to current date/time
            showToast('เพิ่มรายการธุรกรรมเรียบร้อย!', 'success');
        } catch (error) {
            console.error(error);
            showToast('ไม่สามารถบันทึกข้อมูลได้', 'danger');
        }
    });

    // 5. Chart Tabs Toggling
    elements.chartTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            elements.chartTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const chartType = tab.getAttribute('data-chart');
            state.activeChartTab = chartType;

            if (chartType === 'flow') {
                elements.chartFlowContainer.classList.add('active');
                elements.chartCategoryContainer.classList.remove('active');
            } else {
                elements.chartFlowContainer.classList.remove('active');
                elements.chartCategoryContainer.classList.add('active');
            }
            
            updateCharts();
        });
    });

    // 6. Ledger Search
    elements.ledgerSearch.addEventListener('input', (e) => {
        state.filters.search = e.target.value;
        renderLedgerList();
    });

    // 7. Ledger Filter Buttons
    elements.filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            state.filters.type = btn.getAttribute('data-filter');
            renderLedgerList();
        });
    });

    // 8. CSV Exporter
    elements.btnExportCsv.addEventListener('click', exportToCSV);

    // 9. Edit Modal – close actions
    elements.editModalClose.addEventListener('click', closeEditModal);
    elements.editModalCancel.addEventListener('click', closeEditModal);
    elements.editModalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.editModalOverlay) closeEditModal();
    });

    // 10. Edit Modal – type tabs change categories
    elements.editTypeIncome.addEventListener('change', updateEditCategorySelectOptions);
    elements.editTypeExpense.addEventListener('change', updateEditCategorySelectOptions);

    // 11. Edit Modal – form submission
    elements.editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!txRef) return;

        const id = elements.editTxId.value;
        const type = elements.editTypeIncome.checked ? 'income' : 'expense';
        const amount = parseFloat(elements.editTxAmount.value);
        const method = elements.editTxMethod.value;
        const category = elements.editTxCategory.value;
        const date = elements.editTxDate.value;
        const description = elements.editTxDescription.value.trim();

        if (isNaN(amount) || amount <= 0) {
            showToast('กรุณากรอกจำนวนเงินให้ถูกต้อง', 'danger');
            return;
        }
        if (!date) {
            showToast('กรุณาเลือกวันเวลาทำรายการ', 'danger');
            return;
        }

        const updatedTx = { id, type, amount, method, category, date, description };

        try {
            await txRef.doc(id).set(updatedTx);
            closeEditModal();
            showToast('แก้ไขรายการธุรกรรมเรียบร้อยแล้ว!', 'success');
        } catch (error) {
            console.error(error);
            showToast('ไม่สามารถแก้ไขข้อมูลได้', 'danger');
        }
    });

    // 12. Edit Profile Modal
    elements.userProfileSection.addEventListener('click', openEditProfileModal);
    elements.editProfileClose.addEventListener('click', closeEditProfileModal);
    elements.editProfileCancel.addEventListener('click', closeEditProfileModal);
    elements.editProfileModal.addEventListener('click', (e) => {
        if (e.target === elements.editProfileModal) closeEditProfileModal();
    });

    elements.editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const user = auth.currentUser;
        if (!user) return;
        
        const newName = elements.editProfileName.value.trim();
        const newAvatar = elements.editProfileAvatar.value.trim();
        
        if (!newName) {
            showToast('กรุณากรอกชื่อผู้ใช้งาน', 'danger');
            return;
        }

        try {
            await user.updateProfile({
                displayName: newName,
                photoURL: newAvatar || null
            });
            
            // Update UI directly
            document.getElementById('user-name').textContent = newName;
            if (newAvatar) {
                document.getElementById('user-avatar').src = newAvatar;
            } else {
                // Generate UI Avatar if empty
                document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=random`;
            }
            
            closeEditProfileModal();
            showToast('อัปเดตโปรไฟล์เรียบร้อยแล้ว!', 'success');
        } catch (error) {
            console.error(error);
            showToast('เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์', 'danger');
        }
    });
}
// -------------------------------------------------------------
// Transaction Mutators
// -------------------------------------------------------------
function deleteTransaction(id) {
    if (confirm('คุณแน่ใจว่าต้องการลบรายการนี้ใช่ไหม?')) {
        if (!txRef) return;
        txRef.doc(id).delete().then(() => {
            showToast('ลบรายการธุรกรรมเรียบร้อยแล้ว', 'success');
        }).catch(error => {
            console.error(error);
            showToast('ไม่สามารถลบข้อมูลได้', 'danger');
        });
    }
}

// -------------------------------------------------------------
// Edit Modal: Open / Close / Populate
// -------------------------------------------------------------
function openEditModal(id) {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;

    // Set hidden ID
    elements.editTxId.value = tx.id;

    // Set type radio
    if (tx.type === 'income') {
        elements.editTypeIncome.checked = true;
    } else {
        elements.editTypeExpense.checked = true;
    }

    // Populate categories for the correct type, then select the right one
    updateEditCategorySelectOptions();
    elements.editTxCategory.value = tx.category;

    // Fill remaining fields
    elements.editTxAmount.value = tx.amount;
    elements.editTxMethod.value = tx.method;
    elements.editTxDate.value = tx.date;
    elements.editTxDescription.value = tx.description || '';

    // Show modal
    elements.editModalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // prevent background scroll

    // Re-create icons for the modal
    lucide.createIcons();
}

function closeEditModal() {
    elements.editModalOverlay.classList.add('hidden');
    document.body.style.overflow = ''; // restore scroll
    elements.editForm.reset();
}

// -------------------------------------------------------------
// Edit Profile Modal logic
// -------------------------------------------------------------
function openEditProfileModal() {
    const user = auth.currentUser;
    if (!user) return;
    
    // Fill current info
    elements.editProfileName.value = user.displayName || '';
    
    // If the photoURL is from ui-avatars (which we generated), leave input empty for better UX
    // or populate if it's a real custom URL or Google URL.
    if (user.photoURL && !user.photoURL.includes('ui-avatars.com')) {
        elements.editProfileAvatar.value = user.photoURL;
    } else {
        elements.editProfileAvatar.value = '';
    }
    
    elements.editProfileModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
}

function closeEditProfileModal() {
    elements.editProfileModal.classList.add('hidden');
    document.body.style.overflow = '';
    elements.editProfileForm.reset();
}

// -------------------------------------------------------------
// Toast Notifications
// -------------------------------------------------------------
function showToast(message, type = 'success') {
    const toast = elements.toast;
    const icon = toast.querySelector('.toast-icon');
    const msgSpan = toast.querySelector('.toast-message');
    
    msgSpan.textContent = message;
    
    // Set appropriate color badges
    toast.className = 'toast'; // reset classes
    if (type === 'success') {
        toast.classList.add('toast-success');
        icon.setAttribute('data-lucide', 'check-circle-2');
    } else if (type === 'danger') {
        toast.classList.add('toast-danger');
        icon.setAttribute('data-lucide', 'alert-triangle');
    } else {
        icon.setAttribute('data-lucide', 'info');
    }
    
    lucide.createIcons();
    
    toast.classList.remove('hidden');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// -------------------------------------------------------------
// CSV Exporter engine with Excel-friendly UTF-8 BOM representation
// -------------------------------------------------------------
function exportToCSV() {
    if (state.transactions.length === 0) {
        showToast('ไม่มีรายการธุรกรรมสำหรับส่งออกข้อมูล', 'danger');
        return;
    }

    // Set CSV Header columns
    let csvContent = '\uFEFF'; // Excel UTF-8 BOM to prevent Thai char corruption
    csvContent += 'วันเวลา,ประเภท,จำนวนเงิน,ช่องทาง,หมวดหมู่,คำอธิบายเพิ่มเติม\r\n';

    state.transactions.forEach(tx => {
        const typeLabel = tx.type === 'income' ? 'รายรับ' : 'รายจ่าย';
        const methodLabel = tx.method === 'cash' ? 'เงินสด' : 'ธนาคาร';
        const catObj = getCategoryObj(tx.type, tx.category);
        const catLabel = catObj ? catObj.label : tx.category;
        const description = (tx.description || '').replace(/"/g, '""'); // escape quotes

        const formattedDate = new Date(tx.date).toLocaleString('th-TH');
        
        csvContent += `"${formattedDate}","${typeLabel}",${tx.amount},"${methodLabel}","${catLabel}","${description}"\r\n`;
    });

    // Create Download Trigger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `cash_bank_report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว', 'success');
}
