import {VERSION} from "lodash";

export const bye = () => {
  return 'See ya!';
};

export function greet(name:string="qinghai"){
  return  `Hello World! ${name} lodash: ${VERSION}`;
 // return  `Hello World! ${name} lodash: ${VERSION}`;
}
