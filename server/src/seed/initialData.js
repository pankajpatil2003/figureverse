const INITIAL_CATEGORIES = [
  {
    id: 1,
    name: 'Marvel',
    slug: 'marvel',
    tagline: 'Earth’s Mightiest Heroes, Multiverse Legends & Comic Classics',
    accent_color: '#e11d48',
    banner_image_url: 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=1200&q=85',
    display_order: 1
  },
  {
    id: 2,
    name: 'DC',
    slug: 'dc',
    tagline: 'Gotham Knights, Metropolis Icons & Multiverse Statues',
    accent_color: '#2563eb',
    banner_image_url: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=1200&q=85',
    display_order: 2
  },
  {
    id: 3,
    name: 'Fondjoy',
    slug: 'fondjoy',
    tagline: 'Official 1/9 Scale Licensed DC & Armored Collector Action Figures',
    accent_color: '#f59e0b',
    banner_image_url: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&w=1200&q=85',
    display_order: 3
  },
  {
    id: 4,
    name: 'CT Toys',
    slug: 'ct-toys',
    tagline: 'Ultra-Articulated 1/12 Scale Comic & Symbiote Series Figures',
    accent_color: '#a855f7',
    banner_image_url: 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=1200&q=85',
    display_order: 4
  },
  {
    id: 5,
    name: 'ZD Toys',
    slug: 'zd-toys',
    tagline: 'Hall of Armor LED Light-Up Iron Man & Metallic Collector Editions',
    accent_color: '#ef4444',
    banner_image_url: 'https://images.unsplash.com/photo-1623939012339-5b3dc8eca7c6?auto=format&fit=crop&w=1200&q=85',
    display_order: 5
  },
  {
    id: 6,
    name: 'Anime',
    slug: 'anime',
    tagline: 'Shonen Jump Grails, Scale Statues & Imported Japanese Exclusives',
    accent_color: '#ec4899',
    banner_image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=85',
    display_order: 6
  },
  {
    id: 7,
    name: 'Mafex',
    slug: 'mafex',
    tagline: 'Medicom Toy MAFEX Definitive 6-Inch Collector Action Figures',
    accent_color: '#06b6d4',
    banner_image_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1200&q=85',
    display_order: 7
  },
  {
    id: 8,
    name: 'Gaming Figures',
    slug: 'gaming-figures',
    tagline: 'AAA Boss Statues, RPG Legends & Next-Gen Console Icons',
    accent_color: '#10b981',
    banner_image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=85',
    display_order: 8
  }
];

const INITIAL_TEAMS = [
  {
    id: 1,
    name: 'Avengers',
    slug: 'avengers',
    franchise: 'Marvel Universe',
    description: 'Earth’s Mightiest Heroes armored and assembled.',
    badge_color: '#e11d48'
  },
  {
    id: 2,
    name: 'Justice League',
    slug: 'justice-league',
    franchise: 'DC Multiverse',
    description: 'The trinity and Earth’s premier DC defenders.',
    badge_color: '#2563eb'
  },
  {
    id: 3,
    name: 'X-Men',
    slug: 'x-men',
    franchise: 'Marvel Mutants',
    description: '90s Jim Lee & comic-accurate uncanny mutant icons.',
    badge_color: '#eab308'
  },
  {
    id: 4,
    name: 'Spider-Verse',
    slug: 'spider-verse',
    franchise: 'Marvel Spider-Man',
    description: 'Web-slingers, Symbiotes, and multiverse wall-crawlers.',
    badge_color: '#a855f7'
  },
  {
    id: 5,
    name: 'Batman Family',
    slug: 'batman-family',
    franchise: 'DC Gotham',
    description: 'Dark Knight variants, Hush series, and tactical Bat-suits.',
    badge_color: '#64748b'
  },
  {
    id: 6,
    name: 'Jujutsu Sorcerers',
    slug: 'jujutsu-sorcerers',
    franchise: 'Jujutsu Kaisen',
    description: 'Special Grade sorcerers and cursed energy masters.',
    badge_color: '#06b6d4'
  },
  {
    id: 7,
    name: 'Straw Hat Pirates',
    slug: 'straw-hat-pirates',
    franchise: 'One Piece',
    description: 'New World Emperors and Grand Line crew figures.',
    badge_color: '#f97316'
  },
  {
    id: 8,
    name: 'Gaming Legends',
    slug: 'gaming-legends',
    franchise: 'AAA Gaming',
    description: 'Pantheon slayers, demigods, and cyber mercenaries.',
    badge_color: '#10b981'
  }
];

