import ProductList from "@/components/shared/product/product-list";
import {
  getLatestProducts,
  getFeaturedProducts,
} from "@/lib/actions/product.actions";
import { LATEST_PRODUCTS_LIMIT } from "@/lib/constants";
import ProductCarousel from "@/components/shared/product/product-carousel";
import ViewAllProductsButton from "@/components/shared/view-all-products-button";
import IconBoxes from "@/components/icon-boxes";
import Countdown from "@/components/countdown";

const Home = async () => {
  const latestProducts = await getLatestProducts();
  const featured = await getFeaturedProducts();
  return (
    <>
      {featured.length > 0 && <ProductCarousel data={featured} />}

      <ProductList
        data={latestProducts}
        title="Featured Products"
        limit={LATEST_PRODUCTS_LIMIT}
      />
      <ViewAllProductsButton />
      <Countdown />
      <IconBoxes />
    </>
  );
};

export default Home;
