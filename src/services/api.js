/**
 * NEXUS Tech - API Service Layer
 * Centralized place for handling backend communications.
 * To point to your real backend, modify the BASE_URL below and uncomment the real fetch implementations.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.nexus-tech.example.com';

// Helper to simulate network latency for the mock version
const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Database wrapper using localStorage for persistent UI demo
const getMockDb = () => {
  const users = JSON.parse(localStorage.getItem('nexus_db_users') || '[]');
  const orders = JSON.parse(localStorage.getItem('nexus_db_orders') || '[]');
  const installmentRequests = JSON.parse(localStorage.getItem('nexus_db_installments') || '[]');
  return { users, orders, installmentRequests };
};

const saveMockDb = (db) => {
  localStorage.setItem('nexus_db_users', JSON.stringify(db.users));
  localStorage.setItem('nexus_db_orders', JSON.stringify(db.orders));
  localStorage.setItem('nexus_db_installments', JSON.stringify(db.installmentRequests));
};

export const apiService = {
  // --- AUTHENTICATION API ---
  auth: {
    login: async (email, password) => {
      console.log(`[API] calling ${BASE_URL}/auth/login for ${email}`);
      await delay(800);

      /* Real Backend implementation template:
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đăng nhập thất bại');
      }
      return await response.json(); // returns user data & token
      */

      // Simulated validation
      if (!email || !password || password.length < 6) {
        throw new Error('Email hoặc mật khẩu không hợp lệ (mật khẩu tối thiểu 6 ký tự).');
      }

      const db = getMockDb();
      // Check if user exists, otherwise create a default mock profile
      let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        // Create mock default user profile
        user = {
          name: email.split('@')[0].toUpperCase(),
          email: email.toLowerCase(),
          phone: '0912345678',
          address: '123 Đường Cách Mạng Tháng 8, Quận 1, TP. Hồ Chí Minh',
          dob: '1998-01-01',
          gender: 'Nam',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          joinedDate: new Date().toLocaleDateString('vi-VN')
        };
        db.users.push(user);
        saveMockDb(db);
      }

      return user;
    },

    register: async (name, email, password) => {
      console.log(`[API] calling ${BASE_URL}/auth/register for ${email}`);
      await delay(800);

      /* Real Backend implementation template:
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Đăng ký thất bại');
      }
      return await response.json();
      */

      if (!name || !email || !password || password.length < 6) {
        throw new Error('Vui lòng điền đầy đủ thông tin và mật khẩu dài tối thiểu 6 ký tự.');
      }

      const db = getMockDb();
      const exists = db.users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        throw new Error('Email này đã được đăng ký trên hệ thống.');
      }

      const newUser = {
        name,
        email: email.toLowerCase(),
        phone: '',
        address: '',
        dob: '',
        gender: 'Khác',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        joinedDate: new Date().toLocaleDateString('vi-VN')
      };

      db.users.push(newUser);
      saveMockDb(db);
      return newUser;
    },

    updateProfile: async (email, updatedFields) => {
      console.log(`[API] calling ${BASE_URL}/auth/profile/update for ${email}`);
      await delay(700);

      /* Real Backend implementation template:
      const response = await fetch(`${BASE_URL}/auth/profile/update`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // example token placement
        },
        body: JSON.stringify({ email, ...updatedFields })
      });
      if (!response.ok) throw new Error('Cập nhật hồ sơ thất bại');
      return await response.json();
      */

      const db = getMockDb();
      const userIndex = db.users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
      if (userIndex === -1) {
        throw new Error('Không tìm thấy tài khoản người dùng.');
      }

      db.users[userIndex] = { ...db.users[userIndex], ...updatedFields };
      saveMockDb(db);
      return db.users[userIndex];
    }
  },

  // --- ORDERS API ---
  orders: {
    checkout: async (orderData) => {
      console.log(`[API] calling ${BASE_URL}/orders/checkout`, orderData);
      await delay(1000);

      /* Real Backend implementation template:
      const response = await fetch(`${BASE_URL}/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!response.ok) throw new Error('Đặt hàng thất bại');
      return await response.json();
      */

      const db = getMockDb();
      const newOrder = {
        id: `NX-${Math.floor(10000 + Math.random() * 90000)}`,
        orderDate: new Date().toLocaleDateString('vi-VN'),
        deliveryDate: 'Ước tính 2-3 ngày',
        status: 'Chờ xác nhận', // 'Chờ xác nhận', 'Đang vận chuyển', 'Đã giao'
        ...orderData
      };

      db.orders.unshift(newOrder); // Add to beginning of history
      saveMockDb(db);
      return newOrder;
    },

    getHistory: async (email) => {
      console.log(`[API] calling ${BASE_URL}/orders/history for ${email}`);
      await delay(500);

      /* Real Backend implementation template:
      const response = await fetch(`${BASE_URL}/orders/history?email=${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error('Không thể tải lịch sử đơn hàng');
      return await response.json();
      */

      const db = getMockDb();
      
      // Seed default orders if history is completely empty
      if (db.orders.length === 0) {
        db.orders = [
          {
            id: 'NX-94205',
            orderDate: '30/05/2026',
            deliveryDate: 'Đã giao ngày 02/06/2026',
            status: 'Đã giao',
            email: email,
            customerName: 'KHÁCH HÀNG NEXUS',
            phone: '0912345678',
            address: '123 Đường Cách Mạng Tháng 8, Quận 1, TP. Hồ Chí Minh',
            paymentMethod: 'visa',
            paymentCardInfo: '•••• •••• •••• 4242',
            items: [
              { id: 'nexus-watch-04', name: 'NEXUS Chrono Active', price: 279, quantity: 1, selectedColor: 'Standard', image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=200' }
            ],
            subtotal: 279,
            shipping: 35,
            total: 314
          },
          {
            id: 'NX-92841',
            orderDate: '15/05/2026',
            deliveryDate: 'Đã giao ngày 18/05/2026',
            status: 'Đã giao',
            email: email,
            customerName: 'KHÁCH HÀNG NEXUS',
            phone: '0912345678',
            address: '123 Đường Cách Mạng Tháng 8, Quận 1, TP. Hồ Chí Minh',
            paymentMethod: 'cod',
            items: [
              { id: 'nexus-audio-02', name: 'NEXUS Soundscape ANC', price: 349, quantity: 1, selectedColor: 'Red Stealth', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200' }
            ],
            subtotal: 349,
            shipping: 0,
            total: 349
          }
        ];
        saveMockDb(db);
      }

      return db.orders.filter(o => o.email.toLowerCase() === email.toLowerCase());
    }
  },

  // --- INSTALLMENTS API (VINFAST STYLE) ---
  installments: {
    submitRequest: async (requestData) => {
      console.log(`[API] calling ${BASE_URL}/installments/submit-request`, requestData);
      await delay(1000);

      /* Real Backend implementation template:
      const response = await fetch(`${BASE_URL}/installments/submit-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      if (!response.ok) throw new Error('Không thể đăng ký tư vấn trả góp');
      return await response.json();
      */

      const db = getMockDb();
      const newRequest = {
        id: `INS-${Math.floor(10000 + Math.random() * 90000)}`,
        createdDate: new Date().toLocaleDateString('vi-VN'),
        status: 'Chờ duyệt', // 'Chờ duyệt', 'Đang thẩm định', 'Đã phê duyệt', 'Bị từ chối'
        ...requestData
      };

      db.installmentRequests.unshift(newRequest);
      saveMockDb(db);
      return newRequest;
    },

    getRequests: async (email) => {
      console.log(`[API] calling ${BASE_URL}/installments/requests for ${email}`);
      await delay(500);

      /* Real Backend implementation template:
      const response = await fetch(`${BASE_URL}/installments/requests?email=${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error('Không thể tải hồ sơ trả góp');
      return await response.json();
      */

      const db = getMockDb();
      return db.installmentRequests.filter(r => r.email.toLowerCase() === email.toLowerCase());
    }
  }
};
