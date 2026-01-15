// Kiểm tra session cookies khi popup mở
document.addEventListener('DOMContentLoaded', async () => {
    const statusDiv = document.getElementById('status');
    const calculateBtn = document.getElementById('calculateBtn');
    const loginWarning = document.getElementById('loginWarning');

    // Tải kết quả đã lưu (nếu có)
    await loadSavedResults();

    const hasSession = await checkShopeeSession();

    if (hasSession) {
        statusDiv.className = 'status success';
        statusDiv.textContent = '✅ Đã đăng nhập Shopee';
        calculateBtn.disabled = false;
        loginWarning.style.display = 'none';
    } else {
        statusDiv.className = 'status error';
        statusDiv.textContent = '❌ Chưa đăng nhập Shopee';
        calculateBtn.disabled = true;
        loginWarning.style.display = 'block';
    }

    calculateBtn.addEventListener('click', startCalculation);
});

// Tải kết quả đã lưu từ chrome.storage
async function loadSavedResults() {
    try {
        const result = await chrome.storage.local.get(['lastResult', 'lastYear', 'lastCalculated']);
        
        if (result.lastResult && result.lastYear) {
            const resultsDiv = document.getElementById('results');
            const savedTime = result.lastCalculated ? new Date(result.lastCalculated).toLocaleString('vi-VN') : '';
            
            displayResults(result.lastResult, result.lastYear);
            
            // Thêm thông báo về dữ liệu đã lưu
            const status = document.getElementById('status');
            status.className = 'status success';
            status.textContent = `📊 Kết quả đã lưu (${savedTime})`;
        }
    } catch (error) {
        console.error('Lỗi khi tải kết quả:', error);
    }
}

async function checkShopeeSession() {
    try {
        const cookies = await chrome.cookies.getAll({ domain: '.shopee.vn' });
        
        // Log tất cả cookies để debug
        console.log('🍪 Tất cả cookies Shopee:', cookies.map(c => c.name));
        
        // Các cookies có thể cần thiết (kiểm tra nhiều hơn)
        const possibleCookies = [
            'SPC_EC',      // Session cookie chính
            'SPC_U',       // User ID
            'SPC_R_T_ID',  // Request tracking
            'SPC_T_ID',    // Tracking ID
            'SPC_SI',      // Session info
            'SPC_ST',      // Session token
            'csrftoken',   // CSRF protection
            'shopee_token' // Shopee token mới?
        ];
        
        const foundCookies = cookies.map(c => c.name);
        
        // Log từng cookie quan trọng
        possibleCookies.forEach(name => {
            const exists = foundCookies.includes(name);
            console.log(`  ${exists ? '✅' : '❌'} ${name}`);
        });
        
        // Kiểm tra ít nhất có SPC_EC hoặc SPC_U
        const hasMinimum = foundCookies.includes('SPC_EC') || foundCookies.includes('SPC_U');
        
        if (!hasMinimum) {
            console.warn('⚠️ Không tìm thấy cookies cần thiết!');
        }
        
        return hasMinimum;
    } catch (error) {
        console.error('Lỗi khi kiểm tra cookie:', error);
        return false;
    }
}

