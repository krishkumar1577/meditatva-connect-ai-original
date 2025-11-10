// Synthetic Medicine and Pharmacy Inventory Dataset for MediTatva

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  description: string;
  commonUses: string[];
  sideEffects: string[];
  dosageForm: string;
  strength: string;
  packageSize: string;
}

export interface MedicineStock {
  name: string;
  price: number;
  category: string;
  availability: "In Stock" | "Out of Stock" | "Low Stock";
  stockQuantity: number;
  genericName?: string;
  manufacturer?: string;
}

export interface MedicalStore {
  storeId: string;
  storeName: string;
  distanceKm: number;
  address: string;
  contactNumber: string;
  lat: number;
  lon: number;
  medicines: MedicineStock[];
  rating?: number;
  openTime?: string;
  closeTime?: string;
}

export interface PharmacyInventory {
  pharmacyId: string;
  pharmacyName: string;
  address: string;
  distance: number;
  lat: number;
  lon: number;
  phone: string;
  medicineId: string;
  inStock: boolean;
  quantity: number;
  price: number;
  discount?: number;
  lastUpdated: string;
}

export interface ContactRequest {
  id: string;
  storeId: string;
  storeName: string;
  medicineName: string;
  message: string;
  prescriptionFile?: File;
  timestamp: string;
  status: "pending" | "confirmed" | "rejected";
  storeReply?: string;
}

