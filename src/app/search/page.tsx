import { type Metadata } from "next";

import "~/styles/find-search/index.css";

import { Footer } from "~/components/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/Footer";
import { Header } from "~/components/sites/www-findrealestate-com-715c1bfa/root-8a5edab2/Header";
import { SearchPage } from "~/components/sites/www-findrealestate-com-715c1bfa/search-6fb5b778/SearchPage";

/**
 * `/search` — cloned from findrealestate.com/search.
 *
 * Site key  www-findrealestate-com-715c1bfa
 * Page key  search-6fb5b778   ("search-" + sha256("/search").slice(0,8))
 *
 * The header is the `search` variant: measured live, this route's header is
 * completely static (`header_wrapper` only — sticky, white, never transparent,
 * never hidden, never fixed), unlike the homepage's scroll-driven one.
 *
 * Route stylesheet is `styles/find-search/index.css`, imported here rather than
 * from the root layout so the homepage's stylesheet set stays untouched.
 */
export const metadata: Metadata = {
  title: "Search Properties | FIND Real Estate",
  description:
    "Search for your perfect property with FIND's advanced search tools. Filter by location, price, features, and more to find your ideal home.",
  alternates: { canonical: "https://www.findrealestate.com/search" },
};

export default function SearchRoute() {
  return (
    <>
      <Header variant="search" />
      <SearchPage />
      <Footer />
    </>
  );
}