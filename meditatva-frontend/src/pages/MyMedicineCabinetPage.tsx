import { useState, useReducer, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, UserPlus, Edit2, Trash2, MapPin, ShoppingCart,
  Calendar, Pill, User, Users, ChevronDown, ChevronUp,
  X, Clock, AlertCircle, CheckCircle2, Package,
  Search, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  quantityPerMonth: string;
  refillDate: string;
  preferredPharmacy?: string;
  ownerId: string; // "patient" or family member ID
}

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
}

interface CabinetState {
  medicines: Medicine[];
  familyMembers: FamilyMember[];
}

type CabinetAction =
  | { type: "ADD_MEDICINE"; payload: Medicine }
  | { type: "EDIT_MEDICINE"; payload: Medicine }
  | { type: "DELETE_MEDICINE"; payload: string }
  | { type: "ADD_FAMILY_MEMBER"; payload: FamilyMember }
  | { type: "DELETE_FAMILY_MEMBER"; payload: string };

// ============================================================================
// MOCK DATA
// ============================================================================

const INITIAL_STATE: CabinetState = {
  medicines: [
    {
      id: "med-1",
      name: "Metformin 500mg",
      dosage: "1-0-1",
      quantityPerMonth: "60 tablets",
      refillDate: "2025-11-15",
      preferredPharmacy: "HealthPlus Pharmacy",
      ownerId: "patient",
    },
    {
      id: "med-2",
      name: "Aspirin 75mg",
      dosage: "Once Daily",
      quantityPerMonth: "30 tablets",
      refillDate: "2025-11-10",
      preferredPharmacy: "MediCare Store",
      ownerId: "patient",
    },
    {
      id: "med-3",
      name: "Vitamin D3 60K",
      dosage: "Once Weekly",
      quantityPerMonth: "4 capsules",
      refillDate: "2025-12-01",
      ownerId: "patient",
    },
    {
      id: "med-4",
      name: "Thyroid Medication",
      dosage: "Once Daily (morning)",
      quantityPerMonth: "30 tablets",
      refillDate: "2025-11-08",
      preferredPharmacy: "City Pharmacy",
      ownerId: "family-1",
    },
    {
      id: "med-5",
      name: "Calcium Supplement",
      dosage: "1-0-1",
      quantityPerMonth: "60 tablets",
      refillDate: "2025-11-20",
      ownerId: "family-1",
    },
    {
      id: "med-6",
      name: "Multivitamin Syrup",
      dosage: "5ml Daily",
      quantityPerMonth: "200ml bottle",
      refillDate: "2025-11-12",
      preferredPharmacy: "Kids Care Pharmacy",
      ownerId: "family-2",
    },
  ],
  familyMembers: [
    {
      id: "family-1",
      name: "Sarah Johnson",
      relationship: "Spouse",
    },
    {
      id: "family-2",
      name: "Alex Johnson",
      relationship: "Child",
    },
  ],
};

const MEDICINE_SUGGESTIONS = [
  "Metformin 500mg",
  "Aspirin 75mg",
  "Atorvastatin 10mg",
  "Lisinopril 10mg",
  "Levothyroxine 50mcg",
  "Omeprazole 20mg",
  "Amlodipine 5mg",
  "Vitamin D3 60K",
  "Calcium Supplement",
  "Multivitamin",
  "Insulin Glargine",
  "Paracetamol 650mg",
];

const RELATIONSHIPS = [
  "Spouse",
  "Child",
  "Parent",
  "Sibling",
  "Grandparent",
  "Other",
];

// ============================================================================
// REDUCER
// ============================================================================

