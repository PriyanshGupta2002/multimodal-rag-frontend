import { Image as ImageIcon, Sparkles, Table2 } from "lucide-react";

export function DiagramEvidence() {
  return (
    <div className="mt-3 overflow-hidden rounded-md border bg-muted/30">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="flex items-center gap-1.5 text-[10px] font-medium">
          <ImageIcon className="size-3.5 text-primary" />
          Figure from page 4
        </span>
        <span className="text-[9px] text-muted-foreground">Diagram</span>
      </div>
      <div className="bg-background p-3">
        <svg
          viewBox="0 0 360 105"
          role="img"
          aria-label="A three-stage diagram showing files flowing through parsing and indexing into retrieval"
          className="h-auto w-full"
        >
          <defs>
            <marker
              id="flow-arrow"
              markerWidth="7"
              markerHeight="7"
              refX="5"
              refY="3.5"
              orient="auto"
            >
              <path d="M0 0 L7 3.5 L0 7 z" className="fill-muted-foreground" />
            </marker>
          </defs>
          <path
            d="M101 53 H128 M229 53 H256"
            className="stroke-muted-foreground"
            strokeWidth="1.5"
            markerEnd="url(#flow-arrow)"
          />
          <rect
            x="6"
            y="20"
            width="95"
            height="66"
            rx="8"
            className="fill-muted stroke-border"
          />
          <rect
            x="133"
            y="20"
            width="96"
            height="66"
            rx="8"
            className="fill-secondary stroke-border"
          />
          <rect
            x="260"
            y="20"
            width="94"
            height="66"
            rx="8"
            className="fill-primary/10 stroke-primary/40"
          />
          <path
            d="M22 42h19l8 8v18H22zM41 42v9h8"
            className="stroke-primary"
            fill="none"
            strokeWidth="1.5"
          />
          <path
            d="M150 48h12M150 55h16M150 62h10M176 48h37M176 55h37M176 62h37"
            className="stroke-muted-foreground"
            fill="none"
            strokeWidth="1.5"
          />
          <circle cx="280" cy="48" r="4" className="fill-primary/70" />
          <circle cx="293" cy="48" r="4" className="fill-primary/40" />
          <circle cx="306" cy="48" r="4" className="fill-primary/25" />
          <path
            d="M280 64h46"
            className="stroke-primary"
            fill="none"
            strokeWidth="2"
          />
          <text
            x="57"
            y="78"
            textAnchor="middle"
            className="fill-foreground"
            fontSize="8"
          >
            PDF pages
          </text>
          <text
            x="181"
            y="78"
            textAnchor="middle"
            className="fill-foreground"
            fontSize="8"
          >
            Parse &amp; index
          </text>
          <text
            x="307"
            y="78"
            textAnchor="middle"
            className="fill-foreground"
            fontSize="8"
          >
            Retrieve evidence
          </text>
        </svg>
      </div>
      <div className="flex items-center gap-1.5 border-t px-3 py-2 text-[10px] text-muted-foreground">
        <Sparkles className="size-3 text-primary" />
        The answer interprets the figure, not only surrounding text.
      </div>
    </div>
  );
}

export function TableEvidence() {
  return (
    <div className="mt-3 overflow-hidden rounded-md border">
      <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2">
        <span className="flex items-center gap-1.5 text-[10px] font-medium">
          <Table2 className="size-3.5 text-primary" />
          Revenue by quarter · Page 7
        </span>
        <span className="text-[9px] text-muted-foreground">Table</span>
      </div>
      <table className="w-full text-left text-[10px]">
        <thead className="bg-muted/20 text-muted-foreground">
          <tr>
            <th className="px-3 py-1.5 font-medium">Quarter</th>
            <th className="px-3 py-1.5 text-right font-medium">Revenue</th>
            <th className="px-3 py-1.5 text-right font-medium">Change</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-3 py-1.5">Q1</td>
            <td className="px-3 py-1.5 text-right">$1.8M</td>
            <td className="px-3 py-1.5 text-right text-muted-foreground">—</td>
          </tr>
          <tr className="border-t">
            <td className="px-3 py-1.5">Q2</td>
            <td className="px-3 py-1.5 text-right">$2.0M</td>
            <td className="px-3 py-1.5 text-right text-muted-foreground">
              +$0.2M
            </td>
          </tr>
          <tr className="border-t">
            <td className="px-3 py-1.5">Q3</td>
            <td className="px-3 py-1.5 text-right">$2.2M</td>
            <td className="px-3 py-1.5 text-right text-muted-foreground">
              +$0.2M
            </td>
          </tr>
          <tr className="border-t bg-primary/5 font-semibold text-primary">
            <td className="px-3 py-1.5">Q4 · highest</td>
            <td className="px-3 py-1.5 text-right">$2.4M</td>
            <td className="px-3 py-1.5 text-right">+$0.2M</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
