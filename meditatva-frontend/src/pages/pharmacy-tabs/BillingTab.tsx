import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Search, Plus, ShoppingCart, Trash2, FileText, Clock,
  Download, X, User, Phone, Mail, CreditCard
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const medicineDatabase = [
  { id: 1, name: "Paracetamol 500mg", price: 5, stock: 450 },
  { id: 2, name: "Ibuprofen 400mg", price: 8, stock: 250 },
  { id: 3, name: "Amoxicillin 250mg", price: 12, stock: 180 },
  { id: 4, name: "Cetirizine 10mg", price: 6, stock: 320 },
  { id: 5, name: "Omeprazole 20mg", price: 10, stock: 190 },
  { id: 6, name: "Azithromycin 500mg", price: 15, stock: 120 },
  { id: 7, name: "Metformin 500mg", price: 8, stock: 280 },
  { id: 8, name: "Atorvastatin 10mg", price: 12, stock: 150 },
];

const billingHistory = [
  { id: "INV-001", patient: "Rajesh Kumar", date: "2025-11-01", total: 245, status: "Paid" },
  { id: "INV-002", patient: "Priya Sharma", date: "2025-11-02", total: 180, status: "Paid" },
  { id: "INV-003", patient: "Amit Patel", date: "2025-11-03", total: 420, status: "Pending" },
  { id: "INV-004", patient: "Sneha Gupta", date: "2025-11-04", total: 320, status: "Paid" },
  { id: "INV-005", patient: "Vikram Singh", date: "2025-11-05", total: 150, status: "Pending" },
];

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

