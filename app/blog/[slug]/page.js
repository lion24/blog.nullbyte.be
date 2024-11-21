//import { TagList } from "@/components/TagList";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { getPageFromSlug, getDatabase, getBlocks } from "@/lib/notion";
import { renderBlock } from "@/components/notion/renderer";
import Text from "@/components/Text";

const postDateTemplate = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

const authorDetails = [
  {
    name: "Lionel",
    avatar: "https://placecats.com/200/200",
    twitter: "https://x.com/0xlion3l",
  },
];

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { metadata } = await getPageFromSlug(slug);
  return {
    title: metadata.title.map((value) => value.text.content).join(" "),
    description: metadata.description || "Bienvenue chez 0xlionel",
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const { metadata, blocks } = await getPageFromSlug(slug);

  if (!blocks) {
    return <div />;
  }

  return (
    <div>
      <section className="mx-auto max-w-3xl px-4 sm:px-6 xl:max-w-5xl xl:px-0">
        <article>
          <div className="xl:divide-y xl:divide-gray-200 xl:dark:divide-gray-700">
            <header className="pt-6 xl:pb-6">
              <div className="space-y-1 text-center">
                <dl className="space-y-10">
                  <div>
                    <dt className="sr-only">Publié le</dt>
                    <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                      <time dateTime={metadata.publishedDate}>
                        {new Date(metadata.publishedDate).toLocaleDateString(
                          "en-US",
                          postDateTemplate,
                        )}
                      </time>
                    </dd>
                  </div>
                </dl>
                <div>
                  <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14">
                    <Text title={metadata.title} />
                  </h1>
                </div>
              </div>
            </header>
            <div className="grid-rows-[auto_1fr] divide-y divide-gray-200 pb-8 dark:divide-gray-700 xl:grid xl:grid-cols-4 xl:gap-x-6 xl:divide-y-0">
              <dl className="pb-10 pt-6 xl:border-b xl:border-gray-200 xl:pt-11 xl:dark:border-gray-700">
                <dt className="sr-only">Authors</dt>
                <dd>
                  <ul className="flex flex-wrap justify-center gap-4 sm:space-x-12 xl:block xl:space-x-0 xl:space-y-8">
                    {authorDetails &&
                      authorDetails.map((author) => (
                        <li
                          className="flex items-center space-x-2"
                          key={author.name}
                        >
                          {author.avatar && (
                            <Image
                              src={author.avatar}
                              width={200}
                              height={200}
                              alt="avatar"
                              className="h-14 w-14 rounded-full"
                            />
                          )}
                          <dl className="whitespace-nowrap text-sm font-medium leading-5">
                            <dt className="sr-only">Name</dt>
                            <dd className="text-gray-900 dark:text-gray-100">
                              {author.name}
                            </dd>
                            <dt className="sr-only">Twitter</dt>
                            <dd>
                              {author.twitter && (
                                <Link
                                  href={author.twitter}
                                  className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                                >
                                  {author.twitter
                                    .replace("https://twitter.com/", "@")
                                    .replace("https://x.com/", "@")}
                                </Link>
                              )}
                            </dd>
                          </dl>
                        </li>
                      ))}
                  </ul>
                </dd>
              </dl>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 xl:col-span-3 xl:row-span-2 xl:pb-0">
                <div className="prose max-w-none pb-8 pt-10 dark:prose-invert">
                  {blocks.map((block) => (
                    <Fragment key={block.id}>{renderBlock(block)}</Fragment>
                  ))}
                </div>
              </div>
            </div>
            <a href="/" className="text-blue-500 hover:underline mt-4 block">
              ← Go home
            </a>
          </div>
        </article>
      </section>
    </div>
  );
}
