import { MedicalStore, MedicineStock, ContactRequest } from './medicineData';

// Comprehensive synthetic dataset for medical stores near Gharuan
export const MEDICAL_STORES: MedicalStore[] = [
  {
    storeId: "STORE001",
    storeName: "Government Hospital, Gharuan",
    distanceKm: 1.99,
    address: "Rayat Bahra University Campus, Gharuan, Punjab 140413",
    contactNumber: "+91-1762-235001",
    lat: 30.7833,
    lon: 76.6000,
    rating: 4.2,
    openTime: "24/7",
    closeTime: "24/7",
    medicines: [
      { name: "Paracetamol 500mg", price: 12, category: "Pain Relief", availability: "In Stock", stockQuantity: 500 },
      { name: "Dolo 650", price: 28, category: "Pain Relief", availability: "In Stock", stockQuantity: 350 },
      { name: "Cetirizine 10mg", price: 25, category: "Allergy", availability: "In Stock", stockQuantity: 200 },
      { name: "Azithromycin 500mg", price: 95, category: "Antibiotic", availability: "Low Stock", stockQuantity: 45 },
      { name: "Metformin 500mg", price: 45, category: "Diabetes", availability: "In Stock", stockQuantity: 180 },
      { name: "Aspirin 75mg", price: 18, category: "Cardiovascular", availability: "In Stock", stockQuantity: 220 },
      { name: "Vitamin D3 60000 IU", price: 85, category: "Vitamins", availability: "In Stock", stockQuantity: 150 },
      { name: "Omeprazole 20mg", price: 52, category: "Digestive", availability: "In Stock", stockQuantity: 120 },
      { name: "Crocin Advance", price: 35, category: "Pain Relief", availability: "In Stock", stockQuantity: 280 },
      { name: "Amoxicillin 500mg", price: 78, category: "Antibiotic", availability: "Out of Stock", stockQuantity: 0 },
    ]
  },
  {
    storeId: "STORE002",
    storeName: "Medical Store",
    distanceKm: 2.01,
    address: "Main Market, Gharuan, Punjab 140413",
    contactNumber: "+91-98723-45678",
    lat: 30.7845,
    lon: 76.6012,
    rating: 4.5,
    openTime: "08:00 AM",
    closeTime: "10:00 PM",
    medicines: [
      { name: "Paracetamol 500mg", price: 10, category: "Pain Relief", availability: "In Stock", stockQuantity: 600 },
      { name: "Dolo 650", price: 25, category: "Pain Relief", availability: "In Stock", stockQuantity: 400 },
      { name: "Cetirizine 10mg", price: 22, category: "Allergy", availability: "In Stock", stockQuantity: 250 },
      { name: "Allegra 120mg", price: 180, category: "Allergy", availability: "In Stock", stockQuantity: 95 },
      { name: "Azithromycin 500mg", price: 88, category: "Antibiotic", availability: "In Stock", stockQuantity: 120 },
      { name: "Amoxicillin 500mg", price: 75, category: "Antibiotic", availability: "In Stock", stockQuantity: 140 },
      { name: "Metformin 500mg", price: 42, category: "Diabetes", availability: "In Stock", stockQuantity: 200 },
      { name: "Insulin Glargine", price: 1450, category: "Diabetes", availability: "Low Stock", stockQuantity: 15 },
      { name: "Pantoprazole 40mg", price: 68, category: "Digestive", availability: "In Stock", stockQuantity: 100 },
      { name: "Atorvastatin 10mg", price: 95, category: "Cardiovascular", availability: "In Stock", stockQuantity: 85 },
      { name: "Multivitamin Tablets", price: 320, category: "Vitamins", availability: "In Stock", stockQuantity: 75 },
      { name: "Cough Syrup", price: 125, category: "Respiratory", availability: "In Stock", stockQuantity: 60 },
    ]
  },
  {
    storeId: "STORE003",
    storeName: "Healthsure Multispeciality Hospital",
    distanceKm: 2.1,
    address: "NH-7, Near Rayat Bahra University, Gharuan, Punjab",
    contactNumber: "+91-1762-235500",
    lat: 30.7850,
    lon: 76.6020,
    rating: 4.7,
    openTime: "24/7",
    closeTime: "24/7",
    medicines: [
      { name: "Paracetamol 500mg", price: 15, category: "Pain Relief", availability: "In Stock", stockQuantity: 450 },
      { name: "Dolo 650", price: 30, category: "Pain Relief", availability: "In Stock", stockQuantity: 380 },
      { name: "Ibuprofen 400mg", price: 48, category: "Pain Relief", availability: "In Stock", stockQuantity: 210 },
      { name: "Cetirizine 10mg", price: 28, category: "Allergy", availability: "In Stock", stockQuantity: 180 },
      { name: "Allegra 120mg", price: 195, category: "Allergy", availability: "In Stock", stockQuantity: 88 },
      { name: "Azithromycin 500mg", price: 98, category: "Antibiotic", availability: "In Stock", stockQuantity: 150 },
      { name: "Amoxicillin 500mg", price: 82, category: "Antibiotic", availability: "In Stock", stockQuantity: 165 },
      { name: "Metformin 500mg", price: 48, category: "Diabetes", availability: "In Stock", stockQuantity: 220 },
      { name: "Insulin Glargine", price: 1550, category: "Diabetes", availability: "In Stock", stockQuantity: 35 },
      { name: "Aspirin 75mg", price: 22, category: "Cardiovascular", availability: "In Stock", stockQuantity: 250 },
      { name: "Atorvastatin 10mg", price: 105, category: "Cardiovascular", availability: "In Stock", stockQuantity: 95 },
      { name: "Vitamin D3 60000 IU", price: 92, category: "Vitamins", availability: "In Stock", stockQuantity: 175 },
      { name: "Omeprazole 20mg", price: 58, category: "Digestive", availability: "In Stock", stockQuantity: 140 },
      { name: "Pantoprazole 40mg", price: 75, category: "Digestive", availability: "In Stock", stockQuantity: 125 },
      { name: "Salbutamol Inhaler", price: 285, category: "Respiratory", availability: "In Stock", stockQuantity: 45 },
      { name: "Levothyroxine 50mcg", price: 65, category: "Thyroid", availability: "In Stock", stockQuantity: 110 },
    ]
  },
  {
    storeId: "STORE004",
    storeName: "Rayat Bahra SuperSpeciality Hospital",
    distanceKm: 3.93,
    address: "Rayat Bahra University, Kharar-Ludhiana Highway, Gharuan",
    contactNumber: "+91-1762-235100",
    lat: 30.7900,
    lon: 76.6080,
    rating: 4.8,
    openTime: "24/7",
    closeTime: "24/7",
    medicines: [
      { name: "Paracetamol 500mg", price: 14, category: "Pain Relief", availability: "In Stock", stockQuantity: 550 },
      { name: "Dolo 650", price: 32, category: "Pain Relief", availability: "In Stock", stockQuantity: 420 },
      { name: "Crocin Advance", price: 38, category: "Pain Relief", availability: "In Stock", stockQuantity: 320 },
      { name: "Ibuprofen 400mg", price: 52, category: "Pain Relief", availability: "In Stock", stockQuantity: 240 },
      { name: "Cetirizine 10mg", price: 30, category: "Allergy", availability: "In Stock", stockQuantity: 195 },
      { name: "Allegra 120mg", price: 210, category: "Allergy", availability: "In Stock", stockQuantity: 105 },
      { name: "Azithromycin 500mg", price: 105, category: "Antibiotic", availability: "In Stock", stockQuantity: 180 },
      { name: "Amoxicillin 500mg", price: 88, category: "Antibiotic", availability: "In Stock", stockQuantity: 175 },
      { name: "Metformin 500mg", price: 52, category: "Diabetes", availability: "In Stock", stockQuantity: 260 },
      { name: "Insulin Glargine", price: 1650, category: "Diabetes", availability: "In Stock", stockQuantity: 48 },
      { name: "Aspirin 75mg", price: 25, category: "Cardiovascular", availability: "In Stock", stockQuantity: 280 },
      { name: "Atorvastatin 10mg", price: 115, category: "Cardiovascular", availability: "In Stock", stockQuantity: 115 },
      { name: "Vitamin D3 60000 IU", price: 98, category: "Vitamins", availability: "In Stock", stockQuantity: 200 },
      { name: "Multivitamin Tablets", price: 350, category: "Vitamins", availability: "In Stock", stockQuantity: 95 },
      { name: "Omeprazole 20mg", price: 62, category: "Digestive", availability: "In Stock", stockQuantity: 155 },
      { name: "Pantoprazole 40mg", price: 82, category: "Digestive", availability: "In Stock", stockQuantity: 145 },
      { name: "Salbutamol Inhaler", price: 310, category: "Respiratory", availability: "In Stock", stockQuantity: 58 },
      { name: "Cough Syrup", price: 135, category: "Respiratory", availability: "In Stock", stockQuantity: 72 },
      { name: "Levothyroxine 50mcg", price: 72, category: "Thyroid", availability: "In Stock", stockQuantity: 130 },
      { name: "Montelukast 10mg", price: 225, category: "Respiratory", availability: "In Stock", stockQuantity: 65 },
    ]
  },
  {
    storeId: "STORE005",
    storeName: "Bajwa Clinic",
    distanceKm: 3.94,
    address: "Village Bajwa, Near Gharuan, Punjab 140413",
    contactNumber: "+91-98765-43210",
    lat: 30.7920,
    lon: 76.6085,
    rating: 4.3,
    openTime: "09:00 AM",
    closeTime: "09:00 PM",
    medicines: [
      { name: "Paracetamol 500mg", price: 11, category: "Pain Relief", availability: "In Stock", stockQuantity: 380 },
      { name: "Dolo 650", price: 27, category: "Pain Relief", availability: "In Stock", stockQuantity: 310 },
      { name: "Cetirizine 10mg", price: 24, category: "Allergy", availability: "In Stock", stockQuantity: 160 },
      { name: "Azithromycin 500mg", price: 92, category: "Antibiotic", availability: "In Stock", stockQuantity: 95 },
      { name: "Amoxicillin 500mg", price: 76, category: "Antibiotic", availability: "In Stock", stockQuantity: 120 },
      { name: "Metformin 500mg", price: 44, category: "Diabetes", availability: "In Stock", stockQuantity: 175 },
      { name: "Aspirin 75mg", price: 20, category: "Cardiovascular", availability: "In Stock", stockQuantity: 190 },
      { name: "Vitamin D3 60000 IU", price: 88, category: "Vitamins", availability: "In Stock", stockQuantity: 140 },
      { name: "Omeprazole 20mg", price: 55, category: "Digestive", availability: "In Stock", stockQuantity: 105 },
      { name: "Cough Syrup", price: 128, category: "Respiratory", availability: "Low Stock", stockQuantity: 35 },
    ]
  },
  {
    storeId: "STORE006",
    storeName: "Mehar Hospital",
    distanceKm: 4.45,
    address: "Kharar-Ludhiana Road, Near Gharuan, Punjab",
    contactNumber: "+91-1762-240200",
    lat: 30.7980,
    lon: 76.6120,
    rating: 4.6,
    openTime: "24/7",
    closeTime: "24/7",
    medicines: [
      { name: "Paracetamol 500mg", price: 13, category: "Pain Relief", availability: "In Stock", stockQuantity: 480 },
      { name: "Dolo 650", price: 29, category: "Pain Relief", availability: "In Stock", stockQuantity: 390 },
      { name: "Crocin Advance", price: 36, category: "Pain Relief", availability: "In Stock", stockQuantity: 295 },
      { name: "Ibuprofen 400mg", price: 50, category: "Pain Relief", availability: "In Stock", stockQuantity: 225 },
      { name: "Cetirizine 10mg", price: 27, category: "Allergy", availability: "In Stock", stockQuantity: 185 },
      { name: "Allegra 120mg", price: 200, category: "Allergy", availability: "In Stock", stockQuantity: 92 },
      { name: "Azithromycin 500mg", price: 100, category: "Antibiotic", availability: "In Stock", stockQuantity: 165 },
      { name: "Amoxicillin 500mg", price: 85, category: "Antibiotic", availability: "In Stock", stockQuantity: 158 },
      { name: "Metformin 500mg", price: 50, category: "Diabetes", availability: "In Stock", stockQuantity: 235 },
      { name: "Insulin Glargine", price: 1580, category: "Diabetes", availability: "In Stock", stockQuantity: 42 },
      { name: "Aspirin 75mg", price: 24, category: "Cardiovascular", availability: "In Stock", stockQuantity: 265 },
      { name: "Atorvastatin 10mg", price: 108, category: "Cardiovascular", availability: "In Stock", stockQuantity: 102 },
      { name: "Vitamin D3 60000 IU", price: 95, category: "Vitamins", availability: "In Stock", stockQuantity: 188 },
      { name: "Multivitamin Tablets", price: 335, category: "Vitamins", availability: "In Stock", stockQuantity: 85 },
      { name: "Omeprazole 20mg", price: 60, category: "Digestive", availability: "In Stock", stockQuantity: 148 },
      { name: "Pantoprazole 40mg", price: 78, category: "Digestive", availability: "In Stock", stockQuantity: 135 },
      { name: "Salbutamol Inhaler", price: 295, category: "Respiratory", availability: "In Stock", stockQuantity: 52 },
      { name: "Cough Syrup", price: 132, category: "Respiratory", availability: "In Stock", stockQuantity: 68 },
      { name: "Levothyroxine 50mcg", price: 68, category: "Thyroid", availability: "In Stock", stockQuantity: 122 },
    ]
  }
];

