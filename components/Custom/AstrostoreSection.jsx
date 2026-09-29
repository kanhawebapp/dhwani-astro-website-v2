import AstrostoreSlider from "../AstrostoreSlider";

export const dynamic = "force-static";

export default function AstrostoreSection() {
  const astrostorepro = [
    {
      name: "499 Store",
      img: "/ds-img/st1.webp",
      href: "https://shop.dhwaniastro.com/collections/499-store",
    },
    {
      name: "Rose Quartz",
      img: "/ds-img/st2.webp",
      href: "https://shop.dhwaniastro.com/collections/rose-quartz",
    },
    {
      name: "God Idols",
      img: "/prblm/godidol.jpg",
      href: "https://shop.dhwaniastro.com/collections/god-idols",
    },
    {
      name: "Buy 1 Get 1",
      img: "/ds-img/st4.webp",
      href: "https://shop.dhwaniastro.com/collections/buy-1-get-1-free",
    },
    {
      name: "Protective Kavach",
      img: "/ds-img/st5.webp",
      href: "https://shop.dhwaniastro.com/collections/kavach",
    },
    {
      name: "Divine Malas",
      img: "/ds-img/st6.webp",
      href: "https://shop.dhwaniastro.com/collections/mala",
    },
    {
      name: "Pendants & Charms",
      img: "/prblm/penchar.jpg",
      href: "https://shop.dhwaniastro.com/collections/pendants",
    },
    {
      name: "Crystal Tree",
      img: "/ds-img/st8.webp",
      href: "https://shop.dhwaniastro.com/collections/crystal-tree",
    },
  ];

  return (
    <section
      className="products_service_new mt-2 sm:max-w-7xl mx-auto w-full p-4"
      aria-labelledby="dhwani-shop-heading"
    >
      <h2
        id="dhwani-shop-heading"
        className="text-[#2f1254] text-[15px] sm:text-xl lg:text-2xl py-3 text-center font-semibold"
      >
        Astrology Products & Spiritual Shop
      </h2>

      <AstrostoreSlider items={astrostorepro} />
    </section>
  );
}
