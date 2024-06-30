import { tokenize, getTokenizer } from "kuromojin";
import { readFile, writeFile, readdir } from 'fs/promises';
import { join, parse } from "path";
import YAML from "yaml";
import { isNoun, isOneCharacterOrLess, isTwoCharactarsOrLessAndNotArea, isOnlyLastNameOrOnlyFirstName, isProperNoun } from "./utils.mjs";
import options from "./options.default.mjs";

const resultsDir = "/app/results";
const dictionaryDir = "/app/dict";
const targetsDir = "/app/targets";
const targetsDirRegExp = new RegExp(`^${targetsDir}`);
const excludesDir = "/app/excludes";
const dictCsvFilePath = "/app/csv/dict.csv";

const getFileNames = async (dir) => {
  let names = [];

  try{
    names = await readdir(dir);
  }catch(err){
    return err;
  }

  return names.map(name => join(dir, name))
};


const getFileData = async (filename) => {
  const textData = await readFile(filename, "utf-8");
  return textData;
};

const saveFile = async(filename, data) => {
  await writeFile(filename, data, { encoding: "utf-8"});
};

const appendFile = async(filename, data) => {
  await writeFile(filename, data, { encoding: "utf-8", flag: "a"});
};

const getWords = async (textData, options) => {
  const arr = [];

  const tokenizer = await getTokenizer({dictPath: dictionaryDir})
    .then(tokenizer => tokenizer);
 
  const list = tokenizer.tokenize(textData);
  const excludeWords = await getExcludeWords();
  list.forEach((elm) => {
    // 除去ワードリストにあった場合は除去
    if(excludeWords.includes(elm.basic_form)){
      return;
    }

    // 一文字の除去
    if(options["excludeOneCharacter"] && isOneCharacterOrLess(elm)){
      return;
    }

    // 名詞以外の除去
    if(options["excludeNonNouns"] && !isNoun(elm)){
      return;
    }

    // 固有名詞以外の除去
    if(options["excludeNonProperNouns"] && !isProperNoun(elm)){
      return;
    }

    // 2文字以下で地域じゃない場合は除去
    if(options["excludeTwoCharactarsOrLessAndNonArea"] && isTwoCharactarsOrLessAndNotArea(elm)){
      return;
    }

    // 名のみまたは姓のみ場合は除去
    if(options["excludeOnlyLastNameOrOnlyFirstName"] && isOnlyLastNameOrOnlyFirstName(elm)){
      return;
    }
  
    arr.push(elm.basic_form);
    
  });

  return Array.from(new Set(arr));

};

const getTags = async (textData, options) => {

  const res = YAML.parseAllDocuments(textData);

  const tags = [];
  res.forEach((elm, i) => {
    const keys = Object.keys(elm);
    const keys2 = Object.keys(elm.contents);
    const arr = elm.contents.items ? elm.contents.items : [];
    const targetName = options["targetName"] ? options["targetName"] : "tags";
    for(let i = 0; i < arr.length; i++){
      const item = arr[i];
      if(item && item.key && item.key.value === targetName && item.value && item.value.items){
        for(let j = 0; j < item.value.items.length; j++){
          const tag = item.value.items[j].value;
          tags.push(tag);
        }
      }
    }
  });
  return tags;
};

const addTagsToDict = async (tags) => {


  const tokenizer = await getTokenizer({dictPath: dictionaryDir})
    .then(tokenizer => tokenizer);
  
  let str = "";
  for(let i = 0; i < tags.length; i++){
    const tag = tags[i];
    const list = tokenizer.tokenize(tag);
    if(list.length > 1){
      let surface_form = "";
      let reading = "";
      let pronunciation = "";
      console.log(list);
      for(let j = 0; j < list.length; j++){
        const elm = list[j];
        surface_form = `${surface_form}${elm.surface_form ? elm.surface_form : ""}`;
        reading = `${reading}${elm.reading ? elm.reading : ""}`;
        pronunciation = `${pronunciation}${elm.pronunciation ? elm.pronunciation : ""}`;
      }
      str = `${str}${surface_form},,,,名詞,固有名詞,,,*,*,${surface_form},${reading},${pronunciation}\n`
    }
  }

  if(str){
    await appendFile(dictCsvFilePath, str);
  }

};

const insertTags = async (textData, tags, options) => {

  let str = "";

  for(let i = 0; i < tags.length; i++){
    const tag = tags[i];
    str = `${str}  - ${tag}\n`;
  }

  const targetName = options["targetName"] ? options["targetName"] : "tags"
  const regex = new RegExp(`(${targetName}:\\s*\\n(?:\\s*-\\s*.+\\s*\\n)*)(?=(\\s*[a-z]+:|\\s*---))`);
  
  let newTextData = "";
  if(textData.match(regex)){
    newTextData = textData.replace(regex, `$1${str}`);
  }else{
    const str2 = `${targetName}:\n${str}`
    const regex2 = new RegExp("(---\\n(?:.*\\n)*?)(---)")
    newTextData = textData.replace(regex2, `$1${str2}---`);
  }
  return newTextData;

};

const filterTags = async (targetTags, compareTags) => {
  const tagsRemovedDuplicates = Array.from(new Set(targetTags));

  const newTags = tagsRemovedDuplicates.filter(tag => {
    let bool = true;
    for(const compareTag of compareTags){
      if(compareTag.includes(tag)){
        bool = false;
        break;
      }
      if(tag.includes(compareTag)){
        bool = false;
        break;
      }
    }
    
    return bool;
  });
  return newTags;

};

const getExcludeWords = async () => {
  const filePaths = await getFileNames(excludesDir);

  const excludes = [];
  for(let i = 0; i < filePaths.length; i++){
    const filePath = filePaths[i];
    if(filePath.match(/exclude\.txt$/)){
      const textData = await getFileData(filePath);
      const arr = textData.split("\n");
      excludes.push(...arr);
    }
  }

  return excludes;
};


const main = async () => {

  const newOptions = await import("./options.mjs")
    .catch(err => { return {error: err}})
    .then(res => {
      if(res.error){
        return options;
      }
      return res.default;
    });

  const filePaths = await getFileNames(targetsDir);
  console.log(filePaths);

  for(let i = 0; i < filePaths.length; i++){

    const filePath = filePaths[i];
    const textData = await getFileData(filePath);
    const words = await getWords(textData, newOptions);
    console.log(filePath, words)

    if(newOptions["insertTagsToYamlFrontMatter"]){
      const currentTags = await getTags(textData, newOptions);
      
      if(newOptions["addCurrentTagsToDict"]){
        await addTagsToDict(currentTags);
      }

      const newTags = await filterTags(words, currentTags);

      console.log(`currentTags: ${currentTags}`);
      console.log(`newTags: ${newTags}`);

      const newTextData = await insertTags(textData, newTags, newOptions);
  
      await saveFile(filePath.replace(targetsDirRegExp, resultsDir), newTextData);
    }else{
      const textData = JSON.stringify(words);
      const fileName = `${filePath.replace(targetsDirRegExp, resultsDir)}.words.json`;
      await saveFile(fileName, textData);
    }
  }

};

main();
