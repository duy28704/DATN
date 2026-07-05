import { createContext, useState, useEffect } from 'react'
import { apiService } from '../services/api'
import { useToast } from './ToastContext'

export const ProductContext = createContext()
export const DEFAULT_LOW_STOCK_THRESHOLD = 10;

const CATEGORIES = [
  { id: 'all', name: 'Tất cả Laptop' },
  { id: 'gaming', name: 'Laptop Gaming' },
  { id: 'vanphong', name: 'Laptop Văn phòng' },
  { id: 'doha', name: 'Laptop Đồ họa' }
]

// Hàm tự động trích xuất hãng sản xuất từ tên sản phẩm để tránh giá trị null từ DB
const extractBrand = (name) => {
  if (!name) return 'NEXUS';
  const lowerName = name.toLowerCase();
  if (lowerName.includes('lenovo')) return 'Lenovo';
  if (lowerName.includes('asus') || lowerName.includes('rog') || lowerName.includes('tuf')) return 'Asus';
  if (lowerName.includes('dell') || lowerName.includes('inspiron') || lowerName.includes('vostro') || lowerName.includes('latitude') || lowerName.includes('alienware')) return 'Dell';
  if (lowerName.includes('hp') || lowerName.includes('pavilion') || lowerName.includes('envy') || lowerName.includes('spectre') || lowerName.includes('victus')) return 'HP';
  if (lowerName.includes('acer') || lowerName.includes('predator') || lowerName.includes('nitro') || lowerName.includes('swift') || lowerName.includes('aspire')) return 'Acer';
  if (lowerName.includes('msi') || lowerName.includes('katana') || lowerName.includes('cyborg') || lowerName.includes('modern')) return 'MSI';
  if (lowerName.includes('macbook') || lowerName.includes('apple')) return 'Apple';
  return 'NEXUS';
};


// Hàm chuyển đổi và gộp các thông số kỹ thuật chi tiết của sản phẩm.
// Vì dữ liệu sản phẩm (đặc biệt là Laptop) có các trường thông số lưu dưới dạng cột riêng biệt trong database,
// hàm này sẽ đọc các trường đó và chuyển chúng thành cặp khóa-giá trị (Key-Value) tiếng Việt trực quan,
// sau đó gộp chung với các thông số bổ sung/tùy biến có sẵn từ trường `specsJson` để hiển thị đầy đủ trên giao diện.
export const buildSpecs = (item) => {
  let specs = {}
  try {
    // Phân tích cú pháp chuỗi JSON chứa các thông số tùy biến phụ trợ
    if (item.specsJson) {
      specs = JSON.parse(item.specsJson)
    }
  } catch (e) {
    console.error("Lỗi khi phân tích cú pháp specsJson:", e)
  }

  // Định nghĩa ánh xạ từ tên trường trong Database/API (camelCase) sang nhãn tiếng Việt hiển thị ở Front-end
  const fieldMapping = {
    cpuTechnology: 'Công nghệ CPU',
    cpuCores: 'Số nhân CPU',
    cpuThreads: 'Số luồng CPU',
    cpuSpeed: 'Tốc độ CPU',
    npu: 'Bộ xử lý NPU',
    cpuAiPerformanceTops: 'Hiệu năng AI CPU (TOPS)',
    gpuCard: 'Card đồ họa (GPU)',
    gpuCores: 'Số nhân GPU',
    gpuTgp: 'TGP GPU',
    gpuAiPerformanceTops: 'Hiệu năng AI GPU (TOPS)',
    ram: 'Dung lượng RAM',
    ramType: 'Loại RAM',
    ramBusSpeed: 'Tốc độ Bus RAM',
    maxRam: 'Hỗ trợ RAM tối đa',
    storage: 'Ổ cứng (Storage)',
    screenSize: 'Kích thước màn hình',
    screenResolution: 'Độ phân giải màn hình',
    panel: 'Tấm nền màn hình',
    refreshRate: 'Tần số quét',
    colorGamut: 'Độ bao phủ màu',
    touchScreen: 'Màn hình cảm ứng',
    displayTechnology: 'Công nghệ màn hình',
    ports: 'Cổng kết nối',
    wireless: 'Kết nối không dây',
    webcam: 'Webcam',
    keyboardBacklight: 'Đèn bàn phím',
    security: 'Bảo mật',
    audioTechnology: 'Công nghệ âm thanh',
    cooling: 'Hệ thống tản nhiệt',
    otherFeatures: 'Tính năng khác',
    battery: 'Dung lượng Pin',
    operatingSystem: 'Hệ điều hành',
    releaseTime: 'Thời điểm ra mắt',
    dimensionsWeight: 'Kích thước & Trọng lượng',
    material: 'Chất liệu chế tạo',
    memoryCardReader: 'Khe cắm thẻ nhớ'
  }

  // Duyệt qua danh sách ánh xạ, nếu trường nào có dữ liệu thì chuẩn hóa định dạng và gộp vào đối tượng `specs`
  for (const [field, label] of Object.entries(fieldMapping)) {
    if (item[field] !== undefined && item[field] !== null && String(item[field]).trim() !== '') {
      let value = item[field];

      // Tự động thêm đơn vị phù hợp nếu dữ liệu từ backend chưa có đơn vị đo tương ứng
      if (field === 'ramBusSpeed' && !String(value).includes('MHz')) {
        value = `${value} MHz`;
      } else if (field === 'gpuTgp' && !String(value).includes('W')) {
        value = `${value} W`;
      } else if (field === 'screenSize' && !String(value).includes('inch')) {
        value = `${value} inch`;
      } else if (field === 'refreshRate' && !String(value).includes('Hz')) {
        value = `${value} Hz`;
      }

      // Lưu thông số vào object với nhãn hiển thị tương ứng
      specs[label] = String(value);
    }
  }

  return specs;
}

