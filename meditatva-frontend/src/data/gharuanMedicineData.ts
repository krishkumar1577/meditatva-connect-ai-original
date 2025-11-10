// Enhanced Mock Medicine Data for Gharuan Area - MediTatva
// Realistic dataset with multiple stores and medicine availability

import { MedicalStore, MedicineStock } from "./medicineData";

export interface EnhancedMedicineStock extends MedicineStock {
  dosage?: string;
  packSize?: string;
  requiresPrescription?: boolean;
}

export interface EnhancedMedicalStore extends MedicalStore {
  timing: string;
  isOpen24x7?: boolean;
  hasHomeDelivery: boolean;
  hasPickup: boolean;
  deliveryChargeBase: number;
  deliveryChargePerKm: number;
  freeDeliveryAbove?: number;
}

// Comprehensive Medicine Database for Gharuan Region
export const GHARUAN_MEDICINES: EnhancedMedicineStock[] = [
  {
    name: "Paracetamol 500mg",
    price: 10,
    category: "Pain Relief",
    availability: "In Stock",
    stockQuantity: 150,
    genericName: "Acetaminophen",
    manufacturer: "Sun Pharma",
    dosage: "500mg",
    packSize: "15 tablets",
    requiresPrescription: false
  },
  {
    name: "Cetirizine 10mg",
    price: 15,
    category: "Allergy Relief",
    availability: "In Stock",
    stockQuantity: 80,
    genericName: "Cetirizine Hydrochloride",
    manufacturer: "Cipla",
    dosage: "10mg",
    packSize: "10 tablets",
    requiresPrescription: false
  },
  {
    name: "Dolo 650",
    price: 12,
    category: "Pain Relief",
    availability: "In Stock",
    stockQuantity: 200,
    genericName: "Paracetamol",
    manufacturer: "Micro Labs",
    dosage: "650mg",
    packSize: "15 tablets",
    requiresPrescription: false
  },
  {
    name: "Crocin Advance",
    price: 18,
    category: "Pain Relief",
    availability: "In Stock",
    stockQuantity: 120,
    genericName: "Paracetamol",
    manufacturer: "GSK",
    dosage: "500mg",
    packSize: "15 tablets",
    requiresPrescription: false
  },
  {
    name: "Allegra 120mg",
    price: 85,
    category: "Allergy Relief",
    availability: "In Stock",
    stockQuantity: 45,
    genericName: "Fexofenadine",
    manufacturer: "Sanofi",
    dosage: "120mg",
    packSize: "10 tablets",
    requiresPrescription: false
  },
  {
    name: "Montair LC",
    price: 95,
    category: "Allergy Relief",
    availability: "In Stock",
    stockQuantity: 60,
    genericName: "Montelukast + Levocetirizine",
    manufacturer: "Cipla",
    dosage: "5mg + 10mg",
    packSize: "10 tablets",
    requiresPrescription: true
  },
  {
    name: "Azithromycin 500mg",
    price: 120,
    category: "Antibiotic",
    availability: "In Stock",
    stockQuantity: 35,
    genericName: "Azithromycin",
    manufacturer: "Zydus",
    dosage: "500mg",
    packSize: "3 tablets",
    requiresPrescription: true
  },
  {
    name: "Amoxicillin 500mg",
    price: 80,
    category: "Antibiotic",
    availability: "In Stock",
    stockQuantity: 50,
    genericName: "Amoxicillin",
    manufacturer: "Dr. Reddy's",
    dosage: "500mg",
    packSize: "10 capsules",
    requiresPrescription: true
  }
];

