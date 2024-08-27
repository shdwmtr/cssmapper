## CSS Mapper

A simple utility to bulk replace/rename CSS class names from a JSON map.

## How it works

The lexer indexes all files within the given folder hierarchy and parses them with a combination of [css-selector-parser](https://www.npmjs.com/package/css-selector-parser) and
[postcss-safe-parser](https://www.npmjs.com/package/postcss-safe-parser). It then compares all the individual selectors with their counterpart in the map.json diff, and updates old selectors respectively.

## Limitations

The selector parsing library used does not properly parse everything perfectly. some pseudoclasses arent parsed properly and the old classes will remain.
You should always diff the converted files and search for outliers and you will need to manually update these outliers from old to new classname. 

## Prerequisites

- [Node Js](https://nodejs.org/en)
- The required node modules covered in [usage](/#Usage)

## Usage
### Locally
```ps
git clone https://github.com/shdwmtr/cssmapper.git
cd cssmapper
npm install
node lexer ${PATH_TO_THEME}
```
- PATH_TO_THEME represents a recursively indexed folder on disk that contains x amount of CSS files.
### Using GitHub Actions
1. In your GitHub repository containing your CSS files, create a new branch. this branch will hold your converted CSS files.
1. Go to the branch and create *.github/workflows/node.js.yml* as a new file.
1. Copy and paste the contents of [workflows/lexer.yml](./workflows/lexer.yml) to it and commit.
1. Wait for the workflow to push the changes.
1. Assuming you've checked [limitations](/#Limitations) and everything is correct, merge the created branch with your main branch.
