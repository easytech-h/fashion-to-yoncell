import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add a new product
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = await prisma.product.create({
      data: req.body,
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Update a product
app.put('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Delete all products
app.delete('/api/products', async (req, res) => {
  try {
    await prisma.product.deleteMany();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete all products' });
  }
});

// Update product quantity
app.put('/api/products/:id/quantity', async (req, res) => {
  try {
    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: { quantity: req.body.quantity },
    });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product quantity' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});