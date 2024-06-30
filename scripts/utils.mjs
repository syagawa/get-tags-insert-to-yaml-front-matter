export const isOneCharacterOrLess = (elm) => {
  if(elm.basic_form.length <= 1){
    return true;
  }
  return false;
};

export const isNoun = (elm) => {
  if(elm.pos === "名詞"){
    return true;
  }
  return false;
};

export const isProperNoun = (elm) => {
  if(elm.pos_detail_1 === '固有名詞' || elm.pos_detail_2 === '固有名詞' || elm.pos_detail_3 === '固有名詞'){
    return true;
  }
  return false;
};

export const isTwoCharactarsOrLess = (elm) => {
  if(elm.basic_form.length <= 2){
    return true;
  }
  return false;
};

export const isTwoCharactarsOrLessAndNotArea = (elm) => {
  if(isTwoCharactarsOrLess(elm)){
    if(elm.pos_detail_1 === "地域" || elm.pos_detail_2 === "地域" || elm.pos_detail_3 === "地域"){
      return false;
    }else{
      return true;
    }
  }
  return false;
}

export const isOnlyLastNameOrOnlyFirstName = (elm) => {
  if(elm.pos_detail_1 === "固有名詞" && elm.pos_detail_2 === "人名" && ( elm.pos_detail_3 === "姓" || elm.pos_detail_3 === "名" )){
    return true;
  }
  return false;
};

