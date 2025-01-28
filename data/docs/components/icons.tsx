export function Logo(props: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 300 200"
    >
      <path
        d="M50,100 Q100,50 150,100 T250,100"
        fill="none"
        stroke="#0EA5E9"
        strokeWidth="20"
      />
      <circle cx="150" cy="100" r="30" fill="white" />
    </svg>
  );
}