export const BillingTab = memo(() => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [paymentType, setPaymentType] = useState("Cash");

  const filteredMedicines = medicineDatabase.filter(med =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (medicine: typeof medicineDatabase[0]) => {
    const existingItem = cart.find(item => item.id === medicine.id);
    if (existingItem) {
      if (existingItem.quantity < medicine.stock) {
        setCart(cart.map(item =>
          item.id === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
        toast.success(`${medicine.name} quantity increased`);
      } else {
        toast.error("Not enough stock available");
      }
    } else {
      setCart([...cart, { ...medicine, quantity: 1 }]);
      toast.success(`${medicine.name} added to cart`);
    }
  };

  const removeFromCart = (id: number) => {
    const item = cart.find(i => i.id === id);
    setCart(cart.filter(item => item.id !== id));
    toast.success(`${item?.name} removed from cart`);
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    const item = cart.find(i => i.id === id);
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    if (item && newQuantity > item.stock) {
      toast.error("Not enough stock available");
      return;
    }
    setCart(cart.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.05; // 5% GST
  };

  const calculatePlatformFee = () => {
    return calculateSubtotal() * 0.02; // 2% platform fee
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculatePlatformFee();
  };

  const handleGenerateInvoice = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty!");
      return;
    }
    setShowBillingModal(true);
  };

  const handleConfirmInvoice = () => {
    if (!patientName || !contactNumber) {
      toast.error("Please fill in patient details");
      return;
    }

    try {
      // Generate PDF Invoice
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      
      // Header
      pdf.setFillColor(27, 108, 168);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text("MEDITATVA PHARMACY", pageWidth / 2, 20, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text("Tax Invoice", pageWidth / 2, 30, { align: 'center' });

      // Invoice details
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.text(`Invoice #: INV-${Date.now()}`, 20, 50);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 57);
      pdf.text(`Payment: ${paymentType}`, 20, 64);

      // Patient details
      pdf.setFontSize(12);
      pdf.text("Bill To:", 20, 80);
      pdf.setFontSize(10);
      pdf.text(patientName, 20, 87);
      pdf.text(contactNumber, 20, 94);
      if (email) pdf.text(email, 20, 101);

      // Table header
      let yPos = 120;
      pdf.setFillColor(232, 244, 248);
      pdf.rect(20, yPos - 5, pageWidth - 40, 10, 'F');
      pdf.setFontSize(10);
      pdf.text("Medicine", 25, yPos);
      pdf.text("Qty", 120, yPos);
      pdf.text("Price", 145, yPos);
      pdf.text("Total", 170, yPos);

      // Table rows
      yPos += 10;
      cart.forEach((item) => {
        pdf.text(item.name, 25, yPos);
        pdf.text(item.quantity.toString(), 120, yPos);
        pdf.text(`₹${item.price}`, 145, yPos);
        pdf.text(`₹${(item.price * item.quantity).toFixed(2)}`, 170, yPos);
        yPos += 7;
      });

      // Totals
      yPos += 10;
      pdf.line(20, yPos, pageWidth - 20, yPos);
      yPos += 10;
      pdf.text("Subtotal:", 120, yPos);
      pdf.text(`₹${calculateSubtotal().toFixed(2)}`, 170, yPos);
      yPos += 7;
      pdf.text("GST (5%):", 120, yPos);
      pdf.text(`₹${calculateTax().toFixed(2)}`, 170, yPos);
      yPos += 7;
      pdf.text("Platform Fee (2%):", 120, yPos);
      pdf.text(`₹${calculatePlatformFee().toFixed(2)}`, 170, yPos);
      yPos += 10;
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text("TOTAL:", 120, yPos);
      pdf.text(`₹${calculateTotal().toFixed(2)}`, 170, yPos);

      // Footer
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'normal');
      pdf.text("Thank you for your business!", pageWidth / 2, 280, { align: 'center' });

      // Save PDF
      pdf.save(`invoice-${Date.now()}.pdf`);
      
      toast.success("Invoice generated successfully!");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Failed to generate PDF. Please try again.");
      return;
    }
    
    // Reset form
    setShowBillingModal(false);
    setCart([]);
    setPatientName("");
    setContactNumber("");
    setEmail("");
    setPaymentType("Cash");
  };

  return (
    <>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="space-y-4"
      >
        {/* Search and Add to Cart */}
        <Card
          className="p-4"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(27, 108, 168, 0.15)',
            boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
          }}
        >
          <h3 className="text-lg font-bold text-[#0A2342] mb-3">Search Medicines</h3>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#5A6A85]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by medicine name..."
                className="pl-10 bg-white border-[#4FC3F7]/30 text-[#0A2342] placeholder:text-[#5A6A85] focus:border-[#1B6CA8] focus:ring-[#1B6CA8]"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredMedicines.map((med) => (
              <motion.div
                key={med.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#F7F9FC] border border-[#4FC3F7]/20"
                whileHover={{ scale: 1.01, backgroundColor: '#E8F4F8' }}
              >
                <div>
                  <p className="font-semibold text-[#0A2342]">{med.name}</p>
                  <p className="text-sm text-[#5A6A85]">₹{med.price} • Stock: {med.stock}</p>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="sm"
                    onClick={() => addToCart(med)}
                    disabled={med.stock === 0}
                    className="bg-gradient-to-r from-[#1B6CA8] to-[#4FC3F7] hover:from-[#4FC3F7] hover:to-[#1B6CA8] text-white font-semibold"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Cart and Invoice */}
        <Card
          className="p-4"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(27, 108, 168, 0.15)',
            boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
          }}
        >
          <h3 className="text-lg font-bold text-[#0A2342] mb-3 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[#1B6CA8]" />
            Invoice Items
          </h3>
          
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-[#5A6A85] mx-auto mb-3" />
              <p className="text-[#5A6A85]">Cart is empty. Add medicines to create invoice.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#F7F9FC] border border-[#4FC3F7]/20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-[#0A2342]">{item.name}</p>
                      <p className="text-sm text-[#5A6A85]">₹{item.price} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-[#4FC3F7]/30 hover:bg-[#E8F4F8]"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="text-[#0A2342] w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-[#4FC3F7]/30 hover:bg-[#E8F4F8]"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          +
                        </Button>
                      </div>
                      <p className="text-[#012A4A] font-bold w-20 text-right">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[#E74C3C] hover:text-[#C0392B] hover:bg-[#E74C3C]/10"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-[#4FC3F7]/20 pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-[#5A6A85]">
                  <span>Subtotal:</span>
                  <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#5A6A85]">
                  <span>GST (5%):</span>
                  <span className="font-medium">₹{calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#5A6A85]">
                  <span>Platform Fee (2%):</span>
                  <span className="font-medium">₹{calculatePlatformFee().toFixed(2)}</span>
                </div>
                <div className="border-t border-[#4FC3F7]/30 pt-2 mt-2"></div>
                <div className="flex justify-between text-xl font-bold text-[#0A2342]">
                  <span>Final Total:</span>
                  <span className="text-[#1B6CA8]">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleGenerateInvoice}
                  className="w-full bg-gradient-to-r from-[#1B6CA8] to-[#4FC3F7] hover:from-[#4FC3F7] hover:to-[#1B6CA8] text-white font-semibold text-lg py-6 shadow-lg"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Generate Invoice
                </Button>
              </motion.div>
            </>
          )}
        </Card>

        {/* Billing History */}
        <Card
          className="p-4"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(27, 108, 168, 0.15)',
            boxShadow: '0 4px 20px rgba(27, 108, 168, 0.08)',
          }}
        >
          <h3 className="text-lg font-bold text-[#0A2342] mb-3 flex items-center gap-2">
            <Clock className="h-6 w-6 text-[#1B6CA8]" />
            Billing History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#4FC3F7]/20">
                  <th className="text-left py-2 text-[#0A2342] font-semibold">Invoice ID</th>
                  <th className="text-left py-2 text-[#0A2342] font-semibold">Patient</th>
                  <th className="text-left py-2 text-[#0A2342] font-semibold">Date</th>
                  <th className="text-left py-2 text-[#0A2342] font-semibold">Total</th>
                  <th className="text-left py-2 text-[#0A2342] font-semibold">Status</th>
                  <th className="text-left py-2 text-[#0A2342] font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((invoice) => (
                  <motion.tr
                    key={invoice.id}
                    className="border-b border-[#4FC3F7]/10 hover:bg-[#E8F4F8]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="py-3 text-[#0A2342] font-medium">{invoice.id}</td>
                    <td className="py-3 text-[#0A2342]">{invoice.patient}</td>
                    <td className="py-3 text-[#5A6A85]">{invoice.date}</td>
                    <td className="py-3 text-[#0A2342] font-semibold">₹{invoice.total}</td>
                    <td className="py-3">
                      <Badge
                        className={
                          invoice.status === "Paid"
                            ? "bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/30 font-semibold"
                            : "bg-[#F1C40F]/10 text-[#F39C12] border-[#F1C40F]/30 font-semibold"
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Button size="sm" variant="ghost" className="text-[#1B6CA8] hover:text-[#4FC3F7] hover:bg-[#E8F4F8]">
                        <Download className="h-4 w-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Patient Billing Modal */}
      <AnimatePresence>
        {showBillingModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBillingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <Card
                className="overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(27, 108, 168, 0.2)',
                }}
              >
                <div
                  className="p-6 border-b relative"
                  style={{
                    background: 'linear-gradient(135deg, #1B6CA8 0%, #4FC3F7 100%)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <FileText className="h-7 w-7" />
                      Patient Information
                    </h3>
                    <Button
                      onClick={() => setShowBillingModal(false)}
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientName" className="text-[#0A2342] font-semibold flex items-center gap-2">
                      <User className="h-4 w-4 text-[#1B6CA8]" />
                      Patient Name *
                    </Label>
                    <Input
                      id="patientName"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Enter patient name"
                      className="border-[#4FC3F7]/30 focus:border-[#1B6CA8]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactNumber" className="text-[#0A2342] font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#1B6CA8]" />
                      Contact Number *
                    </Label>
                    <Input
                      id="contactNumber"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="Enter contact number"
                      className="border-[#4FC3F7]/30 focus:border-[#1B6CA8]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#0A2342] font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#1B6CA8]" />
                      Email (Optional)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="border-[#4FC3F7]/30 focus:border-[#1B6CA8]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentType" className="text-[#0A2342] font-semibold flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-[#1B6CA8]" />
                      Payment Method
                    </Label>
                    <select
                      id="paymentType"
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                      className="w-full p-2 border border-[#4FC3F7]/30 rounded-md focus:border-[#1B6CA8] focus:outline-none focus:ring-1 focus:ring-[#1B6CA8]"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Insurance">Insurance</option>
                    </select>
                  </div>

                  <div className="border-t border-[#4FC3F7]/20 pt-4 mt-6">
                    <h4 className="font-bold text-[#0A2342] mb-3">Invoice Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#5A6A85]">Subtotal:</span>
                        <span className="font-semibold text-[#0A2342]">₹{calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5A6A85]">GST (5%):</span>
                        <span className="font-semibold text-[#0A2342]">₹{calculateTax().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5A6A85]">Platform Fee (2%):</span>
                        <span className="font-semibold text-[#0A2342]">₹{calculatePlatformFee().toFixed(2)}</span>
                      </div>
                      <div className="border-t border-[#4FC3F7]/20 pt-2 mt-2 flex justify-between">
                        <span className="text-lg font-bold text-[#0A2342]">Total Amount:</span>
                        <span className="text-lg font-bold text-[#1B6CA8]">₹{calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => setShowBillingModal(false)}
                      variant="outline"
                      className="flex-1 border-[#4FC3F7]/30 text-[#1B6CA8] hover:bg-[#E8F4F8]"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmInvoice}
                      className="flex-1 bg-gradient-to-r from-[#1B6CA8] to-[#4FC3F7] hover:from-[#4FC3F7] hover:to-[#1B6CA8] text-white font-semibold"
                    >
                      Confirm & Generate PDF
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

BillingTab.displayName = "BillingTab";