async function startCalculation() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url || !tab.url.includes('shopee.vn')) {
        alert('⚠️ Vui lòng mở tab Shopee (shopee.vn) trước khi tính thống kê!');
        return;
    }

    const selectedYear = parseInt(document.getElementById('yearSelect').value);

    const btn = document.getElementById('calculateBtn');
    const status = document.getElementById('status');
    const progress = document.getElementById('progress');

    btn.disabled = true;
    status.className = 'status loading';
    status.textContent = '🔄 Đang kết nối với Shopee...';
    progress.style.display = 'block';
    progress.textContent = 'Khởi tạo...';

    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: fetchShopeeData,
            args: [selectedYear],
            world: 'MAIN'  // Chạy trong MAIN world để có full access tới cookies
        });

        if (!results || results.length === 0) {
            throw new Error('Không thể inject script vào trang');
        }

        const result = results[0]?.result;

        if (!result) {
            throw new Error('Không nhận được dữ liệu từ script');
        }

        if (result.error) {
            throw new Error(result.error);
        }

        if (result.tongDonHang === 0) {
            status.className = 'status error';
            status.textContent = `⚠️ Không tìm thấy đơn hàng đã giao năm ${selectedYear}`;
            progress.style.display = 'none';
            btn.disabled = false;
            return;
        }

        // Lưu kết quả vào chrome.storage
        await chrome.storage.local.set({
            lastResult: result,
            lastYear: selectedYear,
            lastCalculated: new Date().toISOString()
        });

        displayResults(result, selectedYear);
        status.className = 'status success';
        status.textContent = `✅ Hoàn thành! Tìm thấy ${result.tongDonHang} đơn hàng`;
        progress.style.display = 'none';

        // Gửi thông báo
        await chrome.notifications.create({
            type: 'basic',
            iconUrl: 'images/icon128.png',
            title: '✅ Thống kê hoàn tất!',
            message: `Năm ${selectedYear}: ${formatPrice(result.tongDonHang)} đơn - ${formatPrice(result.tongTienDaTra)} ₫`,
            priority: 2
        });

    } catch (err) {
        console.error('Error:', err);
        status.className = 'status error';
        status.textContent = '❌ ' + (err.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
        progress.style.display = 'none';
    } finally {
        btn.disabled = false;
    }
}

