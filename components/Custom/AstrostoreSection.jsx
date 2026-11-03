import AstrostoreSlider from "../AstrostoreSlider";

export const dynamic = "force-static";

export default function AstrostoreSection() {
  const astrostorepro = [
    {
      name: "Puja Essential",
      img: "/ds-img/webp/puja essential.webp",
      href: "https://shop.dhwaniastro.com/collections/puja-essentials",
    },
    {
      name: "Gift Hamper",
      img: "/ds-img/webp/gift hamper.webp",
      href: "https://shop.dhwaniastro.com/collections",
    },
    {
      name: "Brass Idol",
      img: "/ds-img/webp/brass idol.webp",
      href: "https://shop.dhwaniastro.com/collections/brass-items",
    },
    {
      name: "925 Silver",
      img: "/ds-img/webp/925 silver.webp",
      href: "https://shop.dhwaniastro.com/collections/925-silver",
    },
    {
      name: "Candle",
      img: "/ds-img/webp/candle.webp",
      href: "https://shop.dhwaniastro.com/collections/candle",
    },
    {
      name: "Kamdhenu Cow",
      img: "/ds-img/webp/kamdhenu cow.webp",
      href: "https://shop.dhwaniastro.com/collections/kamdhenu-cow",
    },
  
  ];

  return (
    <section
      className="products_service_new sm:mt-2 sm:max-w-7xl mx-auto w-full p-4"
      aria-labelledby="dhwani-shop-heading"
    >
      <h2
        id="dhwani-shop-heading"
        className="text-[#2f1254] text-[15px] sm:text-xl lg:text-2xl py-3 text-center font-semibold"
      >
       • Astrology Products & Spiritual Shop •
      </h2>

      <AstrostoreSlider items={astrostorepro} />
    </section>
  );
}
