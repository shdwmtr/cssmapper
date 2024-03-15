const fs = require('fs');
const postcss = require('postcss');
const safeParser = require('postcss-safe-parser');
const {createParser, ast, render} = require('css-selector-parser');
const path = require('path');

function get_map() {
  return new Promise((resolve, reject) => {
    const filePath = 'map.json';

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        
        resolve(JSON.parse(data))
    });
  })
}

function dump_export(filepath, content) {
  fs.writeFile(filepath, content, (err) => {
    if (err) {
        console.error('Error writing to file:', err);
        return;
    }
  });
}

function bump_lexer(filepath, map) {
  fs.readFile(filepath, (err, css) => {
    if (err) {
        console.error('Error reading the CSS file:', err);
        return;
    }

    out_dump = css.toString()

    postcss().process(css, { parser: safeParser, from: filepath })
    .then(result => {

      const options = {
          strict: false
      }

      const parse = createParser(options);

      result.root.walkRules(rule => {
        try {
          const selector = parse(rule.selector);

          if (selector.type == 'Selector')
          {
            selector.rules.forEach(rule => {

              function parse_line(item) {

                if (item.name == "class") {
                  const regex = new RegExp(`\\b${item.value.value}.+`);
                  let found = false

                  Object.keys(map).forEach(function(key) 
                  {
                    if (key.match(regex)) {
                      item.value.value = map[key]
                      found = true
                    }
                  })

                  if (!found) {
                    console.error("no translation found")
                  }
                }
                else if (item.type == "ClassName") {
                  const name = item.name
                  mapped = map[name]

                  if (mapped !== undefined) {
                    item.name = map[name]
                  }
                }
              }

              function findItemKeys(rule) {
                for (let key of Object.keys(rule)) {
                  if (key == 'items') {
                    rule[key].forEach(item => {
                        parse_line(item)
                    })
                  }
                  else if (typeof rule[key] === 'object') {
                    findItemKeys(rule[key])
                  }
                }
                return result;
              }
              findItemKeys(rule)
            })
          }

          //console.log(rule.selector)
          console.log(`changed:\n\t${rule.selector}\n\t${render(ast.selector(selector))}`)

          if (out_dump.includes(rule.selector)) {
            out_dump = out_dump.replaceAll(rule.selector, render(ast.selector(selector)))
          }

        } catch (error) {
          console.error("error caught:", error)
        }
      });
      console.log("[+] finished file ->", filepath);
      dump_export(filepath, out_dump)
    })
    .catch(error => {
        console.error('Error parsing the CSS:', error);
    })
  });
}


function index_dir(directory, fileList = []) {
  const files = fs.readdirSync(directory);

  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      index_dir(filePath, fileList);
    } else if (path.extname(file) === '.css') {
      fileList.push(filePath);
    }
  });
  return fileList;
}

get_map().then(map => 
{
  console.log("indexing files in", process.argv[2])
  const files = index_dir(process.argv[2])

  files.forEach(css_entry => {
    console.log("[+] converting ->", css_entry)
    bump_lexer(css_entry, map)
  })
})