export const transformDbProduct = (item) => {
  let numPrice = 0;
  if (item.price) {
    // Trích xuất giá đầu tiên từ chuỗi giá (ví dụ: "21.090.000₫ * ...")
    const match = String(item.price).match(/([0-9.,]+)\s*₫/);
    if (match) {
      const cleaned = match[1].replace(/[^0-9]/g, '');
      numPrice = parseFloat(cleaned) || 0;
    } else {
      const matchOnlyDigits = String(item.price).match(/[0-9.]+/);
      if (matchOnlyDigits) {
        const cleaned = matchOnlyDigits[0].replace(/[^0-9]/g, '');
        numPrice = parseFloat(cleaned) || 0;
      }
    }
  }

  let firstImage = '/assets/nexus-keyboard.png';
  let imagesList = [];
  if (item.images && item.images.trim()) {
    imagesList = item.images.split(/[\n,]/).map(url => url.trim()).filter(Boolean);
    if (imagesList.length > 0) {
      firstImage = imagesList[0];
    }
  } else {
    imagesList = ['/assets/nexus-keyboard.png'];
  }

  // Phân loại Laptop động dựa trên tên và thông số card đồ họa
  let finalCategory = 'vanphong'; // Mặc định là Văn phòng
  const nameLower = (item.name || '').toLowerCase();
  const gpuLower = (item.gpuCard || '').toLowerCase();
  const descLower = (item.description || item.shortDescription || '').toLowerCase();

  if (
    nameLower.includes('gaming') ||
    nameLower.includes('tuf') ||
    nameLower.includes('rog') ||
    nameLower.includes('strix') ||
    nameLower.includes('legion') ||
    nameLower.includes('loq') ||
    nameLower.includes('predator') ||
    nameLower.includes('nitro') ||
    nameLower.includes('cyborg') ||
    nameLower.includes('katana') ||
    nameLower.includes('victus') ||
    nameLower.includes('omen') ||
    gpuLower.includes('rtx') ||
    gpuLower.includes('gtx') ||
    gpuLower.includes('radeon rx')
  ) {
    finalCategory = 'gaming';
  } else if (
    nameLower.includes('creator') ||
    nameLower.includes('studio') ||
    nameLower.includes('proart') ||
    nameLower.includes('oled') ||
    descLower.includes('đồ họa') ||
    descLower.includes('thiết kế đồ họa') ||
    descLower.includes('render') ||
    gpuLower.includes('arc graphics') ||
    gpuLower.includes('geforce') ||
    (gpuLower.includes('nvidia') && !gpuLower.includes('rtx') && !gpuLower.includes('gtx')) ||
    item.ram === '32 GB' ||
    item.ram === '64 GB'
  ) {
    finalCategory = 'doha';
  }

  return {
    id: item.id,
    name: item.name,
    category: finalCategory,
    price: numPrice,
    displayPrice: numPrice > 0 ? '' : 'Chưa cập nhật',
    rating: item.rating || 5.0,
    reviewCount: item.reviewCount || 0,
    tag: item.tag || (numPrice > 35000000 ? 'Hot' : (numPrice < 15000000 ? 'Sale' : 'New')),
    image: firstImage,
    imagesList: imagesList,
    images: item.images || '',
    shortDescription: item.shortDescription || item.description || '',
    description: item.description || '',
    specs: buildSpecs(item),
    reviews: item.reviewsJson ? JSON.parse(item.reviewsJson) : [],
    stockQuantity: item.stockQuantity != null ? item.stockQuantity : 50,
    lowStockThreshold: item.lowStockThreshold != null ? item.lowStockThreshold : DEFAULT_LOW_STOCK_THRESHOLD,
    brand: item.brand || '',
    cpuTechnology: item.cpuTechnology || '',
    gpuCard: item.gpuCard || '',
    ram: item.ram || '',
    storage: item.storage || '',
    screenResolution: item.screenResolution || '',
    refreshRate: item.refreshRate || ''
  };
};

