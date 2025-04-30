import { forwardRef, memo, useRef, useState } from "react";
import s from "./ContactsScreen.module.scss";
import buildClassName from "@/shared/lib/buildClassName";
import HeaderNavigation from "../../common/HeaderNavigation";
import useChatStore from "@/pages/chat/store/useChatSelector";
import { usePrevious, useStableCallback } from "@/shared/hooks/base";
import { LeftColumnScreenType } from "@/pages/chat/types/LeftColumn";
import ContactResult from "./search/results/ContactResult";
import ActionButton from "@/shared/ui/ActionButton";
import {
  ConnectWithoutContactRounded,
  Groups2Rounded,
  PersonAddAlt1Rounded,
  ReduceCapacityRounded,
  SearchRounded,
} from "@mui/icons-material";
import IconButton from "@/shared/ui/IconButton";
import ContactsSortDropdown from "./contacts/ContactsSortDropdown";
import { useLeftScreenNavigation } from "../lib/ScreenContext";

interface OwnProps {
  className?: string;
}

interface StateProps {}

const ContactsScreen = forwardRef<HTMLDivElement, OwnProps & StateProps>(
  (props, ref) => {
    const { className } = props;

    const nodeRef = useRef<HTMLSpanElement>(null);
    const setScreen = useChatStore((store) => store.setScreen);
    const [sortType, setSortType] = useState<string>("name");

    const prevSortType = usePrevious(sortType);

    const isChanged = prevSortType !== sortType;

    const { goBack } = useLeftScreenNavigation();

    const handlePrevClick = useStableCallback(() => {
      goBack();
    });

    const handleSortTypeChange = useStableCallback((type: string) => {
      setSortType(type);
    });

    return (
      <div ref={ref} className={buildClassName(className, s.ContactScreen)}>
        <HeaderNavigation
          className={s.ContactsHeader}
          name="Contacts"
          onPrevClick={handlePrevClick}
        >
          <IconButton>
            <SearchRounded />
          </IconButton>

          <ContactsSortDropdown onChange={handleSortTypeChange} />
        </HeaderNavigation>

        <section
          className={buildClassName(s.ContactsCreateActions, s.ContactSection)}
        >
          <ActionButton icon={<PersonAddAlt1Rounded />}>
            Add contact
          </ActionButton>
          <ActionButton icon={<Groups2Rounded />}>Create group</ActionButton>
          <ActionButton icon={<ConnectWithoutContactRounded />}>
            Create channel
          </ActionButton>
          <ActionButton icon={<ReduceCapacityRounded />}>
            Create own server
          </ActionButton>
        </section>

        <section className={s.ContactsSort}>Sort by </section>

        <section
          className={buildClassName(s.ContactsResultList, s.ContactSection)}
        >
          {Array.from({ length: 20 }).map((_, index) => (
            <ContactResult key={index} />
          ))}
        </section>
      </div>
    );
  },
);

export default memo(ContactsScreen);
