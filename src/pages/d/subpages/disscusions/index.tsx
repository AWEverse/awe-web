import { useMemo, useCallback } from "react";
import { Stack, Box, Button } from "@mui/material";

import data from "../../api/dumb-data.json";
import { Categories, Subcategory } from "../../model";
import SectionList, { Section } from "@/entities/SectionList";

import { TagListItem } from "@/entities/tag-parts";
import TopicItem from "./ui/TopicItem";
import CategoryTitle from "./ui/CategoryTitle";

import s from "./index.module.scss";
import LastPublisher from "../../ui/LastPublisher";
import SortActions from "./ui/SortActions";
import InfoActions from "./ui/InfoActions";
import SearchInput from "@/shared/ui/SearchInput";

type Header = { title: string; desc: string; posts: number };

const DisscusionsPage = () => {
  const sections = useMemo<Section<Header, Subcategory>[]>(() => {
    return (data as Categories).map((item) => ({
      header: { title: item.name, desc: item.desc, posts: item.posts },
      data: item.subcategories,
    }));
  }, []);

  const renderHeader = useCallback(
    (header: Header) => (
      <CategoryTitle
        name={header.title}
        desc={header.desc}
        posts={header.posts}
      />
    ),
    [],
  );

  const renderItem = useCallback(
    (item: Subcategory) => (
      <TopicItem
        className={s.topic}
        name={item.name}
        desc={item.desc}
        posts={item.posts}
        endDecorator={
          <LastPublisher
            avatarSrc="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
            className={s.lastPublisher}
            dateText="2 days ago"
            publisherClassName="awe-user"
            startDecorator={<InfoActions />}
            title={item.name}
          />
        }
      >
        {item.tags?.map(({ name }, idx) => (
          <TagListItem key={`${name}-${idx}`}>
            <span className={s.circle} />
            {name}
          </TagListItem>
        ))}
      </TopicItem>
    ),
    [],
  );

  return (
    <Stack gap={1}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1, sm: 2 },
          mt: 1,
        }}
      >
        <div className="flex w-full gap-2 items-center">
          <SearchInput size="large" labels={["Search", "Category", "Tag"]} />
          <SortActions />
        </div>
        <Button variant="contained">New</Button>
      </Box>

      <SectionList
        keyExtractor={(item, idx) => `${item.name}-${idx}`}
        listClassName={s.disscusions}
        renderItem={({ item }) => renderItem(item)}
        renderSectionHeader={(header) => renderHeader(header)}
        sections={sections}
        wrapperClassName={s.wrapper}
      />
    </Stack>
  );
};

export default DisscusionsPage;
