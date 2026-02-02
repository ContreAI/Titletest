export interface Activity {
  id: string;
  icon: string;
  title: string;
  description: string;
  time: string;
}

export const activitiesData: Activity[] = [
  {
    id: '1',
    icon: 'material-symbols:mail-outline',
    title: 'Sent 1 mail to the contact Muaz',
    description: 'Sent by Sampro',
    time: '5:12 pm',
  },
  {
    id: '2',
    icon: 'material-symbols:square-outline',
    title: 'Onboarding Meeting with Donrai',
    description: 'By Mariyam',
    time: '4:45 pm',
  },
  {
    id: '3',
    icon: 'material-symbols:phone-in-talk-outline',
    title: 'Purchasing-Related Vendors with Muaz',
    description: 'By Mariyam',
    time: '4:05 pm',
  },
  {
    id: '4',
    icon: 'material-symbols:mail-outline',
    title: 'Sent 1 mail to the contact Samdoe',
    description: 'Sent by Sampro',
    time: '3:27 pm',
  },
  {
    id: '5',
    icon: 'material-symbols:attach-file',
    title: 'Added image in the Project Project nothingum',
    description: 'By Ansolo Lazinatov',
    time: '3:12 pm',
  },
  {
    id: '6',
    icon: 'material-symbols:list',
    title: 'Assigned as a director for the Project nothingum',
    description: 'By Netnai Pollock',
    time: '2:13 pm',
  },
  {
    id: '7',
    icon: 'material-symbols:check',
    title: 'Designing the dungeon',
    description: 'By Dorbesh Baba',
    time: '12:55 pm',
  },
];

