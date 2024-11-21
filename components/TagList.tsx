import { ITag } from "@/lib/notion.types";
import { Tag } from "./Tag";

export function TagList({ tags }: { tags: ITag[] }) {
  return (
    <div className="flex flex-wrap mt-2 mb-4">
      <ul className="w-auto flex flex-wrap">
        {tags &&
          tags.map((tagItem: ITag) => (
            <li key={tagItem.id}>
              <Tag tag={tagItem} />
            </li>
          ))}
      </ul>
    </div>
  );
}
