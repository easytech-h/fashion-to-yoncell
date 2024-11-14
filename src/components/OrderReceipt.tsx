import React from 'react';
import { useInventory } from '../context/InventoryContext';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderDate: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  finalAmount: number;
  advancePayment: number;
  paymentMethod: string;
  status: string;
  shippingAddress: string;
  contactNumber: string;
  discount?: number;
}

interface OrderReceiptProps {
  order: Order;
}

const OrderReceipt: React.FC<OrderReceiptProps> = ({ order }) => {
  const { products } = useInventory();

  const formatCurrency = (amount: number | undefined): string => {
    if (typeof amount !== 'number') return 'HTG 0.00';
    return `HTG ${amount.toFixed(2)}`;
  };

  const getProductName = (productId: string): string => {
    const product = products.find((p) => p.id === productId);
    return product?.name || 'Unknown Product';
  };

  const calculateSubtotal = (): number => {
    return order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const calculateTotal = (): number => {
    const subtotal = calculateSubtotal();
    const discount = order.discount || 0;
    return subtotal - discount;
  };

  const calculateBalance = (): number => {
    const total = calculateTotal();
    const paid = order.advancePayment || 0;
    return total - paid;
  };

  const getStatusDisplay = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      pending: 'En attente',
      processing: 'En traitement',
      completed: 'Complété',
      cancelled: 'Annulé',
    };
    return statusMap[status] || status;
  };

  if (!order) {
    return <div>No order data available</div>;
  }

  return (
    <div className="printable-receipt">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .printable-receipt, .printable-receipt * {
              visibility: visible;
            }
            .printable-receipt {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
          .printable-receipt {
            font-family: 'Courier New', Courier, monospace;
            width: 80mm;
            padding: 5mm;
            font-size: 12px;
            line-height: 1.2;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .mb-1 { margin-bottom: 1mm; }
          .mb-2 { margin-bottom: 2mm; }
          .mb-3 { margin-bottom: 3mm; }
          .border-top { border-top: 1px dashed #000; padding-top: 2mm; }
          .border-bottom { border-bottom: 1px dashed #000; padding-bottom: 2mm; }
          table { width: 100%; }
          th, td { text-align: left; vertical-align: top; }
          .col-right { text-align: right; }
        `}
      </style>
      <div className="text-center font-bold mb-2">UP2DATE FASHION</div>
      <div className="text-center mb-3">Bon de commande</div>

      <div className="mb-2">
        <div>Commande N°: {order.id}</div>
        <div>Date: {new Date(order.orderDate).toLocaleString()}</div>
        <div>Client: {order.customerName}</div>
        <div>Contact: {order.contactNumber}</div>
        <div>Adresse: {order.shippingAddress}</div>
        <div>Statut: {getStatusDisplay(order.status)}</div>
      </div>

      <div className="border-top border-bottom mb-2">
        <table>
          <thead>
            <tr>
              <th>Article</th>
              <th>Qté</th>
              <th>Prix</th>
              <th className="col-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index}>
                <td>{getProductName(item.productId)}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.price)}</td>
                <td className="col-right">
                  {formatCurrency(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-3">
        <div className="flex justify-between">
          <span>Sous-total:</span>
          <span>{formatCurrency(calculateSubtotal())}</span>
        </div>
        {order.discount && order.discount > 0 && (
          <div className="flex justify-between">
            <span>Remise:</span>
            <span>{formatCurrency(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>{formatCurrency(calculateTotal())}</span>
        </div>
        <div className="flex justify-between">
          <span>Acompte versé:</span>
          <span>{formatCurrency(order.advancePayment)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Solde à payer:</span>
          <span>{formatCurrency(calculateBalance())}</span>
        </div>
      </div>

      <div className="border-top mb-3">
        <div>Mode de paiement: {order.paymentMethod}</div>
      </div>

      <div className="text-center mb-2">
        <div className="font-bold mb-1">Informations du magasin</div>
        <div>UP2DATE FASHION</div>
        <div>rue la paix , Haiti</div>
        <div>Tel: (509) 3123 3485 / 3261 8607</div>
      </div>

      <div className="text-center font-bold">Merci de votre confiance!</div>
    </div>
  );
};

export default OrderReceipt;
