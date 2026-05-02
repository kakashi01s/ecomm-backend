import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('✨ Starting AURORA premium jewelry database seeding...');

  // ==========================================
  // 1. CLEAR EXISTING DATA (Reverse order to respect Foreign Keys)
  // ==========================================
  console.log('🧹 Clearing old data...');
  await prisma.cartItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany(); // 🚨 Added banner cleanup
  
  // ==========================================
  // 2. CREATE DYNAMIC BANNERS
  // ==========================================
  console.log('🎬 Creating Dynamic Banners...');
  await prisma.banner.createMany({
    data: [
      {
        title: "The Silver Symphony",
        // Using Flutter's highly stable official test video so you don't get 403 errors!
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
      }
    ]
  });

  // ==========================================
  // 3. CREATE CATEGORIES (Now with Images!)
  // ==========================================
  console.log('📦 Creating jewelry categories...');
  const catRoot = await prisma.category.create({ 
    data: { 
      name: 'Silver Collection',
      imageUrl: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=400&q=80' 
    } 
  });
  
  const catRings = await prisma.category.create({ 
    data: { name: 'Rings', parentId: catRoot.id, imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&w=400&q=80' } 
  });
  const catNecklaces = await prisma.category.create({ 
    data: { name: 'Necklaces', parentId: catRoot.id, imageUrl: 'https://images.unsplash.com/photo-1599643478514-4a4e08b50faa?auto=format&fit=crop&w=400&q=80' } 
  });
  const catEarrings = await prisma.category.create({ 
    data: { name: 'Earrings', parentId: catRoot.id, imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80' } 
  });
  const catBracelets = await prisma.category.create({ 
    data: { name: 'Bracelets', parentId: catRoot.id, imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=400&q=80' } 
  });

  // ==========================================
  // 4. THE JEWELRY CATALOG
  // ==========================================
  const products = [
    // --- RINGS ---
    {
      name: 'Sterling Silver Minimalist Band',
      description: 'A sleek, high-polished 925 sterling silver band. Perfect for stacking or wearing alone for a clean, modern look.',
      price: 45.00,
      stock: 150,
      isActive: true,
      categoryId: catRings.id,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&w=600&q=80' }] },
      variants: {
        create: [
          { size: 'US 6', color: 'Silver', stock: 50, price: 45.00 },
          { size: 'US 7', color: 'Silver', stock: 50, price: 45.00 },
          { size: 'US 8', color: 'Silver', stock: 50, price: 45.00 }
        ]
      }
    },
    {
      name: 'Vintage Engraved Silver Signet',
      description: 'Hand-engraved floral motifs on a solid sterling silver signet ring. Heirloom quality with a slightly oxidized finish.',
      price: 85.00,
      salePrice: 65.00, // On Sale
      stock: 40,
      isActive: true,
      categoryId: catRings.id,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80' }] },
      variants: {
        create: [
          { size: 'US 7', color: 'Oxidized Silver', stock: 20, price: 85.00 },
          { size: 'US 9', color: 'Oxidized Silver', stock: 20, price: 85.00 }
        ]
      }
    },
    {
      name: 'Moissanite Silver Halo Ring',
      description: 'A brilliant 1-carat conflict-free Moissanite stone set in a 925 sterling silver halo setting. Unmatched sparkle.',
      price: 150.00,
      stock: 25,
      isActive: true,
      categoryId: catRings.id,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80' }] },
      variants: { create: [{ size: 'US 6.5', color: 'Silver', stock: 25, price: 150.00 }] }
    },

    // --- NECKLACES ---
    {
      name: 'Herringbone Silver Chain',
      description: 'A fluid, liquid-like herringbone chain crafted from pure 925 sterling silver. Lays perfectly flat against the collarbone.',
      price: 110.00,
      stock: 80,
      isActive: true,
      categoryId: catNecklaces.id,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1599643478514-4a4e08b50faa?auto=format&fit=crop&w=600&q=80' }] },
      variants: {
        create: [
          { size: '16 inch', color: 'Silver', stock: 40, price: 110.00 },
          { size: '18 inch', color: 'Silver', stock: 40, price: 120.00 } 
        ]
      }
    },
    {
      name: 'Tear Drop Moonstone Pendant',
      description: 'An ethereal rainbow moonstone cut in a teardrop shape, suspended on a delicate sterling silver cable chain.',
      price: 75.00,
      stock: 60,
      isActive: true,
      categoryId: catNecklaces.id,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=600&q=80' }] },
      variants: { create: [{ size: '18 inch', color: 'Silver/Moonstone', stock: 60, price: 75.00 }] }
    },

    // --- EARRINGS ---
    {
      name: 'Chunky Silver Tube Hoops',
      description: 'Lightweight but bold. These chunky tube hoops offer maximum impact without weighing down your ears.',
      price: 55.00,
      stock: 120,
      isActive: true,
      categoryId: catEarrings.id,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80' }] },
      variants: { create: [{ size: '30mm', color: 'Silver', stock: 120, price: 55.00 }] }
    },
    {
      name: 'Opal Stud Earrings',
      description: 'Minimalist 4mm lab-created opals set in a simple sterling silver prong setting. Flashes of blue, pink, and green.',
      price: 40.00,
      salePrice: 32.00, // On sale
      stock: 200,
      isActive: true,
      categoryId: catEarrings.id,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=600&q=80' }] },
      variants: { create: [{ size: '4mm', color: 'Silver/Opal', stock: 200, price: 40.00 }] }
    },

    // --- BRACELETS ---
    {
      name: 'Heavy Paperclip Chain Bracelet',
      description: 'A bold, flat paperclip chain bracelet in 925 sterling silver. Features a secure lobster clasp.',
      price: 95.00,
      stock: 45,
      isActive: true,
      categoryId: catBracelets.id,
      images: { create: [{ url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80' }] },
      variants: {
        create: [
          { size: '6.5 inch', color: 'Silver', stock: 20, price: 95.00 },
          { size: '7.5 inch', color: 'Silver', stock: 25, price: 95.00 }
        ]
      }
    }
  ];

  console.log('🚀 Inserting jewelry products...');
  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData
    });
    console.log(`Created: ${product.name}`);
  }

  console.log('🎉 AURORA Jewelry seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });