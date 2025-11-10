import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ShoppingCart, Package, Truck, CheckCircle, 
  MapPin, Clock, CreditCard,
  Eye, X, RotateCcw, Phone, Store, Calendar
} from "lucide-react";
import { toast } from "sonner";
import { useOrders, Order } from "@/contexts/OrderContext";

export const MedicineOrders = () => {
  const { state, cancelOrder, reorder } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredOrders = state.orders.filter(order => {
    if (filterStatus === "all") return true;
    if (filterStatus === "active") return ["pending", "confirmed", "processing", "dispatched"].includes(order.status);
    if (filterStatus === "delivered") return order.status === "delivered";
    return true;
  });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
      case "confirmed": return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "processing": return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "dispatched": return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
      case "delivered": return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      case "cancelled": return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "confirmed": return <CheckCircle className="w-4 h-4" />;
      case "processing": return <Package className="w-4 h-4" />;
      case "dispatched": return <Truck className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <X className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      cancelOrder(orderId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Medicine Orders</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Track your medicine orders and deliveries
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => setFilterStatus("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={filterStatus === "active" ? "default" : "outline"}
            onClick={() => setFilterStatus("active")}
            size="sm"
          >
            Active
          </Button>
          <Button
            variant={filterStatus === "delivered" ? "default" : "outline"}
            onClick={() => setFilterStatus("delivered")}
            size="sm"
          >
            Delivered
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{state.orders.length}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Orders</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {state.orders.filter(o => ["pending", "confirmed"].includes(o.status)).length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-indigo-500/20">
              <Truck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {state.orders.filter(o => ["processing", "dispatched"].includes(o.status)).length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">In Transit</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-500/20">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {state.orders.filter(o => o.status === "delivered").length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Delivered</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="p-12 text-center backdrop-blur-xl bg-white/80 dark:bg-slate-800/80">
            <ShoppingCart className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No orders yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Start by finding medicines and placing your first order
            </p>
          </Card>
        ) : (
          <AnimatePresence>
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-5 backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 hover:shadow-lg transition-all">
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500/20 to-blue-500/20">
                          <ShoppingCart className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div>
                          <h3 className="text-slate-900 dark:text-white font-semibold">{order.orderNumber}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{order.pharmacy.name}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} border flex items-center gap-1 w-fit`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {order.medicines.map((medicine, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white text-sm">{medicine.name}</p>
                              {medicine.dosage && (
                                <p className="text-xs text-slate-600 dark:text-slate-400">{medicine.dosage}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-600 dark:text-slate-400">Qty: {medicine.quantity}</p>
                            <p className="font-semibold text-teal-600 dark:text-teal-400">₹{medicine.price * medicine.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Total Amount</p>
                        <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">₹{order.totalAmount}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        {order.status !== "delivered" && order.status !== "cancelled" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelOrder(order.id)}
                            className="gap-2 text-red-600 dark:text-red-400"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </Button>
                        )}
                        {order.status === "delivered" && (
                          <Button
                            size="sm"
                            onClick={() => reorder(order.id)}
                            className="gap-2 bg-gradient-to-r from-teal-600 to-blue-600"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Reorder
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Order Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Card className="p-4 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Order Number</p>
                      <p className="text-lg font-bold">{selectedOrder.orderNumber}</p>
                    </div>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="capitalize ml-1">{selectedOrder.status}</span>
                    </Badge>
                  </div>
                </Card>

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Store className="w-5 h-5" />
                    {selectedOrder.pharmacy.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedOrder.pharmacy.address}</p>
                  <p className="text-sm flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {selectedOrder.pharmacy.phone}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Medicines</h3>
                  {selectedOrder.medicines.map((medicine, idx) => (
                    <div key={idx} className="flex justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                      <div>
                        <p className="font-medium">{medicine.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Qty: {medicine.quantity}</p>
                      </div>
                      <p className="font-bold text-teal-600 dark:text-teal-400">₹{medicine.price * medicine.quantity}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Order Date</p>
                    <p className="font-medium">{formatDate(selectedOrder.orderDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Payment</p>
                    <p className="font-medium">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Amount</p>
                    <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">₹{selectedOrder.totalAmount}</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};
