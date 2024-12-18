import { ChatType, UserProps } from '@/shared/types';
import { ChatProps } from '@/shared/types';
import MessageWraper from '@/shared/ui/message-wraper';
import VideoCircle from '@/shared/ui/message-wraper/video-circle';

export const users: UserProps[] = [
  {
    name: 'Альбінчик',
    username: '@albinchik',
    avatar: 'https://i.pravatar.cc',
    online: true,
  },
  {
    name: 'Микола Куцько',
    username: '@mikola',
    avatar: 'https://i.pravatar.cc',
    online: false,
  },
  {
    name: 'Мурзик',
    username: '@murzik',
    avatar: 'https://i.pravatar.cc',
    online: true,
  },
  {
    name: 'Васька',
    username: '@vaska',
    avatar: 'https://i.pravatar.cc',
    online: false,
  },
  {
    name: 'Том',
    username: '@tom',
    avatar: '/static/images/avatar/5.jpg',
    online: true,
  },
  {
    name: 'Джерри',
    username: '@jerry',
    avatar: 'https://i.pravatar.cc/1',
    online: true,
  },
  {
    name: 'Гарфилд',
    username: '@garfield',
    avatar: 'https://i.pravatar.cc/1',
    online: false,
  },
  {
    name: 'Тихий Омут',
    username: '@omut',
    avatar: 'https://i.pravatar.cc/10',
    online: true,
  },
  {
    name: 'AWE Service Messages',
    username: '@admin',
    avatar: 'https://i.pravatar.cc',
    online: false,
  },
];

