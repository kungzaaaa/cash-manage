/**
 * Application State & Logic
 * Cash & Bank Flow Tracker — Minimalist Edition
 */

// # ============================================
// # PAYMENT / DONATION INTEGRATION (Future)
// # ============================================
// # function initPaymentSystem() { ... }
// # function processDonation(amount, method) { ... }
// # function generateQRCode(amount) { ... }
// # function handlePaymentWebhook(event) { ... }
// # 
// # Supported methods (planned):
// #   - Stripe Payment Gateway
// #   - PromptPay QR Code
// #   - PayPal Donations
// #   - Crypto Wallet
// # ============================================

// Category Configurations with emojis and Lucide icon keys
let CATEGORIES = {
    income: [
        { id: 'salary', labelKey: 'cat.salary', icon: 'briefcase', color: 'hsl(150, 80%, 42%)' },
        { id: 'business', labelKey: 'cat.business', icon: 'store', color: 'hsl(205, 90%, 50%)' },
        { id: 'investment', labelKey: 'cat.investment', icon: 'trending-up', color: 'hsl(280, 80%, 60%)' },
        { id: 'gift', labelKey: 'cat.gift', icon: 'gift', color: 'hsl(40, 95%, 50%)' },
        { id: 'others-income', labelKey: 'cat.others_income', icon: 'plus-circle', color: 'hsl(190, 80%, 45%)' }
    ],
    expense: [
        { id: 'food', labelKey: 'cat.food', icon: 'utensils', color: 'hsl(0, 80%, 60%)' },
        { id: 'shopping', labelKey: 'cat.shopping', icon: 'shopping-cart', color: 'hsl(330, 80%, 55%)' },
        { id: 'travel', labelKey: 'cat.travel', icon: 'car', color: 'hsl(205, 90%, 50%)' },
        { id: 'bills', labelKey: 'cat.bills', icon: 'receipt', color: 'hsl(28, 90%, 55%)' },
        { id: 'housing', labelKey: 'cat.housing', icon: 'home', color: 'hsl(260, 70%, 60%)' },
        { id: 'health', labelKey: 'cat.health', icon: 'heart', color: 'hsl(350, 85%, 55%)' },
        { id: 'entertainment', labelKey: 'cat.entertainment', icon: 'film', color: 'hsl(170, 75%, 40%)' },
        { id: 'others-expense', labelKey: 'cat.others_expense', icon: 'minus-circle', color: 'hsl(0, 0%, 55%)' }
    ]
};

// Fallback static exchange rates (base USD)
const fallbackExchangeRates = {
    USD: 1.0,
    THB: 36.5,
    EUR: 0.92,
    JPY: 156.0,
    GBP: 0.79,
    CNY: 7.25
};

function convertCurrency(amount, from, to) {
    if (!from) from = 'THB';
    if (!to) to = 'THB';
    if (from === to) return amount;
    const rates = state.exchangeRates || fallbackExchangeRates;
    const rateFrom = rates[from] || 1;
    const rateTo = rates[to] || 1;
    return (amount / rateFrom) * rateTo;
}

// App State Management
let state = {
    transactions: [],
    filters: {
        type: 'all',
        search: ''
    },
    currentTheme: 'light',
    activeChartTab: 'flow',
    currentView: 'home', // 'home' or 'detail'
    exchangeRates: null
};

// Chart.js Instances
let flowChartInstance = null;
let categoryChartInstance = null;
let clearCooldownTimer = null;

// DOM Elements
const elements = {
    html: document.documentElement,
    themeToggleBtn: document.getElementById('theme-toggle'),
    btnExportCsv: document.getElementById('btn-export-csv'),
    btnClearAll: document.getElementById('btn-clear-all'),

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

    // Transaction Form (now inside modal)
    addTxModalOverlay: document.getElementById('add-tx-modal-overlay'),
    addTxModalClose: document.getElementById('add-tx-modal-close'),
    btnAddTransaction: document.getElementById('btn-add-transaction'),
    transactionForm: document.getElementById('transaction-form'),
    typeIncomeRadio: document.getElementById('type-income'),
    typeExpenseRadio: document.getElementById('type-expense'),
    txAmount: document.getElementById('tx-amount'),
    txMethod: document.getElementById('tx-method'),
    txCategory: document.getElementById('tx-category'),
    txDate: document.getElementById('tx-date'),
    txDescription: document.getElementById('tx-description'),

    // Recent List (home view)
    recentList: document.getElementById('recent-list'),
    recentEmptyState: document.getElementById('recent-empty-state'),
    btnViewAll: document.getElementById('btn-view-all'),

    // Views
    homeView: document.getElementById('home-view'),
    detailView: document.getElementById('detail-view'),
    btnBackHome: document.getElementById('btn-back-home'),

    // Ledger / Filter elements (detail view)
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

    // Data Management Modal
    dataManageModalOverlay: document.getElementById('data-manage-modal-overlay'),
    dataManageModalClose: document.getElementById('data-manage-modal-close'),
    btnManageData: document.getElementById('btn-manage-data'),
    btnExportData: document.getElementById('btn-export-data'),
    clearCooldownPanel: document.getElementById('clear-cooldown-panel'),
    btnCancelClear: document.getElementById('btn-cancel-clear'),
    btnConfirmClear: document.getElementById('btn-confirm-clear'),
    cooldownCounter: document.getElementById('cooldown-counter'),
    cooldownRingProgress: document.getElementById('cooldown-ring-progress'),

    // Profile Dropdown
    profileDropdown: document.getElementById('profile-dropdown'),
    btnOpenProfile: document.getElementById('btn-open-profile'),
    btnOpenConverter: document.getElementById('btn-open-converter'),
    btnProfileConverter: document.getElementById('btn-profile-converter'),
    converterModalOverlay: document.getElementById('converter-modal-overlay'),
    converterModalClose: document.getElementById('converter-modal-close'),

    // Category Modal
    categoryModalOverlay: document.getElementById('category-modal-overlay'),
    categoryModalClose: document.getElementById('category-modal-close'),
    categoryModalCancel: document.getElementById('category-modal-cancel'),
    categoryForm: document.getElementById('category-form'),
    catTypeIndicator: document.getElementById('cat-type-indicator'),
    catTypeLabel: document.getElementById('cat-type-label'),
    catName: document.getElementById('cat-name'),
    iconPickerGrid: document.getElementById('icon-picker-grid'),
    colorPickerGrid: document.getElementById('color-picker-grid'),
    catPreviewIcon: document.getElementById('cat-preview-icon'),
    catPreviewName: document.getElementById('cat-preview-name'),
    btnAddCategory: document.getElementById('btn-add-category'),
    btnAddCategoryEdit: document.getElementById('btn-add-category-edit')
};

