import ListWrapper from "@/shared/ui/ListWrapper";
import { BoxProps, ListProps } from "@mui/material";
import { ReactNode, Fragment } from "react";
import { FixedSizeList } from "react-window";

interface SlotProps {
  wrapper?: BoxProps;
  list?: ListProps;
}

interface FlatListProps<T> {
  disableWrapper?: boolean;
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
  ItemSeparatorComponent?: ReactNode;
  ListEmptyComponent?: ReactNode;
  ListFooterComponent?: ReactNode;
  ListHeaderComponent?: ReactNode;
  refreshing?: boolean;
  horizontal?: boolean;
  slotProps?: SlotProps;
  /** Enables virtualization for large lists */
  virtualized?: boolean;
  /** Required when virtualized: Height of the list container */
  virtualizedHeight?: number;
  /** Required when virtualized: Width of the list container */
  virtualizedWidth?: number;
  /** Required when virtualized: Size of each item (including separator if present) */
  virtualizedItemSize?: number;
}

/**
 * Renders a list of items with optional virtualization.
 *
 * @template T The type of the items in the list.
 * @param {FlatListProps<T>} props The props for the FlatList component.
 * @returns {ReactNode} The rendered FlatList component.
 */
const FlatList = <T extends unknown>({
  disableWrapper = false,
  data,
  renderItem,
  keyExtractor,
  ItemSeparatorComponent,
  ListEmptyComponent,
  ListFooterComponent,
  ListHeaderComponent,
  refreshing = false,
  horizontal = false,
  slotProps = {},
  virtualized = false,
  virtualizedHeight,
  virtualizedWidth,
  virtualizedItemSize,
}: FlatListProps<T>): ReactNode => {
  const { wrapper, list } = slotProps;

  const renderContent = (): ReactNode => {
    if (data.length === 0) {
      return ListEmptyComponent || null;
    }

    return data.map((item, index) => (
      <Fragment key={keyExtractor(item, index)}>
        {renderItem(item, index)}
        {index < data.length - 1 && ItemSeparatorComponent}
      </Fragment>
    ));
  };

  const renderVirtualizedContent = (): ReactNode => {
    if (data.length === 0) {
      return ListEmptyComponent || null;
    }

    if (
      virtualizedHeight === undefined ||
      virtualizedWidth === undefined ||
      virtualizedItemSize === undefined
    ) {
      throw new Error(
        "virtualizedHeight, virtualizedWidth, and virtualizedItemSize are required when virtualization is enabled",
      );
    }

    return (
      <FixedSizeList
        height={virtualizedHeight}
        width={virtualizedWidth}
        itemCount={data.length}
        itemSize={virtualizedItemSize}
        layout={horizontal ? "horizontal" : "vertical"}
      >
        {({ index, style }) => {
          const item = data[index];
          return (
            <div style={style} key={keyExtractor(item, index)}>
              {renderItem(item, index)}
              {index < data.length - 1 && ItemSeparatorComponent}
            </div>
          );
        }}
      </FixedSizeList>
    );
  };

  const content = virtualized ? renderVirtualizedContent() : renderContent();

  return disableWrapper ? (
    content
  ) : (
    <ListWrapper
      ListFooterComponent={ListFooterComponent}
      ListHeaderComponent={ListHeaderComponent}
      horizontal={horizontal}
      listProps={list}
      refreshing={refreshing}
      wrapperProps={wrapper}
    >
      {content}
    </ListWrapper>
  );
};

export default FlatList;
