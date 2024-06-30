import { readFile, writeFile, readdir } from 'fs/promises';
import { join } from 'path';

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
  
  let textData = "";
  try {
    textData = await readFile(filename, "utf-8");
  }catch(err){
    return textData;
  }
  return textData;
};

const saveFile = async(filename, data) => {
  await writeFile(filename, data, "utf-8");
};


const getSha256 = async (text) => {
  const uint8  = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', uint8);
  return Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2,'0')).join('');
};


const main = async () => {
  
  const presentData = await getFileData("/app/variables/dict-sha");

  let same = false;

  const filePaths = await getFileNames("/app/csv");
  console.log(filePaths);
  let data = "";
  for(let i = 0; i < filePaths.length; i++){
    const filePath = filePaths[i];
    if(filePath.match(/\.csv$/)){
      const textData = await getFileData(filePath);
      data = `${data}${textData}`;
    }
  }

  const currentData = await getSha256(data);
  if(currentData === presentData){
    same = true;
  }
  

  if(same){
    await saveFile("/app/variables/same", "same");
  }else{
    await saveFile("/app/variables/dict-sha", currentData);
  }
  console.log(currentData);

};

main();