// Comprehensive Medicine Database
export const MEDICINES: Medicine[] = [
  {
    id: "MED001",
    name: "Paracetamol 500mg",
    genericName: "Acetaminophen",
    category: "Pain Relief & Fever",
    manufacturer: "Sun Pharma",
    description: "Common pain reliever and fever reducer",
    commonUses: ["Headache", "Fever", "Body pain", "Cold symptoms"],
    sideEffects: ["Nausea", "Allergic reactions (rare)"],
    dosageForm: "Tablet",
    strength: "500mg",
    packageSize: "15 tablets"
  },
  {
    id: "MED002",
    name: "Dolo 650",
    genericName: "Paracetamol",
    category: "Pain Relief & Fever",
    manufacturer: "Micro Labs",
    description: "Fever and pain relief medication",
    commonUses: ["Fever", "Headache", "Toothache", "Muscle pain"],
    dosageForm: "Tablet",
    strength: "650mg",
    packageSize: "15 tablets"
  },
  {
    id: "MED003",
    name: "Crocin Advance",
    genericName: "Paracetamol",
    category: "Pain Relief",
    manufacturer: "GSK",
    description: "Fast relief from pain and fever",
    commonUses: ["Headache", "Fever", "Period pain"],
    dosageForm: "Tablet",
    strength: "500mg",
    packageSize: "20 tablets"
  },
  {
    id: "MED004",
    name: "Cetirizine 10mg",
    genericName: "Cetirizine Hydrochloride",
    category: "Allergy",
    manufacturer: "Cipla",
    description: "Antihistamine for allergy relief",
    commonUses: ["Allergic rhinitis", "Urticaria", "Hay fever", "Skin allergies"],
    sideEffects: ["Drowsiness", "Dry mouth", "Fatigue"],
    dosageForm: "Tablet",
    strength: "10mg",
    packageSize: "10 tablets"
  },
  {
    id: "MED005",
    name: "Allegra 120mg",
    genericName: "Fexofenadine",
    category: "Allergy",
    manufacturer: "Sanofi",
    description: "Non-drowsy allergy medication",
    commonUses: ["Seasonal allergies", "Chronic urticaria"],
    dosageForm: "Tablet",
    strength: "120mg",
    packageSize: "10 tablets"
  },
  {
    id: "MED006",
    name: "Azithromycin 500mg",
    genericName: "Azithromycin",
    category: "Antibiotic",
    manufacturer: "Pfizer",
    description: "Broad-spectrum antibiotic",
    commonUses: ["Respiratory infections", "Skin infections", "Ear infections"],
    sideEffects: ["Nausea", "Diarrhea", "Stomach pain"],
    dosageForm: "Tablet",
    strength: "500mg",
    packageSize: "3 tablets"
  },
  {
    id: "MED007",
    name: "Amoxicillin 500mg",
    genericName: "Amoxicillin",
    category: "Antibiotic",
    manufacturer: "Ranbaxy",
    description: "Penicillin-type antibiotic",
    commonUses: ["Bacterial infections", "Throat infections", "UTI"],
    dosageForm: "Capsule",
    strength: "500mg",
    packageSize: "10 capsules"
  },
  {
    id: "MED008",
    name: "Omeprazole 20mg",
    genericName: "Omeprazole",
    category: "Digestive Health",
    manufacturer: "Dr. Reddy's",
    description: "Proton pump inhibitor for acid reflux",
    commonUses: ["GERD", "Acidity", "Stomach ulcers", "Heartburn"],
    dosageForm: "Capsule",
    strength: "20mg",
    packageSize: "14 capsules"
  },
  {
    id: "MED009",
    name: "Pantoprazole 40mg",
    genericName: "Pantoprazole",
    category: "Digestive Health",
    manufacturer: "Sun Pharma",
    description: "Reduces stomach acid production",
    commonUses: ["Acid reflux", "Gastritis", "Peptic ulcers"],
    dosageForm: "Tablet",
    strength: "40mg",
    packageSize: "15 tablets"
  },
  {
    id: "MED010",
    name: "Metformin 500mg",
    genericName: "Metformin Hydrochloride",
    category: "Diabetes",
    manufacturer: "USV Ltd",
    description: "Blood sugar control medication",
    commonUses: ["Type 2 Diabetes", "PCOS"],
    sideEffects: ["Nausea", "Diarrhea", "Stomach upset"],
    dosageForm: "Tablet",
    strength: "500mg",
    packageSize: "30 tablets"
  },
  {
    id: "MED011",
    name: "Aspirin 75mg",
    genericName: "Acetylsalicylic Acid",
    category: "Cardiovascular",
    manufacturer: "Bayer",
    description: "Blood thinner and pain reliever",
    commonUses: ["Heart disease prevention", "Pain relief", "Fever"],
    dosageForm: "Tablet",
    strength: "75mg",
    packageSize: "30 tablets"
  },
  {
    id: "MED012",
    name: "Atorvastatin 10mg",
    genericName: "Atorvastatin",
    category: "Cardiovascular",
    manufacturer: "Pfizer",
    description: "Cholesterol-lowering medication",
    commonUses: ["High cholesterol", "Heart disease prevention"],
    dosageForm: "Tablet",
    strength: "10mg",
    packageSize: "30 tablets"
  },
  {
    id: "MED013",
    name: "Vitamin D3 60000 IU",
    genericName: "Cholecalciferol",
    category: "Vitamins & Supplements",
    manufacturer: "Abbott",
    description: "Vitamin D supplement",
    commonUses: ["Vitamin D deficiency", "Bone health"],
    dosageForm: "Capsule",
    strength: "60000 IU",
    packageSize: "4 capsules"
  },
  {
    id: "MED014",
    name: "Multivitamin Tablets",
    genericName: "Multivitamin",
    category: "Vitamins & Supplements",
    manufacturer: "HealthKart",
    description: "Daily multivitamin supplement",
    commonUses: ["Nutritional supplement", "General wellness"],
    dosageForm: "Tablet",
    strength: "Multi",
    packageSize: "30 tablets"
  },
  {
    id: "MED015",
    name: "Ibuprofen 400mg",
    genericName: "Ibuprofen",
    category: "Pain Relief",
    manufacturer: "Johnson & Johnson",
    description: "Anti-inflammatory pain reliever",
    commonUses: ["Inflammation", "Pain", "Fever", "Arthritis"],
    sideEffects: ["Stomach upset", "Nausea", "Dizziness"],
    dosageForm: "Tablet",
    strength: "400mg",
    packageSize: "20 tablets"
  },
  {
    id: "MED016",
    name: "Cough Syrup",
    genericName: "Dextromethorphan",
    category: "Respiratory",
    manufacturer: "Dabur",
    description: "Cough suppressant",
    commonUses: ["Dry cough", "Throat irritation"],
    dosageForm: "Syrup",
    strength: "100ml",
    packageSize: "100ml bottle"
  },
  {
    id: "MED017",
    name: "Levothyroxine 50mcg",
    genericName: "Levothyroxine Sodium",
    category: "Thyroid",
    manufacturer: "Abbott",
    description: "Thyroid hormone replacement",
    commonUses: ["Hypothyroidism"],
    dosageForm: "Tablet",
    strength: "50mcg",
    packageSize: "30 tablets"
  },
  {
    id: "MED018",
    name: "Insulin Glargine",
    genericName: "Insulin Glargine",
    category: "Diabetes",
    manufacturer: "Sanofi",
    description: "Long-acting insulin",
    commonUses: ["Type 1 Diabetes", "Type 2 Diabetes"],
    dosageForm: "Injection",
    strength: "100 units/ml",
    packageSize: "3ml cartridge"
  },
  {
    id: "MED019",
    name: "Salbutamol Inhaler",
    genericName: "Salbutamol",
    category: "Respiratory",
    manufacturer: "GSK",
    description: "Bronchodilator for asthma",
    commonUses: ["Asthma", "COPD", "Bronchospasm"],
    dosageForm: "Inhaler",
    strength: "100mcg/dose",
    packageSize: "200 doses"
  },
  {
    id: "MED020",
    name: "Montelukast 10mg",
    genericName: "Montelukast",
    category: "Respiratory",
    manufacturer: "Merck",
    description: "Asthma and allergy medication",
    commonUses: ["Asthma", "Allergic rhinitis"],
    dosageForm: "Tablet",
    strength: "10mg",
    packageSize: "10 tablets"
  }
];

