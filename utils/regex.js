// utils.js
function createSearchRegex(searchText) {
    let text = searchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '');
    let array = text.split('');
    let newArray = array.map((char) => {
      switch (char.toLowerCase()) {
        case 'i':
        case 'ı':
          return '(ı|i|İ|I)';
        case 'g':
        case 'ğ':
          return '(ğ|g|Ğ|G)';
        case 'u':
        case 'ü':
          return '(ü|u|Ü|U)';
        case 's':
        case 'ş':
          return '(ş|s|Ş|S)';
        case 'o':
        case 'ö':
          return '(ö|o|Ö|O)';
        case 'c':
        case 'ç':
          return '(ç|c|Ç|C)';
        default:
          return char;
      }
    });
    return new RegExp('(.*)' + newArray.join('') + '(.*)', 'ig');
  }
  
  module.exports = {
    createSearchRegex
  };
  