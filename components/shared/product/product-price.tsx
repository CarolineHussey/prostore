import { cn } from "@/lib/utils"; //  Utility function to conditionally join class names

const ProductPrice = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
  //Ensure two decimal places
  const stringValue = value.toFixed(2);
  //get int & float parts
  const [intPart, floatPart] = stringValue.split(".");
  return (
    <p className={cn("text-2xl", className)}>
      <span className="text-xs align-super">£</span>
      <span>{intPart}</span>
      <span className="text-xs align-super">.{floatPart}</span>
    </p>
  );
};

export default ProductPrice;
