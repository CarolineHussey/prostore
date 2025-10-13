import ProductList from "@/components/shared/product/product-list";
import {
  getLatestProducts,
  getFeaturedProducts,
} from "@/lib/actions/product.actions";
import { LATEST_PRODUCTS_LIMIT } from "@/lib/constants";
import ProductCarousel from "@/components/shared/product/product-carousel";

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
    </>
  );
};

export default Home;
