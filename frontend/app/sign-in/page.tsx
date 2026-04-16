import { SignIn } from "@stackframe/stack";

export default function SignInPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <SignIn fullPage={false} />
      </div>
    </div>
  );
}
