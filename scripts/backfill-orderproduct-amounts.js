/**
 * Migration script to backfill missing product amounts in orderproducts
 * 
 * This script fixes orderproducts where amount = 0 by fetching the current
 * product's sellingPrice from the products collection and updating the orderproduct.
 * 
 * Usage: node scripts/backfill-orderproduct-amounts.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://metgoprod:Nepal0987poiuytrewq@kraken.evve2.mongodb.net/metgo';

async function backfillOrderProductAmounts() {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully');

    const db = mongoose.connection.db;
    const orderproductsCollection = db.collection('orderproducts');
    const productsCollection = db.collection('products');

    // Find all orderproducts with amount: 0 that are not deleted
    console.log('\nFinding orderproducts with amount: 0...');
    const zeroAmountOrderProducts = await orderproductsCollection.find({
      amount: 0,
      isDeleted: { $ne: true },
      itemType: 'PRODUCT' // Only fix products, not tickets
    }).toArray();

    console.log(`Found ${zeroAmountOrderProducts.length} orderproducts with amount: 0`);

    if (zeroAmountOrderProducts.length === 0) {
      console.log('No orderproducts to fix. Exiting.');
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

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
          console.log(`✅ Updated orderProduct ${orderProduct._id}: amount 0 → ${newAmount} (product: ${product.name || product.nameHe || 'N/A'})`);
          updatedCount++;
        } else {
          console.log(`⚠️  No changes made to orderProduct ${orderProduct._id}`);
          skippedCount++;
        }

      } catch (error) {
        console.error(`❌ Error processing orderProduct ${orderProduct._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Total orderproducts with amount: 0: ${zeroAmountOrderProducts.length}`);
    console.log(`Successfully updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('=========================\n');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    if (client) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  }
}

// Run the migration
backfillOrderProductAmounts()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
