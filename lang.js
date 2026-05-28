/**
 * Internationalization (i18n) Module
 * Cash & Bank Flow Tracker
 * 
 * Supports: Thai (th) and English (en)
 * Uses data-i18n attributes on HTML elements and t() function for JS strings.
 */

// ---------------------------------------------------------------
// Current Language & Currency State
// ---------------------------------------------------------------
let currentLang = localStorage.getItem('app-language') || 'th';
let currentCurrency = localStorage.getItem('app-currency') || 'THB';
const CURRENCIES = {
    THB: { symbol: '฿', nameTh: 'บาท (THB)', nameEn: 'Baht (THB)' },
    USD: { symbol: '$', nameTh: 'ดอลลาร์ (USD)', nameEn: 'Dollar (USD)' },
    EUR: { symbol: '€', nameTh: 'ยูโร (EUR)', nameEn: 'Euro (EUR)' },
    JPY: { symbol: '¥', nameTh: 'เยน (JPY)', nameEn: 'Yen (JPY)' },
    GBP: { symbol: '£', nameTh: 'ปอนด์ (GBP)', nameEn: 'Pound (GBP)' },
    CNY: { symbol: '¥', nameTh: 'หยวน (CNY)', nameEn: 'Yuan (CNY)' },
    KRW: { symbol: '₩', nameTh: 'วอน (KRW)', nameEn: 'Won (KRW)' }
};

function getCurrencySymbol() {
    return CURRENCIES[currentCurrency]?.symbol || '฿';
}

