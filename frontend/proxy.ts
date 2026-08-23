import { auth } from "@clerk/nextjs";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectRoute = createRouteMatcher([
  "/dashboard(.*)",
])

export default clerkMiddleware(async (auth,req) => {
  if (isProtectRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};