export const chats: ChatProps[] = [
  {
    id: '1',
    chatType: ChatType.channel,
    sender: users[8],
    messages: [
      {
        dateId: '1',
        date: 'Сьогодні',
        dateTimestamp: (new Date().setHours(0, 0, 0, 0) / 1000) * 1000,
        messages: [
          {
            id: '1',
            content: (
              <MessageWraper.Text>
                Код для входа в AWE: 64643. Не давайте код никому, даже если его требуют от имени AWE! Этот код используется для
                входа в Ваш аккаунт в AWE. Он не может быть использован для чего-либо ещё. Если Вы не запрашивали код для входа,
                проигнорируйте это сообщение.
              </MessageWraper.Text>
            ),
            thumbnail: {
              url: '',
              name: 'Привіт, я зараз працюю над проектом.',
            },
            timestamp: '9:00',
            timeCache: 1,
            sender: users[8],
            reactions: [],
            type: 'text',
          },
          {
            id: '2',
            content: (
              <MessageWraper.Text>
                Confirm login to the Contest Platform. Dear André, we received a request from your account to log in on
                contest.com.
                <br />
                Browser: Chrome 124 on Windows IP: 94.45.122.33 (Popilnia, Ukraine)
                <br />
                To authorize this request, press the 'Confirm' button below.
                <br />
                If you didn't attempt logging in to the contest platform, use the 'Decline' button or simply ignore this message.
                <br />✅ Accepted
              </MessageWraper.Text>
            ),
            thumbnail: {
              url: '',
              name: 'Confirm login to the Contest Platform. Dear André, we received a request from your account to log in on contest.com.',
            },
            timestamp: '9:10',
            timeCache: 1,
            sender: users[8],
            reactions: [],
            type: 'text',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    chatType: ChatType.private,
    sender: users[0],
    messages: [
      {
        dateId: '1',
        date: 'Сьогодні',
        dateTimestamp: (new Date().setHours(0, 0, 0, 0) / 1000) * 1000,
        messages: [
          {
            id: '1',
            content: <MessageWraper.Text>Привіт, я зараз працюю над проектом.</MessageWraper.Text>,
            thumbnail: {
              url: '',
              name: 'Привіт, я зараз працюю над проектом.',
            },
            timestamp: '9:00',
            timeCache: 1,
            sender: 'You',
            reactions: [],
            type: 'text',
          },
          {
            id: '2',
            content: <MessageWraper.Text>Привіт, я зараз працюю над проектом.</MessageWraper.Text>,
            thumbnail: { url: '', name: 'Це чудово.' },
            timestamp: '9:10',
            timeCache: 2,
            sender: 'You',
            type: 'text',
            reactions: [],
          },
          {
            id: '3',
            content: <MessageWraper.Text>Привіт, я зараз працюю над проектом.</MessageWraper.Text>,
            thumbnail: { url: '', name: 'Відправлю проект до кінця дня.' },
            timestamp: '11:30',
            timeCache: 3,
            sender: users[0],
            type: 'text',
            reactions: [],
          },
          {
            id: '4',
            content: <MessageWraper.Text>Привіт, я зараз працюю над проектом.</MessageWraper.Text>,
            thumbnail: {
              url: '',
              name: 'Привіт, я зараз працюю над проектом.',
            },
            timestamp: '9:00',
            timeCache: 1,
            sender: users[0],
            reactions: [],
            type: 'text',
          },
          {
            id: '5',
            content: <MessageWraper.Text>Привіт, я зараз працюю над проектом.</MessageWraper.Text>,
            thumbnail: { url: '', name: 'Це чудово.' },
            timestamp: '9:10',
            timeCache: 2,
            sender: 'You',
            type: 'text',
            reactions: [],
          },
          {
            id: '6',
            content: <MessageWraper.Text>Привіт, я зараз працюю над проектом.</MessageWraper.Text>,
            thumbnail: { url: '', name: 'Відправлю проект до кінця дня.' },
            timestamp: '11:30',
            timeCache: 3,
            sender: users[0],
            type: 'text',
            reactions: [],
          },
          {
            id: '7',
            content: <MessageWraper.Text>Привіт, я зараз працюю над проектом.</MessageWraper.Text>,
            thumbnail: {
              url: '',
              name: 'Привіт, я зараз працюю над проектом.',
            },
            timestamp: '9:00',
            timeCache: 1,
            sender: users[0],
            reactions: [
              {
                icon: '♥',
                avatars: ['https://i.pravatar.cc'],
              },
            ],
            type: 'text',
          },
          {
            id: '8',
            content: <MessageWraper.Sticker src="https://www.hdwallpapers.in/download/crysis_2_gameplay-1920x1200.jpg" />,
            thumbnail: { url: '', name: 'Це чудово.' },
            timestamp: '9:10',
            timeCache: 2,
            sender: 'You',
            type: 'image',
            reactions: [],
          },
          {
            id: '9',
            content: <VideoCircle />,
            thumbnail: { url: '', name: 'Відправлю проект до кінця дня.' },
            timestamp: '11:30',
            timeCache: 3,
            sender: users[0],
            type: 'image',
            reactions: [],
          },
          {
            id: '10',
            content: (
              <MessageWraper.Sticker src="https://a-static.besthdwallpaper.com/asus-rog-republic-of-gamers-crysis-wallpaper-2048x1536-20221_26.jpg" />
            ),
            thumbnail: { url: '', name: 'Відправлю проект до кінця дня.' },
            timestamp: '11:30',
            timeCache: 3,
            sender: users[0],
            type: 'image',
            reactions: [],
          },
          {
            id: '11',
            content: (
              <MessageWraper.Sticker src="https://a-static.besthdwallpaper.com/asus-rog-republic-of-gamers-crysis-wallpaper-2048x1536-20221_26.jpg" />
            ),
            thumbnail: { url: '', name: 'Відправлю проект до кінця дня.' },
            timestamp: '11:30',
            timeCache: 3,
            sender: 'You',
            type: 'image',
            reactions: [
              {
                icon: '♥',
                avatars: ['https://i.pravatar.cc'],
              },
            ],
          },
          {
            id: '12',
            content: <MessageWraper.Image />,
            thumbnail: { url: '', name: 'Відправлю проект до кінця дня.' },
            timestamp: '11:30',
            timeCache: 3,
            sender: 'You',
            type: 'image',
            reactions: [
              {
                icon: '♥',
                avatars: ['https://i.pravatar.cc'],
              },
            ],
          },
          {
            id: '13',
            content: <VideoCircle />,
            thumbnail: { url: '', name: 'Відправлю проект до кінця дня.' },
            timestamp: '11:30',
            timeCache: 3,
            sender: users[0],
            type: 'image',
            reactions: [],
          },
        ],
      },
    ],
  },
];
