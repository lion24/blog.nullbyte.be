import { ITag } from "@/lib/notion.types";

export function Tag({ tag }: { tag: ITag }) {
  return (
    <a href="#" className="text-xs font-medium text-pink-500 uppercase mr-3">
      {tag.name}
    </a>
  );
}
