import { createContext, useState, useEffect } from 'react'
import { apiService } from '../services/api'

export const ProductContext = createContext()

const CATEGORIES = [
  { id: 'all', name: 'Tất cả' },
  { id: 'wearables', name: 'Thiết bị Đeo' },
  { id: 'audio', name: 'Âm thanh' },
  { id: 'computing', name: 'Máy tính' },
  { id: 'input', name: 'Thiết bị ngoại vi' }
]

// Hàm chuyển đổi và gộp các thông số kỹ thuật chi tiết của sản phẩm.
// Vì dữ liệu sản phẩm (đặc biệt là Laptop) có các trường thông số lưu dưới dạng cột riêng biệt trong database,
// hàm này sẽ đọc các trường đó và chuyển chúng thành cặp khóa-giá trị (Key-Value) tiếng Việt trực quan,
// sau đó gộp chung với các thông số bổ sung/tùy biến có sẵn từ trường `specsJson` để hiển thị đầy đủ trên giao diện.
const buildSpecs = (item) => {
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
        // Chuyển đổi cấu trúc thực thể từ database thành định dạng mà giao diện người dùng sử dụng
        const transformed = data.map(item => {
          let numPrice = 0;
          if (item.price) {
            const cleaned = String(item.price).replace(/[^0-9]/g, '');
            numPrice = parseFloat(cleaned) || 0;
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

          return {
            id: item.id,
            name: item.name,
            category: item.category || 'computing',
            price: numPrice,
            displayPrice: item.price || '',
            rating: item.rating || 5.0,
            reviewCount: item.reviewCount || 0,
            tag: item.tag,
            image: firstImage,
            imagesList: imagesList,
            shortDescription: item.shortDescription || item.description || '',
            description: item.description || '',
            specs: buildSpecs(item), // Gọi hàm gộp thông số kỹ thuật đầy đủ đã bổ sung các trường cột riêng lẻ
            reviews: item.reviewsJson ? JSON.parse(item.reviewsJson) : []
          };
        })
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

  return (
    <ProductContext.Provider value={{ products, categories, loading, error, refreshProducts: fetchProducts }}>
      {children}
    </ProductContext.Provider>
  )
}

