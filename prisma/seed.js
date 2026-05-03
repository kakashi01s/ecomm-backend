import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('✨ Starting AURORA premium jewelry MASSIVE database seeding...');

  // ==========================================
  // 1. CLEAR EXISTING DATA (Strict Reverse Order)
  // ==========================================
  console.log('🧹 Clearing old data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.user.deleteMany();
  
  // ==========================================
  // 2. CREATE USERS & ADDRESSES
  // ==========================================
  console.log('👤 Creating Users...');
  const customer = await prisma.user.create({
    data: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1234567890',
      role: 'CUSTOMER',
      isVerified: true,
      addresses: {
        create: { fullName: 'Jane Doe', phone: '+1234567890', line1: '123 Luxury Lane', city: 'Beverly Hills', state: 'CA', postal: '90210', country: 'USA' }
      }
    }
  });

  // ==========================================
  // 3. CREATE DYNAMIC BANNERS
  // ==========================================
  console.log('🎬 Creating Dynamic Banners...');
  await prisma.banner.createMany({
    data: [
      {
        title: "The Silver Symphony",
        mediaUrl: "https://flutter.github.io/assets-for-api-docs/assets/videos/butterfly.mp4", 
        mediaType: "video",
        linkUrl: "/category/1",
        isActive: true
      },
      {
        title: "Summer Essentials",
        mediaUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
        mediaType: "image",
        linkUrl: "/category/2",
        isActive: true
      },
      {
        title: "Bridal Collection",
        mediaUrl: "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&w=1200&q=80",
        mediaType: "image",
        linkUrl: "/category/3",
        isActive: true
      }
    ]
  });

  // ==========================================
  // 4. HIERARCHICAL CATEGORIES
  // ==========================================
  console.log('📦 Creating Hierarchical Categories...');
  
  const fineJewelry = await prisma.category.create({ data: { name: 'Fine Jewelry', imageUrl: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=400&q=80' } });
  const fashionJewelry = await prisma.category.create({ data: { name: 'Fashion Jewelry', imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80' } });
  const mensCollection = await prisma.category.create({ data: { name: 'Men\'s Collection', imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=400&q=80' } });

  const catEngagement = await prisma.category.create({ data: { name: 'Engagement Rings', parentId: fineJewelry.id, imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&w=400&q=80' } });
  const catNecklaces = await prisma.category.create({ data: { name: 'Necklaces & Pendants', parentId: fineJewelry.id, imageUrl: 'https://images.unsplash.com/photo-1599643478514-4a4e08b50faa?auto=format&fit=crop&w=400&q=80' } });
  const catEarrings = await prisma.category.create({ data: { name: 'Statement Earrings', parentId: fashionJewelry.id, imageUrl: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=400&q=80' } });
  const catWatches = await prisma.category.create({ data: { name: 'Luxury Watches', parentId: mensCollection.id, imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=400&q=80' } });
  const catBracelets = await prisma.category.create({ data: { name: 'Bracelets & Cuffs', parentId: fashionJewelry.id, imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=400&q=80' } });

  // ==========================================
  // 5. MASSIVE PRODUCT CATALOG (20 Products)
  // ==========================================
  console.log('🚀 Inserting 20 rich products...');
  
  const productsData = [
    // --- RINGS ---
    {
      name: 'Aurora Solitaire Diamond Ring',
      description: 'A breathtaking 2-carat conflict-free diamond set in an 18k solid gold band. The ultimate symbol of eternal love.',
      price: 4500.00,
      stock: 10,
      categoryId: catEngagement.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&w=800&q=80', mediaType: 'image' },
          { url: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&w=800&q=80', mediaType: 'image' },
          { url: 'https://flutter.github.io/assets-for-api-docs/assets/videos/butterfly.mp4', mediaType: 'video' } // VIDEO INCLUDED
        ]
      },
      variants: {
        create: [
          { size: 'US 5', color: '18K Yellow Gold', stock: 2, price: 4500.00 },
          { size: 'US 6', color: '18K Yellow Gold', stock: 5, price: 4500.00 },
          { size: 'US 7', color: 'Platinum', stock: 3, price: 4800.00 }
        ]
      }
    },
    {
      name: 'Vintage Oval Sapphire Ring',
      description: 'Deep blue Ceylon sapphire surrounded by a halo of brilliant cut diamonds.',
      price: 2800.00,
      salePrice: 2450.00, // ON SALE
      stock: 5,
      categoryId: catEngagement.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80', mediaType: 'image' },
          { url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80', mediaType: 'image' }
        ]
      },
      variants: { create: [{ size: 'US 6', color: 'White Gold', stock: 5, price: 2800.00 }] }
    },
    {
      name: 'Eternity Diamond Band',
      description: 'Seamless loop of pavé set diamonds. Perfect for stacking.',
      price: 1200.00,
      stock: 15,
      categoryId: catEngagement.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80', mediaType: 'image' },
          { url: 'https://flutter.github.io/assets-for-api-docs/assets/videos/bee.mp4', mediaType: 'video' } // VIDEO INCLUDED
        ]
      },
      variants: { create: [{ size: 'US 7', color: 'Rose Gold', stock: 15, price: 1200.00 }] }
    },
    {
      name: 'Minimalist 14K Gold Band',
      description: 'A simple, everyday essential polished to perfection.',
      price: 350.00,
      stock: 50,
      categoryId: catEngagement.id,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?auto=format&fit=crop&w=800&q=80', mediaType: 'image' }] },
      variants: { create: [{ size: 'US 8', color: 'Yellow Gold', stock: 50, price: 350.00 }] }
    },

    // --- NECKLACES ---
    {
      name: 'Herringbone Liquid Silver Chain',
      description: 'A fluid, liquid-like herringbone chain crafted from pure 925 sterling silver.',
      price: 150.00,
      salePrice: 89.00, // ON SALE
      stock: 80,
      categoryId: catNecklaces.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1599643478514-4a4e08b50faa?auto=format&fit=crop&w=800&q=80', mediaType: 'image' },
          { url: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=80', mediaType: 'image' }
        ]
      },
      variants: {
        create: [
          { size: '16 inch', color: 'Silver', stock: 40, price: 150.00 },
          { size: '18 inch', color: 'Silver', stock: 40, price: 160.00 } 
        ]
      }
    },
    {
      name: 'Diamond Tennis Necklace',
      description: 'A continuous strand of perfectly matched lab-grown diamonds. 10 carats total weight.',
      price: 8500.00,
      stock: 3,
      categoryId: catNecklaces.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80', mediaType: 'image' },
          { url: 'https://flutter.github.io/assets-for-api-docs/assets/videos/butterfly.mp4', mediaType: 'video' }, // VIDEO INCLUDED
          { url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', mediaType: 'image' }
        ]
      },
      variants: { create: [{ size: '16 inch', color: 'White Gold', stock: 3, price: 8500.00 }] }
    },
    {
      name: 'Freshwater Pearl Choker',
      description: 'Irregular baroque pearls strung tightly for a modern take on a classic.',
      price: 220.00,
      stock: 25,
      categoryId: catNecklaces.id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=80', mediaType: 'image' },
          { url: 'https://images.unsplash.com/photo-1599643478514-4a4e08b50faa?auto=format&fit=crop&w=800&q=80', mediaType: 'image' }
        ]
      },
      variants: { create: [{ size: '14 inch', color: 'Pearl / Gold Clasp', stock: 25, price: 220.00 }] }
    },
    {
      name: 'Zodiac Coin Pendant',
      description: 'Engraved astrological signs on a brushed gold medallion.',
      price: 110.00,
      salePrice: 90.00,
      stock: 100,
      categoryId: catNecklaces.id,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?auto=format&fit=crop&w=800&q=80', mediaType: 'image' }] },
      variants: { 
        create: [
          { size: 'Taurus', color: 'Gold', stock: 10, price: 110.00 },
          { size: 'Leo', color: 'Gold', stock: 10, price: 110.00 }
        ] 
      }
    },

    // --- EARRINGS ---
    {
      name: 'Chunky Gold Tube Hoops',
      description: 'Lightweight but bold. These chunky tube hoops offer maximum impact without weighing down your ears.',
      price: 65.00,
      stock: 200,
      categoryId: catEarrings.id,
      images: { 
        create: [
          { url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80', mediaType: 'image' },
          { url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=800&q=80', mediaType: 'image' }
        ] 
      },
      variants: { create: [{ size: '30mm', color: '14K Gold Plated', stock: 200, price: 65.00 }] }
    },
    {
      name: 'Diamond Drop Earrings',
      description: 'Elegant tear-drop diamonds cascading from a secure french hook.',
      price: 3400.00,
      stock: 8,
      categoryId: catEarrings.id,
      images: { 
        create: [
          { url: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&w=800&q=80', mediaType: 'image' },
          { url: 'https://flutter.github.io/assets-for-api-docs/assets/videos/bee.mp4', mediaType: 'video' } // VIDEO INCLUDED
        ] 
      },
      variants: { create: [{ size: 'Standard', color: 'Platinum', stock: 8, price: 3400.00 }] }
    },
    {
      name: 'Sapphire Studs',
      description: 'Deep ocean blue sapphires set in classic 4-prong baskets.',
      price: 450.00,
      stock: 0, // OUT OF STOCK TEST
      categoryId: catEarrings.id,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80', mediaType: 'image' }] },
      variants: { create: [{ size: '5mm', color: 'White Gold', stock: 0, price: 450.00 }] }
    },
    {
      name: 'Mini Huggie Earrings',
      description: 'Tiny, tight-fitting hoops studded with cubic zirconia.',
      price: 45.00,
      salePrice: 30.00, // ON SALE
      stock: 300,
      categoryId: catEarrings.id,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80', mediaType: 'image' }] },
      variants: { create: [{ size: '10mm', color: 'Gold', stock: 300, price: 45.00 }] }
    },

    // --- MEN'S COLLECTION ---
    {
      name: 'Midnight Onyx Men\'s Signet',
      description: 'A heavy solid silver signet ring featuring a polished black onyx stone.',
      price: 195.00,
      salePrice: 150.00,
      stock: 15,
      categoryId: mensCollection.id,
      images: { 
        create: [
          { url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80', mediaType: 'image' },
          { url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80', mediaType: 'image' }
        ] 
      },
      variants: { create: [{ size: 'US 10', color: 'Oxidized Silver / Onyx', stock: 15, price: 195.00 }] }
    },
    {
      name: 'Chronograph Automatic Watch',
      description: 'Swiss-made automatic movement with a sapphire crystal face and genuine leather strap.',
      price: 1200.00,
      stock: 12, 
      isActive: true,
      categoryId: catWatches.id,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80', mediaType: 'image' }] },
      variants: { create: [{ size: '42mm', color: 'Silver / Brown Leather', stock: 12, price: 1200.00 }] }
    },
    {
      name: 'Solid Cuban Link Chain',
      description: '8mm thick solid 14k gold Cuban link. Heavyweight and durable.',
      price: 2400.00,
      stock: 5,
      categoryId: mensCollection.id,
      images: { 
        create: [
          { url: 'https://images.unsplash.com/photo-1599643478514-4a4e08b50faa?auto=format&fit=crop&w=800&q=80', mediaType: 'image' },
          { url: 'https://flutter.github.io/assets-for-api-docs/assets/videos/butterfly.mp4', mediaType: 'video' } // VIDEO INCLUDED
        ] 
      },
      variants: { create: [{ size: '20 inch', color: '14K Gold', stock: 5, price: 2400.00 }] }
    },
    {
      name: 'Braided Leather & Steel Bracelet',
      description: 'Italian leather braided tightly, finished with a brushed steel magnetic clasp.',
      price: 85.00,
      stock: 40,
      categoryId: mensCollection.id,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80', mediaType: 'image' }] },
      variants: { create: [{ size: '8 inch', color: 'Black/Steel', stock: 40, price: 85.00 }] }
    },

    // --- BRACELETS ---
    {
      name: 'Rose Gold Diamond Cuff',
      description: 'A rigid open cuff dusted with micro-pavé diamonds on the edges.',
      price: 850.00,
      stock: 12,
      categoryId: catBracelets.id,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=80', mediaType: 'image' }] },
      variants: { create: [{ size: 'One Size', color: 'Rose Gold', stock: 12, price: 850.00 }] }
    },
    {
      name: 'Double Layered Chain Bracelet',
      description: 'Two delicate chains integrated into one clasp for a pre-stacked look.',
      price: 110.00,
      salePrice: 75.00, // ON SALE
      stock: 65,
      categoryId: catBracelets.id,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80', mediaType: 'image' }] },
      variants: { create: [{ size: '7 inch', color: 'Gold Plated', stock: 65, price: 110.00 }] }
    },
    {
      name: 'Emerald Tennis Bracelet',
      description: 'Alternating lab-grown emeralds and diamonds in a classic tennis setting.',
      price: 3200.00,
      stock: 4,
      categoryId: catBracelets.id,
      images: { 
        create: [
          { url: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&w=800&q=80', mediaType: 'image' },
          { url: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&w=800&q=80', mediaType: 'image' }
        ] 
      },
      variants: { create: [{ size: '6.5 inch', color: 'White Gold/Emerald', stock: 4, price: 3200.00 }] }
    },
    {
      name: 'Heavy Paperclip Chain Bracelet',
      description: 'A bold, flat paperclip chain bracelet in 925 sterling silver.',
      price: 95.00,
      stock: 45,
      categoryId: catBracelets.id,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80', mediaType: 'image' }] },
      variants: { create: [{ size: '7.5 inch', color: 'Silver', stock: 45, price: 95.00 }] }
    }
  ];

  // Insert all 20 products
  for (const productData of productsData) {
    await prisma.product.create({ data: productData });
  }

  // ==========================================
  // 6. POPULATE CART, WISHLIST & ORDERS
  // ==========================================
  console.log('🛍️ Simulating user activity (Cart, Wishlist, Orders)...');
  
  // Fetch a few products to put in Jane's cart
  const allProds = await prisma.product.findMany();
  
  await prisma.cartItem.createMany({
    data: [
      { userId: customer.id, productId: allProds[1].id, quantity: 2 }, // Oval Sapphire Ring
      { userId: customer.id, productId: allProds[6].id, quantity: 1 }  // Pearl Choker
    ]
  });

  await prisma.wishlist.createMany({
    data: [
      { userId: customer.id, productId: allProds[0].id }, // Aurora Solitaire
      { userId: customer.id, productId: allProds[5].id }, // Diamond Tennis Necklace
      { userId: customer.id, productId: allProds[12].id } // Chronograph Watch
    ]
  });

  const address = await prisma.address.findFirst({ where: { userId: customer.id } });
  await prisma.order.create({
    data: {
      userId: customer.id,
      totalAmount: 435.00,
      status: 'DELIVERED',
      addressId: address.id,
      items: {
        create: [
          { productId: allProds[3].id, quantity: 1, price: 350.00 }, // Minimalist Gold Band
          { productId: allProds[15].id, quantity: 1, price: 85.00 }  // Braided Leather Bracelet
        ]
      }
    }
  });

  console.log('🎉 AURORA Premium Database MASSIVE Seeding Finished Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });