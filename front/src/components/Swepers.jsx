import { Swiper, SwiperSlide } from "swiper/react";
import styled from "styled-components";
import slide1Image from "../assets/slide-1.jpg";
import slide2Image from "../assets/slide-2.jpg";
import slide3Image from "../assets/slide-3.jpg";
import slide4Image from "../assets/slide-4.jpg";
import slide5Image from "../assets/slide-5.jpg";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper";
import { Box } from "@mui/system";
const StyledBox = styled.div`
  position: relative;
  direction:ltr;
  &:after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    background-color: #000000b0;
  }
`;

const slides = [
  { image: slide1Image, id: 1 },
  { image: slide2Image, id: 2 },
  { image: slide3Image, id: 3 },
  { image: slide4Image, id: 4 },
  { image: slide5Image, id: 5 },

];
const Image = styled.img`
  width: 100%;
  height: calc(90vh );
  object-fit: cover;
`;
export const Swepers = () => {
  return (
    <StyledBox>
      <Swiper
        spaceBetween={30}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination, Autoplay]}
        loop={true}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        className="mySwiper"
      >
        {slides.map((slide) => {
          return (
            <SwiperSlide key={slide.id}>
              <Box>
                <Image src={slide.image} alt={`slid${slide.id}`} loading="lazy"/>
              </Box>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </StyledBox>
  );
};
