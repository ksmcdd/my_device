# Weather Audio Attribution

Downloaded on 2026-04-24 for local playback in this project. The app loads the Moodist files first where available, then falls back to the older local files or generated Web Audio sounds if a file is unavailable.

## Active Moodist Assets

Source repository: https://github.com/remvze/moodist  
License: MIT License, copyright (c) 2023 MAZE  
Showcase site: https://moodist.mvze.net/

| Local file | Moodist source path | Purpose |
| --- | --- | --- |
| `rain-loop.mp3` | `public/sounds/rain/rain-on-window.mp3` | Rain loop with window/glass texture |
| `thunder-01.mp3` | `public/sounds/rain/thunder.mp3` | Occasional thunder |
| `rain-tap-01.mp3` | `public/sounds/nature/droplets.mp3` | Rain/drop tap accent |

## Fallback Assets

| Local file | Source | Author | License |
| --- | --- | --- | --- |
| `rain-loop.ogg` | Wikimedia Commons, [File:Rain.ogg](https://commons.wikimedia.org/wiki/File:Rain.ogg) | User:ジダネ | Public domain |
| `thunder-01.ogg` | Wikimedia Commons, [File:Rain and thunder.ogg](https://commons.wikimedia.org/wiki/File:Rain_and_thunder.ogg) | User:Caesar | Public domain |
| `rain-tap-01.ogg` | Wikimedia Commons, [File:Water drops dripping.ogg](https://commons.wikimedia.org/wiki/File:Water_drops_dripping.ogg) | ZooFari | CC BY-SA 3.0 |
| `snow-tap-01.ogg` | Wikimedia Commons, [File:Snow globe shaken.ogg](https://commons.wikimedia.org/wiki/File:Snow_globe_shaken.ogg) | ezwa / PDSounds.org, transferred by Fæ | Public domain |

`rain-tap-01.ogg` is redistributed under CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0

## Not Used

`打雷下雨.mp3` and `短暂风声.wav` are local comparison files without recorded source/license information. They are intentionally not referenced by `script.js`.
