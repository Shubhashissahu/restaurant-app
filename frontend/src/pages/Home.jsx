// pages/Home.jsx
import Hero from "../components/hero";
import FeaturedMenu from "../Components/FeaturedMenu";
import Info from "../components/Info";

export default function Home() {
  return (
    <div>
      <Hero />
      <FeaturedMenu />
      <Info />
    </div>
  );
}