// -------------------------------------------------------------
// Core Initialization
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initFormDateTime();
    initTheme();
    initCurrency();
    initCurrencyConverter();
    fetchExchangeRates();
    updateCategorySelectOptions();
    setupEventListeners();
    initCustomDropdowns();
    initCategoryModal();
    lucide.createIcons();
});

// -------------------------------------------------------------
// Firebase Integration (Called by auth.js)
// -------------------------------------------------------------
let txRef = null;
let unsubscribeSnapshot = null;

async function initAppForUser(user) {
    state.currentUser = user;
    txRef = db.collection('users').doc(user.uid).collection('transactions');

    unsubscribeSnapshot = txRef.onSnapshot((snapshot) => {
        state.transactions = snapshot.docs.map(doc => {
            return { id: doc.id, ...doc.data() };
        });
        state.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        renderDashboard();
    }, (error) => {
        console.error("Error fetching transactions: ", error);
        showToast(t('toast.load_error'), 'danger');
    });

    loadCustomCategories(user);
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

function initFormDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    elements.txDate.value = `${year}-${month}-${day}T${hours}:${minutes}`;
}

// -------------------------------------------------------------
// Category management
// -------------------------------------------------------------
function updateCategorySelectOptions() {
    const isIncome = elements.typeIncomeRadio.checked;
    populateCategorySelect(elements.txCategory, isIncome);
}

function updateEditCategorySelectOptions() {
    const isIncome = elements.editTypeIncome.checked;
    populateCategorySelect(elements.editTxCategory, isIncome);
}

function populateCategorySelect(selectEl, isIncome) {
    const activeCategories = isIncome ? CATEGORIES.income : CATEGORIES.expense;
    const currentValue = selectEl.value;
    selectEl.innerHTML = '';

    const EMOJI_MAP = {
        food: '🍔', shopping: '🛍️', travel: '🚗', bills: '🧾',
        housing: '🏠', health: '❤️', entertainment: '🎬',
        salary: '💼', business: '🏪', investment: '📈', gift: '🎁'
    };

    activeCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        const iconSymbol = EMOJI_MAP[cat.id] || (cat.custom ? '✨' : (isIncome ? '📥' : '💸'));
        option.textContent = `${iconSymbol} ${t(cat.labelKey)}`;
        option.setAttribute('data-icon', cat.icon);
        option.setAttribute('data-color', cat.color);
        selectEl.appendChild(option);
    });

    if ([...selectEl.options].some(o => o.value === currentValue)) {
        selectEl.value = currentValue;
    }

    refreshCustomDropdown(selectEl);
}

// -------------------------------------------------------------
// Theme Management
// -------------------------------------------------------------
function initTheme() {
    // Force all pages to default to the light theme on initial load
    const savedTheme = 'light';
    state.currentTheme = savedTheme;
    elements.html.setAttribute('data-theme', savedTheme);
    localStorage.setItem('theme', 'light');
}

function initCurrency() {
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) {
        currencySelect.value = currentCurrency;
        if (typeof refreshCustomDropdown === 'function') {
            refreshCustomDropdown(currencySelect);
        }
        currencySelect.addEventListener('change', () => {
            currentCurrency = currencySelect.value;
            localStorage.setItem('app-currency', currentCurrency);
            
            // Re-apply translations for form amount label
            if (typeof applyTranslations === 'function') {
                applyTranslations();
            }
            
            // Re-render dashboard balance formatting, recent lists, ledger list, and charts
            renderDashboard();
            updateCharts();
        });
    }
}

async function fetchExchangeRates() {
    try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        if (!response.ok) throw new Error('API response failed');
        const data = await response.json();
        if (data && data.rates) {
            state.exchangeRates = data.rates;
            console.log('Realtime exchange rates loaded successfully:', data.rates);
            const updateTimeEl = document.getElementById('rate-update-time');
            if (updateTimeEl) {
                const dateStr = new Date(data.time_last_update_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                updateTimeEl.textContent = `อัปเดตเรียลไทม์ ${dateStr}`;
            }
            renderDashboard();
            updateCharts();
            updateCurrencyConverter();
        }
    } catch (error) {
        console.error('Error fetching realtime exchange rates, using fallback:', error);
        state.exchangeRates = fallbackExchangeRates;
    }
}

function updateCurrencyConverter() {
    const convAmount = document.getElementById('conv-amount');
    const convFrom = document.getElementById('conv-from');
    const convTo = document.getElementById('conv-to');

    if (!convAmount || !convFrom || !convTo) return;

    const amount = parseFloat(convAmount.value) || 0;
    const from = convFrom.value;
    const to = convTo.value;
    
    const result = convertCurrency(amount, from, to);
    
    const rates = state.exchangeRates || fallbackExchangeRates;
    const rateFrom = rates[from] || 1;
    const rateTo = rates[to] || 1;
    const rateText = (rateTo / rateFrom).toFixed(4);

    const fromEl = document.getElementById('conv-result-from');
    const valEl = document.getElementById('conv-result-value');
    if (fromEl) fromEl.textContent = `${formatCurrency(amount)} ${from} (1 ${from} = ${rateText} ${to}) =`;
    if (valEl) valEl.textContent = `${formatCurrency(result)} ${to}`;
}

function initCurrencyConverter() {
    const convAmount = document.getElementById('conv-amount');
    const convFrom = document.getElementById('conv-from');
    const convTo = document.getElementById('conv-to');

    if (!convAmount || !convFrom || !convTo) return;

    convAmount.addEventListener('input', updateCurrencyConverter);
    convFrom.addEventListener('change', updateCurrencyConverter);
    convTo.addEventListener('change', updateCurrencyConverter);

    updateCurrencyConverter();
}

