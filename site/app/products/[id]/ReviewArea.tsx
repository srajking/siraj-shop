import Link from "next/link";
import { getSession } from "@/lib/dal";
import { logout } from "../../login/actions";
import ReviewForm from "./ReviewForm";

// who is here decides what they see: a form for customers, a link for strangers
export default async function ReviewArea({ productId }: { productId: string }) {
  const session = await getSession();
  if (!session) {
    return <p className="login-hint"><Link href={`/login?from=/products/${productId}`}>Log in</Link> to write a review</p>;
  }
  return (
    <>
      <p className="who">Writing as {session.name} · <button form="logout">Log out</button></p>
      <form id="logout" action={logout} hidden />
      <ReviewForm productId={productId} />
    </>
  );
}