// Pharmacy Inventory - Simulating real-time stock across multiple stores
export const PHARMACY_INVENTORY: PharmacyInventory[] = [
  // Apollo Pharmacy inventories
  { pharmacyId: "PH001", pharmacyName: "Apollo Pharmacy", address: "Sector 18, Noida", distance: 0.8, lat: 28.5685, lon: 77.3215, phone: "+91-9876543210", medicineId: "MED001", inStock: true, quantity: 150, price: 25, discount: 10, lastUpdated: "2025-11-08T10:00:00Z" },
  { pharmacyId: "PH001", pharmacyName: "Apollo Pharmacy", address: "Sector 18, Noida", distance: 0.8, lat: 28.5685, lon: 77.3215, phone: "+91-9876543210", medicineId: "MED002", inStock: true, quantity: 200, price: 35, lastUpdated: "2025-11-08T10:00:00Z" },
  { pharmacyId: "PH001", pharmacyName: "Apollo Pharmacy", address: "Sector 18, Noida", distance: 0.8, lat: 28.5685, lon: 77.3215, phone: "+91-9876543210", medicineId: "MED004", inStock: true, quantity: 80, price: 45, lastUpdated: "2025-11-08T10:00:00Z" },
  { pharmacyId: "PH001", pharmacyName: "Apollo Pharmacy", address: "Sector 18, Noida", distance: 0.8, lat: 28.5685, lon: 77.3215, phone: "+91-9876543210", medicineId: "MED006", inStock: false, quantity: 0, price: 120, lastUpdated: "2025-11-08T10:00:00Z" },
  { pharmacyId: "PH001", pharmacyName: "Apollo Pharmacy", address: "Sector 18, Noida", distance: 0.8, lat: 28.5685, lon: 77.3215, phone: "+91-9876543210", medicineId: "MED010", inStock: true, quantity: 120, price: 18, lastUpdated: "2025-11-08T10:00:00Z" },
  
  // MedPlus inventories
  { pharmacyId: "PH002", pharmacyName: "MedPlus", address: "Connaught Place, Delhi", distance: 1.2, lat: 28.6315, lon: 77.2167, phone: "+91-9876543211", medicineId: "MED001", inStock: true, quantity: 100, price: 28, lastUpdated: "2025-11-08T09:30:00Z" },
  { pharmacyId: "PH002", pharmacyName: "MedPlus", address: "Connaught Place, Delhi", distance: 1.2, lat: 28.6315, lon: 77.2167, phone: "+91-9876543211", medicineId: "MED003", inStock: true, quantity: 75, price: 42, discount: 5, lastUpdated: "2025-11-08T09:30:00Z" },
  { pharmacyId: "PH002", pharmacyName: "MedPlus", address: "Connaught Place, Delhi", distance: 1.2, lat: 28.6315, lon: 77.2167, phone: "+91-9876543211", medicineId: "MED005", inStock: true, quantity: 60, price: 180, lastUpdated: "2025-11-08T09:30:00Z" },
  { pharmacyId: "PH002", pharmacyName: "MedPlus", address: "Connaught Place, Delhi", distance: 1.2, lat: 28.6315, lon: 77.2167, phone: "+91-9876543211", medicineId: "MED008", inStock: true, quantity: 90, price: 65, lastUpdated: "2025-11-08T09:30:00Z" },
  { pharmacyId: "PH002", pharmacyName: "MedPlus", address: "Connaught Place, Delhi", distance: 1.2, lat: 28.6315, lon: 77.2167, phone: "+91-9876543211", medicineId: "MED013", inStock: true, quantity: 40, price: 85, lastUpdated: "2025-11-08T09:30:00Z" },
  
  // NetMeds inventories
  { pharmacyId: "PH003", pharmacyName: "NetMeds", address: "Indirapuram, Ghaziabad", distance: 2.5, lat: 28.6410, lon: 77.3681, phone: "+91-9876543212", medicineId: "MED002", inStock: true, quantity: 180, price: 32, discount: 15, lastUpdated: "2025-11-08T08:00:00Z" },
  { pharmacyId: "PH003", pharmacyName: "NetMeds", address: "Indirapuram, Ghaziabad", distance: 2.5, lat: 28.6410, lon: 77.3681, phone: "+91-9876543212", medicineId: "MED004", inStock: true, quantity: 95, price: 48, lastUpdated: "2025-11-08T08:00:00Z" },
  { pharmacyId: "PH003", pharmacyName: "NetMeds", address: "Indirapuram, Ghaziabad", distance: 2.5, lat: 28.6410, lon: 77.3681, phone: "+91-9876543212", medicineId: "MED007", inStock: true, quantity: 70, price: 95, lastUpdated: "2025-11-08T08:00:00Z" },
  { pharmacyId: "PH003", pharmacyName: "NetMeds", address: "Indirapuram, Ghaziabad", distance: 2.5, lat: 28.6410, lon: 77.3681, phone: "+91-9876543212", medicineId: "MED011", inStock: true, quantity: 150, price: 12, lastUpdated: "2025-11-08T08:00:00Z" },
  { pharmacyId: "PH003", pharmacyName: "NetMeds", address: "Indirapuram, Ghaziabad", distance: 2.5, lat: 28.6410, lon: 77.3681, phone: "+91-9876543212", medicineId: "MED015", inStock: false, quantity: 0, price: 55, lastUpdated: "2025-11-08T08:00:00Z" },
  
  // 1mg Store inventories
  { pharmacyId: "PH004", pharmacyName: "1mg Store", address: "Saket, Delhi", distance: 3.2, lat: 28.5244, lon: 77.2066, phone: "+91-9876543213", medicineId: "MED001", inStock: true, quantity: 200, price: 22, discount: 20, lastUpdated: "2025-11-08T07:00:00Z" },
  { pharmacyId: "PH004", pharmacyName: "1mg Store", address: "Saket, Delhi", distance: 3.2, lat: 28.5244, lon: 77.2066, phone: "+91-9876543213", medicineId: "MED006", inStock: true, quantity: 50, price: 115, discount: 10, lastUpdated: "2025-11-08T07:00:00Z" },
  { pharmacyId: "PH004", pharmacyName: "1mg Store", address: "Saket, Delhi", distance: 3.2, lat: 28.5244, lon: 77.2066, phone: "+91-9876543213", medicineId: "MED009", inStock: true, quantity: 85, price: 58, lastUpdated: "2025-11-08T07:00:00Z" },
  { pharmacyId: "PH004", pharmacyName: "1mg Store", address: "Saket, Delhi", distance: 3.2, lat: 28.5244, lon: 77.2066, phone: "+91-9876543213", medicineId: "MED012", inStock: true, quantity: 110, price: 145, lastUpdated: "2025-11-08T07:00:00Z" },
  { pharmacyId: "PH004", pharmacyName: "1mg Store", address: "Saket, Delhi", distance: 3.2, lat: 28.5244, lon: 77.2066, phone: "+91-9876543213", medicineId: "MED014", inStock: true, quantity: 65, price: 320, lastUpdated: "2025-11-08T07:00:00Z" },
  
  // PharmEasy inventories
  { pharmacyId: "PH005", pharmacyName: "PharmEasy", address: "Vaishali, Ghaziabad", distance: 4.1, lat: 28.6509, lon: 77.3383, phone: "+91-9876543214", medicineId: "MED003", inStock: true, quantity: 130, price: 38, discount: 12, lastUpdated: "2025-11-08T06:30:00Z" },
  { pharmacyId: "PH005", pharmacyName: "PharmEasy", address: "Vaishali, Ghaziabad", distance: 4.1, lat: 28.6509, lon: 77.3383, phone: "+91-9876543214", medicineId: "MED005", inStock: true, quantity: 45, price: 175, lastUpdated: "2025-11-08T06:30:00Z" },
  { pharmacyId: "PH005", pharmacyName: "PharmEasy", address: "Vaishali, Ghaziabad", distance: 4.1, lat: 28.6509, lon: 77.3383, phone: "+91-9876543214", medicineId: "MED010", inStock: true, quantity: 140, price: 16, discount: 8, lastUpdated: "2025-11-08T06:30:00Z" },
  { pharmacyId: "PH005", pharmacyName: "PharmEasy", address: "Vaishali, Ghaziabad", distance: 4.1, lat: 28.6509, lon: 77.3383, phone: "+91-9876543214", medicineId: "MED016", inStock: true, quantity: 55, price: 95, lastUpdated: "2025-11-08T06:30:00Z" },
  { pharmacyId: "PH005", pharmacyName: "PharmEasy", address: "Vaishali, Ghaziabad", distance: 4.1, lat: 28.6509, lon: 77.3383, phone: "+91-9876543214", medicineId: "MED017", inStock: true, quantity: 30, price: 72, lastUpdated: "2025-11-08T06:30:00Z" },
  
  // HealthFirst Pharmacy inventories
  { pharmacyId: "PH006", pharmacyName: "HealthFirst Pharmacy", address: "Dwarka, Delhi", distance: 5.8, lat: 28.5921, lon: 77.0460, phone: "+91-9876543215", medicineId: "MED007", inStock: true, quantity: 80, price: 92, discount: 5, lastUpdated: "2025-11-08T05:00:00Z" },
  { pharmacyId: "PH006", pharmacyName: "HealthFirst Pharmacy", address: "Dwarka, Delhi", distance: 5.8, lat: 28.5921, lon: 77.0460, phone: "+91-9876543215", medicineId: "MED011", inStock: true, quantity: 125, price: 14, lastUpdated: "2025-11-08T05:00:00Z" },
  { pharmacyId: "PH006", pharmacyName: "HealthFirst Pharmacy", address: "Dwarka, Delhi", distance: 5.8, lat: 28.5921, lon: 77.0460, phone: "+91-9876543215", medicineId: "MED013", inStock: false, quantity: 0, price: 82, lastUpdated: "2025-11-08T05:00:00Z" },
  { pharmacyId: "PH006", pharmacyName: "HealthFirst Pharmacy", address: "Dwarka, Delhi", distance: 5.8, lat: 28.5921, lon: 77.0460, phone: "+91-9876543215", medicineId: "MED018", inStock: true, quantity: 15, price: 1850, lastUpdated: "2025-11-08T05:00:00Z" },
  { pharmacyId: "PH006", pharmacyName: "HealthFirst Pharmacy", address: "Dwarka, Delhi", distance: 5.8, lat: 28.5921, lon: 77.0460, phone: "+91-9876543215", medicineId: "MED019", inStock: true, quantity: 25, price: 420, lastUpdated: "2025-11-08T05:00:00Z" },
  
  // CareWell Medical inventories
  { pharmacyId: "PH007", pharmacyName: "CareWell Medical", address: "Rohini, Delhi", distance: 6.5, lat: 28.7041, lon: 77.1025, phone: "+91-9876543216", medicineId: "MED008", inStock: true, quantity: 95, price: 62, discount: 8, lastUpdated: "2025-11-08T04:30:00Z" },
  { pharmacyId: "PH007", pharmacyName: "CareWell Medical", address: "Rohini, Delhi", distance: 6.5, lat: 28.7041, lon: 77.1025, phone: "+91-9876543216", medicineId: "MED009", inStock: true, quantity: 78, price: 55, lastUpdated: "2025-11-08T04:30:00Z" },
  { pharmacyId: "PH007", pharmacyName: "CareWell Medical", address: "Rohini, Delhi", distance: 6.5, lat: 28.7041, lon: 77.1025, phone: "+91-9876543216", medicineId: "MED012", inStock: true, quantity: 105, price: 140, discount: 10, lastUpdated: "2025-11-08T04:30:00Z" },
  { pharmacyId: "PH007", pharmacyName: "CareWell Medical", address: "Rohini, Delhi", distance: 6.5, lat: 28.7041, lon: 77.1025, phone: "+91-9876543216", medicineId: "MED015", inStock: true, quantity: 88, price: 52, lastUpdated: "2025-11-08T04:30:00Z" },
  { pharmacyId: "PH007", pharmacyName: "CareWell Medical", address: "Rohini, Delhi", distance: 6.5, lat: 28.7041, lon: 77.1025, phone: "+91-9876543216", medicineId: "MED020", inStock: true, quantity: 42, price: 135, lastUpdated: "2025-11-08T04:30:00Z" },
];

