import { Category, Product, DeliveryLocation } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All Menu' },
  { id: 'burgers', name: 'Burgers', description: 'Handmade smashed beef & crispy buttermilk chicken' },
  { id: 'submarines', name: 'Submarines', description: 'Toasted artisan rolls stacked with savory meats and melted cheese' },
  { id: 'pizza', name: 'Pizza', description: 'Stone-baked thin crust sourdough pizzas with blistered edges' },
  { id: 'sides', name: 'Sides & Dips', description: 'Golden hand-cut fries, tenders, and signature house sauces' },
  { id: 'drinks', name: 'Drinks', description: 'Chilled craft lemonades, thick shakes, and sodas' },
  { id: 'deals', name: 'Chonky Combos', description: 'Curated feasts & crave bundles' }
];

export const DELIVERY_LOCATIONS: DeliveryLocation[] = [
  { id: 'male', area: "Malé City", deliveryFee: 20, estTime: "25–35 mins" },
  { id: 'hulhumale1', area: "Hulhumalé Phase 1", deliveryFee: 25, estTime: "30–40 mins" },
  { id: 'hulhumale2', area: "Hulhumalé Phase 2", deliveryFee: 30, estTime: "35–45 mins" },
  { id: 'vilimale', area: "Vilimalé (Ferry Pickup)", deliveryFee: 25, estTime: "40–50 mins" },
  { id: 'jetty', area: "Malé Boat / Jetty Delivery", deliveryFee: 25, estTime: "30–40 mins" }
];

