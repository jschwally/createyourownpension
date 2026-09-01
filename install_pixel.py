#!/usr/bin/env python3
"""Insert the Meta Pixel snippet into every .html file in the current directory,
immediately before </head>, unless it's already present."""

import glob
import os

MARKER = "<!-- Meta Pixel Code -->"

SNIPPET = """<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1239708754884092');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=1239708754884092&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->
"""


def main():
    html_files = sorted(glob.glob("*.html"))
    updated = []
    skipped = []
    missing_head = []

    for filename in html_files:
        with open(filename, "r", encoding="utf-8") as f:
            content = f.read()

        if MARKER in content:
            skipped.append(filename)
            continue

        idx = content.find("</head>")
        if idx == -1:
            missing_head.append(filename)
            continue

        new_content = content[:idx] + SNIPPET + content[idx:]

        with open(filename, "w", encoding="utf-8") as f:
            f.write(new_content)

        updated.append(filename)

    print(f"Updated ({len(updated)}):")
    for f in updated:
        print(f"  {f}")

    print(f"\nSkipped, already had pixel ({len(skipped)}):")
    for f in skipped:
        print(f"  {f}")

    if missing_head:
        print(f"\nNo </head> found, left unchanged ({len(missing_head)}):")
        for f in missing_head:
            print(f"  {f}")


if __name__ == "__main__":
    main()