function toggleTheme() {
    const nextTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
    state.currentTheme = nextTheme;
    elements.html.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
    updateCharts();
}

// -------------------------------------------------------------
// View Navigation (Home / Detail)
// -------------------------------------------------------------
function showHomeView() {
    state.currentView = 'home';
    elements.homeView.classList.remove('hidden');
    elements.detailView.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showDetailView() {
    state.currentView = 'detail';
    elements.homeView.classList.add('hidden');
    elements.detailView.classList.remove('hidden');
    renderLedgerList();
    updateCharts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    lucide.createIcons();
}

// -------------------------------------------------------------
// Add Transaction Modal
// -------------------------------------------------------------
function openAddTxModal() {
    initFormDateTime();
    elements.addTxModalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
    // Focus amount input after animation
    setTimeout(() => elements.txAmount.focus(), 200);
}

function closeAddTxModal() {
    elements.addTxModalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
}

// -------------------------------------------------------------
// Profile Dropdown Toggle
// -------------------------------------------------------------
function toggleProfileDropdown() {
    const dropdown = elements.profileDropdown;
    const profileSection = document.getElementById('user-profile-section');

    if (dropdown.classList.contains('hidden')) {
        dropdown.classList.remove('hidden');
        profileSection.classList.add('dropdown-open');
    } else {
        dropdown.classList.add('hidden');
        profileSection.classList.remove('dropdown-open');
    }
}

function closeProfileDropdown() {
    elements.profileDropdown.classList.add('hidden');
    const profileSection = document.getElementById('user-profile-section');
    profileSection.classList.remove('dropdown-open');
}

// -------------------------------------------------------------
// Data Management Modal
// -------------------------------------------------------------
function openDataManageModal() {
    closeProfileDropdown();
    elements.dataManageModalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
}

function closeDataManageModal() {
    elements.dataManageModalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
}

// -------------------------------------------------------------
// Core Render Engine
// -------------------------------------------------------------
function renderDashboard() {
    let totalCashIncome = 0;
    let totalCashExpense = 0;
    let totalBankIncome = 0;
    let totalBankExpense = 0;

    state.transactions.forEach(tx => {
        const originalAmount = parseFloat(tx.amount) || 0;
        const amount = convertCurrency(originalAmount, tx.currency || 'THB', currentCurrency);
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

    const curSym = getCurrencySymbol();
    // Update Hero Card
    elements.totalBalance.textContent = formatCurrency(overallBalance);
    elements.totalIncome.textContent = `+${curSym}${formatCurrency(overallIncome)}`;
    elements.totalExpense.textContent = `-${curSym}${formatCurrency(overallExpense)}`;

    elements.cashBalance.textContent = `${curSym}${formatCurrency(currentCashBalance)}`;
    elements.cashIncome.textContent = `+${curSym}${formatCurrency(totalCashIncome)}`;
    elements.cashExpense.textContent = `-${curSym}${formatCurrency(totalCashExpense)}`;

    elements.bankBalance.textContent = `${curSym}${formatCurrency(currentBankBalance)}`;
    elements.bankIncome.textContent = `+${curSym}${formatCurrency(totalBankIncome)}`;
    elements.bankExpense.textContent = `-${curSym}${formatCurrency(totalBankExpense)}`;

    // Update static hero currency symbols and input prefixes
    document.querySelectorAll('.hero-currency').forEach(el => {
        el.textContent = curSym;
    });
    document.querySelectorAll('.input-prefix').forEach(el => {
        el.textContent = curSym;
    });

    // Color negative balance
    if (overallBalance < 0) {
        elements.totalBalance.parentElement.classList.add('text-expense');
    } else {
        elements.totalBalance.parentElement.classList.remove('text-expense');
    }

    // Render recent list on home
    renderRecentList();

    // If on detail view, update ledger and charts
    if (state.currentView === 'detail') {
        renderLedgerList();
        updateCharts();
    }

    if (typeof applyTranslations === 'function') {
        applyTranslations();
    }
}

function formatCurrency(number) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number);
}

// -------------------------------------------------------------
// Render Recent List (Home — max 5 items)
// -------------------------------------------------------------
function renderRecentList() {
    const listContainer = elements.recentList;
    listContainer.innerHTML = '';

    const sortedTx = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentTx = sortedTx.slice(0, 5);

    if (recentTx.length === 0) {
        elements.recentEmptyState.classList.remove('hidden');
        return;
    }

    elements.recentEmptyState.classList.add('hidden');

    recentTx.forEach(tx => {
        const itemLi = document.createElement('li');
        itemLi.className = 'recent-item';
        itemLi.innerHTML = buildTransactionItemHTML(tx);
        setupTransactionItemEvents(itemLi, tx);
        listContainer.appendChild(itemLi);
    });

    lucide.createIcons();
}

// -------------------------------------------------------------
// Render Full Ledger List (Detail View)
// -------------------------------------------------------------
function renderLedgerList() {
    const listContainer = elements.ledgerList;
    listContainer.innerHTML = '';

    const sortedTx = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    const searchVal = state.filters.search.toLowerCase().trim();
    const filterType = state.filters.type;

    const filteredTx = sortedTx.filter(tx => {
        if (filterType === 'income' && tx.type !== 'income') return false;
        if (filterType === 'expense' && tx.type !== 'expense') return false;
        if (filterType === 'cash' && tx.method !== 'cash') return false;
        if (filterType === 'bank' && tx.method !== 'bank') return false;

        if (searchVal) {
            const amountStr = tx.amount.toString();
            const descStr = (tx.description || '').toLowerCase();
            const categoryObj = getCategoryObj(tx.type, tx.category);
            const categoryLabel = categoryObj ? t(categoryObj.labelKey).toLowerCase() : '';
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
        itemLi.innerHTML = buildTransactionItemHTML(tx);
        setupTransactionItemEvents(itemLi, tx);
        listContainer.appendChild(itemLi);
    });

    lucide.createIcons();
}

// Shared HTML builder for transaction items
function buildTransactionItemHTML(tx) {
    const categoryObj = getCategoryObj(tx.type, tx.category);
    const iconName = categoryObj ? categoryObj.icon : 'help-circle';
    const colorVal = categoryObj ? categoryObj.color : 'var(--text-muted)';
    const categoryLabel = categoryObj ? t(categoryObj.labelKey) : t('ledger.category_default');

    const sign = tx.type === 'income' ? '+' : '-';
    const amountClass = tx.type === 'income' ? 'text-income' : 'text-expense';

    const dateObj = new Date(tx.date);
    const formattedDate = dateObj.toLocaleDateString(getDateLocale(), {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const methodBadgeIcon = tx.method === 'cash' ? 'banknote' : 'landmark';

    return `
        <div class="ledger-item-left">
            <div class="item-icon-wrapper" style="background-color: ${colorVal}10; border: 1px solid ${colorVal}20;">
                <i data-lucide="${iconName}" style="color: ${colorVal}"></i>
                <div class="method-indicator bg-${tx.method}" title="${tx.method === 'cash' ? t('ledger.method_cash_title') : t('ledger.method_bank_title')}">
                    <i data-lucide="${methodBadgeIcon}"></i>
                </div>
            </div>
            <div class="item-title-desc">
                <div class="item-title-row">
                    <span class="item-title">${categoryLabel}</span>
                    <span class="method-text-badge">${tx.method === 'cash' ? t('ledger.method_cash') : t('ledger.method_bank')}</span>
                </div>
                ${tx.description ? `<span class="item-desc">${tx.description}</span>` : ''}
                <span class="item-date">${formattedDate}</span>
            </div>
        </div>
        <div class="ledger-item-right">
            <div class="item-amount-wrapper" style="text-align: right;">
                <span class="item-amount ${amountClass}">${sign}${getCurrencySymbol()}${formatCurrency(convertCurrency(parseFloat(tx.amount) || 0, tx.currency || 'THB', currentCurrency))}</span>
                ${tx.currency && tx.currency !== currentCurrency ? `<span class="item-amount-original" style="display:block; font-size:10px; color:var(--text-muted); font-family:var(--font-eng); font-weight:500;">${parseFloat(tx.amount).toFixed(2)} ${tx.currency}</span>` : ''}
            </div>
            <div class="item-actions">
                <button class="btn-action-sm btn-edit" title="${t('ledger.edit_title')}" data-id="${tx.id}">
                    <i data-lucide="pencil"></i>
                </button>
                <button class="btn-action-sm btn-delete" title="${t('ledger.delete_title')}" data-id="${tx.id}">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        </div>
    `;
}

// Setup events for each transaction item
function setupTransactionItemEvents(itemLi, tx) {
    const editBtn = itemLi.querySelector('.btn-edit');
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditModal(tx.id);
    });

    const deleteBtn = itemLi.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTransaction(tx.id);
    });
}

