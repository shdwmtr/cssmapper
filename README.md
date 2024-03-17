## Class Mapper
Steam developers decided to update all the CSS classnames inside the Steam Client for seemingly no good reason. This fixes that. <br>
Please note that this is currently still in development, and may not function as intended. <br>
Join the [discord](https://millennium.web.app/discord) if you have any questions.

## How it works

The lexer indexes all files within the given folder hierarchy and parses them with a combination of [css-selector-parser](https://www.npmjs.com/package/css-selector-parser) and
[postcss-safe-parser](https://www.npmjs.com/package/postcss-safe-parser). It then compares all the individual selectors with their counterpart in the map.json diff, and updates old selectors respectively.

## Prerequisites

- [Node Js](https://nodejs.org/en)

## Usage

```ps
git clone https://github.com/ShadowMonster99/classmapper.git
cd classmapper
node install
node lexer ${PATH_TO_THEME}
```
- PATH_TO_THEME represents a recursively indexed folder on disk that contains x amount of CSS files.


## References:
- [PartyWumpus'](https://gist.github.com/PartyWumpus) git diff mapping implementation [here](https://gist.github.com/PartyWumpus/b1bc83b5b29b155e40742d0aa290f0db)
