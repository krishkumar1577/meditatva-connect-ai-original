import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { toast } from 'sonner';

export interface OrderMedicine {
  name: string;
  dosage?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  pharmacy: {
    name: string;
    address: string;
    phone: string;
    distance?: string;
  };
  medicines: OrderMedicine[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'dispatched' | 'delivered' | 'cancelled';
  orderDate: string;
  estimatedDelivery: string;
  deliveryAddress: string;
  paymentMethod: string;
  prescriptionUrl?: string;
  deliveryCharge?: number;
  deliveryMethod?: 'delivery' | 'pickup';
  trackingNumber?: string;
  customerNotes?: string;
  pharmacyResponse?: {
    message: string;
    responseTime: string;
    confirmed: boolean;
  };
}

interface OrderState {
  orders: Order[];
  activeOrderId: string | null;
}

type OrderAction =
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { id: string; status: Order['status']; trackingNumber?: string } }
  | { type: 'CANCEL_ORDER'; payload: string }
  | { type: 'SET_ACTIVE_ORDER'; payload: string | null }
  | { type: 'ADD_PHARMACY_RESPONSE'; payload: { orderId: string; response: Order['pharmacyResponse'] } }
  | { type: 'REORDER'; payload: string };

interface OrderContextType {
  state: OrderState;
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'orderDate' | 'status'>) => string;
  updateOrderStatus: (id: string, status: Order['status'], trackingNumber?: string) => void;
  cancelOrder: (id: string) => void;
  setActiveOrder: (id: string | null) => void;
  addPharmacyResponse: (orderId: string, response: Order['pharmacyResponse']) => void;
  reorder: (orderId: string) => void;
  getOrderById: (id: string) => Order | undefined;
  getPendingOrders: () => Order[];
  getActiveOrders: () => Order[];
  getDeliveredOrders: () => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case 'ADD_ORDER': {
      const newOrders = [action.payload, ...state.orders];
      // Persist to localStorage
      localStorage.setItem('medicineOrders', JSON.stringify(newOrders));
      return {
        ...state,
        orders: newOrders,
        activeOrderId: action.payload.id,
      };
    }

    case 'UPDATE_ORDER_STATUS': {
      const updatedOrders = state.orders.map(order =>
        order.id === action.payload.id
          ? {
              ...order,
              status: action.payload.status,
              trackingNumber: action.payload.trackingNumber || order.trackingNumber,
            }
          : order
      );
      localStorage.setItem('medicineOrders', JSON.stringify(updatedOrders));
      return {
        ...state,
        orders: updatedOrders,
      };
    }

    case 'CANCEL_ORDER': {
      const cancelledOrders = state.orders.map(order =>
        order.id === action.payload
          ? { ...order, status: 'cancelled' as const }
          : order
      );
      localStorage.setItem('medicineOrders', JSON.stringify(cancelledOrders));
      return {
        ...state,
        orders: cancelledOrders,
      };
    }

    case 'SET_ACTIVE_ORDER':
      return {
        ...state,
        activeOrderId: action.payload,
      };

    case 'ADD_PHARMACY_RESPONSE': {
      const withResponse = state.orders.map(order =>
        order.id === action.payload.orderId
          ? { ...order, pharmacyResponse: action.payload.response }
          : order
      );
      localStorage.setItem('medicineOrders', JSON.stringify(withResponse));
      return {
        ...state,
        orders: withResponse,
      };
    }

    case 'REORDER': {
      const originalOrder = state.orders.find(o => o.id === action.payload);
      if (!originalOrder) return state;

      const newOrder: Order = {
        ...originalOrder,
        id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        orderNumber: `#${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        orderDate: new Date().toISOString(),
        status: 'pending',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        trackingNumber: undefined,
        pharmacyResponse: undefined,
      };

      const reorderedList = [newOrder, ...state.orders];
      localStorage.setItem('medicineOrders', JSON.stringify(reorderedList));
      return {
        ...state,
        orders: reorderedList,
        activeOrderId: newOrder.id,
      };
    }

    default:
      return state;
  }
};

// Initialize state from localStorage
const getInitialState = (): OrderState => {
  try {
    const stored = localStorage.getItem('medicineOrders');
    const orders = stored ? JSON.parse(stored) : [];
    return {
      orders,
      activeOrderId: null,
    };
  } catch {
    return {
      orders: [],
      activeOrderId: null,
    };
  }
};

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, getInitialState());

  const addOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'orderDate' | 'status'>) => {
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const orderNumber = `#${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      orderNumber,
      orderDate: new Date().toISOString(),
      status: 'pending',
    };

    dispatch({ type: 'ADD_ORDER', payload: newOrder });
    toast.success(`Order ${orderNumber} placed successfully! 🎉`);
    
    return orderId;
  };

  const updateOrderStatus = (id: string, status: Order['status'], trackingNumber?: string) => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { id, status, trackingNumber } });
    
    const statusMessages = {
      confirmed: '✅ Order confirmed by pharmacy',
      processing: '📦 Order is being processed',
      dispatched: '🚚 Order dispatched for delivery',
      delivered: '✨ Order delivered successfully',
      cancelled: '❌ Order cancelled',
    };
    
    if (status !== 'pending') {
      toast.success(statusMessages[status]);
    }
  };

  const cancelOrder = (id: string) => {
    dispatch({ type: 'CANCEL_ORDER', payload: id });
    toast.info('Order cancelled successfully');
  };

  const setActiveOrder = (id: string | null) => {
    dispatch({ type: 'SET_ACTIVE_ORDER', payload: id });
  };

  const addPharmacyResponse = (orderId: string, response: Order['pharmacyResponse']) => {
    dispatch({ type: 'ADD_PHARMACY_RESPONSE', payload: { orderId, response } });
  };

  const reorder = (orderId: string) => {
    dispatch({ type: 'REORDER', payload: orderId });
    toast.success('Order placed again! 🔄');
  };

  const getOrderById = (id: string) => state.orders.find(order => order.id === id);

  const getPendingOrders = () => 
    state.orders.filter(order => order.status === 'pending' || order.status === 'confirmed');

  const getActiveOrders = () =>
    state.orders.filter(order => 
      order.status === 'processing' || order.status === 'dispatched'
    );

  const getDeliveredOrders = () =>
    state.orders.filter(order => order.status === 'delivered');

  const value: OrderContextType = {
    state,
    addOrder,
    updateOrderStatus,
    cancelOrder,
    setActiveOrder,
    addPharmacyResponse,
    reorder,
    getOrderById,
    getPendingOrders,
    getActiveOrders,
    getDeliveredOrders,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
};