function getCategoryObj(type, categoryId) {
    const list = type === 'income' ? CATEGORIES.income : CATEGORIES.expense;
    return list.find(item => item.id === categoryId) || null;
}

// -------------------------------------------------------------
// Charts
// -------------------------------------------------------------
function updateCharts() {
    const isDark = state.currentTheme === 'dark';
    const textBaseColor = isDark ? '#9CA3AF' : '#6B7280';
    const borderGridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    let totalCash = 0;
    let totalBank = 0;
    state.transactions.forEach(tx => {
        const originalAmount = parseFloat(tx.amount) || 0;
        const amount = convertCurrency(originalAmount, tx.currency || 'THB', currentCurrency);
        if (tx.method === 'cash') {
            totalCash += (tx.type === 'income' ? amount : -amount);
        } else {
            totalBank += (tx.type === 'income' ? amount : -amount);
        }
    });

    // Flow Chart (Doughnut)
    const flowCtx = document.getElementById('flowChart');
    if (!flowCtx) return;

    if (flowChartInstance) flowChartInstance.destroy();

    flowChartInstance = new Chart(flowCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: [t('chart.cash_label'), t('chart.bank_label')],
            datasets: [{
                data: [Math.max(0, totalCash), Math.max(0, totalBank)],
                backgroundColor: [
                    isDark ? 'rgba(52, 211, 153, 0.7)' : 'rgba(5, 150, 105, 0.7)',
                    isDark ? 'rgba(99, 102, 241, 0.7)' : 'rgba(79, 70, 229, 0.7)'
                ],
                borderColor: isDark ? '#1A1B1E' : '#ffffff',
                borderWidth: 2,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: textBaseColor, font: { family: 'Kanit', size: 12 } }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const val = context.raw || 0;
                            return ` ${context.label}: ${getCurrencySymbol()}${formatCurrency(val)}`;
                        }
                    },
                    titleFont: { family: 'Kanit' },
                    bodyFont: { family: 'Kanit' }
                }
            },
            cutout: '65%'
        }
    });

    // Category Chart (Pie)
    const expenseData = {};
    CATEGORIES.expense.forEach(c => {
        expenseData[c.id] = { label: t(c.labelKey), amount: 0, color: c.color };
    });

    let totalExpenses = 0;
    state.transactions.forEach(tx => {
        if (tx.type === 'expense') {
            const originalAmount = parseFloat(tx.amount) || 0;
            const amount = convertCurrency(originalAmount, tx.currency || 'THB', currentCurrency);
            totalExpenses += amount;
            if (expenseData[tx.category]) {
                expenseData[tx.category].amount += amount;
            } else {
                if (!expenseData['others-expense']) {
                    expenseData['others-expense'] = { label: t('chart.others'), amount: 0, color: '#9CA3AF' };
                }
                expenseData['others-expense'].amount += amount;
            }
        }
    });

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

    const categoryCtx = document.getElementById('categoryChart');
    if (!categoryCtx) return;

    if (categoryChartInstance) categoryChartInstance.destroy();

    if (chartData.length === 0) {
        categoryChartInstance = new Chart(categoryCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: [t('chart.no_expense_data')],
                datasets: [{
                    data: [1],
                    backgroundColor: [isDark ? '#25262B' : '#E5E7EB'],
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
        categoryChartInstance = new Chart(categoryCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: chartData,
                    backgroundColor: chartColors,
                    borderColor: isDark ? '#1A1B1E' : '#ffffff',
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
                            label: function (context) {
                                const val = context.raw || 0;
                                const percentage = ((val / totalExpenses) * 100).toFixed(1);
                                return ` ${context.label}: ${getCurrencySymbol()}${formatCurrency(val)} (${percentage}%)`;
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
// Event Listeners
// -------------------------------------------------------------
function setupEventListeners() {
    // Theme Toggle
    elements.themeToggleBtn.addEventListener('click', toggleTheme);

    // Add Transaction Modal
    elements.btnAddTransaction.addEventListener('click', openAddTxModal);
    elements.addTxModalClose.addEventListener('click', closeAddTxModal);
    elements.addTxModalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.addTxModalOverlay) closeAddTxModal();
    });

    // Profile Dropdown
    document.getElementById('user-profile-section').addEventListener('click', (e) => {
        e.stopPropagation();
        toggleProfileDropdown();
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.topbar-profile-wrapper')) {
            closeProfileDropdown();
        }
    });

    // Profile dropdown items
    elements.btnOpenProfile.addEventListener('click', () => {
        closeProfileDropdown();
        if (typeof openProfileModal === 'function') openProfileModal();
    });

    // Currency Converter Modal Events
    if (elements.btnOpenConverter) {
        elements.btnOpenConverter.addEventListener('click', openConverterModal);
    }
    if (elements.btnProfileConverter) {
        elements.btnProfileConverter.addEventListener('click', openConverterModal);
    }
    if (elements.converterModalClose) {
        elements.converterModalClose.addEventListener('click', closeConverterModal);
    }
    if (elements.converterModalOverlay) {
        elements.converterModalOverlay.addEventListener('click', (e) => {
            if (e.target === elements.converterModalOverlay) closeConverterModal();
        });
    }

    // Data Management
    elements.btnManageData.addEventListener('click', openDataManageModal);
    elements.dataManageModalClose.addEventListener('click', closeDataManageModal);
    elements.dataManageModalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.dataManageModalOverlay) closeDataManageModal();
    });

    // Export data from management modal
    elements.btnExportData.addEventListener('click', () => {
        closeDataManageModal();
        exportToCSV();
    });

    async function executeDataClear() {
        if (!txRef) return;
        try {
            const snapshot = await txRef.get();
            const batch = db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            closeDataManageModal();
            showToast(t('toast.clear_success'), 'danger');
        } catch (error) {
            console.error(error);
            showToast(t('toast.clear_error'), 'danger');
        }
    }

    // Clear all data — 3-second cooldown with cancel
    function startClearCooldown() {
        const DURATION = 5;
        const CIRCUMFERENCE = 125.66; // 2π × 20
        let remaining = DURATION;

        // Show panel, disable the main button
        elements.clearCooldownPanel.classList.remove('hidden');
        elements.btnClearAll.disabled = true;
        elements.btnClearAll.style.opacity = '0.45';
        elements.btnClearAll.style.pointerEvents = 'none';

        // Re-init ring
        elements.cooldownCounter.textContent = remaining;
        elements.cooldownRingProgress.style.strokeDashoffset = '0';
        // Trigger animation on next frame so CSS transition fires
        requestAnimationFrame(() => {
            elements.cooldownRingProgress.style.strokeDashoffset = CIRCUMFERENCE.toString();
        });

        clearCooldownTimer = setInterval(async () => {
            remaining--;
            elements.cooldownCounter.textContent = remaining;

            if (remaining <= 0) {
                clearInterval(clearCooldownTimer);
                clearCooldownTimer = null;
                resetClearCooldown();
                await executeDataClear();
            }
        }, 1000);
    }

    function resetClearCooldown() {
        if (clearCooldownTimer) {
            clearInterval(clearCooldownTimer);
            clearCooldownTimer = null;
        }
        elements.clearCooldownPanel.classList.add('hidden');
        elements.btnClearAll.disabled = false;
        elements.btnClearAll.style.opacity = '';
        elements.btnClearAll.style.pointerEvents = '';
        elements.cooldownCounter.textContent = '3';
        elements.cooldownRingProgress.style.strokeDashoffset = '0';
    }

    elements.btnClearAll.addEventListener('click', () => {
        if (!txRef) return;
        if (!clearCooldownTimer) startClearCooldown();
    });

    elements.btnCancelClear.addEventListener('click', () => {
        resetClearCooldown();
    });

    if (elements.btnConfirmClear) {
        elements.btnConfirmClear.addEventListener('click', async () => {
            if (clearCooldownTimer) {
                clearInterval(clearCooldownTimer);
                clearCooldownTimer = null;
            }
            resetClearCooldown();
            await executeDataClear();
        });
    }

    // View Navigation
    elements.btnViewAll.addEventListener('click', showDetailView);
    elements.btnBackHome.addEventListener('click', showHomeView);

    // Type tabs change categories
    elements.typeIncomeRadio.addEventListener('change', updateCategorySelectOptions);
    elements.typeExpenseRadio.addEventListener('change', updateCategorySelectOptions);

    // Form Submission
    elements.transactionForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!txRef) {
            showToast(t('toast.login_required'), 'danger');
            return;
        }

        const type = elements.typeIncomeRadio.checked ? 'income' : 'expense';
        const amount = parseFloat(elements.txAmount.value);
        const method = elements.txMethod.value;
        const category = elements.txCategory.value;
        const date = elements.txDate.value;
        const description = elements.txDescription.value.trim();

        if (isNaN(amount) || amount <= 0) {
            showToast(t('toast.amount_invalid'), 'danger');
            return;
        }

        if (!date) {
            showToast(t('toast.date_required'), 'danger');
            return;
        }

        const txId = 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const currency = document.getElementById('tx-currency')?.value || 'THB';
        const newTx = { id: txId, type, amount, currency, method, category, date, description };

        try {
            await txRef.doc(txId).set(newTx);
            elements.txAmount.value = '';
            elements.txDescription.value = '';
            initFormDateTime();
            closeAddTxModal();
            showToast(t('toast.tx_added'), 'success');
        } catch (error) {
            console.error(error);
            showToast(t('toast.tx_save_error'), 'danger');
        }
    });

    // Chart Tabs
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

    // Ledger Search
    elements.ledgerSearch.addEventListener('input', (e) => {
        state.filters.search = e.target.value;
        renderLedgerList();
    });

    // Ledger Filter Buttons
    elements.filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.filters.type = btn.getAttribute('data-filter');
            renderLedgerList();
        });
    });

    // CSV Exporter (from detail view)
    elements.btnExportCsv.addEventListener('click', exportToCSV);

    // Edit Modal – close
    elements.editModalClose.addEventListener('click', closeEditModal);
    elements.editModalCancel.addEventListener('click', closeEditModal);
    elements.editModalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.editModalOverlay) closeEditModal();
    });

    // Edit Modal – type tabs
    elements.editTypeIncome.addEventListener('change', updateEditCategorySelectOptions);
    elements.editTypeExpense.addEventListener('change', updateEditCategorySelectOptions);

    // Edit Modal – form submission
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
            showToast(t('toast.amount_invalid'), 'danger');
            return;
        }
        if (!date) {
            showToast(t('toast.date_required'), 'danger');
            return;
        }

        const currency = document.getElementById('edit-tx-currency')?.value || 'THB';
        const updatedTx = { id, type, amount, currency, method, category, date, description };

        try {
            await txRef.doc(id).set(updatedTx);
            closeEditModal();
            showToast(t('toast.tx_edited'), 'success');
        } catch (error) {
            console.error(error);
            showToast(t('toast.tx_edit_error'), 'danger');
        }
    });

    // Category Add buttons
    elements.btnAddCategory.addEventListener('click', () => {
        const isIncome = elements.typeIncomeRadio.checked;
        openCategoryModal(isIncome ? 'income' : 'expense');
    });

    elements.btnAddCategoryEdit.addEventListener('click', () => {
        const isIncome = elements.editTypeIncome.checked;
        openCategoryModal(isIncome ? 'income' : 'expense');
    });
}

