import { getPostsMetadata } from "@/lib/notion";
import { IPost } from "@/lib/notion.types";
import { v4 as uuidv4 } from "uuid";

import HomePage from "./home-page";
import { Metadata } from "next";

export default async function Page() {
  const notion_articles: IPost[] = await getPostsMetadata();

  // console.log(notion_articles);

  // const articles: IPost[] = [
  //   {
  //     id: uuidv4(),
  //     title: "Release of Tailwind Nextjs Starter Blog v2.0",
  //     summary:
  //       "Release of Tailwind Nextjs Starter Blog template v2.0, refactored with Nextjs App directory and React Server Components setup. Discover the new features and how to migrate from v1.",
  //     publishedDate: "2023-08-05",
  //     url: "#",
  //     tags: [
  //       {
  //         id: uuidv4(),
  //         name: "Next.js",
  //       },
  //       {
  //         id: uuidv4(),
  //         name: "Tailwind",
  //       },
  //       {
  //         id: uuidv4(),
  //         name: "Starter",
  //       },
  //     ],
  //     coverImageUrl: "https://placecats.com/150/150",
  //     isPublished: true,
  //   },
  //   {
  //     id: uuidv4(),
  //     title: "New features in v1",
  //     summary:
  //       "An overview of the new features released in v1 - code block copy, multiple authors, frontmatter layout, and more.",
  //     publishedDate: "2021-08-07",
  //     url: "#",
  //     tags: [
  //       {
  //         id: uuidv4(),
  //         name: "Next.js",
  //       },
  //       {
  //         id: uuidv4(),
  //         name: "Tailwind",
  //       },
  //       {
  //         id: uuidv4(),
  //         name: "Guide",
  //       },
  //     ],
  //     coverImageUrl: "https://placecats.com/150/150",
  //     isPublished: true,
  //   },
  //   {
  //     id: uuidv4(),
  //     title: "Introducing Multi-part Posts with Nested Routing",
  //     summary:
  //       "The blog template supports posts in nested sub-folders. This can be used to group posts of similar content e.g., a multi-part course. This post is itself an example of a nested route!",
  //     publishedDate: "2021-05-02",
  //     url: "#",
  //     tags: [
  //       {
  //         id: uuidv4(),
  //         name: "Multi-author",
  //       },
  //       {
  //         id: uuidv4(),
  //         name: "Next.js",
  //       },
  //       {
  //         id: uuidv4(),
  //         name: "Feature",
  //       },
  //     ],
  //     coverImageUrl: "https://placecats.com/150/150",
  //     isPublished: true,
  //   },
  // ];

  return <HomePage recentPosts={notion_articles} />;
}

export const metadata: Metadata = {
  title: "Accueil",
};
