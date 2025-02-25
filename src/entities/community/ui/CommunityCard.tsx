import React from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import { Stack } from "@mui/material";
import CustomDivider from "../../../shared/ui/CustomDivider";
import FlatList from "@/entities/FlatList";

interface MemberInfo {
  count: string | number;
  label: string;
}

interface CommunityCardInfoProps {
  avatarCommunity: string;
  avatars: string[];
  communityName: string;
  communityDesc: string;
  membersInfo: MemberInfo[];
  cardActions?: React.ReactNode;
}

const CommunityCard: React.FC<CommunityCardInfoProps> = ({
  avatarCommunity,
  avatars,
  communityName,
  communityDesc,
  membersInfo,
  cardActions,
}) => {
  return (
    <Card sx={{ p: 1, gap: 1 }} variant="plain">
      <CustomDivider />

      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}
      ></Stack>
    </Card>
  );
};

export { CommunityCard };
