import { Client } from "@notionhq/client";
import { cache } from "react";

export const revalidate = 3600; // revalidate the data at most every hour

const databaseId = process.env.BLOG_DATABASE_ID;

/**
 * Returns a random integer between the specified values, inclusive.
 * The value is no lower than `min`, and is less than or equal to `max`.
 *
 * @param {number} minimum - The smallest integer value that can be returned, inclusive.
 * @param {number} maximum - The largest integer value that can be returned, inclusive.
 * @returns {number} - A random integer between `min` and `max`, inclusive.
 */
function getRandomInt(minimum, maximum) {
  const min = Math.ceil(minimum);
  const max = Math.floor(maximum);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const getDatabase = cache(async () => {
  const response = await notion.databases.query({
    database_id: databaseId,
  });
  return response.results;
});

export const getPage = cache(async (pageId) => {
  const response = await notion.pages.retrieve({ page_id: pageId });
  return response;
});

export const getPageFromSlug = cache(async (slug) => {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "Slug",
      formula: {
        string: {
          equals: slug,
        },
      },
    },
  });
  if (response?.results?.length) {
    const metadata = getMetadata(response.results[0]);

    return {
      metadata,
      blocks: await getBlocks(response.results[0].id),
    };
  }
  return {};
});

export const getBlocks = cache(async (blockID) => {
  const blockId = blockID.replaceAll("-", "");

  const { results } = await notion.blocks.children.list({
    block_id: blockId,
    page_size: 100,
  });

  // Fetches all child blocks recursively
  // be mindful of rate limits if you have large amounts of nested blocks
  // See https://developers.notion.com/docs/working-with-page-content#reading-nested-blocks
  const childBlocks = results.map(async (block) => {
    if (block.has_children) {
      const children = await getBlocks(block.id);
      return { ...block, children };
    }
    return block;
  });

  return Promise.all(childBlocks).then((blocks) =>
    blocks.reduce((acc, curr) => {
      if (curr.type === "bulleted_list_item") {
        if (acc[acc.length - 1]?.type === "bulleted_list") {
          acc[acc.length - 1][acc[acc.length - 1].type].children?.push(curr);
        } else {
          acc.push({
            id: getRandomInt(10 ** 99, 10 ** 100).toString(),
            type: "bulleted_list",
            bulleted_list: { children: [curr] },
          });
        }
      } else if (curr.type === "numbered_list_item") {
        if (acc[acc.length - 1]?.type === "numbered_list") {
          acc[acc.length - 1][acc[acc.length - 1].type].children?.push(curr);
        } else {
          acc.push({
            id: getRandomInt(10 ** 99, 10 ** 100).toString(),
            type: "numbered_list",
            numbered_list: { children: [curr] },
          });
        }
      } else {
        acc.push(curr);
      }
      return acc;
    }, []),
  );
});

export const getMetadata = cache((page) => {
  const properties = page.properties;
  const slug = properties.Slug?.rich_text[0]?.plain_text ?? "";

  return {
    id: page.id,
    title: properties.Title?.title,
    url: "/blog/" + slug,
    tags: properties.Tags?.multi_select.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
    })),
    summary: properties.Summary?.rich_text[0]?.plain_text ?? "",
    coverImageUrl: properties.coverImage?.files[0]?.file.url ?? "",
    publishedDate:
      properties.Date?.date?.start ?? new Date("1970-01-01").toDateString(),
    slug: slug,
    modifiedDate: properties.LastEditedTime?.last_edited_time ?? "",
    isPublished: properties.Published?.checkbox ?? false,
  };
});

export const getPostsMetadata = cache(async () => {
  const database = await getDatabase();
  return database?.map((page) => {
    return getMetadata(page);
  });
});
