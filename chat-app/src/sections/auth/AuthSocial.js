import { Divider, IconButton, Stack } from "@mui/material";
import { AppleLogo, GoogleLogo } from "phosphor-react";
import React from "react";

const AuthSocial = () => {
  return (
    <div>
      <Divider
        sx={{
          my: 2.5,
          typography: "overline",
          color: "text.disable",
          "&::before, ::after": {
            borderTopStyle: "dashed",
          },
        }}
      >
        Hoặc
      </Divider>
      <Stack direction={"row"} justifyContent={"center"} spacing={2}>
            <IconButton>
                <GoogleLogo color="#DF3E30" />
            </IconButton>
            <IconButton>
                <AppleLogo color="#000" />
            </IconButton>
      </Stack>
    </div>
  );
};

export default AuthSocial;
