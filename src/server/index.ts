import express from 'express';
import cors from 'cors';
import db from '../services/database';

const app = express();

app.use(cors());
app.use(express.json());

// Get all products
app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products').all();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add a new product
app.post('/api/products', (req, res) => {
  try {
    const { name, description, quantity, price } = req.body;
    const id = `PROD-${Date.now()}`;
    const stmt = db.prepare('INSERT INTO products (id, name, description, quantity, price) VALUES (?, ?, ?, ?, ?)');
    stmt.run(id, name, description, quantity, price);
    res.status(201).json({ id, name, description, quantity, price });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Update a product
app.put('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, quantity, price } = req.body;
    const stmt = db.prepare('UPDATE products SET name = ?, description = ?, quantity = ?, price = ? WHERE id = ?');
    stmt.run(name, description, quantity, price, id);
    res.json({ id, name, description, quantity, price });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete a product
app.delete('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Delete all products
app.delete('/api/products', (req, res) => {
  try {
    db.prepare('DELETE FROM products').run();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete all products' });
  }
});

// Update product quantity
app.put('/api/products/:id/quantity', (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const stmt = db.prepare('UPDATE products SET quantity = ? WHERE id = ?');
    stmt.run(quantity, id);
    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product quantity' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});