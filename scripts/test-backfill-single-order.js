/**
 * Test script to backfill missing product amounts for a single order
 * 
 * This is a safe test to verify the migration logic before running on all orders
 * 
 * Usage: node scripts/test-backfill-single-order.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://metgoprod:Nepal0987poiuytrewq@kraken.evve2.mongodb.net/metgo';
const TEST_ORDER_ID = '6a21d03afe6c433f2a7e1838'; // The problematic order from the issue

async function testBackfillSingleOrder() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully');

    const db = mongoose.connection.db;
    const orderproductsCollection = db.collection('orderproducts');
    const productsCollection = db.collection('products');

    console.log(`\n=== Testing backfill for order: ${TEST_ORDER_ID} ===\n`);

    // Find orderproducts for this specific order with amount: 0
    const zeroAmountOrderProducts = await orderproductsCollection.find({
      orderId: new mongoose.Types.ObjectId(TEST_ORDER_ID),
      amount: 0,
      isDeleted: { $ne: true },
      itemType: 'PRODUCT'
    }).toArray();

    console.log(`Found ${zeroAmountOrderProducts.length} orderproducts with amount: 0 for this order`);

    if (zeroAmountOrderProducts.length === 0) {
      console.log('No orderproducts to fix for this order. Exiting.');
      return;
    }

    console.log('\n--- Current state ---');
    for (const op of zeroAmountOrderProducts) {
      console.log(`OrderProduct ${op._id}: itemId=${op.itemId}, amount=${op.amount}, quantity=${op.quantity}`);
    }

    console.log('\n--- Starting backfill ---');
    let updatedCount = 0;
    let skippedCount = 0;

    for (const orderProduct of zeroAmountOrderProducts) {
      try {
        // Find the product to get its current sellingPrice
        const product = await productsCollection.findOne({
          _id: orderProduct.itemId,
          isDeleted: { $ne: true }
        });

        if (!product) {
          console.log(`⚠️  Skipped: Product not found for orderProduct ${orderProduct._id} (itemId: ${orderProduct.itemId})`);
          skippedCount++;
          continue;
        }

        if (!product.price || product.price.sellingPrice === undefined || product.price.sellingPrice === null) {
          console.log(`⚠️  Skipped: Product ${product._id} has no sellingPrice`);
          skippedCount++;
          continue;
        }

        const newAmount = product.price.sellingPrice;
        const productName = product.name || product.nameHe || 'N/A';

        console.log(`\nProcessing orderProduct ${orderProduct._id}:`);
        console.log(`  Product: ${productName}`);
        console.log(`  Current amount: ${orderProduct.amount}`);
        console.log(`  New amount: ${newAmount}`);
        console.log(`  Quantity: ${orderProduct.quantity}`);

        // Update the orderproduct with the correct amount
        const result = await orderproductsCollection.updateOne(
          { _id: orderProduct._id },
          { 
            $set: { 
              amount: newAmount,
              updatedAt: new Date()
            }
          }
        );

        if (result.modifiedCount > 0) {
          console.log(`  ✅ Updated successfully`);
          updatedCount++;
        } else {
          console.log(`  ⚠️  No changes made`);
          skippedCount++;
        }

      } catch (error) {
        console.error(`❌ Error processing orderProduct ${orderProduct._id}:`, error.message);
      }
    }

    console.log('\n--- Verifying changes ---');
    const updatedOrderProducts = await orderproductsCollection.find({
      orderId: new mongoose.Types.ObjectId(TEST_ORDER_ID),
      isDeleted: { $ne: true },
      itemType: 'PRODUCT'
    }).toArray();

    console.log('\nFinal state of orderproducts:');
    for (const op of updatedOrderProducts) {
      const product = await productsCollection.findOne({
        _id: op.itemId,
        isDeleted: { $ne: true }
      });
      const productName = product ? (product.name || product.nameHe || 'N/A') : 'Product not found';
      console.log(`OrderProduct ${op._id}: ${productName}, amount=${op.amount}, quantity=${op.quantity}`);
    }

    console.log('\n=== Test Summary ===');
    console.log(`Total orderproducts processed: ${zeroAmountOrderProducts.length}`);
    console.log(`Successfully updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log('=====================\n');

  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  } finally {
    if (client) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  }
}

// Run the test
testBackfillSingleOrder()
  .then(() => {
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
