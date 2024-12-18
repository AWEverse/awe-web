import { Stack, Box, Button } from '@mui/material';

import data from '../../api/dumb-data.json';
import { Categories, Subcategory } from '../../model';
import SectionList, { Section } from '@/entities/SectionList';

import { TagListItem } from '@/entities/tag-parts';
import TopicItem from './ui/TopicItem';
import CategoryTitle from './ui/CategoryTitle';

import s from './index.module.scss';
import LastPublisher from '../../ui/LastPublisher';

import SortActions from './ui/SortActions';
import InfoActions from './ui/InfoActions';
import EmptyChat from '@/pages/chat/ui/middle/placeholder/EmptyChat';
import SearchInput from '@/shared/ui/SearchInput';

/* 
- Disscusion Sections 
  - Topic 1
    - Topic-Post 1 (C++, Python) //tags
    - Topic-Post 2
    - Topic-Post 2
  - Topic 2 
    - Topic-Post    
*/

type Header = { title: string; desc: string; posts: number };

const DisscusionsPage = () => {
  const sections: Section<Header, Subcategory>[] = (data as Categories).map(item => ({
    header: { title: item.name, desc: item.desc, posts: item.posts },
    data: item.subcategories,
  }));

  return (
    <Stack gap={1}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 2 },
          mt: 1,
        }}
      >
        <div className="flex w-full gap-2 items-center">
          <SearchInput size="large" labels={['Search', 'Category', 'Tag']} />
          <SortActions />
        </div>

        <Button variant="contained">New</Button>
      </Box>

      <SectionList
        keyExtractor={(item, index: number) => item.name + index}
        listClassName={s.disscusions}
        renderItem={({ item }) => renderItem(item)}
        renderSectionHeader={header => renderHeader(header)}
        sections={sections}
        wrapperClassName={s.wrapper}
      />

      {/* DO NOT DO THAT. Remind yourself, componentns cannot be imported from other pages!!! */}
      <EmptyChat />
    </Stack>
  );
};

export default DisscusionsPage;

function renderHeader(header: Header) {
  return <CategoryTitle desc={header.desc} name={header.title} posts={header.posts} />;
}

function renderItem(item: Subcategory) {
  return (
    <TopicItem
      className={s.topic}
      desc={item.desc}
      endDecorator={
        <LastPublisher
          avatarSrc="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
          className={s.lastPublisher}
          dateText={'2 days ago'}
          publisherClassName={'awe-user'}
          startDecorator={<InfoActions />}
          title={item.name}
        />
      }
      name={item.name}
      posts={item.posts}
    >
      {item.tags?.map(({ name }, index) => (
        <TagListItem key={`${name}-${index}`}>
          <span className={s.circle}></span>
          {name}
        </TagListItem>
      ))}
    </TopicItem>
  );
}
