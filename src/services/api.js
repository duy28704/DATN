/**
 * NEXUS Tech - API Service Layer
 * Centralized place for handling backend communications.
 * To point to your real backend, modify the BASE_URL below and uncomment the real fetch implementations.
 */

const BASE_URL = import.meta.env.VITE_API_URL;

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

// Helper to get authentication headers with JWT token
const getAuthHeaders = () => {
  const userJson = localStorage.getItem('nexus_user');
  if (!userJson) return { 'Content-Type': 'application/json' };
  try {
    const user = JSON.parse(userJson);
    if (user && user.accessToken) {
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.accessToken}`
      };
    }
  } catch (e) {
    console.error('[API] Error parsing user token from localStorage', e);
  }
  return { 'Content-Type': 'application/json' };
};

export const apiService = {
  auth: {
    login: async (email, password) => {
      console.log(`[API] calling ${BASE_URL}/api/v1/auth/login for ${email}`);

      if (!email) throw new Error('Email hoặc Tên đăng nhập không được để trống.');
      if (!password) throw new Error('Mật khẩu không được để trống.');

      const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }

      return resJson.data;
    },

    register: async (name, email, password) => {
      console.log(`[API] calling ${BASE_URL}/api/v1/auth/register for ${email}`);

      // Detail fields validation
      const nameErr = validators.name(name);
      if (nameErr) throw new Error(nameErr);

      const emailErr = validators.email(email);
      if (emailErr) throw new Error(emailErr);

      const pwdErr = validators.password(password);
      if (pwdErr) throw new Error(pwdErr);

      const response = await fetch(`${BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Đăng ký thất bại. Email có thể đã tồn tại.');
      }

      return resJson.data;
    },

    updateProfile: async (email, updatedFields) => {
      console.log(`[API] calling ${BASE_URL}/api/v1/auth/profile/update for ${email}`);

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

      const response = await fetch(`${BASE_URL}/api/v1/auth/profile/update`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedFields)
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Cập nhật hồ sơ thất bại.');
      }

      return resJson.data;
    },

    logout: async () => {
      console.log(`[API] calling ${BASE_URL}/api/v1/auth/logout`);

      const response = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Đăng xuất thất bại.');
      }
      return resJson;
    }
  },

  // --- PRODUCTS API ---
  products: {
    uploadImage: async (file) => {
      console.log(`[API] calling POST ${BASE_URL}/api/v1/products/upload`);
      const formData = new FormData();
      formData.append('file', file);

      const authHeaders = getAuthHeaders();
      const headers = { ...authHeaders };
      delete headers['Content-Type'];

      const response = await fetch(`${BASE_URL}/api/v1/products/upload`, {
        method: 'POST',
        headers: headers,
        body: formData
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Lỗi khi tải ảnh lên Cloudinary');
      }
      return resJson.data;
    },
    getAll: async () => {
      console.log(`[API] calling ${BASE_URL}/api/v1/products`);
      const response = await fetch(`${BASE_URL}/api/v1/products`);
      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Lỗi khi lấy danh sách sản phẩm');
      }
      return resJson.data;
    },
    getDeleted: async () => {
      console.log(`[API] calling ${BASE_URL}/api/v1/products/deleted`);
      const response = await fetch(`${BASE_URL}/api/v1/products/deleted`, {
        headers: getAuthHeaders()
      });
      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Lỗi khi tải thùng rác');
      }
      return resJson.data;
    },
    restore: async (id) => {
      console.log(`[API] calling PUT ${BASE_URL}/api/v1/products/${id}/restore`);
      const response = await fetch(`${BASE_URL}/api/v1/products/${id}/restore`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Lỗi khi khôi phục sản phẩm');
      }
      return resJson.data;
    },
    getById: async (id) => {
      console.log(`[API] calling ${BASE_URL}/api/v1/products/${id}`);
      const response = await fetch(`${BASE_URL}/api/v1/products/${id}`);
      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Lỗi khi lấy chi tiết sản phẩm');
      }
      return resJson.data;
    },
    create: async (productData) => {
      console.log(`[API] calling POST ${BASE_URL}/api/v1/products`);
      const response = await fetch(`${BASE_URL}/api/v1/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
      });
      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Lỗi khi tạo sản phẩm mới');
      }
      return resJson.data;
    },
    update: async (id, productData) => {
      console.log(`[API] calling PUT ${BASE_URL}/api/v1/products/${id}`);
      const response = await fetch(`${BASE_URL}/api/v1/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData)
      });
      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Lỗi khi cập nhật sản phẩm');
      }
      return resJson.data;
    },
    delete: async (id, hard = false) => {
      console.log(`[API] calling DELETE ${BASE_URL}/api/v1/products/${id}?hard=${hard}`);
      const response = await fetch(`${BASE_URL}/api/v1/products/${id}?hard=${hard}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Lỗi khi xóa sản phẩm');
      }
      return resJson.data;
    },
    importExcel: async (file) => {
      console.log(`[API] calling POST ${BASE_URL}/api/v1/products/import`);
      const formData = new FormData();
      formData.append('file', file);
      
      const authHeaders = getAuthHeaders();
      const headers = { ...authHeaders };
      delete headers['Content-Type'];

      const response = await fetch(`${BASE_URL}/api/v1/products/import`, {
        method: 'POST',
        headers: headers,
        body: formData
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Lỗi khi nhập sản phẩm từ Excel.');
      }
      return resJson.data;
    }
  },

  // --- USERS API ---
  users: {
    getAll: async () => {
      console.log(`[API] calling GET ${BASE_URL}/api/v1/users`);
      const response = await fetch(`${BASE_URL}/api/v1/users`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Lỗi khi lấy danh sách người dùng');
      }
      return resJson.data;
    },
    create: async (userData) => {
      console.log(`[API] calling POST ${BASE_URL}/api/v1/users`);
      const response = await fetch(`${BASE_URL}/api/v1/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Lỗi khi tạo người dùng mới');
      }
      return resJson.data;
    },
    update: async (id, userData) => {
      console.log(`[API] calling PUT ${BASE_URL}/api/v1/users/${id}`);
      const response = await fetch(`${BASE_URL}/api/v1/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Lỗi khi cập nhật thông tin người dùng');
      }
      return resJson.data;
    },
    delete: async (id) => {
      console.log(`[API] calling DELETE ${BASE_URL}/api/v1/users/${id}`);
      const response = await fetch(`${BASE_URL}/api/v1/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Lỗi khi xóa người dùng');
      }
      return resJson.data;
    }
  },

  // --- ORDERS API ---
  orders: {
    checkout: async (orderData) => {
      console.log(`[API] calling ${BASE_URL}/api/v1/orders/checkout`, orderData);

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

      // Convert items to JSON string for backend itemsJson property
      const preparedOrder = {
        email: orderData.email,
        customerName: orderData.customerName,
        phone: orderData.phone,
        address: orderData.address,
        paymentMethod: orderData.paymentMethod,
        paymentCardInfo: orderData.paymentMethod === 'visa'
          ? `•••• •••• •••• ${orderData.cardDetails.number.replace(/\s+/g, '').slice(-4)}`
          : null,
        subtotal: orderData.subtotal,
        shipping: orderData.shipping,
        total: orderData.total,
        itemsJson: JSON.stringify(orderData.items)
      };

      const response = await fetch(`${BASE_URL}/api/v1/orders/checkout`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(preparedOrder)
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Thanh toán thất bại.');
      }
      return resJson.data;
    },

    getHistory: async (email) => {
      console.log(`[API] calling ${BASE_URL}/api/v1/orders/history for ${email}`);

      const response = await fetch(`${BASE_URL}/api/v1/orders/history?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Lỗi khi lấy lịch sử mua hàng.');
      }

      // Parse itemsJson back to items array for frontend compatibility
      const orders = resJson.data || [];
      return orders.map(order => ({
        ...order,
        items: order.itemsJson ? JSON.parse(order.itemsJson) : []
      }));
    }
  },

  // --- INSTALLMENTS API (VINFAST STYLE) ---
  installments: {
    submitRequest: async (requestData) => {
      console.log(`[API] calling ${BASE_URL}/api/v1/installments/submit-request`, requestData);

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

      const preparedRequest = {
        email: requestData.email,
        customerName: requestData.customerName,
        phone: requestData.phone,
        productId: String(requestData.productId),
        productName: requestData.productName,
        productPrice: parseFloat(requestData.price) || 0,
        productImage: requestData.productImage,
        downPaymentPct: requestData.downPaymentPct,
        downPaymentAmount: (requestData.downPaymentPct / 100) * (parseFloat(requestData.price) || 0),
        loanAmount: (1 - requestData.downPaymentPct / 100) * (parseFloat(requestData.price) || 0),
        loanTerm: requestData.loanTerm,
        monthlyPayment: requestData.monthlyEstimate,
        status: 'Chờ duyệt'
      };

      const response = await fetch(`${BASE_URL}/api/v1/installments/submit-request`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(preparedRequest)
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Đăng ký trả góp thất bại.');
      }
      return resJson.data;
    },

    getRequests: async (email) => {
      console.log(`[API] calling ${BASE_URL}/api/v1/installments/requests for ${email}`);

      const response = await fetch(`${BASE_URL}/api/v1/installments/requests?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Lỗi khi lấy danh sách trả góp.');
      }
      return resJson.data;
    }
  },

  // --- CART API ---
  cart: {
    get: async () => {
      console.log(`[API] calling GET ${BASE_URL}/api/v1/cart/get`);
      const response = await fetch(`${BASE_URL}/api/v1/cart/get`, {
        headers: getAuthHeaders()
      });
      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Lỗi khi tải giỏ hàng');
      }
      return resJson.data;
    },
    add: async (productId, quantity, configuration) => {
      console.log(`[API] calling POST ${BASE_URL}/api/v1/cart/add`);
      const response = await fetch(`${BASE_URL}/api/v1/cart/add`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId, quantity, configuration })
      });
      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Lỗi khi thêm vào giỏ hàng');
      }
      return resJson.data;
    },
    updateQuantity: async (productId, configuration, quantity) => {
      console.log(`[API] calling PUT ${BASE_URL}/api/v1/cart/update`);
      const response = await fetch(`${BASE_URL}/api/v1/cart/update`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId, configuration, quantity })
      });
      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Lỗi khi cập nhật số lượng');
      }
      return resJson.data;
    },
    remove: async (productId, configuration) => {
      console.log(`[API] calling DELETE ${BASE_URL}/api/v1/cart/remove`);
      const query = `productId=${productId}&configuration=${encodeURIComponent(configuration)}`;
      const response = await fetch(`${BASE_URL}/api/v1/cart/remove?${query}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Lỗi khi xóa khỏi giỏ hàng');
      }
      return resJson.data;
    },
    clear: async () => {
      console.log(`[API] calling DELETE ${BASE_URL}/api/v1/cart/clear`);
      const response = await fetch(`${BASE_URL}/api/v1/cart/clear`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.message || 'Lỗi khi xóa sạch giỏ hàng');
      }
      return resJson.data;
    }
  }
};
