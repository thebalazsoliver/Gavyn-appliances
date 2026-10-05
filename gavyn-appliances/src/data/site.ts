export const business = {
  name: 'Gavyn Appliances',
  phone: '(905) 505-4287',
  phoneHref: 'tel:+19055054287',
  email: 'gavyn.robinson@gmail.com',
  facebook: 'https://www.facebook.com/Gavynappliances',
  instagram: 'https://www.instagram.com/gavynshvac/',
  formEndpoint: 'https://formsubmit.co/ajax/gavyn.robinson@gmail.com',
  area: 'Greater Toronto Area & Barrie',
} as const;

export const navigation = [
  { label: 'Services', href: '#services' },
  { label: 'About us', href: '#about' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Service area', href: '#areas' },
] as const;

export const services = [
  {
    id: 'fridges',
    icon: 'fridge',
    name: 'Fridges & freezers',
    tag: 'KEEP IT COOL',
    description:
      'Cooling issues, unusual noises or a fridge that won’t stay cold. Get the problem diagnosed and discuss the next steps.',
    items: ['Refrigerators', 'Freezers', 'Cooling & temperature issues'],
  },
  {
    id: 'stoves',
    icon: 'stove',
    name: 'Stoves & ovens',
    tag: 'BACK TO COOKING',
    description:
      'Keep the heart of your kitchen working. Service for gas and electric stoves, ovens and cooktops.',
    items: ['Gas & electric stoves', 'Ovens & cooktops', 'Repair & installation'],
  },
  {
    id: 'laundry',
    icon: 'washer',
    name: 'Washers & dryers',
    tag: 'KEEP LIFE MOVING',
    description:
      'From a washer that won’t drain to a dryer that won’t heat, get help with the appliances your routine depends on.',
    items: ['Washing machines', 'Gas & electric dryers', 'Maintenance & cleaning'],
  },
  {
    id: 'dishwashers',
    icon: 'dishwasher',
    name: 'Dishwashers',
    tag: 'LESS WASHING UP',
    description:
      'Leaks, drainage problems or dishes that come out dirty. Arrange a repair, installation or maintenance visit.',
    items: ['Dishwasher repairs', 'New installations', 'Cleaning & maintenance'],
  },
  {
    id: 'water-heaters',
    icon: 'water',
    name: 'Water heaters',
    tag: 'HOT WATER, SORTED',
    description:
      'Help with your home’s water heater, including repair, installation and maintenance from a G2 certified gas appliance technician.',
    items: ['Water heater repairs', 'Installation', 'Maintenance'],
  },
  {
    id: 'furnaces',
    icon: 'flame',
    name: 'Furnaces',
    tag: 'MAKE YOURSELF COMFORTABLE',
    description:
      'Keep your home comfortable through the Canadian seasons with furnace repairs, installation and regular maintenance.',
    items: ['Furnace repairs', 'Installation', 'Maintenance & cleaning'],
  },
] as const;

export const brands = [
  { src: '/logos/whirlpool.svg', alt: 'Whirlpool', width: 150, height: 48 },
  { src: '/logos/kitchenaid.svg', alt: 'KitchenAid', width: 150, height: 48 },
  { src: '/logos/maytag.svg', alt: 'Maytag', width: 140, height: 48 },
  { src: '/logos/ge.png', alt: 'GE Appliances', width: 160, height: 48 },
  { src: '/logos/lg.png', alt: 'LG', width: 90, height: 48 },
  { src: '/logos/samsung.svg', alt: 'Samsung', width: 150, height: 48 },
  { src: '/logos/bosch.svg', alt: 'Bosch', width: 130, height: 48 },
  { src: '/logos/frigidaire.svg', alt: 'Frigidaire', width: 145, height: 48 },
  { src: '/logos/electrolux.svg', alt: 'Electrolux', width: 160, height: 48 },
  { src: '/logos/miele.svg', alt: 'Miele', width: 100, height: 48 },
] as const;

export const process = [
  {
    title: 'Tell us what’s happening',
    text: 'Call, email or use the form. Share your appliance type, the issue and your location.',
  },
  {
    title: 'Arrange a service visit',
    text: 'We’ll follow up to discuss the work and arrange a time that suits.',
  },
  {
    title: 'Get a clear next step',
    text: 'Have the issue assessed and discuss the repair, installation or maintenance your appliance needs.',
  },
] as const;

export const faqs = [
  {
    question: 'Which appliances do you work on?',
    answer:
      'We work on household appliances, including fridges, freezers, stoves, ovens, washers, dryers and dishwashers, as well as water heaters and furnaces. Repairs, installation and maintenance are available.',
  },
  {
    question: 'Where do you provide service?',
    answer:
      'Service is available across the Greater Toronto Area and the Barrie area. Include your city or postal code when you get in touch so we can confirm availability for your address.',
  },
  {
    question: 'How much does a service visit cost?',
    answer:
      'Service calls start at $70 CAD + HST. Maintenance and cleaning start at $100 CAD + HST. These are starting prices; contact us to discuss the work your appliance needs and the applicable cost.',
  },
  {
    question: 'Can you work on gas appliances?',
    answer:
      'Yes. Gas appliance service is provided by our G2 certified technician. Tell us which gas appliance needs service when you request a visit.',
  },
  {
    question: 'What should I include in my service request?',
    answer:
      'Your city or postal code, the type and brand of appliance, and a brief description of the issue are a good start. If you have the model number, include it in your message too.',
  },
] as const;