// Helper function to search medicines across all stores
export const searchMedicineAcrossStores = (query: string): Array<{
  medicine: MedicineStock;
  store: MedicalStore;
}> => {
  const results: Array<{ medicine: MedicineStock; store: MedicalStore }> = [];
  const searchTerm = query.toLowerCase().trim();

  if (searchTerm.length < 2) return results;

  MEDICAL_STORES.forEach(store => {
    store.medicines.forEach(medicine => {
      if (
        medicine.name.toLowerCase().includes(searchTerm) ||
        medicine.category.toLowerCase().includes(searchTerm) ||
        (medicine.genericName && medicine.genericName.toLowerCase().includes(searchTerm))
      ) {
        results.push({ medicine, store });
      }
    });
  });

  // Sort by: availability first, then by distance, then by price
  return results.sort((a, b) => {
    // In Stock > Low Stock > Out of Stock
    const availabilityOrder = { "In Stock": 0, "Low Stock": 1, "Out of Stock": 2 };
    const availDiff = availabilityOrder[a.medicine.availability] - availabilityOrder[b.medicine.availability];
    if (availDiff !== 0) return availDiff;

    // Then by distance (closer first)
    const distDiff = a.store.distanceKm - b.store.distanceKm;
    if (distDiff !== 0) return distDiff;

    // Then by price (cheaper first)
    return a.medicine.price - b.medicine.price;
  });
};

