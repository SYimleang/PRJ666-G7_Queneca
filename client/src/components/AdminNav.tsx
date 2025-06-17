"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useRestaurant } from "@/context/RestaurantContext";

export default function AdminNav() {
  const { restaurant } = useRestaurant();

  const printQRCode = () => {
    if (!restaurant?.qrCode) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              body {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
              }
              img {
                width: 300px;
                height: 300px;
              }
            </style>
          </head>
          <body>
            <img src="${restaurant.qrCode}" alt="QR Code" />
          </body>
        </html>
      `);

    printWindow.document.close();
    printWindow.focus();

    // Give it a moment to render before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        {/* Home */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Link href={"/admin"}>Home</Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className='grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]'>
              <li className='row-span-3'>
                <NavigationMenuLink asChild>
                  <div className='flex flex-col items-center justify-center border rounded-lg p-6 bg-gray-50'>
                    {restaurant?.qrCode ? (
                      <Image
                        src={restaurant.qrCode}
                        alt='QR Code'
                        width={150}
                        height={150}
                        className='mb-4'
                      />
                    ) : (
                      <></>
                    )}
                    <Button
                      onClick={printQRCode}
                      className='w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded'
                    >
                      Print QR Code
                    </Button>
                  </div>
                </NavigationMenuLink>
              </li>
              <ListItem href='/docs' title='Introduction'>
                Generate new QR code
              </ListItem>
              <ListItem href='/docs/installation' title='Installation'>
                How to install dependencies and structure your app.
              </ListItem>
              <ListItem href='/docs/primitives/typography' title='Typography'>
                Styles for headings, paragraphs, lists...etc
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        {/* Restaurant Config */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href='/admin/restaurant-config'>Restaurant Config</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {/* Waitlist Management */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href='/admin/waitlist-settings'>Waitlist Management</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {/* Staff Management */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href='/staff-mgmt'>Staff Management</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {/* Menu Management */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href='/admin/menu-mgmt'>Menu Management</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {/* Analytics */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href='/admin/analytics'>Analytics</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {/* View */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>View</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className='grid w-[200px] gap-4'>
              <li>
                <NavigationMenuLink asChild>
                  <Link href='/customer'>Customer</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link href='/staff'>Staff</Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link href='/admin'>Admin</Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className='text-sm leading-none font-medium'>{title}</div>
          <p className='text-muted-foreground line-clamp-2 text-sm leading-snug'>
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
