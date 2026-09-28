"use client";

import * as React from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";

import { cn } from "@/lib/utils";

const Menu = MenuPrimitive.Root;

function MenuTrigger({ className, ...props }: MenuPrimitive.Trigger.Props) {
  return (
    <MenuPrimitive.Trigger
      data-slot="menu-trigger"
      className={cn("appearance-none border-0 bg-transparent p-0 outline-none", className)}
      {...props}
    />
  );
}

function MenuPortal(props: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal {...props} />;
}

function MenuPositioner({
  className,
  side = "bottom",
  sideOffset = 8,
  align = "start",
  ...props
}: MenuPrimitive.Positioner.Props) {
  return (
    <MenuPrimitive.Positioner
      side={side}
      sideOffset={sideOffset}
      align={align}
      className={cn("isolate z-50", className)}
      {...props}
    />
  );
}

function MenuPopup({ className, ...props }: MenuPrimitive.Popup.Props) {
  return (
    <MenuPrimitive.Popup
      data-slot="menu-popup"
      className={cn(
        "min-w-44 origin-(--transform-origin) border border-border bg-popover p-1 text-popover-foreground shadow-md duration-100 data-[side=bottom]:slide-in-from-top-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        className,
      )}
      {...props}
    />
  );
}

function MenuLinkItem({ className, ...props }: MenuPrimitive.LinkItem.Props) {
  return (
    <MenuPrimitive.LinkItem
      data-slot="menu-link-item"
      className={cn(
        "flex w-full cursor-default items-center gap-1.5 px-3 py-2 font-mono text-xs font-medium tracking-wide uppercase whitespace-nowrap outline-none select-none data-highlighted:bg-accent/10 data-highlighted:text-accent",
        className,
      )}
      {...props}
    />
  );
}

export { Menu, MenuTrigger, MenuPortal, MenuPositioner, MenuPopup, MenuLinkItem };
