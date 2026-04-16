import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";

export default async function Handler(props: any) {
  return (
    <StackHandler 
      app={stackServerApp} 
      routeProps={props} 
      fullPage={true} 
    />
  );
}
