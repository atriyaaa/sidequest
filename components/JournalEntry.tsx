import Link from "next/link";
import type { Memory, Quest } from "../types/quest";

type Props = {
  quest: Quest;
  memory: Memory;
};

export default function JournalEntry({ quest, memory }: Props) {
  return (
    <article className="memory-card">
      <div className={`memory-art ${quest.color}`} aria-hidden="true">
        {quest.symbol}
      </div>

      <div className="memory-body">
        <time dateTime={memory.updatedAt}>
          {new Date(memory.updatedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          })}
        </time>

        <h2>{quest.title}</h2>
        <p>{memory.text}</p>

        <Link className="text-link" href={`/quests/${quest.id}`}>
          Edit memory ↗
        </Link>
      </div>
    </article>
  );
}