// ---------------------------------------------------------------
// Translation Dictionary
// ---------------------------------------------------------------
const TRANSLATIONS = {
    th: {
        // ========== Page Meta ==========
        'meta.title': 'Cash & Bank Flow Tracker | เครื่องมือบันทึกรายรับ-รายจ่าย',

        // ========== Loading ==========
        'loading.checking': 'กำลังตรวจสอบสถานะผู้ใช้...',

        // ========== Auth Screen ==========
        'auth.brand_title': 'Cash & Bank Flow',
        'auth.brand_desc': 'จัดการการเงินของคุณอย่างมืออาชีพ<br>บันทึกและติดตามทุกรายรับ-รายจ่าย',
        'auth.unified_title': 'เข้าสู่ระบบหรือสร้างบัญชี',
        'auth.email_label': 'อีเมล',
        'auth.password_label': 'รหัสผ่าน',
        'auth.name_label': 'ชื่อ',
        'auth.confirm_password_label': 'ยืนยันรหัสผ่าน',
        'auth.divider_or': 'หรือใช้งานด้วย',
        'auth.terms': 'ในการเข้าสู่ระบบ คุณยอมรับ<a href="#">ข้อตกลงในการให้บริการ</a>และ<a href="#">นโยบายความเป็นส่วนตัว</a>ของเรา',
        'auth.tab_login': 'เข้าสู่ระบบ',
        'auth.tab_register': 'สมัครบัญชีใหม่',
        'auth.google_login': 'เข้าสู่ระบบด้วย Google',
        'auth.divider': 'หรือด้วย',
        'auth.email_placeholder': 'อีเมล',
        'auth.password_placeholder': 'รหัสผ่าน',
        'auth.login_btn': 'เข้าสู่ระบบ',
        'auth.register_name_placeholder': 'ชื่อที่แสดง',
        'auth.register_email_placeholder': 'อีเมล',
        'auth.register_password_placeholder': 'รหัสผ่าน (อย่างน้อย 6 ตัว)',
        'auth.register_confirm_placeholder': 'ยืนยันรหัสผ่าน',
        'auth.register_btn': 'สมัครบัญชีใหม่',

        // Auth errors
        'auth.error.fill_email_password': 'กรุณากรอกอีเมลและรหัสผ่าน',
        'auth.error.password_mismatch': 'รหัสผ่านไม่ตรงกัน กรุณากรอกใหม่',
        'auth.error.password_too_short': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
        'auth.error.email_in_use': 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น',
        'auth.error.invalid_email': 'รูปแบบอีเมลไม่ถูกต้อง',
        'auth.error.user_not_found': 'ไม่พบบัญชีผู้ใช้นี้ กรุณาสมัครสมาชิกก่อน',
        'auth.error.wrong_password': 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง',
        'auth.error.invalid_credential': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        'auth.error.weak_password': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
        'auth.error.popup_closed': 'การเข้าสู่ระบบถูกยกเลิก',
        'auth.error.network': 'ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้ กรุณาลองใหม่',
        'auth.error.too_many': 'มีการเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่',
        'auth.error.cancelled_popup': 'กรุณาลองกดเข้าสู่ระบบอีกครั้ง',
        'auth.error.generic': 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',

        // ========== Header ==========
        'header.subtitle': 'ระบบบันทึกรายรับ-รายจ่ายและเงินคงเหลือแยกบัญชี',
        'header.profile_label': 'จัดการโปรไฟล์',
        'header.user_default': 'ผู้ใช้',
        'header.mock_data': 'ข้อมูลทดลอง',
        'header.clear_all': 'ล้างข้อมูล',
        'header.logout': 'ออกจากระบบ',
        'dropdown.profile': 'จัดการโปรไฟล์',
        'dropdown.manage_data': 'จัดการข้อมูล',
        'dropdown.theme': 'โหมดมืด / สว่าง',
        'dropdown.lang': 'ภาษา (Language)',
        'dropdown.currency': 'สกุลเงิน (Currency)',

        // ========== Dashboard Summary ==========
        'dashboard.total_balance': 'ยอดเงินคงเหลือทั้งหมด',
        'topbar.add_transaction': 'บันทึกรายการ',
        'home.recent_title': 'รายการล่าสุด',
        'home.view_all': 'ดูทั้งหมด',
        'home.empty_desc': 'กดปุ่ม "บันทึกรายการ" ด้านบนเพื่อเริ่มบันทึกรายรับ-รายจ่าย',
        'detail.title': 'รายละเอียดข้อมูล',
        'detail.back': 'กลับหน้าหลัก',
        'dashboard.all_accounts': 'รวมทุกบัญชี',
        'dashboard.total_income': 'รายรับรวม',
        'dashboard.total_expense': 'รายจ่ายรวม',
        'dashboard.cash_balance': 'เงินสดคงเหลือ',
        'dashboard.bank_balance': 'เงินในธนาคารคงเหลือ',

        // ========== Transaction Form ==========
        'form.title': 'บันทึกรายการใหม่',
        'form.income': 'รายรับ (Income)',
        'form.expense': 'รายจ่าย (Expense)',
        'form.amount': 'จำนวนเงิน ({{currency}})',
        'form.method': 'ช่องทางการเงิน',
        'form.method_cash': '💵 เงินสด (Cash)',
        'form.method_bank': '🏦 บัญชีธนาคาร (Bank)',
        'form.category': 'หมวดหมู่',
        'form.date': 'วันเวลาที่ทำรายการ',
        'form.description': 'บันทึกเพิ่มเติม',
        'form.description_placeholder': 'รายละเอียด หรือคำอธิบายเพิ่มเติม...',
        'form.submit': 'บันทึกรายการ',
        'form.add_category': 'เพิ่มหมวดหมู่ใหม่',

        // ========== Charts ==========
        'chart.title': 'วิเคราะห์สัดส่วนและการเงิน',
        'chart.tab_flow': 'กระแสเงินสด',
        'chart.tab_category': 'แยกตามหมวดหมู่',
        'chart.cash_label': 'เงินสด (Cash)',
        'chart.bank_label': 'เงินในธนาคาร (Bank)',
        'chart.no_expense_data': 'ยังไม่มีข้อมูลค่าใช้จ่าย',
        'chart.others': 'อื่น ๆ',

        // ========== Ledger ==========
        'ledger.title': 'ประวัติรายการเดินบัญชี',
        'ledger.export_csv': 'ส่งออก CSV',
        'ledger.search_placeholder': 'ค้นหาบันทึก หรือจำนวนเงิน...',
        'ledger.filter_all': 'ทั้งหมด',
        'ledger.filter_income': 'รายรับ',
        'ledger.filter_expense': 'รายจ่าย',
        'ledger.filter_cash': 'เงินสด',
        'ledger.filter_bank': 'ธนาคาร',
        'ledger.empty_title': 'ไม่พบรายการธุรกรรม',
        'ledger.empty_desc': 'เพิ่มรายรับหรือรายจ่ายใหม่',
        'ledger.method_cash': 'เงินสด',
        'ledger.method_bank': 'ธนาคาร',
        'ledger.method_cash_title': 'เงินสด',
        'ledger.method_bank_title': 'บัญชีธนาคาร',
        'ledger.edit_title': 'แก้ไขรายการ',
        'ledger.delete_title': 'ลบรายการนี้',
        'ledger.category_default': 'หมวดหมู่ทั่วไป',

        // ========== Edit Modal ==========
        'edit.title': 'แก้ไขรายการธุรกรรม',
        'edit.close': 'ปิด',
        'edit.cancel': 'ยกเลิก',
        'edit.save': 'บันทึกการแก้ไข',

        // ========== Profile Modal ==========
        'profile.title': 'จัดการโปรไฟล์และบัญชี',
        'profile.close': 'ปิด',
        'profile.avatar_help': 'คลิกที่รูปเพื่ออัปโหลดรูปภาพ (ระบบบีบอัดและย่อขนาดภาพให้อัตโนมัติ)',
        'profile.reset_avatar': 'กลับไปใช้รูปภาพเริ่มต้น',
        'profile.name_label': 'ชื่อ - นามสกุล',
        'profile.name_placeholder': 'ชื่อของคุณ',
        'profile.email_label': 'อีเมลผู้ใช้งาน',
        'profile.cancel': 'ยกเลิก',
        'profile.save': 'บันทึกโปรไฟล์',

        // ========== Data Management ==========
        'data_manage.title': 'จัดการข้อมูล',
        'data_manage.desc': 'เลือกการดำเนินการกับข้อมูลของคุณ',
        'data_manage.export_title': 'ส่งออกข้อมูล (CSV)',
        'data_manage.export_desc': 'ดาวน์โหลดข้อมูลธุรกรรมทั้งหมดเป็นไฟล์ CSV',
        'data_manage.clear_title': 'ลบข้อมูลทั้งหมด',
        'data_manage.clear_desc': 'ลบธุรกรรมทั้งหมดอย่างถาวร ไม่สามารถกู้คืนได้',
        'data_manage.cooldown_warning': 'กำลังจะลบข้อมูลทั้งหมด...',
        'data_manage.cooldown_cancel': 'ยกเลิก',

        // ========== Danger Zone ==========
        'danger.title': 'คำเตือน',
        'danger.description': 'การลบบัญชีผู้ใช้จะเป็นการลบประวัติและข้อมูลธุรกรรมทั้งหมดของคุณอย่างถาวร โดยไม่สามารถกู้คืนข้อมูลกลับมาได้อีก',
        'danger.delete_btn': 'ลบบัญชีผู้ใช้งานถาวร',

        // ========== Delete Confirmation Modal ==========
        'delete.title': 'ยืนยันการลบบัญชีผู้ใช้',
        'delete.warning': '<strong>คำเตือน:</strong> การกระทำนี้ไม่สามารถย้อนกลับได้ โปรดทำความเข้าใจว่าข้อมูลทั้งหมดจะถูกลบถาวร',
        'delete.instruction': 'กรุณาพิมพ์คำว่า <strong class="user-select-all">DELETE</strong> และพิมพ์ **อีเมลปัจจุบันของคุณ** ด้านล่างเพื่อยืนยัน',
        'delete.confirm_label': 'พิมพ์คำยืนยัน',
        'delete.confirm_placeholder': 'พิมพ์คำว่า DELETE ที่นี่',
        'delete.email_label': 'ป้อนอีเมลของคุณอีกครั้ง',
        'delete.email_placeholder': 'ป้อนอีเมลเพื่อยืนยัน',
        'delete.cancel': 'ยกเลิก',
        'delete.waiting': 'กรุณารอยืนยัน...',
        'delete.confirm_btn': 'ยืนยันการลบบัญชี',

        // ========== Footer ==========
        'footer.text': '© 2026 Cash & Bank Flow Tracker. พัฒนาขึ้นด้วยเทคโนโลยีระดับพรีเมียมและคำนึงถึงความเป็นส่วนตัวของข้อมูลผู้ใช้งาน 100%',

        // ========== Toast Messages ==========
        'toast.login_required': 'กรุณาเข้าสู่ระบบก่อน',
        'toast.load_error': 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
        'toast.mock_loaded': 'โหลดข้อมูลทดลองเสร็จสิ้น',
        'toast.mock_error': 'ไม่สามารถโหลดข้อมูลตัวอย่างได้',
        'toast.clear_success': 'ล้างข้อมูลบัญชีเรียบร้อย',
        'toast.clear_error': 'ไม่สามารถลบข้อมูลได้',
        'toast.amount_invalid': 'กรุณากรอกจำนวนเงินให้ถูกต้อง',
        'toast.date_required': 'กรุณาเลือกวันเวลาทำรายการ',
        'toast.tx_added': 'เพิ่มรายการธุรกรรมเรียบร้อย!',
        'toast.tx_save_error': 'ไม่สามารถบันทึกข้อมูลได้',
        'toast.tx_edited': 'แก้ไขรายการธุรกรรมเรียบร้อยแล้ว!',
        'toast.tx_edit_error': 'ไม่สามารถแก้ไขข้อมูลได้',
        'toast.tx_deleted': 'ลบรายการธุรกรรมเรียบร้อยแล้ว',
        'toast.tx_delete_error': 'ไม่สามารถลบข้อมูลได้',
        'toast.csv_success': 'ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว',
        'toast.csv_no_data': 'ไม่มีรายการธุรกรรมสำหรับส่งออกข้อมูล',
        'toast.profile_updated': 'อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว',
        'toast.profile_error': 'ไม่สามารถอัปเดตโปรไฟล์ได้ กรุณาลองใหม่',
        'toast.name_required': 'กรุณากรอกชื่อ-นามสกุล',
        'toast.avatar_reset': 'สลับกลับไปใช้รูปภาพเริ่มต้นเรียบร้อย (กรุณากดบันทึกเพื่อบันทึกการเปลี่ยนแปลง)',
        'toast.account_deleted': 'ลบบัญชีผู้ใช้และล้างข้อมูลธุรกรรมสำเร็จแล้ว',
        'toast.image_process_error': 'เกิดข้อผิดพลาดในการประมวลผลรูปภาพ',
        'toast.image_select_error': 'กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง',
        'toast.image_load_error': 'เกิดข้อผิดพลาดในการโหลดรูปภาพ',
        'toast.image_read_error': 'เกิดข้อผิดพลาดในการอ่านไฟล์',

        // ========== Confirm Dialogs ==========
        'confirm.load_mock': 'คำเตือน: คุณต้องการโหลดข้อมูลทดลองใช่หรือไม่?\n\nระบบจะเพิ่มข้อมูลตัวอย่างเข้าไปในรายการปัจจุบัน',
        'confirm.clear_all': 'คุณต้องการลบข้อมูลประวัติการทำรายการทั้งหมดใช่หรือไม่? ข้อมูลจะไม่สามารถกู้คืนได้',
        'confirm.delete_tx': 'คุณแน่ใจว่าต้องการลบรายการนี้ใช่ไหม?',

        // ========== Delete Errors ==========
        'delete.error.invalid': 'ข้อมูลยืนยันไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
        'delete.error.relogin': '<div style="line-height: 1.5; padding: 6px;"><strong>⚠️ เกิดข้อผิดพลาดด้านความปลอดภัยสูงสุด:</strong><br>เพื่อความปลอดภัยในการป้องกันบัญชีและข้อมูลของคุณ กรุณา <strong>"ออกจากระบบ"</strong> แล้วทำการ <strong>"เข้าสู่ระบบใหม่อีกครั้ง"</strong> จากนั้นจึงจะสามารถเข้ามาดำเนินการลบบัญชีนี้ได้ตามปกติครับ</div>',
        'delete.error.generic': 'ไม่สามารถลบบัญชีได้เนื่องจากข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง',

        // ========== Categories: Income ==========
        'cat.salary': 'เงินเดือน / ค่าจ้าง',
        'cat.business': 'รายได้ธุรกิจ',
        'cat.investment': 'การลงทุน / ปันผล',
        'cat.gift': 'ของขวัญ / โบนัส',
        'cat.others_income': 'รายรับอื่น ๆ',

        // ========== Categories: Expense ==========
        'cat.food': 'อาหาร & เครื่องดื่ม',
        'cat.shopping': 'ช้อปปิ้ง',
        'cat.travel': 'เดินทาง & พาหนะ',
        'cat.bills': 'บิล & ค่าใช้จ่ายคงที่',
        'cat.housing': 'ที่อยู่อาศัย',
        'cat.health': 'สุขภาพ & รักษาพยาบาล',
        'cat.entertainment': 'ท่องเที่ยว & บันเทิง',
        'cat.others_expense': 'รายจ่ายอื่น ๆ',

        // ========== Category Management Modal ==========
        'category.modal_title': 'เพิ่มหมวดหมู่ใหม่',
        'category.for_income': 'สำหรับรายรับ',
        'category.for_expense': 'สำหรับรายจ่าย',
        'category.name_label': 'ชื่อหมวดหมู่',
        'category.name_placeholder': 'เช่น ค่าเช่า, เงินออม...',
        'category.icon_label': 'เลือกไอคอน',
        'category.color_label': 'เลือกสี',
        'category.preview_label': 'ตัวอย่าง',
        'category.cancel': 'ยกเลิก',
        'category.save': 'เพิ่มหมวดหมู่',
        'category.default_name': 'หมวดหมู่ใหม่',
        'toast.cat_added': 'เพิ่มหมวดหมู่ใหม่เรียบร้อย!',
        'toast.cat_name_required': 'กรุณากรอกชื่อหมวดหมู่',
        'toast.cat_exists': 'หมวดหมู่นี้มีอยู่แล้ว',
        'toast.cat_save_error': 'ไม่สามารถบันทึกหมวดหมู่ได้',

        // ========== CSV Headers ==========
        'csv.date': 'วันเวลา',
        'csv.type': 'ประเภท',
        'csv.amount': 'จำนวนเงิน',
        'csv.method': 'ช่องทาง',
        'csv.category': 'หมวดหมู่',
        'csv.description': 'คำอธิบายเพิ่มเติม',
        'csv.income': 'รายรับ',
        'csv.expense': 'รายจ่าย',
        'csv.cash': 'เงินสด',
        'csv.bank': 'ธนาคาร',

        // ========== Mock Data Descriptions ==========
        'mock.salary': 'เงินเดือนประจำเดือน พฤษภาคม',
        'mock.bills': 'ค่าบริการอินเทอร์เน็ตและไฟฟ้ารอบเดือน',
        'mock.gift': 'รางวัลจากคุณแม่',
        'mock.food': 'มื้อเช้าและกาแฟสตาร์บัคส์',
        'mock.shopping': 'ซื้อรองเท้าผ้าใบสีขาวคู่ใหม่',

        // ========== Language Toggle ==========
        'lang.switch': 'EN',
    },

    en: {
        // ========== Page Meta ==========
        'meta.title': 'Cash & Bank Flow Tracker | Income & Expense Manager',

        // ========== Loading ==========
        'loading.checking': 'Checking user status...',

        // ========== Auth Screen ==========
        'auth.brand_title': 'Cash & Bank Flow',
        'auth.brand_desc': 'Manage your finances like a pro<br>Track every income & expense',
        'auth.unified_title': 'Log in or create account',
        'auth.email_label': 'Email',
        'auth.password_label': 'Password',
        'auth.name_label': 'Name',
        'auth.confirm_password_label': 'Confirm Password',
        'auth.divider_or': 'OR WITH',
        'auth.terms': 'By signing in, you agree to our <a href="#">terms of service</a> and <a href="#">privacy policy</a>.',
        'auth.tab_login': 'Login',
        'auth.tab_register': 'Create Account',
        'auth.google_login': 'Sign in with Google',
        'auth.divider': 'OR WITH',
        'auth.email_placeholder': 'Email',
        'auth.password_placeholder': 'Password',
        'auth.login_btn': 'Login',
        'auth.register_name_placeholder': 'Display Name',
        'auth.register_email_placeholder': 'Email',
        'auth.register_password_placeholder': 'Password (min 6 characters)',
        'auth.register_confirm_placeholder': 'Confirm Password',
        'auth.register_btn': 'Create Account',

        // Auth errors
        'auth.error.fill_email_password': 'Please enter email and password',
        'auth.error.password_mismatch': 'Passwords do not match. Please try again',
        'auth.error.password_too_short': 'Password must be at least 6 characters',
        'auth.error.email_in_use': 'This email is already in use. Please use another',
        'auth.error.invalid_email': 'Invalid email format',
        'auth.error.user_not_found': 'Account not found. Please sign up first',
        'auth.error.wrong_password': 'Incorrect password. Please try again',
        'auth.error.invalid_credential': 'Invalid email or password',
        'auth.error.weak_password': 'Password must be at least 6 characters',
        'auth.error.popup_closed': 'Login was cancelled',
        'auth.error.network': 'Cannot connect to the internet. Please try again',
        'auth.error.too_many': 'Too many login attempts. Please wait a moment',
        'auth.error.cancelled_popup': 'Please try logging in again',
        'auth.error.generic': 'An error occurred. Please try again',

        // ========== Header ==========
        'header.subtitle': 'Track income, expenses & account balances',
        'header.profile_label': 'Manage Profile',
        'header.user_default': 'User',
        'header.mock_data': 'Demo Data',
        'header.clear_all': 'Clear All',
        'header.logout': 'Logout',
        'dropdown.profile': 'Manage Profile',
        'dropdown.manage_data': 'Manage Data',
        'dropdown.theme': 'Dark / Light Mode',
        'dropdown.lang': 'Language (ภาษา)',
        'dropdown.currency': 'Currency (สกุลเงิน)',

        // ========== Dashboard Summary ==========
        'dashboard.total_balance': 'Total Balance',
        'topbar.add_transaction': 'Add Transaction',
        'home.recent_title': 'Recent Transactions',
        'home.view_all': 'See All',
        'home.empty_desc': 'Click "Add Transaction" above to start tracking your flow',
        'detail.title': 'Transaction Details',
        'detail.back': 'Back to Home',
        'dashboard.all_accounts': 'All Accounts',
        'dashboard.total_income': 'Total Income',
        'dashboard.total_expense': 'Total Expense',
        'dashboard.cash_balance': 'Cash Balance',
        'dashboard.bank_balance': 'Bank Balance',

        // ========== Transaction Form ==========
        'form.title': 'New Transaction',
        'form.income': 'Income',
        'form.expense': 'Expense',
        'form.amount': 'Amount ({{currency}})',
        'form.method': 'Payment Method',
        'form.method_cash': '💵 Cash',
        'form.method_bank': '🏦 Bank Account',
        'form.category': 'Category',
        'form.date': 'Date & Time',
        'form.description': 'Notes',
        'form.description_placeholder': 'Additional details or notes...',
        'form.submit': 'Save Transaction',
        'form.add_category': 'Add new category',

        // ========== Charts ==========
        'chart.title': 'Financial Analysis',
        'chart.tab_flow': 'Cash Flow',
        'chart.tab_category': 'By Category',
        'chart.cash_label': 'Cash',
        'chart.bank_label': 'Bank Account',
        'chart.no_expense_data': 'No expense data yet',
        'chart.others': 'Others',

        // ========== Ledger ==========
        'ledger.title': 'Transaction History',
        'ledger.export_csv': 'Export CSV',
        'ledger.search_placeholder': 'Search transactions or amounts...',
        'ledger.filter_all': 'All',
        'ledger.filter_income': 'Income',
        'ledger.filter_expense': 'Expense',
        'ledger.filter_cash': 'Cash',
        'ledger.filter_bank': 'Bank',
        'ledger.empty_title': 'No transactions found',
        'ledger.empty_desc': 'Start by adding a new income or expense, or load demo data to see how it works',
        'ledger.method_cash': 'Cash',
        'ledger.method_bank': 'Bank',
        'ledger.method_cash_title': 'Cash',
        'ledger.method_bank_title': 'Bank Account',
        'ledger.edit_title': 'Edit',
        'ledger.delete_title': 'Delete',
        'ledger.category_default': 'General',

        // ========== Edit Modal ==========
        'edit.title': 'Edit Transaction',
        'edit.close': 'Close',
        'edit.cancel': 'Cancel',
        'edit.save': 'Save Changes',

        // ========== Profile Modal ==========
        'profile.title': 'Profile & Account Settings',
        'profile.close': 'Close',
        'profile.avatar_help': 'Click the photo to upload (images are auto-compressed & resized)',
        'profile.reset_avatar': 'Reset to Default Photo',
        'profile.name_label': 'Full Name',
        'profile.name_placeholder': 'Your name',
        'profile.email_label': 'Email Address',
        'profile.cancel': 'Cancel',
        'profile.save': 'Save Profile',

        // ========== Data Management ==========
        'data_manage.title': 'Manage Data',
        'data_manage.desc': 'Select an action for your data',
        'data_manage.export_title': 'Export Data (CSV)',
        'data_manage.export_desc': 'Download all transactions as a CSV file',
        'data_manage.clear_title': 'Clear All Data',
        'data_manage.clear_desc': 'Permanently delete all transactions. Cannot be undone.',
        'data_manage.cooldown_warning': 'Clearing all data in...',
        'data_manage.cooldown_cancel': 'Cancel',

        // ========== Danger Zone ==========
        'danger.title': 'Warning',
        'danger.description': 'Deleting your account will permanently remove all your financial history and transaction data. This action cannot be undone.',
        'danger.delete_btn': 'Delete Account Permanently',

        // ========== Delete Confirmation Modal ==========
        'delete.title': 'Confirm Account Deletion',
        'delete.warning': '<strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted.',
        'delete.instruction': 'Please type <strong class="user-select-all">DELETE</strong> and enter your **current email** below to confirm.',
        'delete.confirm_label': 'Type confirmation word',
        'delete.confirm_placeholder': 'Type DELETE here',
        'delete.email_label': 'Enter your email again',
        'delete.email_placeholder': 'Enter email to confirm',
        'delete.cancel': 'Cancel',
        'delete.waiting': 'Please wait...',
        'delete.confirm_btn': 'Confirm Delete Account',

        // ========== Footer ==========
        'footer.text': '© 2026 Cash & Bank Flow Tracker. Built with premium technology with 100% user data privacy in mind.',

        // ========== Toast Messages ==========
        'toast.login_required': 'Please login first',
        'toast.load_error': 'Error loading data',
        'toast.mock_loaded': 'Demo data loaded successfully',
        'toast.mock_error': 'Failed to load demo data',
        'toast.clear_success': 'All data cleared successfully',
        'toast.clear_error': 'Failed to delete data',
        'toast.amount_invalid': 'Please enter a valid amount',
        'toast.date_required': 'Please select a date and time',
        'toast.tx_added': 'Transaction added successfully!',
        'toast.tx_save_error': 'Failed to save data',
        'toast.tx_edited': 'Transaction updated successfully!',
        'toast.tx_edit_error': 'Failed to update data',
        'toast.tx_deleted': 'Transaction deleted successfully',
        'toast.tx_delete_error': 'Failed to delete data',
        'toast.csv_success': 'CSV file downloaded successfully',
        'toast.csv_no_data': 'No transactions available for export',
        'toast.profile_updated': 'Profile updated successfully',
        'toast.profile_error': 'Failed to update profile. Please try again',
        'toast.name_required': 'Please enter your name',
        'toast.avatar_reset': 'Switched back to default photo (please click Save to confirm changes)',
        'toast.account_deleted': 'Account and all transaction data deleted successfully',
        'toast.image_process_error': 'Error processing image',
        'toast.image_select_error': 'Please select a valid image file',
        'toast.image_load_error': 'Error loading image',
        'toast.image_read_error': 'Error reading file',

        // ========== Confirm Dialogs ==========
        'confirm.load_mock': 'Warning: Do you want to load demo data?\n\nSample data will be added to your current transactions.',
        'confirm.clear_all': 'Do you want to delete all transaction history? This cannot be undone.',
        'confirm.delete_tx': 'Are you sure you want to delete this transaction?',

        // ========== Delete Errors ==========
        'delete.error.invalid': 'Confirmation data is incorrect. Please check and try again',
        'delete.error.relogin': '<div style="line-height: 1.5; padding: 6px;"><strong>⚠️ Security Error:</strong><br>For your account safety, please <strong>"Log out"</strong> and <strong>"Log in again"</strong>, then try deleting your account.</div>',
        'delete.error.generic': 'Failed to delete account due to system error. Please try again',

        // ========== Categories: Income ==========
        'cat.salary': 'Salary / Wages',
        'cat.business': 'Business Income',
        'cat.investment': 'Investment / Dividends',
        'cat.gift': 'Gifts / Bonus',
        'cat.others_income': 'Other Income',

        // ========== Categories: Expense ==========
        'cat.food': 'Food & Drinks',
        'cat.shopping': 'Shopping',
        'cat.travel': 'Travel & Transport',
        'cat.bills': 'Bills & Fixed Costs',
        'cat.housing': 'Housing',
        'cat.health': 'Health & Medical',
        'cat.entertainment': 'Travel & Entertainment',
        'cat.others_expense': 'Other Expenses',

        // ========== Category Management Modal ==========
        'category.modal_title': 'Add New Category',
        'category.for_income': 'For Income',
        'category.for_expense': 'For Expense',
        'category.name_label': 'Category Name',
        'category.name_placeholder': 'e.g. Rent, Savings...',
        'category.icon_label': 'Choose Icon',
        'category.color_label': 'Choose Color',
        'category.preview_label': 'Preview',
        'category.cancel': 'Cancel',
        'category.save': 'Add Category',
        'category.default_name': 'New Category',
        'toast.cat_added': 'New category added successfully!',
        'toast.cat_name_required': 'Please enter a category name',
        'toast.cat_exists': 'This category already exists',
        'toast.cat_save_error': 'Failed to save category',

        // ========== CSV Headers ==========
        'csv.date': 'Date',
        'csv.type': 'Type',
        'csv.amount': 'Amount',
        'csv.method': 'Method',
        'csv.category': 'Category',
        'csv.description': 'Description',
        'csv.income': 'Income',
        'csv.expense': 'Expense',
        'csv.cash': 'Cash',
        'csv.bank': 'Bank',

        // ========== Mock Data Descriptions ==========
        'mock.salary': 'May monthly salary',
        'mock.bills': 'Internet and electricity bills',
        'mock.gift': 'Gift from mom',
        'mock.food': 'Breakfast and Starbucks coffee',
        'mock.shopping': 'New white sneakers',

        // ========== Language Toggle ==========
        'lang.switch': 'TH',
    }
};

