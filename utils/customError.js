//TODO:Write an article on understanding memory in js
//Hint: Callby value call by ref

class CustomError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

export default CustomError;
