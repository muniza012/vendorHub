export const IMAGE_PATH = "../../assets/category-assets/";


export const heroSlides = [
  {
    title: "Summer Sale",
    offer: "Up to 70% OFF",
    description: "Discover amazing products from your favorite stores.",
    button: "Shop Now",
    image: "slider-4.avif",
  },

  {
    title: "Latest Gadgets",
    offer: "Starting at $99",
    description: "Phones, laptops, gaming and more.",
    button: "Explore",
    image: "slider-3.avif",
  },

  {
    title: "Trending Styles",
    offer: "Buy 2 Get 1",
    description: "Upgrade your wardrobe with top brands.",
    button: "Discover",
    image: "slider-2.avif",
  },
];

export const products = [
  {
    id: 1,
    sku: "SONY-WH1000XM5",
    brand: "Sony",
    name: "Wireless Noise Cancelling Headphones",

    category: "Electronics",
    vendorId: 1,
    vendor: "Sony Official",

    price: 149.99,
    originalPrice: 169.99,
    currency: "$",
    discount: "12% OFF",

    rating: 4.8,
    reviews: 342,

    stock: 17,
    inStock: true,

    shipping: "Free Shipping",

    image: "headphones.png",
    images: ["headphones.png", "headphones-side.webp"],
    alt: "Wireless Headphones",

    description:
      "Experience premium sound with industry-leading noise cancellation, crystal-clear voice calls, and up to 30 hours of battery life. Perfect for travel, work, and entertainment.",

    features: [
      "Active Noise Cancellation",
      "30 Hours Battery",
      "Bluetooth 5.3",
      "USB-C Fast Charging",
    ],
  },

  {
    id: 2,
    sku: "NIKE-AIRZOOM-001",
    brand: "Nike",
    name: "Air Zoom Running Shoes",

    category: "Clothing",
    vendorId: 2,
    vendor: "Nike Store",

    price: 89.99,
    originalPrice: 99.99,
    currency: "$",
    discount: "10% OFF",

    rating: 4.7,
    reviews: 518,

    stock: 24,
    inStock: true,

    shipping: "Free Shipping",

    image: "nike-shoes.avif",
    images: ["nike-shoes.avif", "nike-shoes-side.webp"],
    alt: "Running Shoes",

    description:
      "Designed for runners who demand comfort and performance. Lightweight construction with responsive Zoom Air cushioning provides energy return throughout every run.",

    features: [
      "Zoom Air Cushioning",
      "Breathable Mesh Upper",
      "Rubber Outsole",
      "Lightweight Design",
    ],
  },

  {
    id: 3,
    sku: "APPLE-WATCH10",
    brand: "Apple",
    name: "Apple Watch Series 10",

    category: "Electronics",
    vendorId: 3,
    vendor: "Apple Store",

    price: 399.99,
    originalPrice: 429.99,
    currency: "$",
    discount: "8% OFF",

    rating: 4.9,
    reviews: 912,

    stock: 12,
    inStock: true,

    shipping: "Free Shipping",

    image: "apple-watch-10.jpg",
    images: ["apple-watch-10.jpg", "apple-watch-10-side.jfif"],
    alt: "Apple Watch",

    description:
      "Stay connected, monitor your health, track workouts, receive notifications, and enjoy Apple's brightest display ever in a lightweight premium smartwatch.",

    features: [
      "Always-On Retina Display",
      "Heart Rate Monitoring",
      "GPS + Bluetooth",
      "Water Resistant",
    ],
  },

  {
    id: 4,
    sku: "NESPRESSO-VERTUO",
    brand: "Nespresso",
    name: "Premium Coffee Machine",

    category: "Electronics",
    vendorId: 4,
    vendor: "Nespresso Official",

    price: 229.99,
    originalPrice: 269.99,
    currency: "$",
    discount: "15% OFF",

    rating: 4.6,
    reviews: 186,

    stock: 8,
    inStock: true,

    shipping: "Free Shipping",

    image: "coffee.jfif",
    images: ["coffee.jfif", "coffee-side.avif"],
    alt: "Coffee Machine",

    description:
      "Brew café-quality espresso and coffee at home using one-touch brewing technology and a premium 19-bar pressure extraction system.",

    features: [
      "One-Touch Brewing",
      "Fast Heat-Up",
      "19 Bar Pressure Pump",
      "Energy Saving Mode",
    ],
  },

  {
    id: 5,
    sku: "LOGI-G915-RGB",
    brand: "Logitech",
    name: "RGB Mechanical Gaming Keyboard",

    category: "Electronics",
    vendorId: 5,
    vendor: "Logitech Store",

    price: 119.99,
    originalPrice: 149.99,
    currency: "$",
    discount: "20% OFF",

    rating: 4.8,
    reviews: 431,

    stock: 31,
    inStock: true,

    shipping: "Free Shipping",

    image: "keyboard.png",
    images: ["keyboard.png", "keyboard-side.avif"],
    alt: "Gaming Keyboard",

    description:
      "Premium mechanical gaming keyboard with customizable RGB lighting, ultra-fast response time, durable aluminum construction, and programmable keys.",

    features: [
      "Mechanical Switches",
      "RGB Backlighting",
      "USB-C Connectivity",
      "Anti-Ghosting Keys",
    ],
  },

  {
    id: 6,
    sku: "HUDA-EASYBAKE",
    brand: "Huda Beauty",
    name: "Easy Bake Loose Baking & Setting Powder",

    category: "Beauty",
    vendorId: 6,
    vendor: "Huda Beauty",

    price: 38.0,
    originalPrice: 43.0,
    currency: "$",
    discount: "12% OFF",

    rating: 4.9,
    reviews: 764,

    stock: 42,
    inStock: true,

    shipping: "Free Shipping",

    image: "huda.jfif",
    images: ["huda.jfif", "huda-double.webp"],
    alt: "Huda Beauty Powder",

    description:
      "A lightweight loose setting powder that controls shine, brightens the complexion, and delivers a smooth, long-lasting airbrushed finish for every skin type.",

    features: [
      "Long Lasting",
      "Lightweight Formula",
      "Oil Control",
      "Suitable for All Skin Types",
    ],
  },
];
// export const stores = [
//   {
//     id: 1,
//     name: "Hotels",
//     logo: "hotels.png",
//     alt: "Hotels",
//   },

