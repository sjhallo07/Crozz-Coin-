import { FormEvent, useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import Button from "../UI/Button";
import Card from "../UI/Card";

const AuthPanel = () => {
  const {
    user,
    authenticated,
    loading,
    authError,
    register,
    login,
    logout,
    refresh,
    forgotPassword,
    forgotUsername,
    resetPassword,
  } = useAuth();

  const [registerForm, setRegisterForm] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [usernameEmail, setUsernameEmail] = useState("");
  const [resetForm, setResetForm] = useState({ token: "", password: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handle = async (
    action: () => Promise<void>,
    successMessage: string,
    resetFields?: () => void
  ) => {
    setSubmitting(true);
    setMessage(null);
    try {
      await action();
      setMessage(successMessage);
      resetFields?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handle(
      async () =>
        register({
          email: registerForm.email,
          username: registerForm.username,
          password: registerForm.password,
        }),
      "Registration successful",
      () => setRegisterForm({ email: "", username: "", password: "" })
    );
  };

  const onLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handle(() => login(loginForm), "Signed in");
  };

  const onForgotPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handle(
      () => forgotPassword(forgotEmail.trim()),
      "Email sent",
      () => setForgotEmail("")
    );
  };

  const onForgotUsername = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handle(
      () => forgotUsername(usernameEmail.trim()),
      "Username reminder sent",
      () => setUsernameEmail("")
    );
  };

  const onResetPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handle(
      () => resetPassword(resetForm.token, resetForm.password),
      "Password updated",
      () => setResetForm({ token: "", password: "" })
    );
  };

  return (
    <Card
      title="Account access"
      description="Register, sign in, and recover credentials before interacting with CROZZ."
    >
      {authenticated && user ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4 text-sm text-emerald-900 dark:border-emerald-600/50 dark:bg-emerald-500/10 dark:text-emerald-100">
            <p className="font-semibold">Signed in as</p>
            <p className="font-mono text-xs">{user.email}</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-200">
              Username: {user.username}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => void refresh()}>
              Refresh tokens
            </Button>
            <Button
              variant="ghost"
              onClick={() => void logout()}
              disabled={submitting}
            >
              Sign out
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <form className="space-y-3" onSubmit={onRegister}>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">
              Create an account
            </p>
            <input
              className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
              placeholder="Email"
              type="email"
              required
              value={registerForm.email}
              onChange={(event) =>
                setRegisterForm((prev) => ({
                  ...prev,
                  email: event.target.value,
                }))
              }
            />
            <input
              className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
              placeholder="Username"
              required
              value={registerForm.username}
              onChange={(event) =>
                setRegisterForm((prev) => ({
                  ...prev,
                  username: event.target.value,
                }))
              }
            />
            <input
              className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
              placeholder="Password"
              type="password"
              required
              value={registerForm.password}
              onChange={(event) =>
                setRegisterForm((prev) => ({
                  ...prev,
                  password: event.target.value,
                }))
              }
            />
            <Button type="submit" disabled={submitting || loading}>
              {submitting ? "Submitting…" : "Register"}
            </Button>
          </form>

          <form className="space-y-3" onSubmit={onLogin}>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">
              Sign in
            </p>
            <input
              className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
              placeholder="Email or username"
              required
              value={loginForm.identifier}
              onChange={(event) =>
                setLoginForm((prev) => ({
                  ...prev,
                  identifier: event.target.value,
                }))
              }
            />
            <input
              className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
              placeholder="Password"
              type="password"
              required
              value={loginForm.password}
              onChange={(event) =>
                setLoginForm((prev) => ({
                  ...prev,
                  password: event.target.value,
                }))
              }
            />
            <Button type="submit" variant="secondary" disabled={submitting}>
              Sign in
            </Button>
          </form>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <form className="space-y-3" onSubmit={onForgotPassword}>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Forgot password
          </p>
          <input
            className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
            placeholder="Email"
            type="email"
            required
            value={forgotEmail}
            onChange={(event) => setForgotEmail(event.target.value)}
          />
          <Button type="submit" variant="ghost" disabled={submitting}>
            Send reset token
          </Button>
        </form>

        <form className="space-y-3" onSubmit={onForgotUsername}>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Forgot username
          </p>
          <input
            className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
            placeholder="Email"
            type="email"
            required
            value={usernameEmail}
            onChange={(event) => setUsernameEmail(event.target.value)}
          />
          <Button type="submit" variant="ghost" disabled={submitting}>
            Send reminder
          </Button>
        </form>

        <form className="space-y-3" onSubmit={onResetPassword}>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Reset password
          </p>
          <input
            className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
            placeholder="Reset token"
            required
            value={resetForm.token}
            onChange={(event) =>
              setResetForm((prev) => ({ ...prev, token: event.target.value }))
            }
          />
          <input
            className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
            placeholder="New password"
            type="password"
            required
            value={resetForm.password}
            onChange={(event) =>
              setResetForm((prev) => ({
                ...prev,
                password: event.target.value,
              }))
            }
          />
          <Button type="submit" variant="ghost" disabled={submitting}>
            Update password
          </Button>
        </form>
      </div>

      {(message || authError) && (
        <p className="text-sm font-semibold text-amber-600 dark:text-amber-300">
          {message ?? authError}
        </p>
      )}
    </Card>
  );
};

export default AuthPanel;