// Get autocomplete suggestions for medicine names
export const getMedicineSuggestions = (query: string): string[] => {
  const searchTerm = query.toLowerCase().trim();
  if (searchTerm.length < 2) return [];

  const uniqueNames = new Set<string>();
  
  MEDICAL_STORES.forEach(store => {
    store.medicines.forEach(medicine => {
      if (medicine.name.toLowerCase().includes(searchTerm)) {
        uniqueNames.add(medicine.name);
      }
    });
  });

  return Array.from(uniqueNames).slice(0, 8);
};

// Get store by ID
export const getStoreById = (storeId: string): MedicalStore | undefined => {
  return MEDICAL_STORES.find(store => store.storeId === storeId);
};

// Store contact requests locally
let contactRequests: ContactRequest[] = [];

export const saveContactRequest = (request: Omit<ContactRequest, 'id' | 'timestamp' | 'status'>): ContactRequest => {
  const newRequest: ContactRequest = {
    ...request,
    id: `REQ${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };
  
  contactRequests.push(newRequest);
  localStorage.setItem('medicineContactRequests', JSON.stringify(contactRequests));
  
  // Simulate store reply after 2 seconds (for demo)
  setTimeout(() => {
    updateContactRequestStatus(newRequest.id, 'confirmed', `Hello! Yes, ${request.medicineName} is available. Please visit us or we can arrange home delivery.`);
  }, 2000);
  
  return newRequest;
};

export const updateContactRequestStatus = (id: string, status: ContactRequest['status'], reply?: string) => {
  const request = contactRequests.find(r => r.id === id);
  if (request) {
    request.status = status;
    if (reply) request.storeReply = reply;
    localStorage.setItem('medicineContactRequests', JSON.stringify(contactRequests));
  }
};

export const getContactRequests = (): ContactRequest[] => {
  const stored = localStorage.getItem('medicineContactRequests');
  if (stored) {
    contactRequests = JSON.parse(stored);
  }
  return contactRequests;
};

// Get price range for a medicine
export const getMedicinePriceRange = (medicineName: string): { min: number; max: number; avg: number } | null => {
  const prices: number[] = [];
  
  MEDICAL_STORES.forEach(store => {
    const medicine = store.medicines.find(m => m.name === medicineName);
    if (medicine && medicine.availability !== "Out of Stock") {
      prices.push(medicine.price);
    }
  });

  if (prices.length === 0) return null;

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
  };
};
