import { PropsWithChildren } from 'react';

const MainContent = ({ children }: PropsWithChildren) => (
  <main className="main-content">{children}</main>
);

export default MainContent;
