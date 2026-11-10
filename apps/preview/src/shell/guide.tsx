import { Button } from '@preview/shell/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@preview/shell/components/ui/sheet';
import { useState } from 'react';

import { embedSnippet, type WorkbenchParams } from './params';

const CHAPTERS_EXAMPLE = `WEBVTT

00:00:00.000 --> 00:00:30.000
Introduction

00:00:30.000 --> 00:01:10.000
The product`;

const BUILDERS: [string, string][] = [
  ['WordPress', 'add a Custom HTML block.'],
  ['Webflow', 'add an Embed element.'],
  ['Squarespace', 'add a Code block.'],
  ['Wix', 'choose Embed code, then Embed HTML.'],
  ['Anything else', 'look for a block called HTML, Embed or Code.'],
];

/** For people who don't write code: three steps, with the code for the settings picked in the workbench. */
export function Guide({ params }: { params: WorkbenchParams }) {
  return (
    <Sheet>
      <SheetTrigger render={<Button type="button" variant="outline" size="sm" />}>Use it on your site</SheetTrigger>
      <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Use Plate on your site</SheetTitle>
          <SheetDescription>No coding needed. It takes about five minutes.</SheetDescription>
        </SheetHeader>

        <ol className="grid gap-6 px-4 pb-8">
          <Step number={1} title="Get a link to your video">
            <p>
              Upload the video to Mux and copy its stream link. It looks like{' '}
              <code className="bg-muted rounded px-1">https://stream.mux.com/….m3u8</code>. A direct link to an .mp4
              file works too.
            </p>
          </Step>

          <Step number={2} title="Copy the code">
            <p>
              It already has the theme, colours and layout you picked here. Put your video link where it says{' '}
              <code className="bg-muted rounded px-1">YOUR_VIDEO_LINK</code>.
            </p>
            <Copyable code={embedSnippet(params)} label="Copy code" />
          </Step>

          <Step number={3} title="Paste it into your site">
            <ul className="grid gap-1">
              {BUILDERS.map(([name, how]) => (
                <li key={name}>
                  <strong className="font-medium">{name}:</strong> {how}
                </li>
              ))}
            </ul>
            <p>Publish the page, and the player shows your video.</p>
          </Step>

          <Step number={4} title="Chapters (optional)">
            <p>
              For the chapter index, make a text file called chapters.vtt like the one below. Each chapter is a start
              time, an end time and a name. Upload it to your own site, for example to the media library, and put its
              link where it says <code className="bg-muted rounded px-1">YOUR_CHAPTERS_LINK</code>. With no chapters,
              delete that line.
            </p>
            <Copyable code={CHAPTERS_EXAMPLE} label="Copy example" />
          </Step>
        </ol>
      </SheetContent>
    </Sheet>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <li className="grid gap-2 text-sm leading-relaxed">
      <h3 className="flex items-center gap-2 font-semibold">
        <span className="bg-foreground text-background grid size-6 place-items-center rounded-full text-xs">
          {number}
        </span>
        {title}
      </h3>
      {children}
    </li>
  );
}

function Copyable({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="grid gap-2">
      <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs leading-relaxed" tabIndex={0}>
        <code>{code}</code>
      </pre>
      <div className="flex items-center justify-end gap-2">
        <span className="text-muted-foreground text-xs" role="status">
          {copied ? 'Copied' : ''}
        </span>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            void navigator.clipboard?.writeText(code).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
        >
          {label}
        </Button>
      </div>
    </div>
  );
}
