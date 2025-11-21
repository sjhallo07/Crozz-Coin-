import { PropsWithChildren } from "react";

interface CardProps extends PropsWithChildren {
  title?: string;
}

const Card = ({ title, children }: CardProps) => (
  <section className="card">
    {title && <header className="card__header">{title}</header>}
    <div className="card__body">{children}</div>
  </section>
);

export default Card;
