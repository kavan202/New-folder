export const formatINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const toProperCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const MODEL_EXACT_IMAGES = {
  'Ford-F-150 Lightning': 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?auto=format&fit=crop&w=800&q=80',
  'Chevrolet-Corvette Z06': 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
  'Toyota-Camry XSE': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
  'BMW-M5 Competition': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
  'Porsche-911 GT3 RS': 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80',
  'Audi-RS e-tron GT': 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80',
  'Tata-Harrier': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
  'Tesla-Model S Plaid': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
  'Mercedes-Benz-G 63 AMG': 'https://images.unsplash.com/photo-1520031441872-265e4ff70845?auto=format&fit=crop&w=800&q=80',
  'Hyundai-Creta SX': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
  'Maruti Suzuki-Swift VXi': 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
  'Kia-Seltos HTX': 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
};

export const CATEGORY_DEFAULT_IMAGES = {
  SUV: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
  Sedan: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
  Luxury: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  Truck: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80',
  Sports: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
  Electric: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
  Hatchback: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
  Performance: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
  Default: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80',
};

export const getVehicleImage = (vehicle) => {
  if (vehicle && vehicle.image_url) {
    if (vehicle.image_url.startsWith('/static/uploads')) {
      return `http://127.0.0.1:8000${vehicle.image_url}`;
    }
    return vehicle.image_url;
  }
  if (vehicle && vehicle.make && vehicle.model) {
    const key = `${vehicle.make}-${vehicle.model}`;
    if (MODEL_EXACT_IMAGES[key]) {
      return MODEL_EXACT_IMAGES[key];
    }
  }
  const category = vehicle ? vehicle.category : 'Default';
  return CATEGORY_DEFAULT_IMAGES[category] || CATEGORY_DEFAULT_IMAGES.Default;
};