function cabinetReducer(state: CabinetState, action: CabinetAction): CabinetState {
  switch (action.type) {
    case "ADD_MEDICINE":
      return {
        ...state,
        medicines: [...state.medicines, action.payload],
      };
    case "EDIT_MEDICINE":
      return {
        ...state,
        medicines: state.medicines.map((med) =>
          med.id === action.payload.id ? action.payload : med
        ),
      };
    case "DELETE_MEDICINE":
      return {
        ...state,
        medicines: state.medicines.filter((med) => med.id !== action.payload),
      };
    case "ADD_FAMILY_MEMBER":
      return {
        ...state,
        familyMembers: [...state.familyMembers, action.payload],
      };
    case "DELETE_FAMILY_MEMBER":
      return {
        ...state,
        familyMembers: state.familyMembers.filter((fm) => fm.id !== action.payload),
        medicines: state.medicines.filter((med) => med.ownerId !== action.payload),
      };
    default:
      return state;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getRefillStatus(refillDate: string): {
  status: "on-time" | "upcoming" | "overdue";
  color: string;
  bgColor: string;
  label: string;
} {
  const today = new Date();
  const refill = new Date(refillDate);
  const diffDays = Math.ceil((refill.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: "overdue",
      color: "text-red-700 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
      label: "Overdue",
    };
  } else if (diffDays <= 3) {
    return {
      status: "upcoming",
      color: "text-orange-700 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
      label: "Due Soon",
    };
  } else {
    return {
      status: "on-time",
      color: "text-green-700 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
      label: "On Time",
    };
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const MyMedicineCabinetPage = memo(() => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(cabinetReducer, INITIAL_STATE);
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [expandedFamilyMembers, setExpandedFamilyMembers] = useState<Set<string>>(
    new Set()
  );

  // Get medicines by owner
  const patientMedicines = state.medicines.filter((med) => med.ownerId === "patient");
  const getFamilyMedicines = (familyId: string) =>
    state.medicines.filter((med) => med.ownerId === familyId);

  // Toggle family member expansion
  const toggleFamilyMember = (id: string) => {
    const newExpanded = new Set(expandedFamilyMembers);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFamilyMembers(newExpanded);
  };

  // Handle medicine actions
  const handleEditMedicine = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setShowAddMedicine(true);
  };

  const handleDeleteMedicine = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from your cabinet?`)) {
      dispatch({ type: "DELETE_MEDICINE", payload: id });
      toast.success(`${name} removed from cabinet`);
    }
  };

  const handleFindNearby = (medicineName: string) => {
    toast.info(`Searching for ${medicineName} near you...`);
    // TODO: Integrate with Find Medicine feature
    navigate("/patient/modern?section=find-medicine");
  };

  const handleRequestRefill = (medicine: Medicine) => {
    toast.success(`Refill request submitted for ${medicine.name}`);
    // TODO: Integrate with pharmacy ordering system
  };

  const handleDeleteFamily = (id: string, name: string) => {
    if (
      confirm(
        `Remove ${name} from family members? This will also delete all their medicines.`
      )
    ) {
      dispatch({ type: "DELETE_FAMILY_MEMBER", payload: id });
      toast.success(`${name} removed from family members`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg"
              >
                <Package className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                My Medicine Cabinet
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
              Manage your medications and family members' prescriptions in one place
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowAddFamily(true)}
              variant="outline"
              className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Family Member
            </Button>
            <Button
              onClick={() => {
                setEditingMedicine(null);
                setShowAddMedicine(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Medicine
            </Button>
          </div>
        </motion.div>

        {/* Patient's Medicines */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Your Medicines
            </h2>
            <Badge
              variant="outline"
              className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700"
            >
              {patientMedicines.length} active
            </Badge>
          </div>

          {patientMedicines.length === 0 ? (
            <EmptyState
              icon={<Pill className="w-16 h-16 text-purple-400 dark:text-purple-600" />}
              title="No medicines added yet"
              description="Start by adding your regular medications to keep track of refills"
              actionLabel="Add First Medicine"
              onAction={() => setShowAddMedicine(true)}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {patientMedicines.map((medicine, index) => (
                <MedicineCard
                  key={medicine.id}
                  medicine={medicine}
                  index={index}
                  onEdit={handleEditMedicine}
                  onDelete={handleDeleteMedicine}
                  onFindNearby={handleFindNearby}
                  onRequestRefill={handleRequestRefill}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Family Members' Medicines */}
        {state.familyMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                <Users className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Family Members
              </h2>
              <Badge
                variant="outline"
                className="bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-700"
              >
                {state.familyMembers.length}
              </Badge>
            </div>

            <div className="space-y-4">
              {state.familyMembers.map((member) => (
                <FamilyMemberSection
                  key={member.id}
                  member={member}
                  medicines={getFamilyMedicines(member.id)}
                  isExpanded={expandedFamilyMembers.has(member.id)}
                  onToggle={() => toggleFamilyMember(member.id)}
                  onDelete={handleDeleteFamily}
                  onEditMedicine={handleEditMedicine}
                  onDeleteMedicine={handleDeleteMedicine}
                  onFindNearby={handleFindNearby}
                  onRequestRefill={handleRequestRefill}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state for family members */}
        {state.familyMembers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <EmptyState
              icon={<Users className="w-16 h-16 text-pink-400 dark:text-pink-600" />}
              title="No family members added"
              description="Add family members to manage their medications alongside yours"
              actionLabel="Add Family Member"
              onAction={() => setShowAddFamily(true)}
            />
          </motion.div>
        )}
      </div>

      {/* Add/Edit Medicine Modal */}
      <AnimatePresence>
        {showAddMedicine && (
          <AddMedicineModal
            medicine={editingMedicine}
            familyMembers={state.familyMembers}
            onClose={() => {
              setShowAddMedicine(false);
              setEditingMedicine(null);
            }}
            onSubmit={(medicine) => {
              if (editingMedicine) {
                dispatch({ type: "EDIT_MEDICINE", payload: medicine });
                toast.success(`${medicine.name} updated successfully`);
              } else {
                dispatch({ type: "ADD_MEDICINE", payload: medicine });
                toast.success(`${medicine.name} added to cabinet`);
              }
              setShowAddMedicine(false);
              setEditingMedicine(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Add Family Member Modal */}
      <AnimatePresence>
        {showAddFamily && (
          <AddFamilyMemberModal
            onClose={() => setShowAddFamily(false)}
            onSubmit={(member) => {
              dispatch({ type: "ADD_FAMILY_MEMBER", payload: member });
              toast.success(`${member.name} added to family members`);
              setShowAddFamily(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
});

MyMedicineCabinetPage.displayName = "MyMedicineCabinetPage";

// ============================================================================
// MEDICINE CARD COMPONENT
// ============================================================================

interface MedicineCardProps {
  medicine: Medicine;
  index: number;
  onEdit: (medicine: Medicine) => void;
  onDelete: (id: string, name: string) => void;
  onFindNearby: (name: string) => void;
  onRequestRefill: (medicine: Medicine) => void;
}

const MedicineCard = memo(
  ({ medicine, index, onEdit, onDelete, onFindNearby, onRequestRefill }: MedicineCardProps) => {
    const refillStatus = getRefillStatus(medicine.refillDate);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        layout
      >
        <Card className="backdrop-blur-xl bg-white/90 dark:bg-slate-800/90 border-purple-200 dark:border-purple-900 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 overflow-hidden group h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-pink-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-purple-500/5 transition-all duration-500" />

          <div className="relative p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2">
                  {medicine.name}
                </h3>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  {medicine.dosage}
                </p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg shrink-0">
                <Pill className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">
                  {medicine.quantityPerMonth}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">
                  Due: {formatDate(medicine.refillDate)}
                </span>
              </div>

              {medicine.preferredPharmacy && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300 line-clamp-1">
                    {medicine.preferredPharmacy}
                  </span>
                </div>
              )}
            </div>

            {/* Refill Status Badge */}
            <div className={`p-3 rounded-lg border ${refillStatus.bgColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {refillStatus.status === "overdue" && (
                    <AlertCircle className={`w-4 h-4 ${refillStatus.color}`} />
                  )}
                  {refillStatus.status === "upcoming" && (
                    <Clock className={`w-4 h-4 ${refillStatus.color}`} />
                  )}
                  {refillStatus.status === "on-time" && (
                    <CheckCircle2 className={`w-4 h-4 ${refillStatus.color}`} />
                  )}
                  <span className={`text-sm font-semibold ${refillStatus.color}`}>
                    {refillStatus.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-100 dark:border-purple-900">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(medicine)}
                className="gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                title="Edit medicine"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(medicine.id, medicine.name)}
                className="gap-2 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                title="Remove medicine"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Remove</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFindNearby(medicine.name)}
                className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                title="Find nearby pharmacies"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Find</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRequestRefill(medicine)}
                className="gap-2 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400"
                title="Request refill"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refill</span>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }
);

MedicineCard.displayName = "MedicineCard";

// ============================================================================
// FAMILY MEMBER SECTION COMPONENT
// ============================================================================

interface FamilyMemberSectionProps {
  member: FamilyMember;
  medicines: Medicine[];
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: (id: string, name: string) => void;
  onEditMedicine: (medicine: Medicine) => void;
  onDeleteMedicine: (id: string, name: string) => void;
  onFindNearby: (name: string) => void;
  onRequestRefill: (medicine: Medicine) => void;
}

const FamilyMemberSection = memo(
  ({
    member,
    medicines,
    isExpanded,
    onToggle,
    onDelete,
    onEditMedicine,
    onDeleteMedicine,
    onFindNearby,
    onRequestRefill,
  }: FamilyMemberSectionProps) => {
    return (
      <motion.div layout>
        <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border-pink-200 dark:border-pink-900 overflow-hidden">
          {/* Header */}
          <button
            onClick={onToggle}
            className="w-full p-5 flex items-center justify-between hover:bg-pink-50/50 dark:hover:bg-pink-900/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {member.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {member.relationship}
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-700"
              >
                {medicines.length} medicine{medicines.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(member.id, member.name);
                }}
                className="hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                )}
              </motion.div>
            </div>
          </button>

          {/* Medicines Grid */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-5 pt-0 border-t border-pink-100 dark:border-pink-900">
                  {medicines.length === 0 ? (
                    <div className="text-center py-8">
                      <Pill className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-600 dark:text-slate-400">
                        No medicines added for {member.name}
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {medicines.map((medicine, index) => (
                        <MedicineCard
                          key={medicine.id}
                          medicine={medicine}
                          index={index}
                          onEdit={onEditMedicine}
                          onDelete={onDeleteMedicine}
                          onFindNearby={onFindNearby}
                          onRequestRefill={onRequestRefill}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    );
  }
);

FamilyMemberSection.displayName = "FamilyMemberSection";

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

const EmptyState = memo(
  ({ icon, title, description, actionLabel, onAction }: EmptyStateProps) => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 p-12 text-center border-2 border-dashed border-purple-200 dark:border-purple-800">
          <div className="space-y-4">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {icon}
            </motion.div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                {title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                {description}
              </p>
            </div>
            <Button
              onClick={onAction}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
            >
              {actionLabel}
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }
);

EmptyState.displayName = "EmptyState";

// ============================================================================
// ADD/EDIT MEDICINE MODAL
// ============================================================================

interface AddMedicineModalProps {
  medicine: Medicine | null;
  familyMembers: FamilyMember[];
  onClose: () => void;
  onSubmit: (medicine: Medicine) => void;
}

const AddMedicineModal = memo(
  ({ medicine, familyMembers, onClose, onSubmit }: AddMedicineModalProps) => {
    const [formData, setFormData] = useState({
      name: medicine?.name || "",
      dosage: medicine?.dosage || "",
      quantityPerMonth: medicine?.quantityPerMonth || "",
      refillDate: medicine?.refillDate || "",
      preferredPharmacy: medicine?.preferredPharmacy || "",
      ownerId: medicine?.ownerId || "patient",
    });

    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

    const handleNameChange = (value: string) => {
      setFormData({ ...formData, name: value });
      if (value.length >= 2) {
        const filtered = MEDICINE_SUGGESTIONS.filter((med) =>
          med.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5);
        setFilteredSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setShowSuggestions(false);
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.name || !formData.dosage || !formData.quantityPerMonth || !formData.refillDate) {
        toast.error("Please fill in all required fields");
        return;
      }

      const medicineData: Medicine = {
        id: medicine?.id || `med-${Date.now()}`,
        ...formData,
      };

      onSubmit(medicineData);
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-200 dark:border-purple-800"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 border-b border-purple-700">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">
                  {medicine ? "Edit Medicine" : "Add New Medicine"}
                </h2>
                <p className="text-purple-100">
                  {medicine ? "Update medicine details" : "Add a medicine to your cabinet"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20 shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Medicine Name */}
            <div className="space-y-2 relative">
              <Label htmlFor="name" className="text-sm font-medium">
                Medicine Name *
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onFocus={() => formData.name.length >= 2 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Enter medicine name"
                  className="pl-10 border-purple-200 dark:border-purple-800 focus:border-purple-500"
                  required
                />
              </div>

              {/* Autocomplete Suggestions */}
              <AnimatePresence>
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 rounded-lg shadow-lg overflow-hidden"
                  >
                    {filteredSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, name: suggestion });
                          setShowSuggestions(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center gap-2 border-b border-purple-100 dark:border-purple-900 last:border-0"
                      >
                        <Pill className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-slate-700 dark:text-slate-300">{suggestion}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dosage */}
            <div className="space-y-2">
              <Label htmlFor="dosage" className="text-sm font-medium">
                Dosage *
              </Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g., Once Daily, 1-0-1, 5ml twice daily"
                className="border-purple-200 dark:border-purple-800 focus:border-purple-500"
                required
              />
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">
                Quantity per Month *
              </Label>
              <Input
                id="quantity"
                value={formData.quantityPerMonth}
                onChange={(e) =>
                  setFormData({ ...formData, quantityPerMonth: e.target.value })
                }
                placeholder="e.g., 30 tablets, 200ml bottle"
                className="border-purple-200 dark:border-purple-800 focus:border-purple-500"
                required
              />
            </div>

            {/* Refill Date */}
            <div className="space-y-2">
              <Label htmlFor="refillDate" className="text-sm font-medium">
                Next Refill Date *
              </Label>
              <Input
                id="refillDate"
                type="date"
                value={formData.refillDate}
                onChange={(e) => setFormData({ ...formData, refillDate: e.target.value })}
                className="border-purple-200 dark:border-purple-800 focus:border-purple-500"
                required
              />
            </div>

            {/* Preferred Pharmacy */}
            <div className="space-y-2">
              <Label htmlFor="pharmacy" className="text-sm font-medium">
                Preferred Pharmacy (Optional)
              </Label>
              <Input
                id="pharmacy"
                value={formData.preferredPharmacy}
                onChange={(e) =>
                  setFormData({ ...formData, preferredPharmacy: e.target.value })
                }
                placeholder="Enter pharmacy name"
                className="border-purple-200 dark:border-purple-800 focus:border-purple-500"
              />
            </div>

            {/* Owner Selection */}
            <div className="space-y-2">
              <Label htmlFor="owner" className="text-sm font-medium">
                Medicine For *
              </Label>
              <Select
                value={formData.ownerId}
                onValueChange={(value) => setFormData({ ...formData, ownerId: value })}
              >
                <SelectTrigger className="border-purple-200 dark:border-purple-800 focus:border-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Myself</SelectItem>
                  {familyMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.relationship})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
              >
                {medicine ? "Update Medicine" : "Add Medicine"}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  }
);

AddMedicineModal.displayName = "AddMedicineModal";

// ============================================================================
// ADD FAMILY MEMBER MODAL
// ============================================================================

interface AddFamilyMemberModalProps {
  onClose: () => void;
  onSubmit: (member: FamilyMember) => void;
}

const AddFamilyMemberModal = memo(({ onClose, onSubmit }: AddFamilyMemberModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.relationship) {
      toast.error("Please fill in all fields");
      return;
    }

    const member: FamilyMember = {
      id: `family-${Date.now()}`,
      ...formData,
    };

    onSubmit(member);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border-2 border-pink-200 dark:border-pink-800"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-6 rounded-t-2xl border-b border-pink-700">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">Add Family Member</h2>
              <p className="text-pink-100">Add a family member to manage their medications</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="memberName" className="text-sm font-medium">
              Name *
            </Label>
            <Input
              id="memberName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter family member's name"
              className="border-pink-200 dark:border-pink-800 focus:border-pink-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship" className="text-sm font-medium">
              Relationship *
            </Label>
            <Select
              value={formData.relationship}
              onValueChange={(value) => setFormData({ ...formData, relationship: value })}
            >
              <SelectTrigger className="border-pink-200 dark:border-pink-800 focus:border-pink-500">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIPS.map((rel) => (
                  <SelectItem key={rel} value={rel}>
                    {rel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-lg hover:shadow-pink-500/50 transition-all duration-300"
            >
              Add Member
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
});

AddFamilyMemberModal.displayName = "AddFamilyMemberModal";
