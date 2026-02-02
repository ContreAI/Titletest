import Logo1 from "../../assets/images/avatar/avatar_1.webp";


import { users } from "../../data/users"

export const companies = [
  {
    id: 1,
    name: 'Victory Outfitters Ltd.',
    logo: Logo1,
    link: '#!',
  },

  {
    id: 2,
    name: 'Bean Brew Ltd.',
    logo: Logo1,
    link: '#!',
  },
  {
    id: 3,
    name: 'BrightWave Media',
    logo: Logo1,
    link: '#!',
  },
  {
    id: 4,
    name: 'CloudSync Systems',
    logo: Logo1,
    link: '#!',
  },
  {
    id: 5,
    name: 'Waka Waka PLC',
    logo: Logo1,
    link: '#!',
  },
  {
    id: 6,
    name: 'SwiftPay Systems',
    logo: Logo1,
    link: '#!',
  },
  {
    id: 7,
    name: 'UrbanNest Holdings',
    logo: Logo1,
    link: '#!',
  },
  {
    id: 8,
    name: 'O-Ecopower Innovations',
    logo: Logo1,
    link: '#!',
  },
  {
    id: 9,
    name: 'ShieldNet Security',
    logo: Logo1,
    link: '#!',
  },
];

export const dealsData = [
  {
    id: 'column1',
    title: 'Opened',
    compactMode: false,
    deals: [
      {
        id: 'deal1',
        name: 'Elite Sports Gear',
        company: companies[0],
        stage: 'Contact',
        amount: 105000,
        client: {
          name: users[0].name,
          phone: '+14845211024',
          email: users[0].email,
          videoChat: '',
          address: '',
          link: '#!',
        },
        priority: 'high',
        owner: users[3],
        collaborators: [users[0], users[1]],
        createDate: '05 Jan, 2024',
        lastUpdate: '12 Nov, 2024',
        closeDate: '10 Apr, 2025',
        progress: 30,
        expanded: false,
      },
    ],
  },
  {
    id: 'column2',
    title: 'Earneset Money Delivered',
    compactMode: false,
    deals: [
      
    ],
  },
  {
    id: 'column3',
    title: 'Inspection Contingency Cleared',
    compactMode: false,
    deals: [
    ],
  },
  {
    id: 'column4',
    title: 'Finance Contingency Cleared',
    compactMode: false,
    deals: [
    ],
  },
 
];
