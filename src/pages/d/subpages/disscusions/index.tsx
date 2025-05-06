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
        tags={item.tags}
      />
    ),
    [],
  );

  return (
    <>
      <div>
        <div className={s.header}>
          <SearchInput labels={["Search", "Category", "Tag"]} />
          <SortActions />
        </div>

        <Button variant="contained">New</Button>
      </div>

      <SectionList
        keyExtractor={(item, idx) => `${item.name}-${idx}`}
        listClassName={s.disscusions}
        renderItem={({ item }) => renderItem(item)}
        renderSectionHeader={(header) => renderHeader(header)}
        sections={sections}
        wrapperClassName={s.wrapper}
      />
    </>
  );
};

export default DisscusionsPage;
