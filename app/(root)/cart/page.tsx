import CartTable from "./cart-table";
import { getMyCart } from "@/lib/actions/cart.actions";

export const metaData = {
  title: "Shopping Cart",
};

const CartPage = async () => {
  const cart = await getMyCart();
  const validCart =
    cart && "items" in cart && Array.isArray(cart.items) ? cart : undefined;
  return (
    <>
      <CartTable cart={validCart} />
    </>
  );
};

export default CartPage;
