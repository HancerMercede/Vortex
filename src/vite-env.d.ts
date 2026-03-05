/// <reference types="vite/client" />

declare module '*.jsx' {
  const Component: (props: any) => JSX.Element;
  export default Component;
}
