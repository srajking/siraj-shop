import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main>
      <h1>Log in</h1>
      <Suspense fallback={null}>
        <Form searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

// read ?from= on the server, so the form is in the HTML — it works before any JavaScript
async function Form({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { from } = await searchParams;
  return <LoginForm from={typeof from === "string" ? from : "/"} />;
}
