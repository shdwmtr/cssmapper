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

function bump_lexer(filepath, map, add_comment) {
  fs.readFile(filepath, (err, css) => {
    if (err) {
      console.error('Error reading the CSS file:', err);
      return;
    }

    function preprocessor(result)
    {
      const parse = createParser({
          strict: false
      });

      result.walkRules(rule => {
        try {
          const selector = parse(rule.selector);

          if (selector.type == 'Selector') {
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
                // handle pseudo class selectors
                else if (item.type == "PseudoClass") {
                  // traverse pseudo class
                  traverse_object(item)
                }
              }

              function traverse_object(rule) {
                for (let key of Object.keys(rule)) {
                  if (key == 'items') {
                    rule[key].forEach(item => {
                        parse_line(item)
                    })
                  }
                  else if (typeof rule[key] === 'object') {
                    traverse_object(rule[key])
                  }
                }
                return result;
              }
              traverse_object(rule)
            })
          }
          const regex = /\[class\*="([^"]+)"\]/gm;
          const new_class = String(render(ast.selector(selector))).replace(regex, `.$1`)

          console.log(`changed:\n\t${rule.selector}\n\t${new_class}`)

          if (rule.selector != new_class) {
            rule.selector = add_comment ? `/* ${rule.selector} */\n${new_class}` : new_class;
          }
        } catch (error) {
          console.error("[non-fatal]", String(error.message));
        }
      })
    }

    postcss([ preprocessor ]).process(css, { parser: safeParser, from: undefined })
    .then(result => {
      console.log("[+] finished file ->", filepath);
      dump_export(filepath, result.css)
    })
    .catch(error => {
      console.error('Error parsing the CSS:', String(error.message));
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
    bump_lexer(css_entry, map, process.argv.includes("--comment"))
  })
})

// setTimeout(() => {}, 100000)