// ---------------------------------------------------------------
// Category ID -> Translation Key Mapping
// ---------------------------------------------------------------
const CATEGORY_TRANSLATION_MAP = {
    'salary': 'cat.salary',
    'business': 'cat.business',
    'investment': 'cat.investment',
    'gift': 'cat.gift',
    'others-income': 'cat.others_income',
    'food': 'cat.food',
    'shopping': 'cat.shopping',
    'travel': 'cat.travel',
    'bills': 'cat.bills',
    'housing': 'cat.housing',
    'health': 'cat.health',
    'entertainment': 'cat.entertainment',
    'others-expense': 'cat.others_expense',
};

// ---------------------------------------------------------------
// Core i18n Functions
// ---------------------------------------------------------------

/**
 * Get translated string by key
 * @param {string} key - Translation key (e.g. 'auth.login_btn')
 * @param {object} params - Optional interpolation params (e.g. { count: 5 })
 * @returns {string} Translated string or key as fallback
 */
function t(key, params = {}) {
    const dict = TRANSLATIONS[currentLang] || TRANSLATIONS['th'];
    let text = dict[key] || TRANSLATIONS['th'][key] || key;

    // Auto-replace {{currency}} with current currency code
    const currencyCode = typeof currentCurrency !== 'undefined' ? currentCurrency : (localStorage.getItem('app-currency') || 'THB');
    text = text.replace(/{{currency}}/g, currencyCode);

    // Simple interpolation: replace {{key}} with value
    Object.keys(params).forEach(param => {
        text = text.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
    });

    return text;
}