export const formatDisplayPrice = (price, displayPrice) => {
  const str = (displayPrice || String(price || '')).trim();
  if (!str) return 'Chưa cập nhật';

  const num = Number(str);
  if (!isNaN(num)) {
    return `${num.toLocaleString('vi-VN')} ₫`;
  }

  return str;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const data = await apiService.products.getAll()
      if (data && data.length > 0) {
        const transformed = data.map(transformDbProduct)
        setProducts(transformed)
        setError(null)
      } else {
        setProducts([])
        setError(null)
      }
    } catch (err) {
      console.error('[ProductContext] Error loading products from database:', err)
      setError('Lỗi khi tải danh sách sản phẩm từ máy chủ.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const [compareItems, setCompareItems] = useState([])
  const { showToast } = useToast()

  // Đồng bộ danh sách sản phẩm so sánh từ URL hash khi tải trang
  useEffect(() => {
    if (products.length > 0 && compareItems.length === 0) {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('compare')) {
        const urlParams = new URLSearchParams(hash.split('?')[1] || '');
        const idsStr = urlParams.get('ids');
        if (idsStr) {
          const ids = idsStr.split(',').map(id => parseInt(id, 10)).filter(Boolean);
          const matched = products.filter(p => ids.includes(p.id));
          if (matched.length > 0) {
            setCompareItems(matched.slice(0, 2));
          }
        }
      }
    }
  }, [products])

  const toggleCompare = (product) => {
    setCompareItems(prev => {
      const exists = prev.some(item => item.id === product.id)
      if (exists) {
        return prev.filter(item => item.id !== product.id)
      } else {
        if (prev.length >= 2) {
          showToast({ type: 'warning', title: 'Giới hạn so sánh', message: 'Bạn chỉ có thể so sánh tối đa 2 sản phẩm.' })
          return prev
        }
        return [...prev, product]
      }
    })
  }

  const clearCompare = () => setCompareItems([])

  return (
    <ProductContext.Provider value={{
      products,
      categories,
      loading,
      error,
      refreshProducts: fetchProducts,
      compareItems,
      toggleCompare,
      clearCompare
    }}>
      {children}
    </ProductContext.Provider>
  )
}

