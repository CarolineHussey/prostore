import Image from "next/image";
const loader = "/images/loader.gif";

const LoadingPage = () => {
  return (
    <Image
      src={loader}
      height={150}
      width={150}
      alt="Loading..."
      className="m-auto"
    />
  );
};

export default LoadingPage;
