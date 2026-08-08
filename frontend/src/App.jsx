import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import InventoryTab from './components/InventoryTab';
import InvoiceTab from './components/InvoiceTab';
import AnalyticsTab from './components/AnalyticsTab';
import HistoryTab from './components/HistoryTab';
import AlertsTab from './components/AlertsTab';
import ASbot from './components/ASbot';
import SignInModal from './components/SignInModal';
import { INITIAL_INVENTORY, INITIAL_ORDERS } from './data/mockData';
import { isAdminLoggedIn, logoutAdmin } from './services/auth';
import { 
  fetchInventory, 
  createFootwear, 
  updateFootwear, 
  deleteFootwear, 
  fetchOrders, 
  createOrder,
  updateOrder,
  deleteOrder,
  restockFootwear
} from './services/api';

/* ── Local persistence layer ────────────────────────────────
   Keeps admin changes (add / edit / delete / restock / orders)
   saved across refreshes even when the Django backend is
   unreachable. The backend stays the source of truth whenever
   it is online. */
const STORAGE_KEYS = { inventory: 'as_inventory', orders: 'as_orders' };

const loadLocalData = () => {
  try {
    const inventory = JSON.parse(localStorage.getItem(STORAGE_KEYS.inventory));
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.orders));
    return {
      inventory: Array.isArray(inventory) ? inventory : null,
      orders: Array.isArray(orders) ? orders : null,
    };
  } catch (e) {
    console.error('Failed to read local data:', e);
    return { inventory: null, orders: null };
  }
};

const persistData = (inventory, orders) => {
  try {
    localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(inventory));
    localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
    return true;
  } catch (e) {
    // Base64 shoe images can overflow the ~5MB localStorage quota. The data
    // still lives in memory and on the backend, so this is non-fatal.
    console.error('Failed to save local data (localStorage may be full):', e);
    return false;
  }
};

const orderPayload = (o) => ({
  invoice_id: o.id || o.invoice_id,
  customerName: o.customerName,
  customerPhone: o.customerPhone || '',
  customerEmail: o.customerEmail || '',
  date: o.date,
  subtotal: o.subtotal,
  discount: o.discount || 0,
  discountAmount: o.discountAmount || 0,
  tax: o.tax || 0,
  total: o.total,
  paymentMethod: o.paymentMethod,
  status: o.status || 'Completed',
  items: (o.items || []).map(it => ({
    footwear_id: it.id || it.footwear_id || it.sku_id,
    name: it.name,
    price: it.price,
    qty: it.qty,
    size: it.size || 9
  }))
});

/* Push the admin's local store into the Django backend so the two
   never disagree: backend items/orders that were deleted locally are
   removed, and local additions/edits are written through. */
