import { cn } from "@/lib/utils"; //  Utility function to conditionally join class names (enables dynamic className)

const ProductPrice = ({
  price,
  className,
}: {
  price: number;
  className?: string;
}) => {
  //Ensure two decimal places
  const stringValue = price.toFixed(2);
  //separate int & float parts so we can style them differently
  const [intPart, floatPart] = stringValue.split(".");
  return (
    //wrap classes in cn for dynamic className handling (in this case text-2xl will always be applied when this component is used and it will be joined to any additional classes passed via the className prop)
    <p className={cn("text-2xl", className)}>
      <span className="text-xs align-super">£</span>
      <span>{intPart}</span>
      <span className="text-xs align-super">.{floatPart}</span>
    </p>
  );
};

export default ProductPrice;