/**
 * Get the translated label for a category ID
 * @param {string} categoryId - Category ID (e.g. 'salary', 'food')
 * @returns {string} Translated category label
 */
function tCategory(categoryId) {
    const key = CATEGORY_TRANSLATION_MAP[categoryId];
    return key ? t(key) : categoryId;
}

/**
 * Apply translations to all HTML elements with data-i18n attributes
 */
function applyTranslations() {
    // data-i18n → textContent
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translated = t(key);
        if (translated !== key) {
            // Check if translation contains HTML (like <br> or <strong>)
            if (translated.includes('<')) {
                el.innerHTML = translated;
            } else {
                el.textContent = translated;
            }
        }
    });

    // data-i18n-placeholder → placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const translated = t(key);
        if (translated !== key) {
            el.placeholder = translated;
        }
    });

    // data-i18n-title → title attribute
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        const translated = t(key);
        if (translated !== key) {
            el.title = translated;
        }
    });

    // data-i18n-aria → aria-label attribute
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const key = el.getAttribute('data-i18n-aria');
        const translated = t(key);
        if (translated !== key) {
            el.setAttribute('aria-label', translated);
        }
    });

    // data-i18n-html → innerHTML (for elements that need HTML content)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        const translated = t(key);
        if (translated !== key) {
            el.innerHTML = translated;
        }
    });

    // Update page title
    document.title = t('meta.title');

    // Update html lang attribute
    document.documentElement.setAttribute('lang', currentLang === 'th' ? 'th' : 'en');
}

