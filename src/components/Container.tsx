type Props = {
  children: React.ReactNode;
};

const Container = ({ children }: Props) => {
  return <div className="rounded-lg w-[275px] min-h-[300px]">{children}</div>;
};

export default Container;
