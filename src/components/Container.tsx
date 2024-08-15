type Props = {
  children: React.ReactNode;
};

const Container = ({ children }: Props) => {
  return <div className="rounded-lg w-[250px] min-h-[300px]">{children}</div>;
};

export default Container;