// -------------------------------------------------------------
// Transaction Mutators
// -------------------------------------------------------------
function deleteTransaction(id) {
    if (confirm(t('confirm.delete_tx'))) {
        if (!txRef) return;
        txRef.doc(id).delete().then(() => {
            showToast(t('toast.tx_deleted'), 'success');
        }).catch(error => {
            console.error(error);
            showToast(t('toast.tx_delete_error'), 'danger');
        });
    }
}

// -------------------------------------------------------------
// Edit Modal
// -------------------------------------------------------------
function openEditModal(id) {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;

    elements.editTxId.value = tx.id;

    if (tx.type === 'income') {
        elements.editTypeIncome.checked = true;
    } else {
        elements.editTypeExpense.checked = true;
    }

    updateEditCategorySelectOptions();
    elements.editTxCategory.value = tx.category;
    refreshCustomDropdown(elements.editTxCategory);

    elements.editTxAmount.value = tx.amount;
    elements.editTxMethod.value = tx.method;
    refreshCustomDropdown(elements.editTxMethod);
    elements.editTxDate.value = tx.date;
    elements.editTxDescription.value = tx.description || '';
    const editTxCurrency = document.getElementById('edit-tx-currency');
    if (editTxCurrency) {
        editTxCurrency.value = tx.currency || 'THB';
    }

    elements.editModalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
}