// Enhanced Medical Stores in Gharuan Area
export const GHARUAN_MEDICAL_STORES: EnhancedMedicalStore[] = [
  {
    storeId: "STORE001",
    storeName: "Medical Store, Main Market Gharuan",
    distanceKm: 2.01,
    address: "Main Market, Gharuan, Punjab 140413",
    contactNumber: "+91-98722-07107",
    lat: 30.7575,
    lon: 76.6575,
    rating: 4.5,
    timing: "9AM - 9PM",
    isOpen24x7: false,
    hasHomeDelivery: true,
    hasPickup: true,
    deliveryChargeBase: 15,
    deliveryChargePerKm: 2,
    freeDeliveryAbove: 500,
    medicines: [
      {
        name: "Paracetamol 500mg",
        price: 10,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 150,
        genericName: "Acetaminophen",
        manufacturer: "Sun Pharma"
      },
      {
        name: "Cetirizine 10mg",
        price: 15,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 70,
        genericName: "Cetirizine Hydrochloride",
        manufacturer: "Cipla"
      },
      {
        name: "Dolo 650",
        price: 12,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 80,
        genericName: "Paracetamol",
        manufacturer: "Micro Labs"
      },
      {
        name: "Crocin Advance",
        price: 18,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 65,
        genericName: "Paracetamol",
        manufacturer: "GSK"
      },
      {
        name: "Allegra 120mg",
        price: 86,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 40,
        genericName: "Fexofenadine",
        manufacturer: "Sanofi"
      },
      {
        name: "Montair LC",
        price: 94,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 50,
        genericName: "Montelukast + Levocetirizine",
        manufacturer: "Cipla"
      },
      {
        name: "Azithromycin 500mg",
        price: 120,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 25,
        genericName: "Azithromycin",
        manufacturer: "Zydus"
      },
      {
        name: "Amoxicillin 500mg",
        price: 80,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 40,
        genericName: "Amoxicillin",
        manufacturer: "Dr. Reddy's"
      }
    ]
  },
  {
    storeId: "STORE002",
    storeName: "Government Hospital Pharmacy, Gharuan",
    distanceKm: 1.99,
    address: "Rayat Bahra University Campus, Gharuan, Punjab 140413",
    contactNumber: "+91-1762-235001",
    lat: 30.7580,
    lon: 76.6580,
    rating: 4.6,
    timing: "24/7",
    isOpen24x7: true,
    hasHomeDelivery: true,
    hasPickup: true,
    deliveryChargeBase: 15,
    deliveryChargePerKm: 2,
    medicines: [
      {
        name: "Paracetamol 500mg",
        price: 12,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 200,
        genericName: "Acetaminophen",
        manufacturer: "Sun Pharma"
      },
      {
        name: "Cetirizine 10mg",
        price: 14,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 90,
        genericName: "Cetirizine Hydrochloride",
        manufacturer: "Cipla"
      },
      {
        name: "Dolo 650",
        price: 11,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 150,
        genericName: "Paracetamol",
        manufacturer: "Micro Labs"
      },
      {
        name: "Crocin Advance",
        price: 17,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 80,
        genericName: "Paracetamol",
        manufacturer: "GSK"
      },
      {
        name: "Allegra 120mg",
        price: 85,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 35,
        genericName: "Fexofenadine",
        manufacturer: "Sanofi"
      },
      {
        name: "Montair LC",
        price: 92,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 45,
        genericName: "Montelukast + Levocetirizine",
        manufacturer: "Cipla"
      },
      {
        name: "Azithromycin 500mg",
        price: 115,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 30,
        genericName: "Azithromycin",
        manufacturer: "Zydus"
      },
      {
        name: "Amoxicillin 500mg",
        price: 75,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 55,
        genericName: "Amoxicillin",
        manufacturer: "Dr. Reddy's"
      }
    ]
  },
  {
    storeId: "STORE003",
    storeName: "Healthsure Multispeciality Hospital Store",
    distanceKm: 2.1,
    address: "Gharuan, Punjab 140413",
    contactNumber: "+91-98155-32101",
    lat: 30.7560,
    lon: 76.6590,
    rating: 4.4,
    timing: "8AM - 10PM",
    isOpen24x7: false,
    hasHomeDelivery: true,
    hasPickup: true,
    deliveryChargeBase: 20,
    deliveryChargePerKm: 2.5,
    freeDeliveryAbove: 600,
    medicines: [
      {
        name: "Paracetamol 500mg",
        price: 11,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 100,
        genericName: "Acetaminophen",
        manufacturer: "Sun Pharma"
      },
      {
        name: "Cetirizine 10mg",
        price: 15,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 70,
        genericName: "Cetirizine Hydrochloride",
        manufacturer: "Cipla"
      },
      {
        name: "Dolo 650",
        price: 13,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 90,
        genericName: "Paracetamol",
        manufacturer: "Micro Labs"
      },
      {
        name: "Crocin Advance",
        price: 19,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 85,
        genericName: "Paracetamol",
        manufacturer: "GSK"
      },
      {
        name: "Allegra 120mg",
        price: 85,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 35,
        genericName: "Fexofenadine",
        manufacturer: "Sanofi"
      },
      {
        name: "Montair LC",
        price: 95,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 50,
        genericName: "Montelukast + Levocetirizine",
        manufacturer: "Cipla"
      },
      {
        name: "Azithromycin 500mg",
        price: 125,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 20,
        genericName: "Azithromycin",
        manufacturer: "Zydus"
      },
      {
        name: "Amoxicillin 500mg",
        price: 82,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 45,
        genericName: "Amoxicillin",
        manufacturer: "Dr. Reddy's"
      }
    ]
  },
  {
    storeId: "STORE004",
    storeName: "Mehar Hospital Pharmacy",
    distanceKm: 4.4,
    address: "Zirakpur, Punjab 140603",
    contactNumber: "+91-99158-88877",
    lat: 30.6420,
    lon: 76.8173,
    rating: 4.3,
    timing: "24/7",
    isOpen24x7: true,
    hasHomeDelivery: true,
    hasPickup: true,
    deliveryChargeBase: 25,
    deliveryChargePerKm: 3,
    freeDeliveryAbove: 800,
    medicines: [
      {
        name: "Paracetamol 500mg",
        price: 10,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 180,
        genericName: "Acetaminophen",
        manufacturer: "Sun Pharma"
      },
      {
        name: "Cetirizine 10mg",
        price: 14,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 95,
        genericName: "Cetirizine Hydrochloride",
        manufacturer: "Cipla"
      },
      {
        name: "Dolo 650",
        price: 13,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 130,
        genericName: "Paracetamol",
        manufacturer: "Micro Labs"
      },
      {
        name: "Crocin Advance",
        price: 18,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 75,
        genericName: "Paracetamol",
        manufacturer: "GSK"
      },
      {
        name: "Allegra 120mg",
        price: 88,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 40,
        genericName: "Fexofenadine",
        manufacturer: "Sanofi"
      },
      {
        name: "Montair LC",
        price: 93,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 55,
        genericName: "Montelukast + Levocetirizine",
        manufacturer: "Cipla"
      },
      {
        name: "Azithromycin 500mg",
        price: 118,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 30,
        genericName: "Azithromycin",
        manufacturer: "Zydus"
      },
      {
        name: "Amoxicillin 500mg",
        price: 78,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 60,
        genericName: "Amoxicillin",
        manufacturer: "Dr. Reddy's"
      }
    ]
  },
  {
    storeId: "STORE005",
    storeName: "Apollo Pharmacy, Derabassi",
    distanceKm: 5.8,
    address: "GT Road, Derabassi, Punjab 140507",
    contactNumber: "+91-1762-521000",
    lat: 30.5897,
    lon: 76.8414,
    rating: 4.7,
    timing: "8AM - 11PM",
    isOpen24x7: false,
    hasHomeDelivery: true,
    hasPickup: true,
    deliveryChargeBase: 30,
    deliveryChargePerKm: 3,
    freeDeliveryAbove: 1000,
    medicines: [
      {
        name: "Paracetamol 500mg",
        price: 9,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 250,
        genericName: "Acetaminophen",
        manufacturer: "Sun Pharma"
      },
      {
        name: "Cetirizine 10mg",
        price: 13,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 110,
        genericName: "Cetirizine Hydrochloride",
        manufacturer: "Cipla"
      },
      {
        name: "Dolo 650",
        price: 10,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 200,
        genericName: "Paracetamol",
        manufacturer: "Micro Labs"
      },
      {
        name: "Crocin Advance",
        price: 17,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 140,
        genericName: "Paracetamol",
        manufacturer: "GSK"
      },
      {
        name: "Allegra 120mg",
        price: 82,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 55,
        genericName: "Fexofenadine",
        manufacturer: "Sanofi"
      },
      {
        name: "Montair LC",
        price: 90,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 70,
        genericName: "Montelukast + Levocetirizine",
        manufacturer: "Cipla"
      },
      {
        name: "Azithromycin 500mg",
        price: 115,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 40,
        genericName: "Azithromycin",
        manufacturer: "Zydus"
      },
      {
        name: "Amoxicillin 500mg",
        price: 72,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 75,
        genericName: "Amoxicillin",
        manufacturer: "Dr. Reddy's"
      }
    ]
  },
  {
    storeId: "STORE006",
    storeName: "MedPlus, Kurali",
    distanceKm: 7.2,
    address: "Main Market, Kurali, Punjab 140103",
    contactNumber: "+91-98760-12345",
    lat: 30.8742,
    lon: 76.5981,
    rating: 4.2,
    timing: "9AM - 9PM",
    isOpen24x7: false,
    hasHomeDelivery: true,
    hasPickup: true,
    deliveryChargeBase: 35,
    deliveryChargePerKm: 3.5,
    freeDeliveryAbove: 1200,
    medicines: [
      {
        name: "Paracetamol 500mg",
        price: 11,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 160,
        genericName: "Acetaminophen",
        manufacturer: "Sun Pharma"
      },
      {
        name: "Cetirizine 10mg",
        price: 16,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 75,
        genericName: "Cetirizine Hydrochloride",
        manufacturer: "Cipla"
      },
      {
        name: "Dolo 650",
        price: 14,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 120,
        genericName: "Paracetamol",
        manufacturer: "Micro Labs"
      },
      {
        name: "Crocin Advance",
        price: 20,
        category: "Pain Relief",
        availability: "In Stock",
        stockQuantity: 95,
        genericName: "Paracetamol",
        manufacturer: "GSK"
      },
      {
        name: "Allegra 120mg",
        price: 90,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 30,
        genericName: "Fexofenadine",
        manufacturer: "Sanofi"
      },
      {
        name: "Montair LC",
        price: 96,
        category: "Allergy Relief",
        availability: "In Stock",
        stockQuantity: 38,
        genericName: "Montelukast + Levocetirizine",
        manufacturer: "Cipla"
      },
      {
        name: "Azithromycin 500mg",
        price: 122,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 28,
        genericName: "Azithromycin",
        manufacturer: "Zydus"
      },
      {
        name: "Amoxicillin 500mg",
        price: 85,
        category: "Antibiotic",
        availability: "In Stock",
        stockQuantity: 45,
        genericName: "Amoxicillin",
        manufacturer: "Dr. Reddy's"
      }
    ]
  }
];

// Helper function to calculate delivery charge
export const calculateDeliveryCharge = (
  distanceKm: number,
  deliveryType: 'delivery' | 'pickup',
  store: EnhancedMedicalStore
): number => {
  if (deliveryType === 'pickup') {
    return 0;
  }

  if (distanceKm < 2) {
    return 15;
  } else {
    return Math.min(distanceKm * 2, 40);
  }
};

// Helper function to check if medicine requires prescription
export const requiresPrescription = (medicineName: string): boolean => {
  const prescriptionRequired = [
    "Azithromycin",
    "Amoxicillin",
    "Montair LC",
    "Antibiotic"
  ];
  
  return prescriptionRequired.some(med => 
    medicineName.toLowerCase().includes(med.toLowerCase())
  );
};
