'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { getPanelBreadcrumb } from '@/lib/panel/nav'

export const PanelBreadcrumb = () => {
  const crumbs = getPanelBreadcrumb(usePathname())

  return (
    <Breadcrumb>
      <BreadcrumbList className="sm:gap-2">
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1
          return (
            <Fragment key={crumb.href}>
              <BreadcrumbItem>
                {last ? (
                  <BreadcrumbPage className="font-semibold text-brand-navy">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild className="hover:text-brand-navy">
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!last && <BreadcrumbSeparator />}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