function closeEditModal() {
    elements.editModalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
    elements.editForm.reset();
}

// -------------------------------------------------------------
// Currency Converter Modal Actions
// -------------------------------------------------------------
function openConverterModal() {
    closeProfileDropdown();
    
    // Auto-close Profile modal if open
    const profileOverlay = document.getElementById('profile-modal-overlay');
    if (profileOverlay) {
        profileOverlay.classList.add('hidden');
    }
    
    elements.converterModalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    updateCurrencyConverter();
    lucide.createIcons();
}

function closeConverterModal() {
    elements.converterModalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
}

// -------------------------------------------------------------
// Toast
// -------------------------------------------------------------
function showToast(message, type = 'success') {
    const toast = elements.toast;
    const icon = toast.querySelector('.toast-icon');
    const msgSpan = toast.querySelector('.toast-message');

    msgSpan.textContent = message;
    toast.className = 'toast';

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
    setTimeout(() => { toast.classList.add('hidden'); }, 3000);
}

// -------------------------------------------------------------
// CSV Export
// -------------------------------------------------------------
function exportToCSV() {
    if (state.transactions.length === 0) {
        showToast(t('toast.csv_no_data'), 'danger');
        return;
    }

    let csvContent = '\uFEFF';
    csvContent += `${t('csv.date')},${t('csv.type')},${t('csv.amount')},${t('csv.method')},${t('csv.category')},${t('csv.description')}\r\n`;

    state.transactions.forEach(tx => {
        const typeLabel = tx.type === 'income' ? t('csv.income') : t('csv.expense');
        const methodLabel = tx.method === 'cash' ? t('csv.cash') : t('csv.bank');
        const catObj = getCategoryObj(tx.type, tx.category);
        const catLabel = catObj ? t(catObj.labelKey) : tx.category;
        const description = (tx.description || '').replace(/"/g, '""');
        const formattedDate = new Date(tx.date).toLocaleString(getDateLocale());
        csvContent += `"${formattedDate}","${typeLabel}",${tx.amount},"${methodLabel}","${catLabel}","${description}"\r\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cash_bank_report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(t('toast.csv_success'), 'success');
}

// -------------------------------------------------------------
// Category Management System
// -------------------------------------------------------------
const AVAILABLE_ICONS = [
    'tag', 'wallet', 'credit-card', 'piggy-bank', 'coins',
    'building-2', 'car', 'plane', 'train', 'bike',
    'coffee', 'utensils', 'shopping-bag', 'shirt', 'scissors',
    'heart', 'baby', 'graduation-cap', 'book', 'music',
    'gamepad-2', 'tv', 'smartphone', 'wifi', 'zap',
    'wrench', 'hammer', 'paintbrush', 'camera', 'flower-2',
    'dog', 'cat', 'leaf', 'sun', 'umbrella',
    'gift', 'sparkles', 'trophy', 'medal', 'star'
];

const AVAILABLE_COLORS = [
    'hsl(0, 80%, 55%)', 'hsl(15, 85%, 55%)', 'hsl(30, 90%, 50%)',
    'hsl(45, 95%, 50%)', 'hsl(55, 90%, 48%)', 'hsl(80, 70%, 45%)',
    'hsl(120, 60%, 42%)', 'hsl(150, 80%, 38%)', 'hsl(175, 75%, 40%)',
    'hsl(195, 85%, 45%)', 'hsl(210, 90%, 50%)', 'hsl(230, 80%, 55%)',
    'hsl(260, 70%, 55%)', 'hsl(280, 75%, 55%)', 'hsl(310, 70%, 50%)',
    'hsl(330, 80%, 55%)', 'hsl(350, 85%, 55%)', 'hsl(0, 0%, 50%)',
    'hsl(200, 15%, 40%)', 'hsl(25, 75%, 45%)'
];

let categoryModalState = {
    type: 'income',
    selectedIcon: 'tag',
    selectedColor: 'hsl(210, 90%, 50%)'
};

function initCategoryModal() {
    const iconGrid = elements.iconPickerGrid;
    iconGrid.innerHTML = '';
    AVAILABLE_ICONS.forEach(iconName => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'icon-pick-btn' + (iconName === 'tag' ? ' active' : '');
        btn.setAttribute('data-icon', iconName);
        btn.innerHTML = `<i data-lucide="${iconName}"></i>`;
        btn.addEventListener('click', () => selectCategoryIcon(iconName));
        iconGrid.appendChild(btn);
    });

    const colorGrid = elements.colorPickerGrid;
    colorGrid.innerHTML = '';
    AVAILABLE_COLORS.forEach((color, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'color-pick-btn' + (idx === 10 ? ' active' : '');
        btn.style.background = color;
        btn.setAttribute('data-color', color);
        btn.addEventListener('click', () => selectCategoryColor(color));
        colorGrid.appendChild(btn);
    });

    elements.categoryModalClose.addEventListener('click', closeCategoryModal);
    elements.categoryModalCancel.addEventListener('click', closeCategoryModal);
    elements.categoryModalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.categoryModalOverlay) closeCategoryModal();
    });

    elements.categoryForm.addEventListener('submit', handleCategoryFormSubmit);
    elements.catName.addEventListener('input', updateCategoryPreview);
    lucide.createIcons();
}

function selectCategoryIcon(iconName) {
    categoryModalState.selectedIcon = iconName;
    elements.iconPickerGrid.querySelectorAll('.icon-pick-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-icon') === iconName);
    });
    updateCategoryPreview();
}

function selectCategoryColor(color) {
    categoryModalState.selectedColor = color;
    elements.colorPickerGrid.querySelectorAll('.color-pick-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-color') === color);
    });
    updateCategoryPreview();
}

function updateCategoryPreview() {
    const name = elements.catName.value.trim() || t('category.default_name');
    const color = categoryModalState.selectedColor;
    const icon = categoryModalState.selectedIcon;

    elements.catPreviewName.textContent = name;
    elements.catPreviewIcon.style.backgroundColor = color + '18';
    elements.catPreviewIcon.style.border = `1px solid ${color}30`;
    elements.catPreviewIcon.innerHTML = `<i data-lucide="${icon}" style="color: ${color}"></i>`;
    lucide.createIcons();
}

function openCategoryModal(type) {
    categoryModalState.type = type;
    categoryModalState.selectedIcon = 'tag';
    categoryModalState.selectedColor = AVAILABLE_COLORS[10];

    elements.categoryForm.reset();

    const indicator = elements.catTypeIndicator;
    indicator.className = 'cat-type-indicator';
    if (type === 'income') {
        indicator.classList.add('type-income');
        indicator.querySelector('.cat-type-icon').setAttribute('data-lucide', 'arrow-down-left');
        elements.catTypeLabel.textContent = t('category.for_income');
    } else {
        indicator.classList.add('type-expense');
        indicator.querySelector('.cat-type-icon').setAttribute('data-lucide', 'arrow-up-right');
        elements.catTypeLabel.textContent = t('category.for_expense');
    }

    elements.iconPickerGrid.querySelectorAll('.icon-pick-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-icon') === 'tag');
    });

    elements.colorPickerGrid.querySelectorAll('.color-pick-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-color') === AVAILABLE_COLORS[10]);
    });

    updateCategoryPreview();

    elements.categoryModalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
    setTimeout(() => elements.catName.focus(), 100);
}

function closeCategoryModal() {
    elements.categoryModalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
    elements.categoryForm.reset();
}

async function handleCategoryFormSubmit(e) {
    e.preventDefault();

    const name = elements.catName.value.trim();
    if (!name) {
        showToast(t('toast.cat_name_required'), 'danger');
        return;
    }

    const type = categoryModalState.type;
    const icon = categoryModalState.selectedIcon;
    const color = categoryModalState.selectedColor;
    const id = 'custom-' + name.toLowerCase().replace(/[^a-z0-9฀-๿]/gi, '-').replace(/-+/g, '-').substring(0, 30) + '-' + Date.now().toString(36);
    const labelKey = `cat.custom.${id}`;

    if (TRANSLATIONS.th) TRANSLATIONS.th[labelKey] = name;
    if (TRANSLATIONS.en) TRANSLATIONS.en[labelKey] = name;

    const newCat = {
        id, labelKey, icon, color, custom: true, customName: name
    };

    if (type === 'income') {
        CATEGORIES.income.push(newCat);
    } else {
        CATEGORIES.expense.push(newCat);
    }

    if (state.currentUser) {
        try {
            await db.collection('users').doc(state.currentUser.uid)
                .collection('customCategories').doc(id).set({
                    id, type, labelKey, icon, color, custom: true, customName: name
                });
        } catch (error) {
            console.error('Error saving custom category:', error);
            showToast(t('toast.cat_save_error'), 'danger');
        }
    }

    updateCategorySelectOptions();
    if (elements.editModalOverlay && !elements.editModalOverlay.classList.contains('hidden')) {
        updateEditCategorySelectOptions();
    }

    elements.txCategory.value = id;
    refreshCustomDropdown(elements.txCategory);

    closeCategoryModal();
    showToast(t('toast.cat_added'), 'success');
}

async function loadCustomCategories(user) {
    try {
        const snapshot = await db.collection('users').doc(user.uid)
            .collection('customCategories').get();

        snapshot.docs.forEach(doc => {
            const catData = doc.data();
            if (TRANSLATIONS.th) TRANSLATIONS.th[catData.labelKey] = catData.customName;
            if (TRANSLATIONS.en) TRANSLATIONS.en[catData.labelKey] = catData.customName;

            const targetList = catData.type === 'income' ? CATEGORIES.income : CATEGORIES.expense;
            const exists = targetList.some(c => c.id === catData.id);
            if (!exists) {
                targetList.push({
                    id: catData.id,
                    labelKey: catData.labelKey,
                    icon: catData.icon,
                    color: catData.color,
                    custom: true,
                    customName: catData.customName
                });
            }
        });

        updateCategorySelectOptions();
    } catch (error) {
        console.error('Error loading custom categories:', error);
    }
}

// -------------------------------------------------------------
// Custom Dropdown System
// -------------------------------------------------------------
const customDropdownMap = new Map();

const METHOD_DISPLAY = {
    cash: { icon: 'banknote', color: 'hsl(150, 80%, 42%)' },
    bank: { icon: 'landmark', color: 'hsl(205, 90%, 50%)' }
};

function initCustomDropdowns() {
    initMethodSelectData(elements.txMethod);
    initMethodSelectData(elements.editTxMethod);

    createCustomDropdown(elements.txMethod);
    createCustomDropdown(elements.txCategory);
    createCustomDropdown(elements.editTxMethod);
    createCustomDropdown(elements.editTxCategory);

    // Initialize currency custom select dropdowns
    const currencySelects = ['currency-select', 'tx-currency', 'edit-tx-currency', 'conv-from', 'conv-to'];
    currencySelects.forEach(id => {
        const el = document.getElementById(id);
        if (el) createCustomDropdown(el);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select')) {
            closeAllDropdowns();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllDropdowns();
    });
}

function initMethodSelectData(selectEl) {
    if (!selectEl) return;
    [...selectEl.options].forEach(opt => {
        const meta = METHOD_DISPLAY[opt.value];
        if (meta) {
            opt.setAttribute('data-icon', meta.icon);
            opt.setAttribute('data-color', meta.color);
        }
    });
}

function createCustomDropdown(selectEl) {
    if (!selectEl || customDropdownMap.has(selectEl)) return;

    selectEl.style.cssText = 'position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important;';

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';
    selectEl.insertAdjacentElement('afterend', wrapper);

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'cs-trigger';
    trigger.innerHTML = `
        <span class="cs-icon"></span>
        <span class="cs-label"></span>
        <svg class="cs-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
    `;
    wrapper.appendChild(trigger);

    const panel = document.createElement('div');
    panel.className = 'cs-panel';
    wrapper.appendChild(panel);

    customDropdownMap.set(selectEl, { wrapper, trigger, panel });

    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const wasOpen = wrapper.classList.contains('open');
        closeAllDropdowns();
        if (!wasOpen) wrapper.classList.add('open');
    });

    refreshCustomDropdown(selectEl);
}

function refreshCustomDropdown(selectEl) {
    if (!selectEl) return;
    const data = customDropdownMap.get(selectEl);
    if (!data) return;

    const { wrapper, trigger, panel } = data;
    const options = [...selectEl.options];
    const selectedVal = selectEl.value;

    panel.innerHTML = '';
    options.forEach(opt => {
        const item = document.createElement('div');
        const isActive = opt.value === selectedVal;
        item.className = 'cs-option' + (isActive ? ' active' : '');

        const iconName = opt.getAttribute('data-icon');
        const color = opt.getAttribute('data-color') || '';

        const fullText = opt.textContent;
        const spaceIdx = fullText.indexOf(' ');
        let emoji = '';
        let label = fullText;
        if (spaceIdx > 0 && spaceIdx <= 3) {
            emoji = fullText.substring(0, spaceIdx);
            label = fullText.substring(spaceIdx + 1);
        }

        let iconHTML;
        if (iconName) {
            iconHTML = `<span class="cs-opt-icon" style="${color ? 'color:' + color : ''}"><i data-lucide="${iconName}"></i></span>`;
        } else {
            iconHTML = `<span class="cs-opt-icon">${emoji}</span>`;
        }

        item.innerHTML = `${iconHTML}<span class="cs-opt-label">${label}</span>`;

        if (isActive && color) {
            item.style.backgroundColor = hslToHsla(color, 0.08);
            item.querySelector('.cs-opt-label').style.color = color;
            item.querySelector('.cs-opt-label').style.fontWeight = '500';
        }

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            selectEl.value = opt.value;
            selectEl.dispatchEvent(new Event('change', { bubbles: true }));
            wrapper.classList.remove('open');
            refreshCustomDropdown(selectEl);
        });

        panel.appendChild(item);
    });

    const selectedOpt = options.find(o => o.value === selectedVal) || options[0];
    if (selectedOpt) {
        const iconName = selectedOpt.getAttribute('data-icon');
        const color = selectedOpt.getAttribute('data-color') || '';
        const fullText = selectedOpt.textContent;
        const spaceIdx = fullText.indexOf(' ');
        let emoji = '';
        let label = fullText;
        if (spaceIdx > 0 && spaceIdx <= 3) {
            emoji = fullText.substring(0, spaceIdx);
            label = fullText.substring(spaceIdx + 1);
        }

        const triggerIcon = trigger.querySelector('.cs-icon');
        if (iconName) {
            triggerIcon.innerHTML = `<i data-lucide="${iconName}" style="${color ? 'color:' + color : ''}"></i>`;
        } else {
            triggerIcon.textContent = emoji;
        }
        trigger.querySelector('.cs-label').textContent = label;
    }

    lucide.createIcons();
}

function closeAllDropdowns() {
    document.querySelectorAll('.custom-select.open').forEach(d => d.classList.remove('open'));
}

function hslToHsla(hsl, alpha) {
    if (!hsl) return '';
    return hsl.replace('hsl(', 'hsla(').replace(')', `, ${alpha})`);
}
