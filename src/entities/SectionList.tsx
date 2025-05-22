import { ReactNode, Fragment, useCallback } from "react";

export interface Section<THeader, TSection> {
  header: THeader;
  data: TSection[];
}

interface Item<T> {
  item: T;
  index: number;
}

interface SectionListProps<THeader, TSection> {
  sections: Section<THeader, TSection>[];
  keyExtractor: (item: TSection, index: number) => string;
  renderItem: (item: Item<TSection>) => ReactNode;
  renderSectionHeader?: (header: THeader) => ReactNode | null;
  ItemSeparatorComponent?: ReactNode;
  SectionSeparatorComponent?: ReactNode;
  ListEmptyComponent?: ReactNode;
  ListFooterComponent?: ReactNode;
  wrapperClassName?: string;
  listClassName?: string;
}

/**
 * Renders a list of sections, each containing a list of items.
 *
 * @template T The type of the items in each section.
 * @param {SectionListProps<T>} props The props for the SectionList component.
 * @returns {ReactNode} The rendered SectionList component.
 */
const SectionList = <THeader, TSection>(
  props: SectionListProps<THeader, TSection>,
): ReactNode => {
  const {
    sections,
    keyExtractor,
    renderItem,
    renderSectionHeader,
    ItemSeparatorComponent,
    SectionSeparatorComponent,
    ListEmptyComponent,
    ListFooterComponent,
    wrapperClassName,
    listClassName,
  } = props;

  if (sections.length === 0) {
    return ListEmptyComponent || null;
  }

  const renderItems = useCallback(
    (data: TSection[]) => {
      return data.map((item, index) => {
        const ItemSeparator = index < data.length - 1 && ItemSeparatorComponent;

        return (
          <Fragment key={keyExtractor(item, index)}>
            {renderItem({ item, index })}
            {ItemSeparator}
          </Fragment>
        );
      });
    },
    [ItemSeparatorComponent],
  );

  return sections.map((section, sectionIndex) => {
    const { header, data } = section;
    const SectionSeparator =
      sectionIndex < sections.length - 1 && SectionSeparatorComponent;

    return (
      <div key={`${header}-${sectionIndex}`} className={wrapperClassName}>
        {renderSectionHeader?.(header) || null}

        <ul className={listClassName}>
          {renderItems(data)}
          {SectionSeparator}
        </ul>

        {ListFooterComponent}
      </div>
    );
  });
};

export default SectionList;
