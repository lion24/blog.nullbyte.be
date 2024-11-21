import { Fragment } from "react";
import Link from "next/link";

import Text from "../Text";

export function renderBlock(block) {
  const { type, id } = block;
  const value = block[type];

  switch (type) {
    case "paragraph":
      return (
        <p className="mb-4 text-gray-800">
          <Text title={value.rich_text} />
        </p>
      );
    case "heading_1":
      return (
        <h1 className="text-4xl font-bold mb-6">
          <Text title={value.rich_text} />
        </h1>
      );
    case "heading_2":
      return (
        <h2 className="text-3xl font-semibold mb-5">
          <Text title={value.rich_text} />
        </h2>
      );
    case "heading_3":
      return (
        <h3 className="text-2xl font-medium mb-4">
          <Text title={value.rich_text} />
        </h3>
      );
    case "bulleted_list": {
      return (
        <ul className="list-disc pl-8 mb-4">
          {value.children.map((child) => renderBlock(child))}
        </ul>
      );
    }
    case "numbered_list": {
      return (
        <ol className="list-decimal pl-8 mb-4">
          {value.children.map((child) => renderBlock(child))}
        </ol>
      );
    }
    case "bulleted_list_item":
    case "numbered_list_item":
      return (
        <li key={block.id} className="mb-2">
          <Text title={value.rich_text} />
          {!!value.children && renderNestedList(block)}
        </li>
      );
    case "to_do":
      return (
        <div className="mb-4">
          <label htmlFor={id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={id}
              defaultChecked={value.checked}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <Text title={value.rich_text} />
          </label>
        </div>
      );
    case "toggle":
      return (
        <details className="mb-4">
          <summary className="cursor-pointer font-medium text-gray-800">
            <Text title={value.rich_text} />
          </summary>
          <div className="pl-4 mt-2">
            {block.children?.map((child) => (
              <Fragment key={child.id}>{renderBlock(child)}</Fragment>
            ))}
          </div>
        </details>
      );
    case "child_page":
      return (
        <div className="p-4 border rounded mb-4 bg-gray-100">
          <strong className="block mb-2 text-lg font-semibold">
            {value?.title}
          </strong>
          <div>{block.children.map((child) => renderBlock(child))}</div>
        </div>
      );
    case "image": {
      const src =
        value.type === "external" ? value.external.url : value.file.url;
      const caption = value.caption ? value.caption[0]?.plain_text : "";
      return (
        <figure className="mb-6">
          <img src={src} alt={caption} className="w-full rounded-lg" />
          {caption && (
            <figcaption className="mt-2 text-center text-sm text-gray-500">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    }
    case "divider":
      return <hr key={id} className="my-8 border-t border-gray-300" />;
    case "quote":
      return (
        <blockquote
          key={id}
          className="pl-4 border-l-4 border-indigo-500 italic text-gray-700 mb-4"
        >
          {value.rich_text[0].plain_text}
        </blockquote>
      );
    case "code":
      return (
        <pre className="p-4 bg-gray-100 rounded mb-4">
          <code className="text-sm font-mono text-gray-800" key={id}>
            {value.rich_text[0].plain_text}
          </code>
        </pre>
      );
    case "file": {
      const srcFile =
        value.type === "external" ? value.external.url : value.file.url;
      const splitSourceArray = srcFile.split("/");
      const lastElementInArray = splitSourceArray[splitSourceArray.length - 1];
      const captionFile = value.caption ? value.caption[0]?.plain_text : "";
      return (
        <figure className="mb-4">
          <div className="text-indigo-600">
            📎 <Link href={srcFile}>{lastElementInArray.split("?")[0]}</Link>
          </div>
          {captionFile && (
            <figcaption className="mt-1 text-sm text-gray-500">
              {captionFile}
            </figcaption>
          )}
        </figure>
      );
    }
    case "bookmark": {
      const href = value.url;
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="text-indigo-500 hover:underline mb-4 block"
        >
          {href}
        </a>
      );
    }
    case "table": {
      return (
        <table className="table-auto border-collapse border border-gray-300 mb-4">
          <tbody>
            {block.children?.map((child, index) => {
              const RowElement =
                value.has_column_header && index === 0 ? "th" : "td";
              return (
                <tr key={child.id} className="border-t border-gray-300">
                  {child.table_row?.cells?.map((cell, i) => (
                    <RowElement
                      key={`${cell.plain_text}-${i}`}
                      className="p-2 border-r border-gray-300"
                    >
                      <Text title={cell} />
                    </RowElement>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }
    case "column_list": {
      return (
        <div className="flex flex-wrap gap-4 mb-4">
          {block.children.map((childBlock) => renderBlock(childBlock))}
        </div>
      );
    }
    case "column": {
      return (
        <div className="flex-1">
          {block.children.map((child) => renderBlock(child))}
        </div>
      );
    }
    default:
      return `❌ Unsupported block (${
        type === "unsupported" ? "unsupported by Notion API" : type
      })`;
  }
}

export function renderNestedList(blocks) {
  const { type } = blocks;
  const value = blocks[type];
  if (!value) return null;

  const isNumberedList = value.children[0].type === "numbered_list_item";

  if (isNumberedList) {
    return (
      <ol className="list-decimal pl-8 mb-4">
        {value.children.map((block) => renderBlock(block))}
      </ol>
    );
  }
  return (
    <ul className="list-disc pl-8 mb-4">
      {value.children.map((block) => renderBlock(block))}
    </ul>
  );
}