//   {
//     id: 2,
//     name: "Nike",
//     logo: "nike.png",
//     alt: "Nike",
//   },

//   {
//     id: 3,
//     name: "Temu",
//     logo: "temu.png",
//     alt: "Temu",
//   },

//   {
//     id: 4,
//     name: "Adidas",
//     logo: "addidas.png",
//     alt: "Adidas",
//     hoverBg: "hover:bg-black",
//   },

//   {
//     id: 5,
//     name: "Expedia",
//     logo: "expedia.png",
//     alt: "Expedia",
//   },

//   {
//     id: 6,
//     name: "Walgreen",
//     logo: "walgreen.png",
//     alt: "Walgreen",
//   },

//   {
//     id: 7,
//     name: "Kohl's",
//     logo: "kohls.png",
//     alt: "Kohl's",
//     hoverBg: "hover:bg-black",
//   },
// ];

export const stores = [
  {
    id: 1,
    name: "Sony Official",
    logo: "sonyLogo.png",
    alt: "Sony Official",
    isNew: false,
    hoverBg: "hover:bg-pink-950",
  },

  {
    id: 2,
    name: "Nike Store",
    logo: "nikeLogo.png",
    alt: "Nike Store",
    isNew: false,
    hoverBg: "hover:bg-red-800",
  },

  {
    id: 3,
    name: "Apple Store",
    logo: "AppleLogo.png",
    alt: "Apple Store",
    isNew: false,
    hoverBg: "hover:bg-red-800",
  },

  {
    id: 4,
    name: "Nespresso Official",
    logo: "NespressoLogo.png",
    alt: "Nespresso Official",
    isNew: false,
    hoverBg: "hover:bg-green-950",
  },

  {
    id: 5,
    name: "Logitech Store",
    logo: "logitechLogo.png",
    alt: "Logitech Store",
    isNew: true,
    hoverBg: "hover:bg-orange-400",
  },

  {
    id: 6,
    name: "Huda Beauty",
    logo: "hudaLogo.png",
    alt: "Huda Beauty",
    isNew: true,
    hoverBg: "hover:bg-blue-600",
  },
];
export const categories = [
  { name: "Food" },
  { name: "Electronics" },
  { name: "Beauty" },
  { name: "Clothing" },
  { name: "Travel" },
  { name: "Home" },
  { name: "Accessories" },
];


export const categoryCarouselItems = [
  {
    name: "Clothing",
    image: "3.-clothing.png",
    alt: "Clothing",
  },
  {
    name: "Beauty",
    image: "beauty.png",
    alt: "Beauty",
  },
  {
    name: "Accessories",
    image: "accessories1762370411256.png",
    alt: "Accessories",
  },
  {
    name: "Travel",
    image: "1.-travel.png",
    alt: "Travel",
  },
  {
    name: "Food",
    image: "12.-food.png",
    alt: "Food",
  },
  {
    name: "Electronics",
    image: "electronic.png",
    alt: "Electronics",
  },
  {
    name: "Home",
    image: "home (1).png",
    alt: "Home",
  },
  {
    name: "Favourites",
    type: "link",
    link: "wishlist.html",
    image: "favorties.png",
    alt: "Favourites",
  },
  {
    name: "All-stores",
    type: "link",
    link: "stores.html",
    image: "all-stores.png",
    alt: "All Stores",
  },
  {
    name: "New Stores",
    type: "link",
    link: "stores.html?filter=new",
    image: "new-stores.png",
    alt: "New Stores",
  },
];

////////////delivery options

export const deliveryOptions = [
  {
    id: "1",
    name: "Free Delivery",
    deliveryDays: "5 - 7 Days",
    price: 0,
  },
  {
    id: "2",
    name: "Express Delivery",
    deliveryDays: "2 - 3 Days",
    price: 10,
  },
  {
    id: "3",
    name: "Next Day Delivery",
    deliveryDays: "1 Day",
    price: 20,
  },
];
