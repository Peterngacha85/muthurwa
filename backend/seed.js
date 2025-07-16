const mongoose = require('mongoose');
const User = require('./models/User');
const Buyer = require('./models/Buyer');
const TomatoType = require('./models/TomatoType');
const Transaction = require('./models/Transaction');
const Delivery = require('./models/Delivery');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/muthurwa')
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

const sampleData = {
  users: [
    {
      name: 'John Doe',
      phone: '1234567890',
      password: 'password123',
      location: 'Nairobi',
      role: 'admin'
    },
    {
      name: 'Jane Smith',
      phone: '0987654321',
      password: 'password123',
      location: 'Mombasa',
      role: 'vendor'
    }
  ],
  buyers: [
    {
      name: 'Alice Johnson',
      phone: '1111111111',
      idNumber: 'ID001',
      location: 'Nairobi Central'
    },
    {
      name: 'Bob Wilson',
      phone: '2222222222',
      idNumber: 'ID002',
      location: 'Westlands'
    },
    {
      name: 'Carol Brown',
      phone: '3333333333',
      idNumber: 'ID003',
      location: 'Eastleigh'
    }
  ],
  tomatoTypes: [
    {
      name: 'Roma Tomatoes',
      variety: 'Roma',
      unit: 'kg',
      description: 'Plum tomatoes perfect for sauces',
      defaultPrice: 120
    },
    {
      name: 'Cherry Tomatoes',
      variety: 'Cherry',
      unit: 'box',
      description: 'Small sweet tomatoes',
      defaultPrice: 200
    },
    {
      name: 'Beefsteak Tomatoes',
      variety: 'Beefsteak',
      unit: 'piece',
      description: 'Large slicing tomatoes',
      defaultPrice: 50
    },
    {
      name: 'Green Tomatoes',
      variety: 'Green',
      unit: 'kg',
      description: 'Unripe tomatoes for cooking',
      defaultPrice: 80
    }
  ]
};

async function seedDatabase() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Buyer.deleteMany({});
    await TomatoType.deleteMany({});
    await Transaction.deleteMany({});
    await Delivery.deleteMany({});

    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleData.users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.name}`);
    }

    // Create buyers (associate with first user)
    const createdBuyers = [];
    for (const buyerData of sampleData.buyers) {
      const buyer = new Buyer({
        ...buyerData,
        ownerId: createdUsers[0]._id
      });
      await buyer.save();
      createdBuyers.push(buyer);
      console.log(`Created buyer: ${buyer.name}`);
    }

    // Create tomato types (associate with first user)
    const createdTomatoTypes = [];
    for (const tomatoTypeData of sampleData.tomatoTypes) {
      const tomatoType = new TomatoType({
        ...tomatoTypeData,
        ownerId: createdUsers[0]._id
      });
      await tomatoType.save();
      createdTomatoTypes.push(tomatoType);
      console.log(`Created tomato type: ${tomatoType.name}`);
    }

    // Create sample transactions
    const sampleTransactions = [
      {
        buyerId: createdBuyers[0]._id,
        tomatoTypeId: createdTomatoTypes[0]._id,
        quantity: 10,
        unitPrice: 120,
        totalAmount: 1200,
        paidAmount: 1200,
        paymentStatus: 'paid',
        deliveryStatus: 'delivered',
        deliveryDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ownerId: createdUsers[0]._id
      },
      {
        buyerId: createdBuyers[1]._id,
        tomatoTypeId: createdTomatoTypes[1]._id,
        quantity: 5,
        unitPrice: 200,
        totalAmount: 1000,
        paidAmount: 500,
        paymentStatus: 'partial',
        deliveryStatus: 'pending',
        deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        ownerId: createdUsers[0]._id
      },
      {
        buyerId: createdBuyers[2]._id,
        tomatoTypeId: createdTomatoTypes[2]._id,
        quantity: 20,
        unitPrice: 50,
        totalAmount: 1000,
        paidAmount: 0,
        paymentStatus: 'unpaid',
        deliveryStatus: 'pending',
        deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        ownerId: createdUsers[0]._id
      }
    ];

    const createdTransactions = [];
    for (const transactionData of sampleTransactions) {
      const transaction = new Transaction(transactionData);
      await transaction.save();
      createdTransactions.push(transaction);
      console.log(`Created transaction: ${transaction._id}`);
    }

    // Create sample deliveries
    const sampleDeliveries = [
      {
        transactionId: createdTransactions[0]._id,
        buyerId: createdBuyers[0]._id,
        deliveryPersonName: 'Mike Driver',
        deliveryLocation: 'Nairobi Central Market',
        deliveryStatus: 'delivered',
        timestamp: new Date(),
        ownerId: createdUsers[0]._id
      },
      {
        transactionId: createdTransactions[1]._id,
        buyerId: createdBuyers[1]._id,
        deliveryPersonName: 'Sarah Courier',
        deliveryLocation: 'Westlands Mall',
        deliveryStatus: 'pending',
        timestamp: new Date(),
        ownerId: createdUsers[0]._id
      }
    ];

    for (const deliveryData of sampleDeliveries) {
      const delivery = new Delivery(deliveryData);
      await delivery.save();
      console.log(`Created delivery: ${delivery._id}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('Phone: 1234567890, Password: password123');
    console.log('Phone: 0987654321, Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 