export const PRODUCTS: Product[] = [
  // --- BURGERS ---
  {
    id: 'chonky-smash-classic',
    name: 'The Chonky OG Smash',
    category: 'burgers',
    description: 'Double 100% Angus smash patties, double aged American cheese, grilled sweet onions, house pickled dill pickles, and signature Chonky secret sauce on a toasted potato bun.',
    basePrice: 145,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
    badge: 'Bestseller',
    isPopular: true,
    isAvailable: true,
    calories: '780 kcal',
    prepTime: '12-15 mins',
    optionGroups: [
      {
        id: 'bun-type',
        title: 'Choose Your Bun',
        required: true,
        choices: [
          { id: 'potato-bun', name: 'Golden Potato Bun (Recommended)', priceDelta: 0, isDefault: true },
          { id: 'brioche-bun', name: 'Buttery Glazed Brioche', priceDelta: 10 },
          { id: 'lettuce-wrap', name: 'Crisp Lettuce Wrap (Low Carb)', priceDelta: 0 }
        ]
      },
      {
        id: 'patty-size',
        title: 'Meat Portions',
        required: true,
        choices: [
          { id: 'double-patty', name: 'Double Patty (Original)', priceDelta: 0, isDefault: true },
          { id: 'triple-patty', name: 'Triple Patty (Mega Chonky)', priceDelta: 45 },
          { id: 'single-patty', name: 'Single Patty', priceDelta: -25 }
        ]
      },
      {
        id: 'spice-level',
        title: 'Heat Level',
        required: false,
        choices: [
          { id: 'regular', name: 'Classic (Mild)', priceDelta: 0, isDefault: true },
          { id: 'spicy', name: 'Spicy Kick (Cayenne & Jalapeño)', priceDelta: 5 },
          { id: 'ghost-hot', name: 'Flamin’ Hot (Ghost Pepper Dust)', priceDelta: 10 }
        ]
      }
    ],
    extras: [
      { id: 'ex-bacon-jam', name: 'Sweet Bacon Jam', price: 25, description: 'Slow cooked smoky beef bacon & maple' },
      { id: 'ex-extra-cheese', name: 'Extra Melted Cheddar', price: 18, description: 'Two slices rich aged cheddar' },
      { id: 'ex-grilled-mushrooms', name: 'Buttery Truffle Mushrooms', price: 22, description: 'Sauteed portobello' },
      { id: 'ex-fried-egg', name: 'Crispy Fried Egg', price: 15, description: 'Sunny side runny yolk' }
    ]
  },
  {
    id: 'truffle-melt-burger',
    name: 'Smoked Truffle Melt',
    category: 'burgers',
    description: 'Double Angus beef patties smothered in melted Swiss cheese, caramelized balsamic shallots, and house-whipped black truffle garlic aioli.',
    basePrice: 165,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=900&q=80',
    badge: 'Chef\'s Pick',
    isPopular: true,
    isAvailable: true,
    prepTime: '15 mins',
    optionGroups: [
      {
        id: 'bun-type',
        title: 'Choose Your Bun',
        required: true,
        choices: [
          { id: 'brioche-bun', name: 'Buttery Glazed Brioche', priceDelta: 0, isDefault: true },
          { id: 'potato-bun', name: 'Golden Potato Bun', priceDelta: 0 }
        ]
      },
      {
        id: 'patty-size',
        title: 'Meat Portions',
        required: true,
        choices: [
          { id: 'double-patty', name: 'Double Patty', priceDelta: 0, isDefault: true },
          { id: 'triple-patty', name: 'Triple Patty', priceDelta: 45 }
        ]
      }
    ],
    extras: [
      { id: 'ex-extra-truffle', name: 'Extra Truffle Aioli Dip', price: 20 },
      { id: 'ex-crispy-shallots', name: 'Crispy French Fried Shallots', price: 15 },
      { id: 'ex-extra-swiss', name: 'Double Swiss Emmental Cheese', price: 20 }
    ]
  },
  {
    id: 'crispy-nashville-chicken',
    name: 'Nashville Hot Crispy Chicken',
    category: 'burgers',
    description: '24-hour buttermilk brined chicken breast, dredged in spicy seasoned flour, fried crispy and dipped in hot cayenne chili oil. Topped with apple slaw and pickles.',
    basePrice: 135,
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=900&q=80',
    badge: 'Hot',
    isPopular: true,
    isAvailable: true,
    prepTime: '12-15 mins',
    optionGroups: [
      {
        id: 'spice-level',
        title: 'Nashville Heat Scale',
        required: true,
        choices: [
          { id: 'mild', name: 'Mild Heat (Pleasant Tingle)', priceDelta: 0 },
          { id: 'medium', name: 'Medium Hot (The Standard)', priceDelta: 0, isDefault: true },
          { id: 'hot', name: 'Extra Hot (Sweat Guaranteed)', priceDelta: 5 },
          { id: 'reaper', name: 'Carolina Reaper (Fire Alarm)', priceDelta: 10 }
        ]
      },
      {
        id: 'cheese-option',
        title: 'Cheese Addition',
        required: false,
        choices: [
          { id: 'no-cheese', name: 'No Cheese', priceDelta: 0, isDefault: true },
          { id: 'pepper-jack', name: 'Pepper Jack Melt', priceDelta: 15 },
          { id: 'american', name: 'Classic American', priceDelta: 15 }
        ]
      }
    ],
    extras: [
      { id: 'ex-honey-drizzle', name: 'Hot Honey Drizzle', price: 15 },
      { id: 'ex-pickles', name: 'Extra Pickle Chips', price: 10 },
      { id: 'ex-ranch', name: 'House Herb Ranch Dip', price: 15 }
    ]
  },
  {
    id: 'bbq-smokehouse-bacon',
    name: 'BBQ Smokehouse Bacon Beast',
    category: 'burgers',
    description: 'Double beef patties, crispy onion rings, thick-cut smoked beef bacon, sharp cheddar, and smoky hickory barbecue sauce on toasted sesame brioche.',
    basePrice: 155,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
    badge: 'Popular',
    isPopular: false,
    isAvailable: true,
    prepTime: '15 mins',
    optionGroups: [
      {
        id: 'patty-size',
        title: 'Patty Options',
        required: true,
        choices: [
          { id: 'double-patty', name: 'Double Patty', priceDelta: 0, isDefault: true },
          { id: 'triple-patty', name: 'Triple Patty', priceDelta: 45 }
        ]
      }
    ],
    extras: [
      { id: 'ex-bacon', name: 'Double Smoked Bacon', price: 25 },
      { id: 'ex-bbq-dip', name: 'Extra Hickory BBQ Sauce', price: 12 },
      { id: 'ex-rings', name: 'Add Onion Rings Layer', price: 18 }
    ]
  },

  // --- SUBMARINES ---
  {
    id: 'philly-cheesesteak-sub',
    name: 'The Chonky Philly Cheesesteak',
    category: 'submarines',
    description: 'Thinly shaved prime ribeye steak seared on the flat top with caramelized sweet onions and green peppers, drenched in gooey melted provolone & house cheese sauce inside a toasted 10-inch artisan roll.',
    basePrice: 175,
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=900&q=80',
    badge: 'Bestseller',
    isPopular: true,
    isAvailable: true,
    prepTime: '15-18 mins',
    optionGroups: [
      {
        id: 'sub-size',
        title: 'Select Sub Size',
        required: true,
        choices: [
          { id: 'sub-reg', name: '8" Regular Sub', priceDelta: 0, isDefault: true },
          { id: 'sub-chonky', name: '12" Full Chonky Sub (Generous)', priceDelta: 45 }
        ]
      },
      {
        id: 'cheese-type',
        title: 'Cheese Blend',
        required: true,
        choices: [
          { id: 'whiz-provolone', name: 'Provolone + Real Cheese Whiz', priceDelta: 0, isDefault: true },
          { id: 'smoked-gouda', name: 'Smoked Gouda Melt', priceDelta: 15 },
          { id: 'white-cheddar', name: 'Sharp White Cheddar', priceDelta: 10 }
        ]
      }
    ],
    extras: [
      { id: 'ex-cherry-peppers', name: 'Spicy Pickled Cherry Peppers', price: 15 },
      { id: 'ex-extra-steak', name: 'Extra Ribeye Steak (50g)', price: 35 },
      { id: 'ex-mushrooms', name: 'Garlic Sauteed Mushrooms', price: 18 }
    ]
  },
  {
    id: 'loaded-chicken-parm-sub',
    name: 'Crispy Chicken Parmigiana Sub',
    category: 'submarines',
    description: 'Panko herb-crusted chicken breast cutlet, rich San Marzano marinara, fresh melted mozzarella, grated aged Pecorino Romano, and sweet basil pesto on garlic-toasted bread.',
    basePrice: 150,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80',
    badge: 'Chef\'s Pick',
    isPopular: true,
    isAvailable: true,
    prepTime: '15 mins',
    optionGroups: [
      {
        id: 'sub-size',
        title: 'Select Sub Size',
        required: true,
        choices: [
          { id: 'sub-reg', name: '8" Regular Sub', priceDelta: 0, isDefault: true },
          { id: 'sub-chonky', name: '12" Full Chonky Sub', priceDelta: 40 }
        ]
      }
    ],
    extras: [
      { id: 'ex-extra-marinara', name: 'Side of Warm Marinara Dip', price: 15 },
      { id: 'ex-ricotta', name: 'Whipped Ricotta Layer', price: 20 },
      { id: 'ex-prosciutto', name: 'Crisped Prosciutto Shavings', price: 25 }
    ]
  },
  {
    id: 'spicy-italian-cold-cut-sub',
    name: 'Godfather Italian Deli Sub',
    category: 'submarines',
    description: 'Stacked high with beef pastrami, smoked turkey ham, salami, provolone, shredded iceberg, heirloom tomatoes, red onions, oregano, and house red wine vinaigrette.',
    basePrice: 160,
    image: 'https://images.unsplash.com/photo-1554998171-89445e31c52b?auto=format&fit=crop&w=900&q=80',
    badge: 'New',
    isPopular: false,
    isAvailable: true,
    prepTime: '10-12 mins',
    optionGroups: [
      {
        id: 'sub-style',
        title: 'Preparation Style',
        required: true,
        choices: [
          { id: 'toasted', name: 'Hot Pressed & Toasted (Melted)', priceDelta: 0, isDefault: true },
          { id: 'classic-cold', name: 'Classic Deli Cold-Cut', priceDelta: 0 }
        ]
      }
    ],
    extras: [
      { id: 'ex-giardiniera', name: 'Chicago Style Hot Giardiniera', price: 15 },
      { id: 'ex-extra-cheese', name: 'Extra Provolone', price: 15 }
    ]
  },

  // --- PIZZA ---
  {
    id: 'chonky-hot-honey-pepperoni',
    name: 'Hot Honey Double Pepperoni Pizza',
    category: 'pizza',
    description: '48-hour slow fermented sourdough crust, San Marzano tomato sauce, fresh fior di latte mozzarella, cupping beef pepperoni that chars to perfection, and a spicy chili-infused hot honey drizzle.',
    basePrice: 210,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80',
    badge: 'Bestseller',
    isPopular: true,
    isAvailable: true,
    prepTime: '18-20 mins',
    optionGroups: [
      {
        id: 'pizza-size',
        title: 'Choose Size',
        required: true,
        choices: [
          { id: 'piz-10', name: '10" Personal (6 Slices)', priceDelta: 0, isDefault: true },
          { id: 'piz-14', name: '14" Large Sharing (8 Slices)', priceDelta: 65 }
        ]
      },
      {
        id: 'crust-style',
        title: 'Crust Type',
        required: true,
        choices: [
          { id: 'sourdough', name: 'Artisan Sourdough Thin Crust', priceDelta: 0, isDefault: true },
          { id: 'cheese-stuffed', name: 'Mozzarella Stuffed Crust', priceDelta: 35 },
          { id: 'garlic-butter-crust', name: 'Garlic Butter Herb Brush', priceDelta: 15 }
        ]
      }
    ],
    extras: [
      { id: 'ex-extra-honey', name: 'Extra Pot of Spicy Hot Honey', price: 18 },
      { id: 'ex-burrata', name: 'Add Fresh Whole Burrata Centre', price: 45 },
      { id: 'ex-garlic-ranch', name: 'House Garlic Cream Dip', price: 15 }
    ]
  },
  {
    id: 'truffle-wild-mushroom-pizza',
    name: 'Black Truffle & Wild Mushroom',
    category: 'pizza',
    description: 'Creamy mascarpone garlic white base, roasted shiitake and button mushrooms, smoked provolone, fresh thyme, and cold-pressed Italian white truffle oil.',
    basePrice: 225,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
    badge: 'Chef\'s Pick',
    isPopular: true,
    isAvailable: true,
    prepTime: '18 mins',
    optionGroups: [
      {
        id: 'pizza-size',
        title: 'Choose Size',
        required: true,
        choices: [
          { id: 'piz-10', name: '10" Personal (6 Slices)', priceDelta: 0, isDefault: true },
          { id: 'piz-14', name: '14" Large Sharing (8 Slices)', priceDelta: 70 }
        ]
      }
    ],
    extras: [
      { id: 'ex-parm', name: 'Fresh Shaved 24-Mo Parmesan', price: 25 },
      { id: 'ex-truffle-oil', name: 'Extra White Truffle Drizzle', price: 20 }
    ]
  },
  {
    id: 'margherita-stracciatella',
    name: 'Classic Margherita D.O.P.',
    category: 'pizza',
    description: 'Simplicity at its best: crushed San Marzano tomatoes, fresh mozzarella medallions, olive oil, and sweet torn basil on charred blistered crust.',
    basePrice: 175,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80',
    badge: 'Popular',
    isPopular: false,
    isAvailable: true,
    prepTime: '15 mins',
    optionGroups: [
      {
        id: 'pizza-size',
        title: 'Choose Size',
        required: true,
        choices: [
          { id: 'piz-10', name: '10" Personal (6 Slices)', priceDelta: 0, isDefault: true },
          { id: 'piz-14', name: '14" Large Sharing (8 Slices)', priceDelta: 55 }
        ]
      }
    ],
    extras: [
      { id: 'ex-extra-cheese', name: 'Double Mozzarella Melt', price: 25 },
      { id: 'ex-anchovies', name: 'Salt-cured Anchovies', price: 20 }
    ]
  },

  // --- SIDES & DIPS ---
  {
    id: 'loaded-chonky-fries',
    name: 'Loaded Animal-Style Fries',
    category: 'sides',
    description: 'Crispy skin-on potato fries topped with caramelized diced onions, melted cheddar cheese sauce, pickled jalapeños, and Chonky secret sauce.',
    basePrice: 75,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=900&q=80',
    badge: 'Bestseller',
    isPopular: true,
    isAvailable: true,
    prepTime: '8-10 mins',
    optionGroups: [
      {
        id: 'spice-style',
        title: 'Jalapeño Level',
        required: true,
        choices: [
          { id: 'jalapenos-on', name: 'With Pickled Jalapeños', priceDelta: 0, isDefault: true },
          { id: 'jalapenos-off', name: 'No Jalapeños (Mild)', priceDelta: 0 }
        ]
      }
    ],
    extras: [
      { id: 'ex-bacon-bits', name: 'Real Crispy Beef Bacon Bits', price: 18 },
      { id: 'ex-cheese-sauce', name: 'Extra Cheddar Sauce Dip', price: 15 }
    ]
  },
  {
    id: 'parmesan-truffle-fries',
    name: 'Truffle & Aged Parmesan Fries',
    category: 'sides',
    description: 'Thin-cut golden fries tossed in aromatic truffle oil, chopped fresh flat-leaf parsley, and mountains of microplaned 24-month aged parmesan cheese.',
    basePrice: 85,
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=900&q=80',
    badge: 'Chef\'s Pick',
    isPopular: false,
    isAvailable: true,
    prepTime: '8 mins',
    extras: [
      { id: 'ex-truffle-mayo', name: 'Garlic Truffle Mayo Tub', price: 15 }
    ]
  },
  {
    id: 'buttermilk-tenders',
    name: 'Crispy Buttermilk Chicken Tenders (4pcs)',
    category: 'sides',
    description: 'Hand-breaded jumbo chicken breast strips fried to a loud crunch. Served with your choice of house dipping sauce.',
    basePrice: 95,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=900&q=80',
    badge: 'Popular',
    isPopular: true,
    isAvailable: true,
    prepTime: '10 mins',
    optionGroups: [
      {
        id: 'dip-selection',
        title: 'Choose Included Dip',
        required: true,
        choices: [
          { id: 'chonky-sauce', name: 'Chonky Secret Sauce', priceDelta: 0, isDefault: true },
          { id: 'honey-mustard', name: 'Smoky Honey Mustard', priceDelta: 0 },
          { id: 'garlic-ranch', name: 'Cool Buttermilk Herb Ranch', priceDelta: 0 },
          { id: 'sweet-chili', name: 'Spicy Sweet Chili', priceDelta: 0 }
        ]
      }
    ],
    extras: [
      { id: 'ex-extra-dip', name: 'Extra Dipping Tub', price: 12 },
      { id: 'ex-nashville-dust', name: 'Dust with Nashville Hot Spice', price: 10 }
    ]
  },
  {
    id: 'craft-onion-rings',
    name: 'Beer-Battered Thick Onion Rings',
    category: 'sides',
    description: 'Giant sweet yellow onion rings double-dunked in craft batter and fried until deep golden and shattering. Served with chipotle aioli.',
    basePrice: 65,
    image: 'https://images.unsplash.com/photo-1639024471287-032f6644f4e2?auto=format&fit=crop&w=900&q=80',
    isPopular: false,
    isAvailable: true,
    prepTime: '8 mins'
  },

  // --- DRINKS ---
  {
    id: 'salted-caramel-pretzel-shake',
    name: 'Salted Caramel Pretzel Thickshake',
    category: 'drinks',
    description: 'Rich Madagascar vanilla bean soft serve churned with house salted caramel drizzle, crushed salted pretzels, and whipped double cream.',
    basePrice: 85,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80',
    badge: 'Bestseller',
    isPopular: true,
    isAvailable: true,
    prepTime: '5 mins',
    extras: [
      { id: 'ex-extra-caramel', name: 'Double Caramel Drizzle', price: 10 },
      { id: 'ex-malted', name: 'Make it Malted', price: 10 }
    ]
  },
  {
    id: 'fresh-passionfruit-lemonade',
    name: 'Handcrafted Passionfruit Lemonade',
    category: 'drinks',
    description: 'Freshly squeezed lemons, island passionfruit pulp, crushed mint leaves, and sparkling soda over crushed ice. Incredibly refreshing.',
    basePrice: 60,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80',
    badge: 'New',
    isPopular: true,
    isAvailable: true,
    prepTime: '4 mins',
    optionGroups: [
      {
        id: 'sweetness',
        title: 'Sweetness Level',
        required: true,
        choices: [
          { id: 'reg-sweet', name: 'Standard Sweetness', priceDelta: 0, isDefault: true },
          { id: 'less-sweet', name: 'Less Sweet (More Tart)', priceDelta: 0 }
        ]
      }
    ]
  },
  {
    id: 'belgian-chocolate-shake',
    name: 'Dark Belgian Chocolate Shake',
    category: 'drinks',
    description: 'Decadent 70% dark Belgian cocoa blended with rich cream, chocolate fudge swirl, and topped with chocolate curls.',
    basePrice: 80,
    image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=900&q=80',
    isPopular: false,
    isAvailable: true,
    prepTime: '5 mins'
  },

  // --- DEALS & COMBOS ---
  {
    id: 'the-duo-crave-bundle',
    name: 'The Duo Crave Bundle',
    category: 'deals',
    description: 'Choice of any 2 Burgers, 1 Loaded Animal-Style Fries, 1 Buttermilk Tenders (4pcs), and 2 Cold Drinks of your choice. Saves MVR 75!',
    basePrice: 380,
    image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=900&q=80',
    badge: 'Bestseller',
    isPopular: true,
    isAvailable: true,
    prepTime: '20 mins',
    optionGroups: [
      {
        id: 'burger-1',
        title: 'Select First Burger',
        required: true,
        choices: [
          { id: 'b1-smash', name: 'The Chonky OG Smash', priceDelta: 0, isDefault: true },
          { id: 'b1-chicken', name: 'Nashville Hot Crispy Chicken', priceDelta: 0 },
          { id: 'b1-truffle', name: 'Smoked Truffle Melt', priceDelta: 20 }
        ]
      },
      {
        id: 'burger-2',
        title: 'Select Second Burger',
        required: true,
        choices: [
          { id: 'b2-chicken', name: 'Nashville Hot Crispy Chicken', priceDelta: 0, isDefault: true },
          { id: 'b2-smash', name: 'The Chonky OG Smash', priceDelta: 0 },
          { id: 'b2-truffle', name: 'Smoked Truffle Melt', priceDelta: 20 }
        ]
      },
      {
        id: 'drinks-choice',
        title: 'Select 2 Drinks',
        required: true,
        choices: [
          { id: 'd-lemonade', name: '2x Passionfruit Lemonades', priceDelta: 0, isDefault: true },
          { id: 'd-shakes', name: '2x Shakes (Caramel & Choc)', priceDelta: 40 },
          { id: 'd-mix', name: '1x Lemonade + 1x Caramel Shake', priceDelta: 20 }
        ]
      }
    ]
  },
  {
    id: 'pizza-night-feast',
    name: 'Stone-Baked Pizza Feast',
    category: 'deals',
    description: '14" Hot Honey Double Pepperoni Pizza, 1 Large Truffle & Parmesan Fries, and 2 Gourmet Shakes.',
    basePrice: 420,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',
    badge: 'Chef\'s Pick',
    isPopular: true,
    isAvailable: true,
    prepTime: '22 mins'
  }
];

