import ListWrapper from '@/shared/ui/ListWrapper';
import { BoxProps, ListProps } from '@mui/material';
import { ReactNode, Fragment } from 'react';

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
}

/**
 * Renders a list of items.
 *
 * @template T The type of the items in the list.
 * @param {FlatListProps<T>} props The props for the FlatList component.
 * @returns {ReactNode} The rendered FlatList component.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
const FlatList = <T extends unknown>(props: FlatListProps<T>): ReactNode => {
  const {
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
  } = props;

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

  return disableWrapper ? (
    renderContent()
  ) : (
    <ListWrapper
      ListFooterComponent={ListFooterComponent}
      ListHeaderComponent={ListHeaderComponent}
      horizontal={horizontal}
      listProps={list}
      refreshing={refreshing}
      wrapperProps={wrapper}
    >
      {renderContent()}
    </ListWrapper>
  );
};

export default FlatList;
