import ProductCard from "@/components/shared/product/product-card";
import { Button } from "@/components/ui/button";
import { getAllProducts } from "@/lib/actions/product.actions";
import { getAllCategories } from "@/lib/actions/product.actions";
import Link from "next/link";

const priceRanges = [
  { name: "£1 to £49", value: "1-49" },
  { name: "£50 to £99", value: "50-99" },
  { name: "£100 to £149", value: "100-149" },
  { name: "£150 to £199", value: "150-199" },
  { name: "£200 to £249", value: "200-249" },
  { name: "£250 to £299", value: "250-299" },
  { name: "£300 to £399", value: "300-399" },
  { name: "£400 to £500", value: "400-500" },
];

const ratings = ["4", "3", "2", "1"];
const sortOrders = ["newest", "lowest", "highest", "toprated"];

export async function generateMetadata(props: {
  searchParams: Promise<{
    q: string;
    price: string;
    category: string;
    rating: string;
  }>;
}) {
  const {
    q = "all",
    price = "all",
    category = "all",
    rating = "all",
  } = await props.searchParams;

  const isQuerySet = q && q !== "all" && q.trim() !== "";
  const isCategorySet =
    category && category !== "all" && category.trim() !== "";
  const isPriceSet = price && price !== "all" && price.trim() !== "";
  const isRatingSet = rating && rating !== "all" && rating.trim() !== "";

  if (isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
    return {
      title: `Search: ${isQuerySet ? q : ""} ${
        isCategorySet ? `Category ${category}` : ""
      }
    ${
      isPriceSet
        ? ` Price: £${price.split("-")[0]} - £${price.split("-")[1]} `
        : ""
    }
    ${isRatingSet ? `Rating ${rating}` : ""}
    `,
    };
  } else {
    return { title: "Search" };
  }
}

const SearchPage = async (props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
  }>;
}) => {
  const {
    q = "all",
    category = "all",
    price = "all",
    rating = "all",
    sort = "newest",
    page = 1,
  } = await props.searchParams;

  const categories = await getAllCategories();

  // Construct filter url
  const getFilterUrl = ({
    c,
    p,
    s,
    r,
    pg,
  }: {
    c?: string;
    p?: string;
    s?: string;
    r?: string;
    pg?: string | number;
  }) => {
    const params = { q, category, price, rating, sort, page: String(page) };

    if (c) params.category = c;
    if (p) params.price = p;
    if (s) params.sort = s;
    if (r) params.rating = r;
    if (pg) params.page = String(pg);

    return `/search?${new URLSearchParams(params).toString()}`;
  };

  const products = await getAllProducts({
    query: q,
    category,
    price,
    rating,
    sort,
    page: Number(page),
  });
  return (
    <div className="grid md:grid-cols-5 md:gap-5">
      {/*FILTERS */}
      <div className="filter-links">
        {/*Category Links */}
        <div className="text-xl mb-2 mt-3">Department</div>
        <div>
          <ul className="space-y-1">
            <li>
              {
                <Link
                  className={`${
                    (category === "all" || category === "") && "font-bold"
                  }`}
                  href={getFilterUrl({ c: "all" })}
                >
                  Any
                </Link>
              }
            </li>
            {categories.map((x) => (
              <li key={x.category}>
                <Link
                  className={`${category === x.category && "font-bold"}`}
                  href={getFilterUrl({ c: x.category })}
                >
                  {x.category}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/*Price Links */}
        <div className="text-xl mb-2 mt-3">Price</div>
        <div>
          <ul className="space-y-1">
            <li>
              {
                <Link
                  className={`${
                    (price === "all" || price === "") && "font-bold"
                  }`}
                  href={getFilterUrl({ p: "all" })}
                >
                  Any
                </Link>
              }
            </li>
            {priceRanges.map((x) => (
              <li key={x.value}>
                <Link
                  className={`${price === x.value && "font-bold"}`}
                  href={getFilterUrl({ p: x.value })}
                >
                  {x.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/*Rating Links */}
        <div className="text-xl mb-2 mt-3">Rating</div>
        <div>
          <ul className="space-y-1">
            <li>
              {
                <Link
                  className={`${
                    (rating === "all" || rating === "") && "font-bold"
                  }`}
                  href={getFilterUrl({ r: "all" })}
                >
                  Any
                </Link>
              }
            </li>
            {ratings.map((r) => (
              <li key={r}>
                <Link
                  className={`${rating === r.toString() && "font-bold"}`}
                  href={getFilterUrl({ r: `${r}` })}
                >
                  {`${r} stars & up`}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="md:col-span-4 space-y-4">
        <div className="flex-between flex-col m-y-4 md:flex-row my-4">
          <div className="flex items-center">
            {q !== "all" && q !== "" && ` Query: ${q}`}
            {category !== "all" && category !== "" && ` Category: ${category}`}
            {price !== "all" &&
              price !== "" &&
              ` Price: £${price.split("-")[0]} - £${price.split("-")[1]} `}
            {rating !== "all" && rating !== "" && ` Rating: ${rating} & up`}
            {(q !== "all" && q !== "") ||
            (category !== "all" && category !== "") ||
            (rating !== "all" && rating !== "") ||
            (price !== "all" && price !== "") ? (
              <Button variant={"link"} asChild>
                <Link href="/search" className="text-xs">
                  Clear
                </Link>
              </Button>
            ) : null}
          </div>
          {/*Sort */}
          <div>
            Sort by{" "}
            {sortOrders.map((s) => (
              <Link
                key={s}
                className={`mx-2 ${sort == s && "font-bold"}`}
                href={getFilterUrl({ s })}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Link>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {products.data.length === 0 && <div>No Product Found</div>}
          {products.data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