const INITIAL_TAGS = [
  { id: 1, name: 'LED Light-Up', slug: 'led-light-up', color: '#f59e0b' },
  { id: 2, name: 'Diecast Parts', slug: 'diecast-parts', color: '#94a3b8' },
  { id: 3, name: 'Deluxe Edition', slug: 'deluxe-edition', color: '#ec4899' },
  { id: 4, name: 'Import Exclusive', slug: 'import-exclusive', color: '#06b6d4' },
  { id: 5, name: 'Comic Accurate', slug: 'comic-accurate', color: '#a855f7' },
  { id: 6, name: 'Collector Bestseller', slug: 'collector-bestseller', color: '#10b981' },
  { id: 7, name: 'High Articulation', slug: 'high-articulation', color: '#ef4444' }
];

const INITIAL_FIGURES = [
  {
    id: 1,
    title: 'MAFEX No.185 Spider-Man (Classic Comic Costume Ver.)',
    slug: 'mafex-no-185-spider-man-classic-comic',
    sku: 'FV-MFX-185',
    character_name: 'Peter Parker / Spider-Man',
    franchise: 'Marvel Comics',
    category_id: 7, // Mafex
    team_id: 4,     // Spider-Verse
    tag_ids: [4, 5, 6, 7],
    manufacturer: 'Medicom Toy',
    scale: '1/12',
    height_cm: 15.5,
    material: 'ABS & PVC',
    box_contents: 'Spider-Man figure, 3 interchangeable head sculpts (masked & unmasked Peter Parker), 6 web effects, magnetic feet/hands, articulated MAFEX display stand',
    description: 'The definitive 1/12 comic book Spider-Man by Medicom Toy MAFEX. Features vibrant cel-inspired metallic blue and crimson paint work, butterfly shoulder joints for deep crouched poses, and magnetic wall-climbing palms.',
    price: 7499,
    original_price: 8999,
    stock: 14,
    badge: 'in_stock',
    rating: 4.9,
    review_count: 86,
    image_url: 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=900&q=85',
    gallery_urls: [
      'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=900&q=85'
    ],
    is_featured: true,
    is_new_arrival: false,
    is_active: true
  },
  {
    id: 2,
    title: 'ZD Toys Iron Man Mark 85 LED Deluxe Hall of Armor Edition',
    slug: 'zd-toys-iron-man-mark-85-led-deluxe',
    sku: 'FV-ZDT-MK85',
    character_name: 'Tony Stark / Iron Man Mk LXXXV',
    franchise: 'Avengers: Endgame',
    category_id: 5, // ZD Toys
    team_id: 1,     // Avengers
    tag_ids: [1, 3, 6],
    manufacturer: 'ZD Toys',
    scale: '1/10',
    height_cm: 18.0,
    material: 'Metallic Painted ABS & PVC with LED Unit',
    box_contents: 'Iron Man Mk 85 Figure, USB-rechargeable LED Arc Reactor & Eyes, Nano Lightning Refocuser backpack, Energy Blade, Nano Shield, 4 flame thrusters, Flight Stand',
    description: 'Officially licensed ZD Toys 7-inch Iron Man Mark 85 featuring automotive-grade candy red and gold metallic coating, USB-rechargeable LED light-up eyes and chest reactor, and full Nano-tech weapon loadouts.',
    price: 3299,
    original_price: 4199,
    stock: 22,
    badge: 'hot_deal',
    rating: 4.8,
    review_count: 64,
    image_url: 'https://images.unsplash.com/photo-1623939012339-5b3dc8eca7c6?auto=format&fit=crop&w=900&q=85',
    gallery_urls: [
      'https://images.unsplash.com/photo-1623939012339-5b3dc8eca7c6?auto=format&fit=crop&w=900&q=85'
    ],
    is_featured: true,
    is_new_arrival: true,
    is_active: true
  },
  {
    id: 3,
    title: 'Fondjoy DC Batman (The Dark Knight Trilogy) 1/9 Deluxe Ver.',
    slug: 'fondjoy-dc-batman-dark-knight-deluxe',
    sku: 'FV-FDJ-BAT09',
    character_name: 'Bruce Wayne / Batman',
    franchise: 'DC Universe',
    category_id: 3, // Fondjoy
    team_id: 5,     // Batman Family
    tag_ids: [3, 6, 7],
    manufacturer: 'Fondjoy',
    scale: '1/9',
    height_cm: 19.5,
    material: 'ABS, PVC & Wired Fabric Cape',
    box_contents: 'Batman 1/9 figure, Bruce Wayne unmasked head sculpt, wired cloth cape, Grapnel Gun, sticky bomb launcher, 3 Batarangs, 4 pairs of tactical hands, Gotham gargoyle base',
    description: 'Fondjoy’s acclaimed 1/9 scale Dark Knight action figure boasts hyper-detailed carbon-weave armor textures, a posable wired fabric cape, and double-jointed knees and elbows for cinematic rooftop poses.',
    price: 3899,
    original_price: 4599,
    stock: 18,
    badge: 'in_stock',
    rating: 4.9,
    review_count: 52,
    image_url: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=900&q=85',
    gallery_urls: [
      'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=900&q=85'
    ],
    is_featured: true,
    is_new_arrival: true,
    is_active: true
  },
  {
    id: 4,
    title: 'CT Toys Spider-Man Black Suit Symbiote 1/12 Action Figure',
    slug: 'ct-toys-spider-man-black-suit-symbiote',
    sku: 'FV-CTT-SYM01',
    character_name: 'Symbiote Spider-Man',
    franchise: 'Marvel Secret Wars',
    category_id: 4, // CT Toys
    team_id: 4,     // Spider-Verse
    tag_ids: [5, 6, 7],
    manufacturer: 'CT Toys',
    scale: '1/12',
    height_cm: 15.2,
    material: ' Matte PVC & POM Joints',
    box_contents: 'Black Suit Spider-Man figure, 3 expressive masked heads, symbiote tendril effects, white web shoot lines, 5 pairs of hands, articulated claw stand',
    description: 'Fan-favorite CT Toys 1/12 scale Secret Wars Symbiote Spider-Man with deep matte-black finish, crisp white spider emblem, ultra-smooth POM joint tolerances, and dynamic web-swinging accessories.',
    price: 2199,
    original_price: 2799,
    stock: 25,
    badge: 'hot_deal',
    rating: 4.8,
    review_count: 112,
    image_url: 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=900&q=85',
    gallery_urls: [
      'https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=900&q=85'
    ],
    is_featured: true,
    is_new_arrival: true,
    is_active: true
  },
  {
    id: 5,
    title: 'Marvel Legends Wolverine (97 Astonishing Tiger Stripe Collector Ver.)',
    slug: 'marvel-legends-wolverine-97-tiger-stripe',
    sku: 'FV-MRV-WLV97',
    character_name: 'Logan / Wolverine',
    franchise: 'X-Men 97',
    category_id: 1, // Marvel
    team_id: 3,     // X-Men
    tag_ids: [5, 6, 7],
    manufacturer: 'Hasbro Marvel Legends',
    scale: '1/12',
    height_cm: 14.8,
    material: 'ABS & PVC',
    box_contents: 'Wolverine figure, snarling battle head, unmasked Logan head, pull-back cowl hood piece, Adamantium claw hands & fist hands',
    description: 'Pinless double-jointed X-Men 97 Tiger Stripe Wolverine featuring removable metallic-painted Adamantium claw hands, unmasked Logan portrait, and classic yellow-and-blue team suit sculpting.',
    price: 2999,
    original_price: 3499,
    stock: 11,
    badge: 'in_stock',
    rating: 4.9,
    review_count: 74,
    image_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=85',
    gallery_urls: [
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=900&q=85'
    ],
    is_featured: false,
    is_new_arrival: true,
    is_active: true
  },
  {
    id: 6,
    title: 'DC Multiverse Superman (Kingdom Come Armored Collector Statue)',
    slug: 'dc-multiverse-superman-kingdom-come',
    sku: 'FV-DCM-SUP01',
    character_name: 'Kal-El / Superman',
    franchise: 'DC Comics',
    category_id: 2, // DC
    team_id: 2,     // Justice League
    tag_ids: [3, 5],
    manufacturer: 'McFarlane Collector Edition',
    scale: '1/10',
    height_cm: 18.5,
    material: 'PVC & Soft Goods Cape',
    box_contents: 'Superman figure, wired cloth cape with embossed emblem, heat-vision alternate head, flight stand, foil collector art card',
    description: 'Inspired by Alex Ross’s masterpiece Kingdom Come, this DC Collector Edition Superman features a custom wired cloth cape, heat-vision alternate portrait, and dynamic aerial flight stand.',
    price: 3499,
    original_price: 3999,
    stock: 9,
    badge: 'in_stock',
    rating: 4.7,
    review_count: 38,
    image_url: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&w=900&q=85',
    gallery_urls: [
      'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&w=900&q=85'
    ],
    is_featured: false,
    is_new_arrival: false,
    is_active: true
  },
  {
    id: 7,
    title: 'S.H.Figuarts Satoru Gojo — Hollow Purple Shibuya Incident Ver.',
    slug: 'sh-figuarts-satoru-gojo-shibuya-ver',
    sku: 'FV-ANM-GOJO01',
    character_name: 'Satoru Gojo',
    franchise: 'Jujutsu Kaisen',
    category_id: 6, // Anime
    team_id: 6,     // Jujutsu Sorcerers
    tag_ids: [4, 6, 7],
    manufacturer: 'Bandai Tamashii Nations',
    scale: '1/12',
    height_cm: 17.0,
    material: 'ABS & PVC',
    box_contents: 'Satoru Gojo figure, 4 faceplates (Six Eyes unmasked, blindfolded, smirking, Domain Expansion), Infinite Void hand signs, Hollow Purple translucent aura effect',
    description: 'Imported Tamashii Nations S.H.Figuarts Satoru Gojo capturing his Shibuya Incident showdown. Includes translucent Six Eyes sculpts and Domain Expansion: Unlimited Void hand gestures.',
    price: 6299,
    original_price: 7299,
    stock: 8,
    badge: 'limited',
    rating: 5.0,
    review_count: 95,
    image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=85',
    gallery_urls: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=900&q=85'
    ],
    is_featured: true,
    is_new_arrival: true,
    is_active: true
  },
  {
    id: 8,
    title: 'Portrait.Of.Pirates Monkey D. Luffy Gear 5 "Sun God Nika" Statue',
    slug: 'pop-monkey-d-luffy-gear-5-sun-god-nika',
    sku: 'FV-ANM-LUF05',
    character_name: 'Monkey D. Luffy (Gear 5)',
    franchise: 'One Piece',
    category_id: 6, // Anime
    team_id: 7,     // Straw Hat Pirates
    tag_ids: [3, 4, 6],
    manufacturer: 'MegaHouse Japan',
    scale: '1/8',
    height_cm: 23.0,
    material: 'High-Density PVC & Translucent Resin Clouds',
    box_contents: 'Gear 5 Luffy figure, Awakening steam cloud base, lightning bolt Haki attachment, numbered certificate of authenticity',
    description: 'MegaHouse’s breathtaking Gear 5 Luffy centerpiece statue surrounded by pearlescent awakening steam clouds and conqueror’s Haki lightning bolts.',
    price: 11499,
    original_price: 13999,
    stock: 5,
    badge: 'limited',
    rating: 5.0,
    review_count: 61,
    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=900&q=85',
    gallery_urls: [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=900&q=85'
    ],
    is_featured: true,
    is_new_arrival: false,
    is_active: true
  },
  {
    id: 9,
    title: 'God of War Ragnarök — Kratos & Leviathan Axe 1/10 Deluxe Figure',
    slug: 'god-of-war-ragnarok-kratos-deluxe',
    sku: 'FV-GAM-KRT01',
    character_name: 'Kratos (Ghost of Sparta)',
    franchise: 'God of War Ragnarök',
    category_id: 8, // Gaming Figures
    team_id: 8,     // Gaming Legends
    tag_ids: [2, 3, 7],
    manufacturer: 'Good Smile / PlayStation Studios',
    scale: '1/10',
    height_cm: 20.0,
    material: 'PVC, ABS & Diecast Weapon Blades',
    box_contents: 'Kratos figure, diecast Leviathan Axe with frost effect, chained Blades of Chaos, Draupnir Spear, collapsible Guardian Shield, Mimir head accessory',
    description: 'Officially licensed God of War Ragnarök collector figure featuring real metal-alloy Blades of Chaos, frost-infused Leviathan Axe, and weathered Norse fur pauldron sculpting.',
    price: 5899,
    original_price: 6999,
    stock: 12,
    badge: 'in_stock',
    rating: 4.9,
    review_count: 47,
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=85',
    gallery_urls: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=85'
    ],
    is_featured: true,
    is_new_arrival: true,
    is_active: true
  },
  {
    id: 10,
    title: 'MAFEX No.126 Batman "Hush" Black Version (Jim Lee Art Edition)',
    slug: 'mafex-no-126-batman-hush-black-ver',
    sku: 'FV-MFX-126',
    character_name: 'Batman (Hush Comic Ver.)',
    franchise: 'DC Batman: Hush',
    category_id: 7, // Mafex
    team_id: 5,     // Batman Family
    tag_ids: [4, 5, 6, 7],
    manufacturer: 'Medicom Toy',
    scale: '1/12',
    height_cm: 16.0,
    material: 'ABS, PVC & Multi-Wire Cloth Cape',
    box_contents: 'Batman Hush figure, 3 portraits (stoic, gritted teeth, Bruce Wayne), multi-ribbed wired cape, gargoyle display ledge, batarangs & grapple line',
    description: 'Sculpted directly from Jim Lee’s iconic Batman: Hush artwork, featuring a dramatic 6-wire dynamic cloth cape and concrete Gotham gargoyle display base.',
    price: 8299,
    original_price: 9499,
    stock: 7,
    badge: 'pre_order',
    rating: 5.0,
    review_count: 104,
    image_url: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=900&q=85',
    gallery_urls: [
      'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=900&q=85'
    ],
    is_featured: false,
    is_new_arrival: true,
    is_active: true
  },
  {
    id: 11,
    title: 'Fondjoy Justice League Hulkbuster / Armored Batman Mech Suit',
    slug: 'fondjoy-armored-batman-mech-suit-deluxe',
    sku: 'FV-FDJ-ARM02',
    character_name: 'Armored Batman Mk-II',
    franchise: 'DC Justice League',
    category_id: 3, // Fondjoy
    team_id: 2,     // Justice League
    tag_ids: [1, 2, 3],
    manufacturer: 'Fondjoy',
    scale: '1/9',
    height_cm: 22.0,
    material: 'Diecast Alloy Frame & ABS Armor',
    box_contents: 'Heavy Armored Batman figure, LED light-up visor head, Kryptonite grenade launcher, battle-damaged chest swap plate, wired tattered cape',
    description: 'Heavyweight Fondjoy 1/9 Armored Batman featuring diecast alloy joints, glowing LED optical visors, and interchangeable battle-scarred armor plates.',
    price: 4499,
    original_price: 5299,
    stock: 15,
    badge: 'in_stock',
    rating: 4.8,
    review_count: 33,
    image_url: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&w=900&q=85',
    gallery_urls: [
      'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&w=900&q=85'
    ],
    is_featured: false,
    is_new_arrival: false,
    is_active: true
  },
  {
    id: 12,
    title: 'CT Toys Agent Venom (Flash Thompson) Tactical Symbiote 1/12 Figure',
    slug: 'ct-toys-agent-venom-tactical-symbiote',
    sku: 'FV-CTT-AGV02',
    character_name: 'Flash Thompson / Agent Venom',
    franchise: 'Marvel Spider-Verse',
    category_id: 4, // CT Toys
    team_id: 4,     // Spider-Verse
    tag_ids: [3, 7],
    manufacturer: 'CT Toys',
    scale: '1/12',
    height_cm: 16.2,
    material: 'ABS & PVC',
    box_contents: 'Agent Venom figure, 4 back-mounted symbiote mechanical tendrils, 4 tactical firearms, muzzle flash effects, symbiote blade arm',
    description: 'Multi-armed tactical Agent Venom 1/12 figure equipped with 4 articulated back tendrils that hold dual SMGs and carbines simultaneously for extreme action dioramas.',
    price: 2499,
    original_price: 3199,
    stock: 19,
    badge: 'in_stock',
    rating: 4.8,
    review_count: 58,
    image_url: 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=900&q=85',
    gallery_urls: [
      'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?auto=format&fit=crop&w=900&q=85'
    ],
    is_featured: false,
    is_new_arrival: true,
    is_active: true
  },
  {
    id: 13,
    title: 'ZD Toys Iron Man Mark 5 Suitcase Armor with Hall of Armor LED Bay',
    slug: 'zd-toys-iron-man-mark-5-hall-of-armor-bay',
    sku: 'FV-ZDT-MK05',
    character_name: 'Iron Man Mark V (Suitcase Armor)',
    franchise: 'Iron Man 2',
    category_id: 5, // ZD Toys
    team_id: 1,     // Avengers
    tag_ids: [1, 3, 6],
    manufacturer: 'ZD Toys',
    scale: '1/10',
    height_cm: 18.0,
    material: 'Metallic Silver/Crimson ABS + LED Bay',
    box_contents: 'Iron Man Mk 5 figure, Stark Racing Suitcase prop, modular LED Hall of Armor display gantry bay, repulsor blast beams',
    description: 'Includes both the crimson-and-silver segmented Mark V Suitcase Armor and an interlocking LED-illuminated Stark Hall of Armor display chamber.',
    price: 3699,
    original_price: 4499,
    stock: 16,
    badge: 'in_stock',
    rating: 4.9,
    review_count: 49,
    image_url: 'https://images.unsplash.com/photo-1623939012339-5b3dc8eca7c6?auto=format&fit=crop&w=900&q=85',
    gallery_urls: [
      'https://images.unsplash.com/photo-1623939012339-5b3dc8eca7c6?auto=format&fit=crop&w=900&q=85'
    ],
    is_featured: false,
    is_new_arrival: false,
    is_active: true
  },
  {
    id: 14,
    title: 'Black Myth: Wukong — The Destined One Great Sage Armor 1/12 Figure',
    slug: 'black-myth-wukong-destined-one-great-sage',
    sku: 'FV-GAM-WUK01',
    character_name: 'The Destined One (Sun Wukong)',
    franchise: 'Black Myth: Wukong',
    category_id: 8, // Gaming Figures
    team_id: 8,     // Gaming Legends
    tag_ids: [2, 3, 4, 7],
    manufacturer: 'INART / Game Science Licensed',
    scale: '1/12',
    height_cm: 16.8,
    material: 'PVC, Fabric Tunic & Diecast Jingubang Staff',
    box_contents: 'Destined One figure, diecast Ruyi Jingu Bang staff, Golden Feng-Tail Crown with pheasant plumes, gourd flask, Somersault Cloud base',
    description: 'Equipped with the mythical Golden Suozi Armor, real metal Ruyi Jingu Bang staff, and articulated twin pheasant-feather crown plumes.',
    price: 6999,
    original_price: 7999,
    stock: 6,
    badge: 'pre_order',
    rating: 5.0,
    review_count: 41,
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=85',
    gallery_urls: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=85'
    ],
    is_featured: true,
    is_new_arrival: true,
    is_active: true
  },
  {
    id: 15,
    title: 'Marvel Deadpool & Wolverine — Deadpool Corps Deluxe 1/12 Set',
    slug: 'marvel-deadpool-and-wolverine-deluxe-set',
    sku: 'FV-MRV-DPW01',
    character_name: 'Wade Wilson / Deadpool',
    franchise: 'Marvel Studios',
    category_id: 1, // Marvel
    team_id: 1,     // Avengers
    tag_ids: [2, 3, 6, 7],
    manufacturer: 'Tamashii / Marvel Collector',
    scale: '1/12',
    height_cm: 15.8,
    material: 'ABS, PVC & Metal Katanas',
    box_contents: 'Deadpool figure, Dogpool companion figurine, Headpool floating prop, dual metal katanas, golden desert eagles, 6 pairs of expressive hands',
    description: 'Maximum-effort collector edition Deadpool complete with dual diecast katanas, golden pistols, Dogpool companion figure, and interchangeable eye expressions.',
    price: 4999,
    original_price: 5799,
    stock: 13,
    badge: 'in_stock',
    rating: 4.9,
    review_count: 68,
    image_url: 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=900&q=85',
    gallery_urls: [
      'https://images.unsplash.com/photo-1635863138275-d9b33299680b?auto=format&fit=crop&w=900&q=85'
    ],
    is_featured: false,
    is_new_arrival: true,
    is_active: true
  },
  {
    id: 16,
    title: 'DC The Flash (Barry Allen Speed Force Lightning Deluxe Edition)',
    slug: 'dc-the-flash-speed-force-lightning-deluxe',
    sku: 'FV-DCM-FLS02',
    character_name: 'Barry Allen / The Flash',
    franchise: 'DC Justice League',
    category_id: 2, // DC
    team_id: 2,     // Justice League
    tag_ids: [5, 7],
    manufacturer: 'DC Direct / McFarlane',
    scale: '1/10',
    height_cm: 17.8,
    material: 'ABS & Translucent PVC Effects',
    box_contents: 'The Flash figure, 5 wrap-around translucent yellow Speed Force lightning trail effects, alternate sprinting hands, cosmic treadmill base',
    description: 'High-velocity Barry Allen action figure featuring metallic crimson suit detailing, gold boots, and five attachable Speed Force lightning bolt effects.',
    price: 2899,
    original_price: 3499,
    stock: 17,
    badge: 'in_stock',
    rating: 4.7,
    review_count: 29,
    image_url: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=900&q=85',
    gallery_urls: [
      'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=900&q=85'
    ],
    is_featured: false,
    is_new_arrival: false,
    is_active: true
  }
];

module.exports = {
  INITIAL_CATEGORIES,
  INITIAL_TEAMS,
  INITIAL_TAGS,
  INITIAL_FIGURES
};