async function fetchShopeeData(year) {
    const YEAR = year;
    const PAGE_SIZE = 20;
    const LIST_TYPE = 3; 
    const PRICE_DIV = 100000;
    
    const accum = {
        tongDonHang: 0,
        tongTienDaTra: 0,
        tongTienTruocGiam: 0,
        tongSanPham: 0,
        tongTietKiem: 0
    };

    function getCsrfToken() {
        const match = document.cookie.match(/csrftoken=([^;]+)/);
        return match ? match[1] : '';
    }

    async function fetchPage(offset) {
        const url = `https://shopee.vn/api/v4/order/get_order_list?list_type=${LIST_TYPE}&offset=${offset}&limit=${PAGE_SIZE}`;
        
        const csrftoken = getCsrfToken();
        
        // Headers cập nhật theo Shopee mới nhất
        const headers = {
            'accept': 'application/json',
            'content-type': 'application/json',
            'x-api-source': 'pc',
            'x-requested-with': 'XMLHttpRequest',
            'x-shopee-language': 'vi',
            'referer': 'https://shopee.vn/user/purchase/',
            'af-ac-enc-dat': 'null',
            'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin'
        };
        
        if (csrftoken) {
            headers['x-csrftoken'] = csrftoken;
        }
        
        console.log('🌐 Sending request with headers:', headers);
        console.log('🔐 CSRF Token:', csrftoken ? csrftoken.substring(0, 10) + '...' : 'NONE');
        
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: headers
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: Không thể lấy dữ liệu. Vui lòng đảm bảo bạn đã đăng nhập Shopee.`);
        }

        const data = await response.json();
        console.log('📦 Response data structure:', Object.keys(data));
        
        return data;
    }

    function processOrders(orders, accum, year, priceDiv) {
        for (const order of orders) {
            const ctime = order?.shipping?.tracking_info?.ctime;
            if (!ctime) continue;
            
            const orderDate = new Date(ctime * 1000);
            if (orderDate.getFullYear() !== year) continue;
            
            accum.tongDonHang++;
            accum.tongTienDaTra += (order?.info_card?.final_total ?? 0) / priceDiv;
            
            const orderListCards = order?.info_card?.order_list_cards || [];
            for (const card of orderListCards) {
                const itemGroups = card?.product_info?.item_groups || [];
                for (const group of itemGroups) {
                    const items = group?.items || [];
                    for (const item of items) {
                        accum.tongSanPham += item?.amount ?? 0;
                        accum.tongTienTruocGiam += (item?.order_price ?? 0) / priceDiv;
                    }
                }
            }
        }
    }

    try {
        
        let data = await fetchPage(0);

        // Debug: Log response để kiểm tra
        console.log('API Response:', data);
        console.log('Response type:', typeof data);
        console.log('Has data property:', 'data' in data);

        // Kiểm tra null/undefined
        if (!data) {
            throw new Error('⚠️ Không nhận được phản hồi từ Shopee API. Vui lòng kiểm tra kết nối internet và thử lại.');
        }

        // Kiểm tra lỗi từ API
        if (data.error !== undefined && data.error !== 0) {
            const errorMsg = data.error_msg || data.msg || 'Lỗi không xác định';
            throw new Error(`⚠️ Lỗi API Shopee (${data.error}): ${errorMsg}\n\n🔐 Vui lòng:\n1. Đăng xuất Shopee\n2. Đăng nhập lại\n3. Thử lại extension`);
        }

        // Kiểm tra cấu trúc dữ liệu
        if (!data.data) {
            console.error('Data structure:', Object.keys(data));
            throw new Error('⚠️ Dữ liệu trả về không đúng định dạng.\n\n💡 Nguyên nhân có thể:\n- Shopee đã thay đổi API\n- Phiên đăng nhập hết hạn\n\n🔄 Hãy thử:\n1. Tải lại trang Shopee\n2. Đăng nhập lại\n3. Thử lại extension');
        }

        if (!data.data.details_list) {
            console.error('Data.data structure:', Object.keys(data.data));
            throw new Error('⚠️ Không tìm thấy danh sách đơn hàng.\n\n✅ Đảm bảo:\n1. Bạn đã đăng nhập Shopee\n2. Đang ở trang shopee.vn\n3. Có ít nhất 1 đơn hàng đã giao');
        }

        let orders = data.data.details_list;
        let offset = PAGE_SIZE;
        let pageIndex = 1;

        processOrders(orders, accum, YEAR, PRICE_DIV);

        while (orders.length === PAGE_SIZE && pageIndex < 200) {
            await new Promise(r => setTimeout(r, 500));
            
            data = await fetchPage(offset);
            orders = data.data.details_list || [];
            pageIndex++;
            
            processOrders(orders, accum, YEAR, PRICE_DIV);
            
            offset += PAGE_SIZE;
        }

        accum.tongTietKiem = Math.max(0, accum.tongTienTruocGiam - accum.tongTienDaTra);
        
        return accum;

    } catch (error) {
        console.error('Fetch error:', error);
        return { error: error.message };
    }
}

function displayResults(data, year) {
    const resultsDiv = document.getElementById('results');
    const totalAmount = document.getElementById('totalAmount');
    const totalOrders = document.getElementById('totalOrders');
    const totalProducts = document.getElementById('totalProducts');
    const totalSaved = document.getElementById('totalSaved');
    const resultYear = document.getElementById('resultYear');

    resultYear.textContent = year;
    totalAmount.textContent = formatPrice(data.tongTienDaTra) + ' ₫';
    totalOrders.textContent = formatPrice(data.tongDonHang) + ' đơn';
    totalProducts.textContent = formatPrice(data.tongSanPham) + ' sản phẩm';
    totalSaved.textContent = formatPrice(data.tongTietKiem) + ' ₫';

    resultsDiv.style.display = 'block';
}


function formatPrice(number, fixed = 0) {
    if (isNaN(number)) return '0';
    number = number.toFixed(fixed);
    let delimeter = ',';
    number += '';
    let rgx = /(\d+)(\d{3})/;
    while (rgx.test(number)) {
        number = number.replace(rgx, '$1' + delimeter + '$2');
    }
    return number;
}