export const HERO_SLIDES = [
  {
    id: 'slide-chicken',
    category: 'sides',
    tagline: 'HOT & CRISPY',
    headline: 'Crave the Crispy Perfection!',
    description: 'Golden buttermilk chicken tenders, hand-breaded and served piping hot.',
    cta: 'Order Now',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1200&q=85',
    accent: '#700808'
  },
  {
    id: 'slide-burgers',
    category: 'burgers',
    tagline: 'HOT & SMASHED',
    headline: 'The Chonky OG Smash Burger',
    description: 'Double 100% Angus smash patties, gooey American cheese & secret sauce.',
    cta: 'Order Now',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85',
    accent: '#5e0606'
  },
  {
    id: 'slide-pizza',
    category: 'pizza',
    tagline: '48-HR SOURDOUGH',
    headline: 'Hot Honey Double Pepperoni',
    description: 'Stone-baked with blistering sourdough crusts and melted Italian mozzarella.',
    cta: 'Order Now',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=1200&q=85',
    accent: '#7a0a0a'
  },
  {
    id: 'slide-submarines',
    category: 'submarines',
    tagline: 'TOASTED HEARTH',
    headline: 'Loaded Ribeye Submarine',
    description: 'Seared shaved ribeye smothered in provolone on a crunchy hearth roll.',
    cta: 'Order Now',
    image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=1200&q=85',
    accent: '#4e0505'
  }
];
