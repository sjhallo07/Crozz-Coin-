import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const Button = ({ variant = "primary", className, ...props }: ButtonProps) => (
  <button
    className={clsx("btn", `btn-${variant}`, className)}
    {...props}
  />
);

export default Button;