// Helper functions
export const getMedicineById = (id: string): Medicine | undefined => {
  return MEDICINES.find(med => med.id === id);
};

export const searchMedicines = (query: string): Medicine[] => {
  const lowerQuery = query.toLowerCase();
  return MEDICINES.filter(med => 
    med.name.toLowerCase().includes(lowerQuery) ||
    med.genericName.toLowerCase().includes(lowerQuery) ||
    med.category.toLowerCase().includes(lowerQuery)
  );
};

export const getPharmacyInventory = (medicineId: string): PharmacyInventory[] => {
  return PHARMACY_INVENTORY.filter(inv => inv.medicineId === medicineId);
};

export const getAvailableStores = (medicineId: string): PharmacyInventory[] => {
  return PHARMACY_INVENTORY.filter(inv => inv.medicineId === medicineId && inv.inStock);
};

export const sortInventoryByPrice = (inventory: PharmacyInventory[]): PharmacyInventory[] => {
  return [...inventory].sort((a, b) => {
    const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
    const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
    return priceA - priceB;
  });
};

export const sortInventoryByDistance = (inventory: PharmacyInventory[]): PharmacyInventory[] => {
  return [...inventory].sort((a, b) => a.distance - b.distance);
};

export const sortInventoryByAvailability = (inventory: PharmacyInventory[]): PharmacyInventory[] => {
  return [...inventory].sort((a, b) => {
    if (a.inStock && !b.inStock) return -1;
    if (!a.inStock && b.inStock) return 1;
    return 0;
  });
};
