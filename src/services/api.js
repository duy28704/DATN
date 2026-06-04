/**
 * NEXUS Tech - API Service Layer
 * Centralized place for handling backend communications.
 * To point to your real backend, modify the BASE_URL below and uncomment the real fetch implementations.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.nexus-tech.example.com';

// Helper to simulate network latency for the mock version
const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

// --- DETAIL VALIDATION RULES ---
export const validators = {
  email: (val) => {
    if (!val) return 'Email không được để trống';
    const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return reg.test(val) ? null : 'Email không đúng định dạng (Ví dụ: hoang.nam@gmail.com)';
  },
  phone: (val) => {
    if (!val) return 'Số điện thoại không được để trống';
    const reg = /^(0[3|5|7|8|9])([0-9]{8})$/;
    return reg.test(val) ? null : 'Số điện thoại phải gồm 10 chữ số (bắt đầu bằng 03, 05, 07, 08, 09)';
  },
  password: (val) => {
    if (!val) return 'Mật khẩu không được để trống';
    if (val.length < 6) return 'Mật khẩu phải dài tối thiểu 6 ký tự';
    const hasLetter = /[a-zA-Z]/.test(val);
    const hasNumber = /[0-9]/.test(val);
    return (hasLetter && hasNumber) ? null : 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số để tăng bảo mật';
  },
  name: (val) => {
    if (!val || val.trim().length < 2) return 'Họ tên phải từ 2 ký tự trở lên';
    const reg = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂĐÊÔƠƯàáâãèéêìíòóôõùúăđĩũơưăâđêôơư\s]+$/;
    return reg.test(val) ? null : 'Họ tên chỉ được phép chứa chữ cái tiếng Việt và khoảng trắng';
  },
  address: (val) => {
    if (!val || val.trim().length < 10) return 'Địa chỉ phải chi tiết hơn (tối thiểu 10 ký tự)';
    return null;
  },
  dob: (val) => {
    if (!val) return 'Ngày sinh không được để trống';
    const birthDate = new Date(val);
    const today = new Date();
    if (birthDate > today) return 'Ngày sinh không thể ở tương lai';
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 15 ? null : 'Khách hàng phải từ 15 tuổi trở lên để sử dụng dịch vụ';
  },
  cardNumber: (val) => {
    const clean = val.replace(/\s+/g, '');
    if (!/^\d{16}$/.test(clean)) return 'Số thẻ tín dụng/Visa phải chứa đúng 16 chữ số';
    
    // Luhn Algorithm checksum verification
    let sum = 0;
    let shouldDouble = false;
    for (let i = clean.length - 1; i >= 0; i--) {
      let digit = parseInt(clean.charAt(i));
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return (sum % 10 === 0) ? null : 'Số thẻ không hợp lệ (Không vượt qua kiểm tra checksum Luhn)';
  },
  cardExpiry: (val) => {
    if (!/^\d{2}\/\d{2}$/.test(val)) return 'Định dạng ngày hết hạn phải là MM/YY (Ví dụ: 12/29)';
    const [mStr, yStr] = val.split('/');
    const month = parseInt(mStr, 10);
    const year = parseInt(yStr, 10);
    if (month < 1 || month > 12) return 'Tháng không hợp lệ (phải từ 01 đến 12)';
    
    const today = new Date();
    const currentYear = today.getFullYear() % 100; // yy
    const currentMonth = today.getMonth() + 1;
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return 'Thẻ này đã hết hạn sử dụng';
    }
    return null;
  },
  cardCVC: (val) => {
    return /^\d{3}$/.test(val) ? null : 'Mã CVC/CVV bảo mật phải gồm đúng 3 chữ số';
  }
};

// Mock Database wrapper using localStorage for persistent UI demo
const getMockDb = () => {
  let usersRaw = localStorage.getItem('nexus_db_users');
  let users = [];
  if (!usersRaw) {
    // Seed default users inside mock database
    users = [
      {
        name: 'DEV TESTER',
        email: 'test@nexus.com',
        password: 'Password123',
        phone: '0912345678',
        address: '123 Đường Cách Mạng Tháng 8, Quận 1, TP. Hồ Chí Minh',
        dob: '1995-05-15',
        gender: 'Nam',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        joinedDate: '01/01/2026'
      },
      {
        name: 'VINFAST FAN',
        email: 'vinfast@nexus.com',
        password: 'Vinfast2026',
        phone: '0987654321',
        address: '456 Đường Lạc Long Quân, Quận Tây Hồ, Hà Nội',
        dob: '1990-10-20',
        gender: 'Nữ',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        joinedDate: '15/02/2026'
      }
    ];
    localStorage.setItem('nexus_db_users', JSON.stringify(users));
  } else {
    users = JSON.parse(usersRaw);
  }

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

      // Validate email format
      const emailErr = validators.email(email);
      if (emailErr) throw new Error(emailErr);

      // Validate password format
      const pwdErr = validators.password(password);
      if (pwdErr) throw new Error(pwdErr);

      const db = getMockDb();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        throw new Error('Tài khoản không tồn tại trên hệ thống. Vui lòng đăng ký tài khoản mới.');
      }

      if (user.password !== password) {
        throw new Error('Mật khẩu đăng nhập không chính xác. Vui lòng kiểm tra lại.');
      }

      return user;
    },

    register: async (name, email, password) => {
      console.log(`[API] calling ${BASE_URL}/auth/register for ${email}`);
      await delay(800);

      // Detail fields validation
      const nameErr = validators.name(name);
      if (nameErr) throw new Error(nameErr);

      const emailErr = validators.email(email);
      if (emailErr) throw new Error(emailErr);

      const pwdErr = validators.password(password);
      if (pwdErr) throw new Error(pwdErr);

      const db = getMockDb();
      const exists = db.users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        throw new Error('Địa chỉ email này đã tồn tại trên hệ thống.');
      }

      const newUser = {
        name,
        email: email.toLowerCase(),
        password, // Save password in mock DB
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

      // Profile updates validation
      if (updatedFields.name !== undefined) {
        const err = validators.name(updatedFields.name);
        if (err) throw new Error(`Họ tên: ${err}`);
      }
      if (updatedFields.phone) {
        const err = validators.phone(updatedFields.phone);
        if (err) throw new Error(`Số điện thoại: ${err}`);
      }
      if (updatedFields.address) {
        const err = validators.address(updatedFields.address);
        if (err) throw new Error(`Địa chỉ: ${err}`);
      }
      if (updatedFields.dob) {
        const err = validators.dob(updatedFields.dob);
        if (err) throw new Error(`Ngày sinh: ${err}`);
      }

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

      // Validate delivery fields
      const nameErr = validators.name(orderData.customerName);
      if (nameErr) throw new Error(`Tên người nhận: ${nameErr}`);

      const phoneErr = validators.phone(orderData.phone);
      if (phoneErr) throw new Error(`Số điện thoại nhận: ${phoneErr}`);

      const addrErr = validators.address(orderData.address);
      if (addrErr) throw new Error(`Địa chỉ nhận hàng: ${addrErr}`);

      // Visa specific card detail validations
      if (orderData.paymentMethod === 'visa') {
        if (!orderData.cardDetails) {
          throw new Error('Vui lòng cung cấp thông tin thẻ tín dụng.');
        }
        
        const cardNumErr = validators.cardNumber(orderData.cardDetails.number);
        if (cardNumErr) throw new Error(`Số thẻ: ${cardNumErr}`);

        const cardHolderErr = validators.name(orderData.cardDetails.name);
        if (cardHolderErr) throw new Error(`Tên chủ thẻ: ${cardHolderErr}`);

        const cardExpiryErr = validators.cardExpiry(orderData.cardDetails.expiry);
        if (cardExpiryErr) throw new Error(`Hạn dùng thẻ: ${cardExpiryErr}`);

        const cardCVCErr = validators.cardCVC(orderData.cardDetails.cvc);
        if (cardCVCErr) throw new Error(`Mã CVC: ${cardCVCErr}`);
      }

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
            customerName: 'DEV TESTER',
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
            customerName: 'DEV TESTER',
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

      // Validate consultation fields
      const nameErr = validators.name(requestData.customerName);
      if (nameErr) throw new Error(`Họ tên đăng ký: ${nameErr}`);

      const phoneErr = validators.phone(requestData.phone);
      if (phoneErr) throw new Error(`Số điện thoại: ${phoneErr}`);

      const emailErr = validators.email(requestData.email);
      if (emailErr) throw new Error(`Email: ${emailErr}`);

      if (requestData.downPaymentPct < 20 || requestData.downPaymentPct > 80) {
        throw new Error('Số tiền trả trước phải nằm trong khoảng từ 20% đến 80% giá trị sản phẩm.');
      }

      const validTerms = [6, 12, 18, 24, 36];
      if (!validTerms.includes(requestData.loanTerm)) {
        throw new Error('Kỳ hạn vay trả góp không được hỗ trợ.');
      }

      const db = getMockDb();
      const newRequest = {
        id: `INS-${Math.floor(10000 + Math.random() * 90000)}`,
        createdDate: new Date().toLocaleDateString('vi-VN'),
        status: 'Chờ duyệt', // 'Chờ duyệt', 'Đang thẩm định', 'Đã phê duyệt'
        ...requestData
      };

      db.installmentRequests.unshift(newRequest);
      saveMockDb(db);
      return newRequest;
    },

    getRequests: async (email) => {
      console.log(`[API] calling ${BASE_URL}/installments/requests for ${email}`);
      await delay(500);

      const db = getMockDb();
      return db.installmentRequests.filter(r => r.email.toLowerCase() === email.toLowerCase());
    }
  }
};