/**
 * Set the application language and re-render everything
 * @param {string} lang - Language code ('th' or 'en')
 */
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('app-language', lang);

    // Update language toggle button
    const langFlag = document.getElementById('lang-flag');
    const authLangFlag = document.getElementById('auth-lang-flag');
    if (langFlag) langFlag.textContent = t('lang.switch');
    if (authLangFlag) authLangFlag.textContent = t('lang.switch');

    // Apply translations to all data-i18n elements
    applyTranslations();

    // Re-render dashboard if available (will also re-apply dynamic content)
    if (typeof renderDashboard === 'function') {
        renderDashboard();
    }

    // Re-render category dropdown options with new language labels
    if (typeof updateCategorySelectOptions === 'function') {
        updateCategorySelectOptions();
    }

    // Refresh method custom dropdowns after translation
    if (typeof refreshCustomDropdown === 'function') {
        const txMethod = document.getElementById('tx-method');
        const editTxMethod = document.getElementById('edit-tx-method');
        if (txMethod) refreshCustomDropdown(txMethod);
        if (editTxMethod) refreshCustomDropdown(editTxMethod);
    }
}

/**
 * Toggle between Thai and English
 */
function toggleLanguage() {
    const newLang = currentLang === 'th' ? 'en' : 'th';
    setLanguage(newLang);
}

/**
 * Get the current locale string for date formatting
 * @returns {string} Locale string ('th-TH' or 'en-US')
 */
function getDateLocale() {
    return currentLang === 'th' ? 'th-TH' : 'en-US';
}

// ---------------------------------------------------------------
// Initialize language on page load
// ---------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Apply initial translations
    applyTranslations();

    // Set toggle button text
    const langFlag = document.getElementById('lang-flag');
    const authLangFlag = document.getElementById('auth-lang-flag');
    if (langFlag) langFlag.textContent = t('lang.switch');
    if (authLangFlag) authLangFlag.textContent = t('lang.switch');

    // Setup toggle events
    const langToggle = document.getElementById('lang-toggle');
    const authLangToggle = document.getElementById('auth-lang-toggle');
    if (langToggle) langToggle.addEventListener('click', toggleLanguage);
    if (authLangToggle) authLangToggle.addEventListener('click', toggleLanguage);
});
