import React from 'react';
import { useInventory } from '../context/InventoryContext';

interface Sale {
  id: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  total: number;
  discount: number;
  paymentReceived: number;
  change: number;
  date: string;
  cashier: string;
  storeLocation: string;
}

interface PrintableReceiptProps {
  sale: Sale;
}

const PrintableReceipt: React.FC<PrintableReceiptProps> = ({ sale }) => {
  const { products } = useInventory();

  const formatCurrency = (amount: number) => `HTG ${amount.toFixed(2)}`;

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
      <div className="text-center font-bold mb-2">EASYTECH MASTER STOCK</div>
      <div className="text-center mb-3">POS Receipt</div>
      
      <div className="mb-2">
        <div>Date: {new Date(sale.date).toLocaleString()}</div>
        <div>Receipt No: {sale.id}</div>
        <div>Cashier: {sale.cashier}</div>
      </div>
      
      <div className="border-top border-bottom mb-2">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th className="col-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, index) => {
              const product = products.find(p => p.id === item.productId);
              return (
                <tr key={index}>
                  <td>{product?.name}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.price)}</td>
                  <td className="col-right">{formatCurrency(item.quantity * item.price)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(sale.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount:</span>
          <span>{formatCurrency(sale.discount)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>{formatCurrency(sale.total)}</span>
        </div>
      </div>
      
      <div className="border-top mb-3">
        <div className="flex justify-between">
          <span>Payment Received:</span>
          <span>{formatCurrency(sale.paymentReceived)}</span>
        </div>
        <div className="flex justify-between">
          <span>Change:</span>
          <span>{formatCurrency(sale.change)}</span>
        </div>
      </div>
      
      <div className="text-center mb-2">
        <div className="font-bold mb-1">Store Information</div>
        <div>{sale.storeLocation}</div>
        <div>123 Main St, Port-au-Prince, Haiti</div>
        <div>Tel: (123) 456-7890</div>
      </div>
      
      <div className="text-center mb-2">
        <div className="font-bold mb-1">Return Policy</div>
        <div>Items can be returned within 30 days</div>
        <div>with original receipt. Some restrictions apply.</div>
      </div>
      
      <div className="text-center font-bold">
        Thank you for your purchase!
      </div>
    </div>
  );
};

export default PrintableReceipt;