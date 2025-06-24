import { storage } from './storage';

export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Create categories
    const categories = [
      { name: 'Tops', slug: 'tops', description: 'Shirts, blouses, and t-shirts' },
      { name: 'Bottoms', slug: 'bottoms', description: 'Pants, jeans, and shorts' },
      { name: 'Dresses', slug: 'dresses', description: 'Casual and formal dresses' },
      { name: 'Outerwear', slug: 'outerwear', description: 'Jackets, coats, and blazers' },
      { name: 'Accessories', slug: 'accessories', description: 'Bags, jewelry, and belts' }
    ];

    const createdCategories = [];
    for (const category of categories) {
      const existing = await storage.getCategoryBySlug(category.slug);
      if (!existing) {
        const created = await storage.createCategory(category);
        createdCategories.push(created);
      }
    }

    // Create sample products
    const products = [
      {
        name: 'Classic White T-Shirt',
        slug: 'classic-white-tshirt',
        description: 'Comfortable cotton t-shirt perfect for everyday wear',
        price: '29.99',
        salePrice: '24.99',
        brand: 'EshoBasics',
        categoryId: 1,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
        colors: ['White', 'Black', 'Gray'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        stock: 150,
        rating: '4.5',
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Blue Denim Jeans',
        slug: 'blue-denim-jeans',
        description: 'High-quality denim jeans with a modern fit',
        price: '79.99',
        salePrice: '59.99',
        brand: 'DenimCo',
        categoryId: 2,
        imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
        colors: ['Blue', 'Dark Blue', 'Light Blue'],
        sizes: ['28', '30', '32', '34', '36'],
        stock: 75,
        rating: '4.3',
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Summer Floral Dress',
        slug: 'summer-floral-dress',
        description: 'Beautiful floral dress perfect for summer occasions',
        price: '89.99',
        salePrice: '69.99',
        brand: 'FloralFashion',
        categoryId: 3,
        imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500',
        colors: ['Floral Blue', 'Floral Pink', 'Floral Yellow'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        stock: 60,
        rating: '4.7',
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Leather Jacket',
        slug: 'leather-jacket',
        description: 'Premium leather jacket with classic styling',
        price: '199.99',
        salePrice: '149.99',
        brand: 'LeatherLux',
        categoryId: 4,
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
        colors: ['Black', 'Brown', 'Tan'],
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 25,
        rating: '4.8',
        isActive: true,
        isFeatured: true
      },
      {
        name: 'Designer Handbag',
        slug: 'designer-handbag',
        description: 'Elegant handbag for everyday sophistication',
        price: '149.99',
        salePrice: '119.99',
        brand: 'LuxeBags',
        categoryId: 5,
        imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500',
        colors: ['Black', 'Brown', 'Beige'],
        sizes: ['One Size'],
        stock: 40,
        rating: '4.6',
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Striped Sweater',
        slug: 'striped-sweater',
        description: 'Cozy striped sweater for cool weather',
        price: '64.99',
        salePrice: '49.99',
        brand: 'WarmWear',
        categoryId: 1,
        imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500',
        colors: ['Navy/White', 'Red/White', 'Black/Gray'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        stock: 80,
        rating: '4.4',
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Casual Chinos',
        slug: 'casual-chinos',
        description: 'Versatile chino pants for smart-casual looks',
        price: '59.99',
        salePrice: '44.99',
        brand: 'SmartCasual',
        categoryId: 2,
        imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500',
        colors: ['Khaki', 'Navy', 'Olive'],
        sizes: ['28', '30', '32', '34', '36'],
        stock: 90,
        rating: '4.2',
        isActive: true,
        isFeatured: false
      },
      {
        name: 'Evening Gown',
        slug: 'evening-gown',
        description: 'Elegant evening gown for special occasions',
        price: '249.99',
        salePrice: '199.99',
        brand: 'ElegantEvening',
        categoryId: 3,
        imageUrl: 'https://images.unsplash.com/photo-1566479179817-c32639b63ced?w=500',
        colors: ['Black', 'Navy', 'Burgundy'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        stock: 15,
        rating: '4.9',
        isActive: true,
        isFeatured: true
      }
    ];

    for (const product of products) {
      const existing = await storage.getProductBySlug(product.slug);
      if (!existing) {
        await storage.createProduct(product);
      }
    }

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}