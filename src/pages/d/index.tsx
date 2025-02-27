import { Box, Link, Stack } from "@mui/material";
import { Outlet } from "react-router";

const RedditPage = () => {
  return (
    <>
      <Stack direction={"row"}>
        <Link className="TabLink" href="/d/overview">
          Overview
        </Link>
        <Link className="TabLink" href="/d/disscusions">
          Disscusions
        </Link>
        <Link className="TabLink" href="/d/members">
          Members
        </Link>
      </Stack>
      <Outlet />
    </>
  );
};

export default RedditPage;