const reconcileWithBackend = async (localInventory, localOrders) => {
  const [apiInventory, apiOrders] = await Promise.all([fetchInventory(), fetchOrders()]);

  const backendSkus = new Set(apiInventory.map(i => i.sku_id));
  const localSkus = new Set(localInventory.map(i => i.sku_id || i.id));

  for (const b of apiInventory) {
    if (!localSkus.has(b.sku_id)) {
      try { await deleteFootwear(b.sku_id); } catch (e) { console.warn('reconcile delete inventory:', e); }
    }
  }
  for (const item of localInventory) {
    const sku = item.sku_id || item.id;
    try {
      if (backendSkus.has(sku)) await updateFootwear(sku, item);
      else await createFootwear({ sku_id: sku, ...item });
    } catch (e) { console.warn('reconcile upsert inventory:', e); }
  }

  const backendIds = new Set(apiOrders.map(o => o.invoice_id));
  const localIds = new Set(localOrders.map(o => o.id || o.invoice_id));

  for (const b of apiOrders) {
    if (!localIds.has(b.invoice_id)) {
      try { await deleteOrder(b.invoice_id); } catch (e) { console.warn('reconcile delete order:', e); }
    }
  }
  for (const o of localOrders) {
    const id = o.id || o.invoice_id;
    try {
      if (backendIds.has(id)) await updateOrder(id, orderPayload(o));
      else await createOrder(orderPayload(o));
    } catch (e) { console.warn('reconcile upsert order:', e); }
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShoeFromLanding, setSelectedShoeFromLanding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(() => isAdminLoggedIn());
  const [showSignIn, setShowSignIn] = useState(false);

  // Footwear Inventory State (local DBMS first, mock data as last resort)
  const [inventory, setInventory] = useState(() => loadLocalData().inventory ?? INITIAL_INVENTORY);

  // Order History State (local DBMS first, mock data as last resort)
  const [orderHistory, setOrderHistory] = useState(() => loadLocalData().orders ?? INITIAL_ORDERS);

  // Persist every admin change to localStorage automatically
  useEffect(() => {
    if (isAdmin) persistData(inventory, orderHistory);
  }, [inventory, orderHistory, isAdmin]);

  // Load Inventory & Orders from Django REST API on mount
  const loadDataFromBackend = async () => {
    setLoading(true);
    const local = loadLocalData();
    const admin = isAdminLoggedIn();
    try {
      const [apiInventory, apiOrders] = await Promise.all([fetchInventory(), fetchOrders()]);

      if (admin && local.inventory && local.orders) {
        // Admin's saved store is authoritative — bring the backend up to date
        await reconcileWithBackend(local.inventory, local.orders);
      } else {
        // Normal user or first-ever run — backend is the shared source of truth
        setInventory(apiInventory);
        setOrderHistory(apiOrders);
        if (admin) persistData(apiInventory, apiOrders);
      }
    } catch (err) {
      console.warn("Could not reach Django API, using saved local data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataFromBackend();
  }, []);

  // Alert Count Calculation
  const alertCount = inventory.filter(i => i.stock <= i.minStock).length;

  // Push the current in-memory store to the backend so every device sees the
  // same data. Reconciles the freshly-built `next` state instead of re-reading
  // localStorage, which can be stale if a large base64 image overflowed its
  // quota before the persist effect ran.
  const syncWithBackend = async (nextInventory, nextOrders) => {
    try {
      await reconcileWithBackend(nextInventory, nextOrders);
      return true;
    } catch (e) {
      console.error("Failed to sync with Django DBMS:", e);
      return false;
    }
  };

  // Handlers for Inventory CRUD with Django DBMS integration
  const handleAddShoe = async (newShoe) => {
    // 1. Optimistic state update
    const next = [newShoe, ...inventory];
    setInventory(next);

    // 2. Persist in Django DBMS database
    try {
      // The backend serializer maps id <-> sku_id, but only reads sku_id on
      // input. Send sku_id explicitly so new stock survives in the DB and
      // shows up for normal users after sign-out.
      const sku = newShoe.sku_id || newShoe.id;
      const payload = { ...newShoe, sku_id: sku };
      delete payload.id;
      await createFootwear(payload);
    } catch (e) {
      console.error("Failed to add shoe to Django DBMS:", e);
    }

    // 3. Flush to localStorage now, then reconcile the in-memory state (which
    // includes any freshly uploaded image) to the backend.
    persistData(next, orderHistory);
    await syncWithBackend(next, orderHistory);
  };

  const handleUpdateShoe = async (updatedShoe) => {
    const next = inventory.map(item => item.id === updatedShoe.id || item.sku_id === updatedShoe.sku_id ? updatedShoe : item);
    setInventory(next);

    try {
      const sku = updatedShoe.sku_id || updatedShoe.id;
      const payload = { ...updatedShoe, sku_id: sku };
      delete payload.id;
      await updateFootwear(sku, payload);
    } catch (e) {
      console.error("Failed to update shoe in Django DBMS:", e);
    }

    persistData(next, orderHistory);
    await syncWithBackend(next, orderHistory);
  };

  const handleDeleteShoe = async (shoeId) => {
    if (window.confirm("Are you sure you want to delete this footwear SKU from Django database?")) {
      const next = inventory.filter(item => item.id !== shoeId && item.sku_id !== shoeId);
      setInventory(next);

      try {
        await deleteFootwear(shoeId);
      } catch (e) {
        console.error("Failed to delete shoe from Django DBMS:", e);
      }

      persistData(next, orderHistory);
      await syncWithBackend(next, orderHistory);
    }
  };

  // Handler for POS Invoice Completion with Django DBMS integration
  const handleCompleteOrder = async (newOrder) => {
    setOrderHistory(prev => [newOrder, ...prev]);

    try {
      await createOrder({
        invoice_id: newOrder.id,
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone || '',
        customerEmail: newOrder.customerEmail || '',
        date: newOrder.date,
        subtotal: newOrder.subtotal,
        discount: newOrder.discount || 0,
        discountAmount: newOrder.discountAmount || 0,
        tax: newOrder.tax || 0,
        total: newOrder.total,
        paymentMethod: newOrder.paymentMethod,
        status: newOrder.status || 'Completed',
        items: newOrder.items.map(it => ({
          footwear_id: it.id || it.sku_id,
          name: it.name,
          price: it.price,
          qty: it.qty,
          size: it.size || 9
        }))
      });
      // Refresh inventory stock level from Django DBMS after order auto-deduction
      await loadDataFromBackend();
    } catch (e) {
      console.error("Failed to complete order in Django DBMS:", e);
    }
  };

  const handleRestockShoe = async (skuId, quantity) => {
    try {
      await restockFootwear(skuId, quantity);
      await loadDataFromBackend();
    } catch (e) {
      console.error("Failed to restock footwear in Django DBMS:", e);
    }
  };

  const handleUpdateOrder = async (updatedOrder) => {
    setOrderHistory(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));

    try {
      await updateOrder(updatedOrder.id, {
        customerName: updatedOrder.customerName,
        customerPhone: updatedOrder.customerPhone || '',
        customerEmail: updatedOrder.customerEmail || '',
        date: updatedOrder.date,
        subtotal: updatedOrder.subtotal,
        discount: updatedOrder.discount || 0,
        discountAmount: updatedOrder.discountAmount || 0,
        tax: updatedOrder.tax || 0,
        total: updatedOrder.total,
        paymentMethod: updatedOrder.paymentMethod,
        status: updatedOrder.status || 'Completed',
        items: (updatedOrder.items || []).map(it => ({
          footwear_id: it.id || it.footwear_id || it.sku_id,
          name: it.name,
          price: it.price,
          qty: it.qty,
          size: it.size || 9
        }))
      });
      await loadDataFromBackend();
    } catch (e) {
      console.error("Failed to update order in Django DBMS:", e);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm(`Delete order ${orderId}? Inventory stock for its items will be restored.`)) {
      setOrderHistory(prev => prev.filter(o => o.id !== orderId));

      try {
        await deleteOrder(orderId);
        await loadDataFromBackend();
      } catch (e) {
        console.error("Failed to delete order from Django DBMS:", e);
      }
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAdmin(false);
    setActiveTab('landing');
  };

  const handleSelectShoeForInvoice = (shoe) => {
    setSelectedShoeFromLanding(shoe);
    setActiveTab('invoice');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#F0F0F0', display: 'flex', flexDirection: 'column', fontFamily: "'Space Grotesk', sans-serif" }}>
      
      {/* Header Bar */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        alertCount={alertCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onQuickInvoice={() => setActiveTab('invoice')}
        isAdmin={isAdmin}
        onOpenSignIn={() => setShowSignIn(true)}
        onLogout={handleLogout}
      />

      {/* Main Tab Body — normal users only ever see the landing page */}
      <main style={{ flex:1, maxWidth: 1280, width:'100%', margin: '0 auto', padding: '0 24px' }}>
        
        {(!isAdmin || activeTab === 'landing') && (
          <LandingPage 
            inventory={inventory} 
            setActiveTab={setActiveTab}
            onSelectShoeForInvoice={handleSelectShoeForInvoice}
            isAdmin={isAdmin}
            onOpenSignIn={() => setShowSignIn(true)}
            onLogout={handleLogout}
          />
        )}

        {isAdmin && activeTab === 'inventory' && (
          <InventoryTab 
            inventory={inventory}
            onAddShoe={handleAddShoe}
            onUpdateShoe={handleUpdateShoe}
            onDeleteShoe={handleDeleteShoe}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectShoeForInvoice={handleSelectShoeForInvoice}
          />
        )}

        {isAdmin && activeTab === 'invoice' && (
          <InvoiceTab 
            inventory={inventory}
            onCompleteOrder={handleCompleteOrder}
            selectedShoeFromLanding={selectedShoeFromLanding}
            clearSelectedShoeFromLanding={() => setSelectedShoeFromLanding(null)}
          />
        )}

        {isAdmin && activeTab === 'analytics' && (
          <AnalyticsTab 
            inventory={inventory}
            orderHistory={orderHistory}
          />
        )}

        {isAdmin && activeTab === 'history' && (
          <HistoryTab 
            orderHistory={orderHistory}
            onUpdateOrder={handleUpdateOrder}
            onDeleteOrder={handleDeleteOrder}
          />
        )}

        {isAdmin && activeTab === 'alerts' && (
          <AlertsTab 
            inventory={inventory}
            onRestockShoe={handleRestockShoe}
            setActiveTab={setActiveTab}
          />
        )}

        {isAdmin && activeTab === 'asbot' && (
          <ASbot inventory={inventory} orderHistory={orderHistory} />
        )}

      </main>

      {/* Dynamic Footer */}
      <Footer setActiveTab={setActiveTab} isAdmin={isAdmin} onOpenSignIn={() => setShowSignIn(true)} />

      {/* Admin Sign In Modal */}
      <SignInModal
        open={showSignIn}
        onClose={() => setShowSignIn(false)}
        onLogin={() => setIsAdmin(true)}
      />

    </div>
  );
}
