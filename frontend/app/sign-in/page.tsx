import { SignIn } from "@stackframe/stack";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your ALL BLUE account to access your orders, wishlist, and personalized recommendations.",
  openGraph: {
    title: "Sign In | ALL BLUE",
    description: "Sign in to your ALL BLUE account.",
  },
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-20">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-[#F5F5F5] flex items-center justify-center mx-auto mb-6">
              <img src="/logo.png" alt="ALL BLUE" className="w-8 h-8 object-contain" />
            </div>
            <h1 className="nike-heading text-[24px] md:text-[32px] text-[#111111] mb-2">
              Welcome Back
            </h1>
            <p className="text-[14px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              Sign in to access your account, orders, and wishlist.
            </p>
          </div>

          {/* Stack Auth Component */}
          <div className="[&_*]:!rounded-none [&_button]:!rounded-[30px]">
            <SignIn fullPage={false} />
          </div>

          {/* Footer Links */}
          <div className="mt-10 text-center space-y-3">
            <p className="text-[14px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              New to ALL BLUE?{" "}
              <Link href="/handler/sign-up" className="text-[#111111] font-medium hover:underline">
                Create an account
              </Link>
            </p>
            <Link
              href="/"
              className="inline-block text-[14px] text-[#707072] hover:text-[#111111] transition-colors font-medium"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
            >
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
