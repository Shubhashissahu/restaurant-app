// pages/Home.jsx
import Navbar from "../Components/Navbar";
import Hero from "../Components/hero";
import Menu from "../Components/Menu";
import Info from "../Components/info";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Menu />
      <Info />
    </div>
  );
}