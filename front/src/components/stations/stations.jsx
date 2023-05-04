import React from "react";
import { Box, Container, Paper, Typography, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import Station from "./station";
const CustomPaper = styled(Paper)(({ theme }) => ({
  height: "500px",
  overflowY: "scroll",
  overflowY: "scroll",
  "&::-webkit-scrollbar": {
    width: "8px",
    backgroundColor: "#fff",
  },
  "&::-webkit-scrollbar-thumb": {
    borderRadius: "10px",
    backgroundColor: "rgba(0,0,0,.2)",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "rgba(0,0,0,.4)",
  },
  "&::-webkit-scrollbar-corner": {
    display: "none",
  },
}));

const citys = [
  {
    id: 1,
    city: { name: "Hurghada", query: "Hurghada,%20Egypt" },
    stations: ["El Nasr Street", "Watanya-HRG", "Al Ahyaa"],
  },
  {
    id: 2,
    city: { name: "Sharm El Sheikh", query: "Sharm+El+Sheikh,%20Egypt" },
    stations: ["Watanya-SSH", "El Ruwaysat"],
  },
  {
    id: 3,
    city: { name: "Giza/Cairo", query: "cairo,%20Egypt" },
    stations: ["6 October - El Hussary", "Mehawar ElMoshier", "Ramsis"],
  },
  {
    id: 4,

    city: { name: "Alexandria", query: "Alexandria,%20Egypt" },
    stations: ["Moharam Bek", "Sidi Gaber"],
  },
  {
    id: 5,

    city: { name: "Dahab", query: "Dahab,%20Egypt" },
    stations: ["Dahab"],
  },
  {
    id: 6,

    city: { name: "Sohag", query: "Sohag,%20Egypt" },
    stations: ["Dar ElTeb", "El Ray"],
  },
  {
    id: 7,

    city: { name: "Luxor", query: "Luxor,%20Egypt" },
    stations: ["Railway station", "Armant"],
  },
  {
    id: 8,
    city: { name: "Qena", query: "Qena,%20Egypt" },
    stations: ["Qena ", "Qift"],
  },
  {
    id: 9,

    city: { name: "Asyout", query: "Asyout+ELHILALEY,%20Egypt" },
    stations: ["Elmoalmien", "ELHILALEY"],
  },
];
export const Stations = () => {
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };
  return (
    <Box sx={{ color: "text.main", backgroundColor: "background.secondary" }}>
      <CustomPaper
        elevation={3}
        square
        sx={{ paddingX: [1, 1, 4], paddingY: 4 }}
      >
        <Stack spacing={2}>
          {citys.map((city) => {
            return (
              <Station
                city={city}
                key={city.id}
                expanded={expanded}
                handleChange={handleChange}
              />
            );
          })}
        </Stack>
      </CustomPaper>
    </Box>
  );
};
